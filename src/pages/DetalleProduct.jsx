// ProductDetail.jsx (completo, Cloudinary-ready)
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { useAuth } from "../pages/AuthContext";
import FAQDOS from "../sections/FAQDOS";



const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://fitnoris-production.up.railway.app");

// Cloudinary config
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/<TU_CLOUD_NAME>/upload";
const CLOUDINARY_UPLOAD_PRESET = "<TU_UPLOAD_PRESET>";
const IMAGE_ACCEPT = "image/*,.gif,image/gif";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch {}
    }
    return () => {
      if ("scrollRestoration" in window.history) {
        try {
          window.history.scrollRestoration = "auto";
        } catch {}
      }
    };
  }, []);

const fetchProductData = async (silent = false) => {
  if (!silent) setLoading(true);

  try {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    const data = await res.json();

    const rawImages = Array.isArray(data.images)
      ? data.images.map((img) => ({ id: img.id, url: img.url }))
      : [];

    setProduct({
      ...data,
      price: data.price ? Number(data.price) : 0,
      oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
      discount: data.discount ? Number(data.discount) : 0,
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      images: rawImages?.length
        ? rawImages.map((img) => img?.url || "/img/default.jpg")
        : ["/img/default.jpg"],
      rawImages: rawImages,

      // 👉 Mantener saltos de línea tal como vienen
      description: data.description ? String(data.description) : "Sin descripción disponible",
    });

    const recRes = await fetch(`${API_URL}/api/products`);
    const recData = await recRes.json();

    setRecommended(
      recData.filter((p) => p.id !== parseInt(id)).slice(0, 5)
    );

  } catch (err) {
    console.error("Error cargando datos:", err);
  } finally {
    if (!silent) setLoading(false);
  }
};


  useEffect(() => {
    fetchProductData();
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });
    scrollToTop();
    const timers = [100, 300, 600].map((t) => setTimeout(scrollToTop, t));
    return () => timers.forEach(clearTimeout);
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-400" />
          <p className="text-purple-300 text-sm font-medium tracking-wide">Cargando producto...</p>
        </div>
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
    newImages: [], // archivos locales seleccionados
    deleteImages: [], // IDs Cloudinary para eliminar
  });

  const [toastUploadVisible, setToastUploadVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndexPending, setDeleteIndexPending] = useState(null);
  const [deleteIsNewPreview, setDeleteIsNewPreview] = useState(false);
  const [deleteKindPending, setDeleteKindPending] = useState(null); 
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
    setSelectedImageIndex((idx) => (product.images && idx < product.images.length ? idx : 0));
  }, [product]);

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
      image: thumbs[selectedImageIndex]?.src || "/img/default.jpg",

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
  navigate("/catalog/checkout");
};

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: [...(prev[name] || []), ...files] }));
      const previews = Array.from(files).map((f) => URL.createObjectURL(f));
      setProduct((prev) => ({ ...prev, images: [...prev.images, ...previews] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveNewImagePreview = (localIndex) => {
    setProduct((prev) => {
      const images = [...prev.images];
      images.splice(product.rawImages.length + localIndex, 1);
      return { ...prev, images };
    });
    setFormData((prev) => {
      const newImgs = [...prev.newImages];
      newImgs.splice(localIndex, 1);
      return { ...prev, newImages: newImgs };
    });
  };

  const openDeleteModalForThumb = (thumb) => {
    setDeleteKindPending(thumb.kind);
    if (thumb.kind === "local") setDeleteIndexPending(thumb.localIndex);
    else if (thumb.kind === "existing") setDeleteIndexPending(thumb.existingIndex);
    else setDeleteIndexPending(null);
    setShowDeleteModal(true);
  };

const handleConfirmDelete = async () => {
  try {
    if (deleteKindPending === "local") {
      handleRemoveNewImagePreview(deleteIndexPending);
    } else {
      const imgToDelete =
        deleteKindPending === "main"
          ? product.imageUrl
          : product.rawImages[deleteIndexPending]?.url;

      const imgIdToDelete =
        deleteKindPending === "main"
          ? product.rawImages?.[0]?.id
          : product.rawImages?.[deleteIndexPending]?.id;

      if (imgToDelete) {
        // 🔥 1️⃣ Borrar imagen de Cloudinary
        await fetch(`${API_URL}/api/images/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imgToDelete }),
        });

        // 🔥 2️⃣ Marcar imagen para eliminación en base de datos
        setFormData((prev) => ({
          ...prev,
          deleteImages: [...(prev.deleteImages || []), imgIdToDelete],
        }));

        // 🔥 3️⃣ Actualizar estado local para quitarla de vista
        setProduct((prev) => {
          const images = [...prev.images];
          const rawImages = [...prev.rawImages];

          if (deleteKindPending === "main") {
            images.splice(0, 1);
            rawImages.splice(0, 1);
          } else {
            images.splice(deleteIndexPending, 1);
            rawImages.splice(deleteIndexPending, 1);
          }

          return { ...prev, images, rawImages };
        });
      }
    }
  } catch (err) {
    console.error("Error eliminando imagen Cloudinary:", err);
  } finally {
    setShowDeleteModal(false);
    setDeleteIndexPending(null);
    setDeleteKindPending(null);
  }
};

// Cambiar imagen específica (miniatura)
const handleReplaceImage = (thumb, idx, file) => {
  if (!file) return;

  const newUrl = URL.createObjectURL(file);

  // Si es una imagen local (newImages)
  if (thumb.kind === "local") {
    setProduct((prev) => {
      const images = [...prev.images];
      images[product.rawImages.length + thumb.localIndex] = newUrl;
      return { ...prev, images };
    });

    setFormData((prev) => {
      const updated = [...prev.newImages];
      updated[thumb.localIndex] = file;
      return { ...prev, newImages: updated };
    });
  }

  // Si es una imagen existente en el servidor (rawImages)
  if (thumb.kind === "existing") {
    // Marcar imagen vieja para eliminar
    const imgId = product.rawImages[thumb.existingIndex]?.id;

    setFormData((prev) => ({
      ...prev,
      deleteImages: [...prev.deleteImages, imgId],
      newImages: [...prev.newImages, file],
    }));

    setProduct((prev) => {
      const images = [...prev.images];
      images[idx] = newUrl;
      return { ...prev, images };
    });
  }

  // Si es la imagen principal (main)
  if (thumb.kind === "main") {
    const imgId = product.rawImages?.[0]?.id;

    setFormData((prev) => ({
      ...prev,
      deleteImages: [...prev.deleteImages, imgId],
      newImages: [...prev.newImages, file],
    }));

    setProduct((prev) => {
      const images = [...prev.images];
      images[0] = newUrl;
      return { ...prev, images };
    });
  }
};



 const buildThumbs = () => {
    const thumbs = [];
    if (product.imageUrl) thumbs.push({ src: product.imageUrl.startsWith("http") ? product.imageUrl : `${API_URL}${product.imageUrl}`, kind: "main" });
    product.rawImages?.forEach((rawImg, idx) => thumbs.push({ src: rawImg.url.startsWith("http") ? rawImg.url : `${API_URL}${rawImg.url}`, kind: "existing", existingIndex: idx }));
    formData.newImages?.forEach((file, idx) => thumbs.push({ src: URL.createObjectURL(file), kind: "local", localIndex: idx }));
    return thumbs;
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

      formData.newImages?.forEach((file) => payloadForm.append("newImages", file));
      if (formData.deleteImages?.length) payloadForm.append("deleteImages", JSON.stringify(formData.deleteImages));

      const res = await fetch(`${API_URL}/api/products/${product.id}`, { method: "PUT", body: payloadForm });
      if (!res.ok) throw new Error("Error al actualizar producto");

      const updated = await res.json();

      setProduct({
        ...updated,
        images: updated.images?.map((img) => (img.url ? `${API_URL}${img.url}` : "/img/default.jpg")) || ["/img/default.jpg"],
        rawImages: updated.images || [],
      });

      setFormData((prev) => ({ ...prev, newImages: [], deleteImages: [] }));
      setIsEditing(false);
      setToastUploadVisible(true);
      setTimeout(() => setToastUploadVisible(false), 2000);
    } catch (err) {
      console.error("Error al guardar producto:", err);
    }
  };


  const thumbs = buildThumbs();
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto text-white">

        {/* Volver */}
        <button
          onClick={() => navigate("/catalog")}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver al catálogo
        </button>

        {/* PRODUCTO PRINCIPAL */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-10 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

              {/* SLIDER DE IMÁGENES */}
              <div className="relative w-full flex flex-col items-center">

                {/* Imagen principal con soporte táctil */}
                <div
                  className="relative w-full max-w-[420px] aspect-square bg-gradient-to-br from-purple-900/30 to-black/60
                  rounded-2xl overflow-hidden shadow-2xl border border-purple-800/30 flex items-center justify-center select-none group"

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
                  <img
                  src={thumbs[selectedImageIndex]?.src || "/img/default.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e)=> (e.target.src = "/img/default.jpg")}
                />

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
                      className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === thumbs.length - 1 ? 0 : prev + 1))}
                      className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
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
                <div className="mt-5 flex items-center gap-2.5 overflow-x-auto max-w-full px-1 pb-1">
                  {thumbs.map((thumb, idx) => (
                    <div key={idx} className="relative shrink-0">
                      <button
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          idx === selectedImageIndex ? "border-purple-400 ring-2 ring-purple-400/30" : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <img src={thumb.src} className="w-full h-full object-cover" />
                      </button>

                      {isAdmin && (
                        <button
                          title="Eliminar imagen"
                          onClick={() => openDeleteModalForThumb(thumb, idx)}
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
                            onChange={(e) =>
                              handleReplaceImage(thumb, idx, e.target.files[0])
                            }
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


            
            <div className="flex flex-col gap-5 lg:pt-2">
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
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide text-white shadow-sm mb-3">
                        Promo
                      </span>
                    )}
                    <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-purple-200">
                      {product.name}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{formatCurrency(product.price)}</span>
                    {product.oldPrice && <span className="text-lg sm:text-xl text-gray-500 line-through">{formatCurrency(product.oldPrice)}</span>}
                  </div>

                  {savings > 0 && (
                    <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-sm font-semibold text-emerald-400">
                      Ahorras {formatCurrency(savings)}
                    </span>
                  )}

                  <div className="h-px bg-white/10" />

                  <p className="text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-line">{product.description}</p>

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
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
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
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 ${
                        product.agotado
                          ? "bg-gray-700 cursor-not-allowed opacity-60"
                          : addedToCart
                            ? "bg-emerald-500 shadow-emerald-900/30"
                            : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-purple-900/30 active:scale-[0.98]"
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
                    className="w-full px-6 py-3 bg-white text-purple-900 hover:bg-purple-50 rounded-xl font-bold shadow-lg shadow-black/20 transition-colors"
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
            <div className="mt-16 sm:mt-20">
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
                  const imgSrc = item.imageUrl
                    ? item.imageUrl.startsWith("http")
                      ? item.imageUrl
                      : `${API_URL}${item.imageUrl}`
                    : "/img/default.jpg";

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate(`/catalog/producto/${item.id}`);
                        const scrollToTop = () => window.scrollTo({ top: 0 });
                        [50, 200, 400].forEach((t) => setTimeout(scrollToTop, t));
                      }}
                      className="flex-shrink-0 w-[170px] sm:w-[210px] cursor-pointer group"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-purple-400/40 group-hover:bg-white/[0.06] group-hover:-translate-y-1">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => (e.target.src = "/img/default.jpg")}
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
                    setDeleteIsNewPreview(false);
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
