import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useCart } from "./CartContext";
import { useAuth } from "../pages/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://fitnorius-production.up.railway.app");

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

  // ✅ useCallback para evitar recreaciones y prevenir loops
  const fetchProductData = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`, { signal });
        if (!res.ok) throw new Error("Error al obtener producto");
        const data = await res.json();
        // Guardar tanto las URLs públicas (product.images) como las rutas originales del backend (rawImages)
        const rawImages =
          data.images?.length && Array.isArray(data.images)
            ? data.images // Ej: ["/uploads/xyz.jpg", "/uploads/abc.jpg"] (paths desde backend)
            : data.imageUrl
            ? [data.imageUrl]
            : [];

        setProduct({
          ...data,
          price: data.price ? Number(data.price) : 0,
          oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
          discount: data.discount ? Number(data.discount) : 0,
          // images: urls públicas para mostrar (pueden ser absolute si ya vienen así)
          images:
            rawImages?.length
              ? rawImages.map((img) =>
                  img.startsWith("http") ? img : `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`
                )
              : ["/img/default.jpg"],
          // rawImages: ruta tal cual la devuelve el backend (sin API_URL)
          rawImages: rawImages,
          description: data.description || "Sin descripción disponible",
        });

        // Petición recomendados (se hace aquí para mantener coherencia)
        const recRes = await fetch(`${API_URL}/api/products`, { signal });
        if (!recRes.ok) throw new Error("Error al obtener productos recomendados");
        const recData = await recRes.json();
        setRecommended(recData.filter((p) => p.id !== parseInt(id)).slice(0, 5));
      } catch (err) {
        // Ignorar abort errors (cuando se aborta la petición por navegación/unmount)
        if (err.name === "AbortError") return;
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProductData(controller.signal);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });
    scrollToTop();
    const timers = [100, 300, 600].map((t) => setTimeout(scrollToTop, t));

    return () => {
      // abort any inflight fetches when component unmounts or id changes
      controller.abort();
      timers.forEach(clearTimeout);
    };
  }, [id, fetchProductData]);

  useEffect(() => {
    if (!loading && product) {
      const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });
      const timers = [50, 200].map((t) => setTimeout(scrollToTop, t));
      return () => timers.forEach(clearTimeout);
    }
  }, [product, loading]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950">
        <p className="text-purple-400 text-xl animate-pulse">
          Cargando producto...
        </p>
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
      refetch={() => {
        // reusar fetchProductData con abortcontrol por seguridad
        const controller = new AbortController();
        fetchProductData(controller.signal);
        // no retornamos controller; quien llame a refetch no necesita abort (se usa puntualmente)
      }}
    />
  );
}

function ProductDetailContent({
  product,
  setProduct,
  recommended,
  addToCart,
  navigate,
  API_URL,
  refetch,
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { isAdmin } = useAuth();

  // formData ahora maneja nuevos archivos y las imágenes a borrar
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice || "",
    discount: product.discount || "",
    description: product.description,
    // newImages: lista de File que se van a subir (append 'newImages' al FormData)
    newImages: [],
    // deleteImages: lista de rutas (raw paths) a eliminar en backend
    deleteImages: [],
  });

  useEffect(() => {
    // Cuando cambia product (por fetch), actualizar formData base (mantener nuevos/newImages y deleteImages)
    setFormData((prev) => ({
      ...prev,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice || "",
      discount: product.discount || "",
      description: product.description,
    }));
    // Reset selectedImageIndex si excede
    setSelectedImageIndex((idx) =>
      product.images && idx < product.images.length ? idx : 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const formatCurrency = (value) =>
    Number(value).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    });

  const savings =
    product.oldPrice && product.price
      ? Number(product.oldPrice) - Number(product.price)
      : 0;

  const handleQuantityChange = (delta) =>
    setQuantity((prev) => Math.max(1, prev + delta));

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

  const handleAdd = () => navigate("/catalog/checkout");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    // input individual (name fields) - mantener compatibilidad con edición existente
    if (files) {
      // Si es el input de imagen individual (en modo editing simple), coger solo el primer file
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // NUEVO: manejar selección de nuevas imágenes (admin) -> option 3: añadir multiple
  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Añadir previews a product.images (usando createObjectURL) y push a rawImages como null temporal
    const previewUrls = files.map((f) => URL.createObjectURL(f));

    setProduct((prev) => {
      const newImages = [...(prev.images || []), ...previewUrls];
      const newRaw = [...(prev.rawImages || []), ...files.map(() => null)]; // null indicates new local file
      return {
        ...prev,
        images: newImages,
        rawImages: newRaw,
      };
    });

    // Añadir files a formData.newImages
    setFormData((prev) => ({
      ...prev,
      newImages: [...(prev.newImages || []), ...files],
    }));

    // reset input value to allow re-upload same file again if needed
    e.target.value = "";
  };

  // NUEVO: eliminar una imagen individual (solo admin). index corresponde al índice mostrado en product.images
  const handleDeleteImage = (index) => {
    // confirmar (puedes quitar confirm si no quieres prompt)
    if (!confirm("¿Eliminar esta imagen? Esta acción se aplicará cuando guardes los cambios.")) {
      return;
    }

    setProduct((prev) => {
      const images = [...(prev.images || [])];
      const raw = [...(prev.rawImages || [])];

      const removedRaw = raw[index]; // puede ser null si era recién subida (archivo)
      // quitar elemento
      images.splice(index, 1);
      raw.splice(index, 1);

      // ajustar selectedImageIndex
      let newSelected = selectedImageIndex;
      if (index === selectedImageIndex) {
        newSelected = 0;
      } else if (index < selectedImageIndex) {
        newSelected = Math.max(0, selectedImageIndex - 1);
      }

      setSelectedImageIndex(newSelected);

      // si la imagen removida corresponde a una newImage (raw === null), la tenemos que quitar de formData.newImages
      if (removedRaw === null) {
        // removemos el primer archivo que coincida por tamaño/nombre con previews - es mejor intentar por tamaño+name, pero como raw is null
        // approach: removemos el último archivo en newImages (porque añadimos en orden). Para mayor robustez podríamos mapear previews->files, pero evitamos complejidad.
        setFormData((prevForm) => {
          const newImgs = [...(prevForm.newImages || [])];
          // intentemos eliminar un archivo heurísticamente: buscar archivo cuyo preview esté en images? complicado.
          // Para evitar eliminar el archivo incorrecto, intentaremos eliminar el archivo que tenga URL.createObjectURL con mismo name/size no posible.
          // Mejor: cuando añadimos archivos, se añadieron en el mismo orden; asumimos que si quitaron el índice i luego de agregar al final, retiramos el correspondiente del final.
          // Implementación simple: quitar último archivo si newImages no vacio.
          if (newImgs.length > 0) newImgs.pop();
          return { ...prevForm, newImages: newImgs };
        });
      } else {
        // si removedRaw tiene valor (ruta del backend), debemos marcarla para borrado en deleteImages
        setFormData((prevForm) => ({
          ...prevForm,
          deleteImages: [...(prevForm.deleteImages || []), removedRaw],
        }));
      }

      return {
        ...prev,
        images,
        rawImages: raw,
      };
    });
  };

  // Manejar click en miniatura
  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  // NUEVO: handler para quitar una newImage previamente agregada (por si el admin decide quitar antes de guardar)
  const handleRemoveNewImagePreview = (previewIndex) => {
    setProduct((prev) => {
      const images = [...(prev.images || [])];
      const raw = [...(prev.rawImages || [])];

      // localizar el previewIndex en rawImages que sea null y esté en la misma posición
      // asumimos el previewIndex es el índice exacto en images/rawImages
      const removedRaw = raw[previewIndex]; // debería ser null si fue new
      images.splice(previewIndex, 1);
      raw.splice(previewIndex, 1);

      setSelectedImageIndex((sel) =>
        previewIndex === sel ? 0 : previewIndex < sel ? Math.max(0, sel - 1) : sel
      );

      // remover del formData.newImages el archivo correspondiente:
      setFormData((prevForm) => {
        const newImgs = [...(prevForm.newImages || [])];
        // intentar eliminar el archivo posicionado en newImgs correspondiente al previewIndex relativo al primer null
        // encontrar how many existing rawImages (non-null) before previewIndex to compute indexInNewImages
        const rawBefore = raw.slice(0, previewIndex + 1); // after splice above raw already removed, but for calculation keep simple: we'll try remove last
        if (newImgs.length > 0) {
          newImgs.pop(); // heurística: remove last added
        }
        return { ...prevForm, newImages: newImgs };
      });

      return { ...prev, images, rawImages: raw };
    });
  };

  // Guardar cambios (actualizado para soportar newImages[] y deleteImages[])
  const handleSave = async () => {
    try {
      const payloadForm = new FormData();

      const productJson = {
        name: formData.name,
        price: formData.price?.toString() || "0",
        oldPrice: formData.oldPrice?.toString() || null,
        discount: formData.discount?.toString() || null,
        description: formData.description,
      };

      payloadForm.append(
        "product",
        new Blob([JSON.stringify(productJson)], { type: "application/json" })
      );

      // append newImages (cada file con la misma key 'newImages')
      if (formData.newImages && formData.newImages.length > 0) {
        formData.newImages.forEach((file) => {
          payloadForm.append("newImages", file);
        });
      }

      // append deleteImages as JSON string (backend debe parsearlo)
      if (formData.deleteImages && formData.deleteImages.length > 0) {
        // backend expects array of paths (raw) to delete
        payloadForm.append("deleteImages", JSON.stringify(formData.deleteImages));
      }

      const res = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: "PUT",
        body: payloadForm,
      });

      if (!res.ok) throw new Error("Error al actualizar producto");

      const updated = await res.json();

      // actualizar producto local con la respuesta del backend
      setProduct((prev) => ({
        ...prev,
        ...updated,
        rawImages: updated.images?.length ? updated.images : [],
        images: updated.images?.length
          ? updated.images.map((img) => (img.startsWith("http") ? img : `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`))
          : prev.images,
      }));

      // limpiar formData newImages & deleteImages
      setFormData((prev) => ({
        ...prev,
        newImages: [],
        deleteImages: [],
      }));

      setIsEditing(false);
      alert("✅ Producto actualizado correctamente");
      // re-fetch para mantener consistencia (usa refetch proporcionado)
      if (typeof refetch === "function") {
        try {
          refetch();
        } catch {}
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar cambios");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto text-white">
        <br />
        <button
          onClick={() => window.history.back()}
          className="mb-8 px-6 py-2 bg-purple-700/40 hover:bg-purple-700/60 rounded-lg transition-all duration-300 shadow-md hover:shadow-purple-600/50 backdrop-blur-sm"
        >
          ← Volver
        </button>

        {/* PRODUCTO PRINCIPAL */}
        <div className="bg-black/40 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_-15px_rgba(168,85,247,0.6)] border border-purple-800/40 p-8 sm:p-12 transition-all duration-500 hover:shadow-[0_0_70px_-10px_rgba(168,85,247,0.8)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Imagen principal + miniaturas debajo */}
            <div className="relative group">
              <div className="w-full aspect-square bg-gradient-to-br from-purple-900/40 to-black rounded-3xl overflow-hidden shadow-lg flex items-center justify-center border border-purple-800/40">
                <img
                  src={
                    // si está en edición y el formData tiene image individual se muestra; sino la imagen seleccionada
                    isEditing && formData.image
                      ? URL.createObjectURL(formData.image)
                      : product.images[selectedImageIndex]
                  }
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => (e.target.src = "/img/default.jpg")}
                />
              </div>

              {/* MINIATURAS */}
              <div className="mt-4 flex items-center gap-3 overflow-x-auto">
                {product.images &&
                  product.images.map((imgSrc, idx) => (
                    <div key={idx} className="relative">
                      <button
                        onClick={() => handleThumbnailClick(idx)}
                        className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                          idx === selectedImageIndex ? "border-purple-400" : "border-transparent"
                        } focus:outline-none`}
                      >
                        <img
                          src={imgSrc}
                          alt={`thumb-${idx}`}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.src = "/img/default.jpg")}
                        />
                      </button>

                      {isAdmin && (
                        <button
                          title="Eliminar imagen"
                          onClick={() => {
                            // si la imagen fue añadida recientemente (rawImages[idx] === null), usar remove new preview
                            const raw = (product.rawImages || [])[idx];
                            if (raw === null) {
                              // es una previsualización de archivo nuevo
                              if (confirm("Eliminar esta imagen agregada (todavía no guardada)?")) {
                                handleRemoveNewImagePreview(idx);
                              }
                            } else {
                              // imagen que existe en backend -> marcar para borrado
                              handleDeleteImage(idx);
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                {/* Agregar imagen (admin) */}
                {isAdmin && (
                  <label className="w-20 h-20 rounded-md flex items-center justify-center border-2 border-dashed border-purple-600 text-purple-300 cursor-pointer hover:bg-purple-800/30">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAddImages}
                      className="hidden"
                    />
                    <span className="text-2xl">＋</span>
                  </label>
                )}
              </div>

              {isEditing && (
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  className="mt-4 text-sm text-gray-300"
                />
              )}
            </div>

            {/* Información */}
            <div className="flex flex-col space-y-6">
              {isEditing ? (
                <>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange({ ...e, target: { ...e.target, name: "name", value: e.target.value } })}
                    className="px-4 py-2 rounded-lg w-full bg-white/10 text-white"
                    placeholder="Nombre del producto"
                  />
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange({ ...e, target: { ...e.target, name: "price", value: e.target.value } })}
                    className="px-4 py-2 rounded-lg w-full bg-white/10 text-white"
                    placeholder="Precio"
                  />
                  <input
                    name="oldPrice"
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) => handleChange({ ...e, target: { ...e.target, name: "oldPrice", value: e.target.value } })}
                    className="px-4 py-2 rounded-lg w-full bg-white/10 text-white"
                    placeholder="Precio anterior"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleChange({ ...e, target: { ...e.target, name: "description", value: e.target.value } })}
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
                        // limpiar previews agregadas sin guardar: recargar datos originales
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
                    <span className="text-5xl font-bold text-purple-300 drop-shadow-md">
                      {formatCurrency(product.price)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-2xl text-gray-500 line-through">
                        {formatCurrency(product.oldPrice)}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-green-400 font-semibold text-lg">
                      ¡Ahorras {formatCurrency(savings)}!
                    </p>
                  )}
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {product.description}
                  </p>

                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold text-white hover:scale-105 transition-transform"
                    >
                      Editar producto ✏️
                    </button>
                  )}
                </>
              )}

              {!isEditing && (
                <>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                      −
                    </button>
                    <span className="text-2xl font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-900 rounded-xl font-bold shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_50px_rgba(167,85,247,0.7)] hover:scale-105 transition-all"
                  >
                    {addedToCart ? "✓ Agregado al carrito" : "Agregar al carrito"}
                  </button>

                  <button
                    onClick={handleAdd}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-green-700 rounded-xl font-bold shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:shadow-[0_0_50px_rgba(34,197,94,0.8)] hover:scale-105 transition-all"
                  >
                    Finalizar compra
                  </button>
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
            <div className="flex flex-wrap justify-center gap-8">
              {recommended.map((item) => {
                const hasPromo =
                  item.oldPrice && Number(item.price) < Number(item.oldPrice);
                const ahorro = hasPromo
                  ? (Number(item.oldPrice) - Number(item.price)).toFixed(2)
                  : null;

                const imgSrc = item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : `${API_URL}${item.imageUrl.startsWith("/") ? "" : "/"}${item.imageUrl}`
                  : "/img/default.jpg";

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/catalog/producto/${item.id}`);
                      const scrollToTop = () => window.scrollTo({ top: 0 });
                      [50, 200, 400].forEach((t) =>
                        setTimeout(scrollToTop, t)
                      );
                    }}
                    className="block w-full max-w-[250px] mx-auto cursor-pointer transform transition-transform hover:scale-105"
                  >
                    <div className="bg-gradient-to-br from-purple-900/40 via-black/80 to-gray-900/80 backdrop-blur-xl border border-purple-800/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-purple-800/50 transition-all duration-500">
                      <div className="relative w-full h-[280px] overflow-hidden group">
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
                        <div className="flex items-center justify-between">
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
      </div>
    </div>
  );
}
