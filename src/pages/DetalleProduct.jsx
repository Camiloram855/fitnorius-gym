import GradientBlinds from "../components/backgrounds/GradientBlinds";
import ProductImageCrossfade from "../components/ProductImageCrossfade";
// ProductDetail.jsx (completo, Cloudinary-ready)
import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../api/client";
import API_URL from "../config";
import { useCart } from "./CartContext";
import { useAuth } from "../pages/AuthContext";
import FAQDOS from "../sections/FAQDOS";
import ProductImage from "../components/ProductImage";
import ProductImageModal from "../components/ProductImageModal";
import ExpandableDescription from "../components/ExpandableDescription";
import { LoaderLogo } from "../components/GlobalLoader";
import { PLACEHOLDER_IMAGE, buildImageUrl } from "../utils/images";



const IMAGE_ACCEPT = "image/*,.gif,image/gif";

/**
 * Object URLs estables para los archivos locales pendientes de subir.
 *
 * Antes se generaban dentro de buildThumbs(), que se ejecutaba en cada render:
 * eso devolvía una URL blob distinta en cada render, el navegador volvía a
 * pedir la imagen y además se fugaba memoria porque nunca se revocaban.
 */
function usePreviewUrls(entries) {
  const [urls, setUrls] = useState({});

  useEffect(() => {
    const created = {};
    entries.forEach(({ key, file }) => {
      if (file) created[key] = URL.createObjectURL(file);
    });
    setUrls(created);

    return () => {
      // Se revoca en el siguiente tick para no invalidar la URL mientras el
      // <img> que la usa todavía está montado.
      const pending = setTimeout(() => {
        Object.values(created).forEach((url) => URL.revokeObjectURL(url));
      }, 0);

      return () => clearTimeout(pending);
    };
  }, [entries]);

  return urls;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [recommendationsReadyFor, setRecommendationsReadyFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const requestRef = useRef(0);

const fetchProductData = useCallback(async (silent = false) => {
  const request = ++requestRef.current;
  if (!silent) setLoading(true);

  try {
    const res = await apiFetch(`${API_URL}/api/products/${id}`, { loading: false });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    if (request !== requestRef.current) return;

    const rawImages = Array.isArray(data.images)
      ? data.images
          .filter((img) => img && img.url)
          .map((img) => ({ id: img.id, url: img.url }))
      : [];

    setProduct({
      ...data,
      price: data.price ? Number(data.price) : 0,
      oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
      discount: data.discount ? Number(data.discount) : 0,
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      imageUrl: data.imageUrl || null,
      rawImages: rawImages,

      // 👉 Mantener saltos de línea tal como vienen
      description: data.description ? String(data.description) : "Sin descripción disponible",
    });


  } catch (err) {
    if (request !== requestRef.current) return;
    if (!silent) setProduct(null);
    console.error("Error cargando datos:", err);
  } finally {
    if (!silent && request === requestRef.current) setLoading(false);
  }
}, [id]);


  useEffect(() => {
    fetchProductData();
    return () => { requestRef.current += 1; };
  }, [id, fetchProductData]);

  useEffect(() => {
    let cancelled = false;
    setRecommended([]);
    apiFetch(`${API_URL}/api/products`, { loading: false })
      .then((response) => {
        if (!response.ok) throw new Error(`Error ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setRecommended(Array.isArray(data) ? data.filter((item) => String(item.id) !== String(id)).slice(0, 5) : []);
      })
      .catch((error) => { if (!cancelled) console.error("Error cargando recomendaciones:", error); })
      .finally(() => { if (!cancelled) setRecommendationsReadyFor(id); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading || recommendationsReadyFor !== id || (product && String(product.id) !== String(id)))
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950">
        <LoaderLogo />
      </div>
    );

  if (!product)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>No se encontró el producto</p>
      </div>
    );

  return (
    <ProductDetailContent
      key={product.id}
      product={product}
      setProduct={setProduct}
      recommended={recommended}
      addToCart={addToCart}
      navigate={navigate}
      API_URL={API_URL}
      refetch={fetchProductData}
    />
  );
}

function ProductDetailContent({ product, setProduct, recommended, addToCart, navigate, API_URL, refetch }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { isAdmin } = useAuth();
  const { cartItems } = useCart();
  const [emptyWarning, setEmptyWarning] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);


  

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    oldPrice: "",
    discount: "",
    description: "",
    mainImage: null,      // archivo local que sustituirá la imagen principal
    newImages: [],        // miniaturas nuevas, aún no subidas
    replacedImages: {},   // { [existingIndex]: File } miniaturas reemplazadas
    deleteImages: [],     // IDs de imágenes a eliminar al guardar
  });

  const [toastUploadVisible, setToastUploadVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndexPending, setDeleteIndexPending] = useState(null);
  const [deleteKindPending, setDeleteKindPending] = useState(null);

  // Previsualizaciones locales: URLs estables, revocadas al descartarlas.
  const previewEntries = useMemo(
    () => [
      ...(formData.newImages || []).map((file, index) => ({ key: `new:${index}`, file })),
      ...Object.keys(formData.replacedImages)
        .sort((a, b) => Number(a) - Number(b))
        .map((index) => ({ key: `repl:${index}`, file: formData.replacedImages[index] })),
      ...(formData.mainImage ? [{ key: "main", file: formData.mainImage }] : []),
    ],
    [formData.newImages, formData.replacedImages, formData.mainImage]
  );
  const previewUrls = usePreviewUrls(previewEntries);

  // Lista de miniaturas del slider. Memoizada para no crear URLs nuevas en
  // cada render (era lo que disparaba el bucle de peticiones).
  const thumbs = useMemo(() => {
    const list = [];
    const mainSrc = previewUrls.main || buildImageUrl(product.imageUrl, API_URL);

    if (product.imageUrl || previewUrls.main) {
      list.push({ src: mainSrc, kind: "main" });
    }

    (product.rawImages || []).forEach((image, index) => {
      const replacedSrc = previewUrls[`repl:${index}`];
      list.push({
        src: replacedSrc || buildImageUrl(image.url, API_URL),
        kind: replacedSrc ? "replaced" : "existing",
        existingIndex: index,
        id: image.id,
      });
    });

    (formData.newImages || []).forEach((_file, index) => {
      const preview = previewUrls[`new:${index}`];
      if (preview) list.push({ src: preview, kind: "local", localIndex: index });
    });

    return list;
  }, [product.imageUrl, product.rawImages, formData.newImages, previewUrls, API_URL]);

  useEffect(() => {
    if (!product) return;
    setFormData((prev) => ({
      ...prev,
      name: product.name ?? "",
      price: product.price ?? "",
      oldPrice: product.oldPrice ?? "",
      discount: product.discount ?? "",
      description: product.description ?? "",
    }));
  }, [product]);

  // Si se quedan sin miniaturas, vuelve a la primera para no quedar fuera de rango.
  useEffect(() => {
    setSelectedImageIndex((index) => (index < thumbs.length ? index : 0));
  }, [thumbs.length]);

  const formatCurrency = (value) =>
    Number(value).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    });

  const savings = product.oldPrice && product.price ? Number(product.oldPrice) - Number(product.price) : 0;
  const handleQuantityChange = (delta) => setQuantity((prev) => Math.max(1, prev + delta));
  const handleAddToCart = () => {
    if (product.agotado) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      image: thumbs[selectedImageIndex]?.src || PLACEHOLDER_IMAGE,

    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };
  const handleAdd = () => {
  if (!cartItems || cartItems.length === 0) {
    setEmptyWarning(true);
    setTimeout(() => setEmptyWarning(false), 2500);
    return;
  }
  navigate("/checkout");
};

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const selectedFiles = Array.from(files);
      if (selectedFiles.length === 0) return;
      // Vaciar el input permite volver a elegir el mismo archivo después de quitarlo.
      e.target.value = "";
      setFormData((prev) => ({ ...prev, [name]: [...(prev[name] || []), ...selectedFiles] }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveNewImagePreview = (localIndex) => {
    setFormData((prev) => {
      const newImages = [...prev.newImages];
      newImages.splice(localIndex, 1);
      return { ...prev, newImages };
    });
  };

  const openDeleteModalForThumb = (thumb) => {
    // La imagen principal vive en products.image_url y no tiene fila propia en
    // la tabla images, así que no se puede borrar por ID: se sustituye.
    if (thumb.kind === "main") return;

    setDeleteKindPending(thumb.kind);
    setDeleteIndexPending(thumb.kind === "local" ? thumb.localIndex : thumb.existingIndex);
    setShowDeleteModal(true);
  };

const handleConfirmDelete = async () => {
  try {
    if (deleteKindPending === "local") {
      handleRemoveNewImagePreview(deleteIndexPending);
      return;
    }

    if (deleteKindPending !== "existing" && deleteKindPending !== "replaced") return;

    const imageId = product.rawImages?.[deleteIndexPending]?.id;
    if (!imageId) return;

    const deleteResponse = await apiFetch(`${API_URL}/api/images/${imageId}`, {
      method: "DELETE",
    });
    if (!deleteResponse.ok) throw new Error("No se pudo eliminar la imagen");

    // Ya está borrada en el servidor: solo se quita de la vista. No se encola
    // en deleteImages porque el PUT volvería a intentar eliminarla.
    setProduct((prev) => ({
      ...prev,
      rawImages: prev.rawImages.filter((_, index) => index !== deleteIndexPending),
    }));
    setFormData((prev) => {
      const replacedImages = { ...prev.replacedImages };
      delete replacedImages[deleteIndexPending];

      return {
        ...prev,
        replacedImages,
        deleteImages: prev.deleteImages.filter((id) => id !== imageId),
      };
    });
  } catch (err) {
    console.error("Error eliminando imagen:", err);
  } finally {
    setShowDeleteModal(false);
    setDeleteIndexPending(null);
    setDeleteKindPending(null);
  }
};

// Cambiar imagen específica (miniatura)
const handleReplaceImage = (thumb, file) => {
  if (!file) return;

  if (thumb.kind === "local") {
    setFormData((prev) => {
      const newImages = [...prev.newImages];
      newImages[thumb.localIndex] = file;
      return { ...prev, newImages };
    });
    return;
  }

  if (thumb.kind === "main") {
    setFormData((prev) => ({ ...prev, mainImage: file }));
    return;
  }

  // Miniatura existente: la antigua se marca para borrar al guardar y la
  // replacement se sube en el mismo PUT. Antes se usaba rawImages[0].id, que
  // terminaba borrando la primera de la galería al editar la principal.
  const imageId = product.rawImages?.[thumb.existingIndex]?.id;

  setFormData((prev) => ({
    ...prev,
    replacedImages: { ...prev.replacedImages, [thumb.existingIndex]: file },
    deleteImages:
      imageId && !prev.deleteImages.includes(imageId)
        ? [...prev.deleteImages, imageId]
        : prev.deleteImages,
  }));
};



  const handleSave = async () => {
    try {
      const payloadForm = new FormData();
      payloadForm.append(
        "product",
        new Blob(
          [
            JSON.stringify({
              name: formData.name,
              price: formData.price?.toString() || "0",
              oldPrice: formData.oldPrice?.toString() || null,
              discount: formData.discount?.toString() || null,
              description: formData.description,
              categoryId: product.categoryId || null,
            }),
          ],
          { type: "application/json" }
        )
      );

      if (formData.mainImage) payloadForm.append("image", formData.mainImage);
      formData.newImages?.forEach((file) => payloadForm.append("newImages", file));
      Object.values(formData.replacedImages).forEach((file) => payloadForm.append("newImages", file));
      if (formData.deleteImages?.length) payloadForm.append("deleteImages", JSON.stringify(formData.deleteImages));

      const res = await apiFetch(`${API_URL}/api/products/${product.id}`, { method: "PUT", body: payloadForm });
      if (!res.ok) throw new Error("Error al actualizar producto");

      // Se recarga desde el servidor en lugar de reconstruir el DTO a mano:
      // así las URLs se normalizan igual que en la carga inicial.
      setFormData((prev) => ({
        ...prev,
        mainImage: null,
        newImages: [],
        replacedImages: {},
        deleteImages: [],
      }));
      setIsEditing(false);
      await refetch(true);

      setToastUploadVisible(true);
      setTimeout(() => setToastUploadVisible(false), 2000);
    } catch (err) {
      console.error("Error al guardar producto:", err);
    }
  };


  return (
    <div className="relative isolate min-h-screen bg-[#0b0714] py-6 px-5 sm:py-10 sm:px-8 lg:px-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <GradientBlinds gradientColors={['#FF9FFC', '#5227FF']}
          angle={20} blindCount={16} blindMinWidth={60}
          spotlightRadius={0.5} shine={0.4} relief={0.5} glow={0.4}
          sway={0.35} hoverTilt={0.6} clickEffect="ripple" noise={0.3} dpr={1} />
        <div className="absolute inset-0 bg-[#0b0714]/65" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent" />
      </div>
      <div className="max-w-[1180px] mx-auto text-white">

        {/* Volver */}
        <button
          onClick={() => navigate("/")}
          className="mb-8 sm:mb-10 inline-flex items-center gap-2 py-2 text-xs font-medium tracking-wide text-white/50 hover:text-purple-200 transition-colors focus-visible:outline focus-visible:outline-purple-300"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver al catálogo
        </button>

        {/* PRODUCTO PRINCIPAL */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-9 sm:gap-12 lg:gap-16 xl:gap-20 items-start">

              {/* SLIDER DE IMÁGENES */}
              <div className="relative min-w-0 w-full flex flex-col items-center">

                {/* Imagen principal con soporte táctil */}
                <div
                  className="relative w-full aspect-[1/1.06] bg-[#15121b]
                  rounded-[28px] overflow-hidden border border-white/10 flex items-center justify-center select-none group"

                  onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
                  onTouchMove={(e) => setTouchEnd(e.touches[0].clientX)}
                  onTouchEnd={() => {
                    if (!touchStart || !touchEnd) return;
                    const distance = touchStart - touchEnd;

                    if (distance > 60) {
                      // → swipe izquierda (imagen siguiente)
                      setSelectedImageIndex((prev) =>
                        prev === thumbs.length - 1 ? 0 : prev + 1
                      );
                    }
                    if (distance < -60) {
                      // ← swipe derecha (imagen anterior)
                      setSelectedImageIndex((prev) =>
                        prev === 0 ? thumbs.length - 1 : prev - 1
                      );
                    }

                    setTouchStart(null);
                    setTouchEnd(null);
                  }}
                >
                  <button
                    type="button"
                    aria-label="Ampliar imagen del producto"
                    onClick={() => setImageModalOpen(true)}
                    disabled={thumbs.length === 0}
                    className="relative h-full w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"
                  >
                    <ProductImageCrossfade
                      src={thumbs[selectedImageIndex]?.src}
                      alt={product.name}
                    />
                  </button>

                {product.agotado && (
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <span className="text-white font-bold text-xs uppercase tracking-[0.2em]">Agotado</span>
                  </div>
                )}

                {/* Flechas de navegación (desktop) */}
                {thumbs.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? thumbs.length - 1 : prev - 1))}
                      className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 transition-colors duration-300"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === thumbs.length - 1 ? 0 : prev + 1))}
                      className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 transition-colors duration-300"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                  </>
                )}
                </div>

                {/* Puntos del slider */}
                {thumbs.length > 1 && (
                  <div className="flex gap-1.5 mt-4">
                    {thumbs.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === selectedImageIndex
                            ? "bg-purple-400 w-6"
                            : "bg-gray-600 w-1.5 hover:bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Miniaturas debajo */}
                <div className="mt-4 flex w-full items-center gap-3 overflow-x-auto max-w-full px-1 pt-2 pb-3">
                  {thumbs.map((thumb, idx) => (
                    <div key={idx} className="relative shrink-0">
                      <button
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-[76px] h-[64px] sm:w-[104px] sm:h-[82px] rounded-2xl overflow-hidden border transition-all duration-200 ${
                          idx === selectedImageIndex ? "border-purple-300 ring-1 ring-purple-300/60" : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <ProductImage
                          src={thumb.src}
                          alt={`${product.name} - vista ${idx + 1} de ${thumbs.length}`}
                          className="w-full h-full object-cover"
                        />
                      </button>

                      {isAdmin && thumb.kind !== "main" && (
                        <button
                          title="Eliminar imagen"
                          onClick={() => openDeleteModalForThumb(thumb)}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white 
                          rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg leading-none"
                        >
                          ×
                        </button>
                      )}

                      {isAdmin && (
                        <>
                          <label
                            htmlFor={`edit-thumb-${idx}`}
                            className="absolute -bottom-1.5 -right-1.5 bg-blue-600 hover:bg-blue-700 
                            text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] 
                            shadow-lg cursor-pointer leading-none"
                            title="Editar imagen"
                          >
                            ✏️
                          </label>

                          <input
                            id={`edit-thumb-${idx}`}
                            type="file"
                            accept={IMAGE_ACCEPT}
                            className="hidden"
                            onClick={(e) => {
                              // Permite reelegir el mismo archivo.
                              e.target.value = "";
                            }}
                            onChange={(e) => handleReplaceImage(thumb, e.target.files[0])}
                          />
                        </>
                      )}
                    </div>
                  ))}

                  {isAdmin && (
                    <label className="w-16 h-16 sm:w-[72px] sm:h-[72px] shrink-0 rounded-xl flex items-center justify-center border-2 
                    border-dashed border-purple-600/60 text-purple-300 cursor-pointer hover:bg-purple-800/20 hover:border-purple-500 transition-colors">
                      <input
                        type="file"
                        accept={IMAGE_ACCEPT}
                        multiple
                        onChange={handleChange}
                        className="hidden"
                        name="newImages"
                      />
                      <span className="text-2xl leading-none">＋</span>
                    </label>
                  )}
                </div>
              </div>


            
            <div className="min-w-0 flex flex-col gap-6 lg:pt-5">
              {isEditing ? (
                <>
                  <div className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-purple-300 mb-1.5">Nombre</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="px-4 py-2.5 rounded-xl w-full bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition"
                        placeholder="Nombre del producto"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-purple-300 mb-1.5">Precio</label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={handleChange}
                          className="px-4 py-2.5 rounded-xl w-full bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition"
                          placeholder="Precio"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-purple-300 mb-1.5">Precio anterior</label>
                        <input
                          name="oldPrice"
                          type="number"
                          step="0.01"
                          value={formData.oldPrice}
                          onChange={handleChange}
                          className="px-4 py-2.5 rounded-xl w-full bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition"
                          placeholder="Precio anterior"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-purple-300 mb-1.5">Descripción</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="px-4 py-2.5 rounded-xl w-full bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition resize-none"
                        placeholder="Descripción"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                      Guardar cambios
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        refetch();
                      }}
                      className="px-6 py-2.5 bg-white/10 border border-white/10 rounded-xl font-bold hover:bg-white/15 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>

                </>
              ) : (
                <>
                  <div>
                    {hasPromoBadge(product) && (
                      <span className="inline-flex items-center rounded-full border border-purple-300/15 bg-purple-400/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-purple-200 mb-5">
                        Promo
                      </span>
                    )}
                    <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-purple-200">
                      {product.name}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-serif text-3xl sm:text-[2.1rem] font-normal tracking-tight text-white">{formatCurrency(product.price)}</span>
                    {product.oldPrice && <span className="text-sm text-white/35 line-through">{formatCurrency(product.oldPrice)}</span>}
                  </div>

                  {savings > 0 && (
                    <span className="inline-flex w-fit items-center rounded-full bg-purple-400/10 border border-purple-300/10 px-3 py-1.5 text-xs font-medium text-purple-200">
                      Ahorras {formatCurrency(savings)}
                    </span>
                  )}

                  <div className="h-px bg-white/10" />

                  <ExpandableDescription key={product.id ?? "producto"} text={product.description} />

                  {isAdmin && (
                    <button onClick={() => setIsEditing(true)} className="self-start px-5 py-2 bg-white/5 border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-colors text-sm">
                      Editar producto ✏️
                    </button>
                  )}
                </>
              )}

              {!isEditing && (
                <>
                  <div className="h-px bg-white/10" />

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex shrink-0 items-center gap-1 bg-transparent border border-white/20 rounded-full p-1.5 w-fit">
                      <button onClick={() => handleQuantityChange(-1)} className="w-9 h-9 flex items-center justify-center text-lg rounded-lg hover:bg-white/10 transition">
                        −
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                      <button onClick={() => handleQuantityChange(1)} className="w-9 h-9 flex items-center justify-center text-lg rounded-lg hover:bg-white/10 transition">
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={product.agotado}
                      className={`flex-1 min-h-12 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs uppercase tracking-[0.08em] font-semibold transition-all duration-200 ${
                        product.agotado
                          ? "bg-gray-700 cursor-not-allowed opacity-60"
                          : addedToCart
                            ? "bg-emerald-500 shadow-emerald-900/30"
                            : "bg-[#9146ff] hover:bg-[#a264ff] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-300"
                      }`}
                    >
                      {product.agotado ? (
                        "Producto agotado"
                      ) : addedToCart ? (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          ¡Agregado!
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                          Agregar al carrito
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="w-full px-6 py-3.5 border border-purple-300/30 text-purple-100 hover:bg-purple-400/10 rounded-full text-xs uppercase tracking-[0.08em] font-semibold transition-colors"
                  >
                    Finalizar compra
                  </button>

                  {emptyWarning && (
                    <p className="text-red-400 text-sm font-semibold animate-pulse text-center">
                      🛒 Tu carrito está vacío — agrega un producto para continuar.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

          {/* RECOMENDADOS */}
          {recommended.length > 0 && (
            <div className="mt-20 sm:mt-28 border-t border-white/10 pt-10 sm:pt-14">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white whitespace-nowrap">
                  Productos Recomendados
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-purple-500/40 to-transparent" />
              </div>

              {/* 🔥 Scroll horizontal – tarjetas siempre en fila */}
              <div
                className="flex gap-5 overflow-x-auto px-1 pb-4 scrollbar-thin scrollbar-thumb-purple-700/60 scrollbar-track-transparent"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {recommended.map((item) => {
                  const hasPromo = item.oldPrice && Number(item.price) < Number(item.oldPrice);
                  const ahorro = hasPromo ? (Number(item.oldPrice) - Number(item.price)).toFixed(2) : null;
                  const imgSrc = buildImageUrl(item.imageUrl, API_URL);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate(`/producto/${item.id}`);
                      }}
                      className="flex-shrink-0 w-[170px] sm:w-[210px] cursor-pointer group"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-purple-400/40 group-hover:bg-white/[0.06] group-hover:-translate-y-1">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <ProductImage
                            src={imgSrc}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {hasPromo && (
                            <div className="absolute top-2.5 left-2.5">
                              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-wide text-white shadow-sm">
                                Promo
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3.5 flex flex-col gap-1.5">
                          <h3 className="font-bold text-gray-100 uppercase tracking-wide text-xs leading-tight line-clamp-2 min-h-[2rem]">
                            {item.name}
                          </h3>

                          <div className="flex flex-col gap-0.5 mt-auto">
                            <span className="text-emerald-400 font-extrabold text-base leading-none">
                              {formatCurrency(item.price)}
                            </span>
                            {item.oldPrice && (
                              <span className="text-gray-500 line-through text-xs leading-none">
                                {formatCurrency(item.oldPrice)}
                              </span>
                            )}
                          </div>

                          {ahorro && (
                            <span className="self-start mt-1 bg-purple-500/15 text-purple-300 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full">
                              Ahorras {formatCurrency(ahorro)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


        {imageModalOpen && thumbs.length > 0 && (
          <ProductImageModal
            key={product.id}
            images={thumbs}
            title={product.name}
            initialIndex={selectedImageIndex}
            onClose={() => setImageModalOpen(false)}
          />
        )}

        {/* Modal eliminar y Toast aquí (idéntico a tu original, usando handleConfirmDelete) */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-purple-950 to-black border border-purple-700/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-2 text-white">
                {deleteKindPending === "local" ? "Eliminar imagen agregada (previsualización)" :
                 deleteKindPending === "main" ? "Eliminar imagen principal" :
                 "Eliminar imagen existente"}
              </h3>
              <p className="text-gray-300 mb-5 text-sm leading-relaxed">
                {deleteKindPending === "local"
                  ? "Esta imagen fue añadida como previsualización y se quitará localmente."
                  : deleteKindPending === "main"
                  ? "Se eliminará la imagen principal del producto. ¿Deseas continuar?"
                  : "Se eliminará esta miniatura del servidor. ¿Deseas continuar?"}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteIndexPending(null);
                    setDeleteKindPending(null);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button onClick={handleConfirmDelete} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {toastUploadVisible && (
          <div className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 text-sm font-medium">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Miniatura(s) agregada(s) correctamente
          </div>
        )}
      
      </div>
      
    </div>
  );
}

function hasPromoBadge(product) {
  return (
    product.oldPrice !== null &&
    product.oldPrice !== undefined &&
    Number(product.price) < Number(product.oldPrice)
  );
}
