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
    : "https://fitnorius-production.up.railway.app");

// Cloudinary config
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/<TU_CLOUD_NAME>/upload";
const CLOUDINARY_UPLOAD_PRESET = "<TU_UPLOAD_PRESET>";

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
        <p className="text-purple-400 text-xl animate-pulse">Cargando producto...</p>
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
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      image: product.images?.[0] || "/img/default.jpg",
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto text-white">
        <br />
        <button
          onClick={() => navigate("/catalog")}
          className="mb-8 px-6 py-2 bg-purple-700/40 hover:bg-purple-700/60 rounded-lg transition-all duration-300 shadow-md hover:shadow-purple-600/50 backdrop-blur-sm"
        >
          ← Volver a catalogo
        </button>

        {/* PRODUCTO PRINCIPAL */}
        <div className="bg-black/40 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_-15px_rgba(168,85,247,0.6)] border border-purple-800/40 p-8 sm:p-12 transition-all duration-500 hover:shadow-[0_0_70px_-10px_rgba(168,85,247,0.8)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* SLIDER DE IMÁGENES — Imagen más pequeña + swipe táctil */}
              <div className="relative w-full flex flex-col items-center">

                {/* Imagen principal con soporte táctil */}
                <div
                  className="w-90 h-90 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-purple-900/40 to-black 
                  rounded-3xl overflow-hidden shadow-lg border border-purple-800/40 flex items-center justify-center select-none"
                  
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
                    className="w-full h-full object-cover transition-transform duration-500 ease-out"
                    onError={(e) => (e.target.src = "/img/default.jpg")}
                  />
                </div>

                {/* Puntos del slider */}
                <div className="flex gap-2 mt-4">
                  {thumbs.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        idx === selectedImageIndex
                          ? "bg-purple-400 scale-125"
                          : "bg-gray-500"
                      }`}
                    />
                  ))}
                </div>

                {/* Miniaturas debajo */}
                <div className="mt-6 flex items-center gap-3 overflow-x-auto max-w-full px-2">
                  {thumbs.map((thumb, idx) => (
                    <div key={idx} className="relative">
                      <button
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                          idx === selectedImageIndex ? "border-purple-400" : "border-transparent"
                        }`}
                      >
                        <img src={thumb.src} className="w-full h-full object-cover" />
                      </button>

                      {isAdmin && (
                        <button
                          title="Eliminar imagen"
                          onClick={() => openDeleteModalForThumb(thumb, idx)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white 
                          rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                        >
                          ×
                        </button>
                      )}

                      {isAdmin && (
                        <>
                          <label
                            htmlFor={`edit-thumb-${idx}`}
                            className="absolute -bottom-2 right-1 bg-blue-600 hover:bg-blue-700 
                            text-white rounded-full w-6 h-6 flex items-center justify-center text-xs 
                            shadow-lg cursor-pointer"
                            title="Editar imagen"
                          >
                            ✏️
                          </label>

                          <input
                            id={`edit-thumb-${idx}`}
                            type="file"
                            accept="image/*"
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
                    <label className="w-20 h-20 rounded-md flex items-center justify-center border-2 
                    border-dashed border-purple-600 text-purple-300 cursor-pointer hover:bg-purple-800/30">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleChange}
                        className="hidden"
                        name="newImages"
                      />
                      <span className="text-2xl">＋</span>
                    </label>
                  )}
                </div>
              </div>


            
            <div className="flex flex-col space-y-6">
              {isEditing ? (
                <>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="px-4 py-2 rounded-lg w-full bg-white/10 text-white"
                    placeholder="Nombre del producto"
                  />
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="px-4 py-2 rounded-lg w-full bg-white/10 text-white"
                    placeholder="Precio"
                  />
                  <input
                    name="oldPrice"
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={handleChange}
                    className="px-4 py-2 rounded-lg w-full bg-white/10 text-white"
                    placeholder="Precio anterior"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="px-4 py-2 rounded-lg w-full bg-white/10 text-white"
                    placeholder="Descripción"
                  />
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-700 rounded-lg font-bold shadow-md hover:scale-105 transition-transform"
                    >
                      Guardar cambios
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        refetch();
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg font-bold hover:scale-105 transition-transform"
                    >
                      Cancelar
                    </button>
                  </div>

                </>
              ) : (
                <>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-300 drop-shadow-lg">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-4xl font-bold text-purple-300 drop-shadow-md">{formatCurrency(product.price)}</span>
                    {product.oldPrice && <span className="text-2xl text-gray-500 line-through">{formatCurrency(product.oldPrice)}</span>}
                  </div>
                  {savings > 0 && <p className="text-green-400 font-semibold text-lg">¡Ahorras {formatCurrency(savings)}!</p>}
                  <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">{product.description}</p>

                  {isAdmin && (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold text-white hover:scale-105 transition-transform">
                      Editar producto ✏️
                    </button>
                  )}
                </>
              )}

              {!isEditing && (
                <>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleQuantityChange(-1)} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                      −
                    </button>
                    <span className="text-2xl font-semibold">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold shadow-lg"
                  >
                    Agregar al carrito
                  </button>

                  <button
                    onClick={handleAdd}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold shadow-lg"
                  >
                    Finalizar compra
                  </button>
                  {emptyWarning && (
                  <p className="text-red-400 text-lg font-semibold mt-3 animate-pulse">
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
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-300 mb-12">
                Productos Recomendados
              </h2>

              {/* 🔥 Scroll horizontal – tarjetas siempre en fila */}
              <div
                className="flex gap-6 overflow-x-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-purple-700/60 scrollbar-track-transparent"
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
                      className="flex-shrink-0 w-[200px] sm:w-[230px] cursor-pointer transform transition-transform hover:scale-105"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <div className="bg-gradient-to-br from-purple-900/40 via-black/80 to-gray-900/80 backdrop-blur-xl border border-purple-800/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-purple-800/50 transition-all duration-500">
                        <div className="relative w-full h-[220px] overflow-hidden group">
                          <img
                            src={imgSrc}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => (e.target.src = "/img/default.jpg")}
                          />
                          {hasPromo && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                              ¡PROMO!
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col">
                          <h3 className="font-semibold text-gray-100 uppercase tracking-wide mb-2 text-sm line-clamp-1">
                            {item.name}
                          </h3>

                          <div className=" items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-green-400 font-bold text-lg">
                                {formatCurrency(item.price)}
                              </span>
                              {item.oldPrice && (
                                <span className="text-gray-400 line-through text-sm">
                                  {formatCurrency(item.oldPrice)}
                                </span>
                              )}
                            </div>

                            {ahorro && (
                              <span className="bg-purple-800/40 text-purple-300 text-xs font-semibold px-2 py-1 rounded-full">
                                -{formatCurrency(ahorro)}
                              </span>
                            )}
                          </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-black/80 border border-purple-700 rounded-2xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-xl font-bold mb-2 text-white">
                {deleteKindPending === "local" ? "Eliminar imagen agregada (previsualización)" :
                 deleteKindPending === "main" ? "Eliminar imagen principal" :
                 "Eliminar imagen existente"}
              </h3>
              <p className="text-gray-300 mb-4">
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
                  className="px-4 py-2 bg-gray-700 rounded-md"
                >
                  Cancelar
                </button>
                <button onClick={handleConfirmDelete} 
                className="px-4 py-2 bg-red-600 rounded-md">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {toastUploadVisible && <div className="fixed right-6 bottom-6 bg-green-700 text-white px-4 py-3 rounded-lg shadow-lg z-50">Miniatura(s) agregada(s) correctamente</div>}
      
      </div>
      
    </div>
  );
}
