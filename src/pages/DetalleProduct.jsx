import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

  // --- Desactivar scroll restoration del navegador
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch (e) {}
    }
    return () => {
      if ("scrollRestoration" in window.history) {
        try {
          window.history.scrollRestoration = "auto";
        } catch (e) {}
      }
    };
  }, []);

  // 🔄 Cargar producto y recomendados
  const fetchProductData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`);
      const data = await res.json();
      setProduct({
        ...data,
        price: data.price ? Number(data.price) : 0,
        oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
        discount: data.discount ? Number(data.discount) : 0,
        images: data.images?.length
          ? data.images.map((img) => `${API_URL}${img}`)
          : data.imageUrl
          ? [`${API_URL}${data.imageUrl}`]
          : ["/img/default.jpg"],
        description: data.description || "Sin descripción disponible",
      });

      const recRes = await fetch(`${API_URL}/api/products`);
      const recData = await recRes.json();
      setRecommended(recData.filter((p) => p.id !== parseInt(id)).slice(0, 5));
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();

    // ✅ Forzar scroll al inicio al cambiar producto
    const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    scrollToTop();
    const t1 = setTimeout(scrollToTop, 100);
    const t2 = setTimeout(scrollToTop, 300);
    const t3 = setTimeout(scrollToTop, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [id]);

  // ✅ Refuerzo adicional: cuando el producto termina de cargar, también sube
  useEffect(() => {
    if (!loading && product) {
      const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      const t1 = setTimeout(scrollToTop, 50);
      const t2 = setTimeout(scrollToTop, 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
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
      refetch={fetchProductData}
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

  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice || "",
    discount: product.discount || "",
    description: product.description,
    image: null,
  });

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
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // ✅ Guardar cambios y actualizar sin refrescar
  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      const productJson = {
        name: formData.name,
        price: formData.price?.toString() || "0",
        oldPrice: formData.oldPrice?.toString() || null,
        discount: formData.discount?.toString() || null,
        description: formData.description,
      };

      formDataToSend.append(
        "product",
        new Blob([JSON.stringify(productJson)], { type: "application/json" })
      );

      if (formData.image) formDataToSend.append("image", formData.image);

      const res = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Error al actualizar producto");

      const updated = await res.json();

      setProduct((prev) => ({
        ...prev,
        ...updated,
        images: updated.images?.length
          ? updated.images.map((img) => `${API_URL}${img}`)
          : prev.images,
      }));

      setIsEditing(false);
      alert("✅ Producto actualizado correctamente");
      await refetch();
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar cambios");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-950 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="mb-6 px-5 py-2 bg-purple-700/30 hover:bg-purple-700/50 text-white rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/50"
        >
          ← Volver
        </button>

        {/* PRODUCTO PRINCIPAL */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-800/40 p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {/* Imagen principal */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full aspect-square bg-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/60">
                <img
                  src={
                    isEditing && formData.image
                      ? URL.createObjectURL(formData.image)
                      : product.images[selectedImageIndex]
                  }
                  alt={product.name}
                  className="w-full h-full object-contain transition-all duration-300"
                />
              </div>
              {isEditing && (
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  className="text-white"
                />
              )}
            </div>

            {/* Información */}
            <div className="flex flex-col justify-center space-y-6">
              {isEditing ? (
                <>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg w-full"
                    placeholder="Nombre del producto"
                  />
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg w-full"
                    placeholder="Precio"
                  />
                  <input
                    name="oldPrice"
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg w-full"
                    placeholder="Precio anterior"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg w-full"
                    placeholder="Descripción"
                  />
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Guardar cambios
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white text-center lg:text-left">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap items-baseline gap-3 justify-center lg:justify-start">
                    <span className="text-4xl sm:text-5xl font-bold text-purple-400">
                      {formatCurrency(product.price)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-2xl text-gray-400 line-through">
                        {formatCurrency(product.oldPrice)}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-green-400 font-semibold text-lg text-center lg:text-left">
                      ¡Ahorras {formatCurrency(savings)}!
                    </p>
                  )}
                  <p className="text-gray-200 text-center lg:text-left">{product.description}</p>

                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Editar producto ✏️
                    </button>
                  )}
                </>
              )}

              {!isEditing && (
                <>
                  <div className="flex items-center gap-4 justify-center lg:justify-start">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg"
                    >
                      −
                    </button>
                    <span className="text-xl text-white">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
                  >
                    {addedToCart ? "✓ Agregado al carrito" : "Agregar al carrito"}
                  </button>

                  <button
                    onClick={handleAdd}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
                  >
                    Finalizar compra
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 🟣 RECOMENDADOS */}
        {recommended.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-purple-400 mb-8 text-center">
              Productos Recomendados
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {recommended.map((item) => {
                const hasPromo =
                  item.oldPrice && Number(item.price) < Number(item.oldPrice);
                const ahorro = hasPromo
                  ? (
                      Number(item.oldPrice) - Number(item.price)
                    ).toFixed(2)
                  : null;

                const imgSrc = item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : `${API_URL}${
                        item.imageUrl.startsWith("/") ? "" : "/"
                      }${item.imageUrl}`
                  : "/img/default.jpg";

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/catalog/producto/${item.id}`);
                      const scrollToTop = () =>
                        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                      setTimeout(scrollToTop, 50);
                      setTimeout(scrollToTop, 200);
                      setTimeout(scrollToTop, 400);
                    }}
                    className="block w-full max-w-[250px] mx-auto cursor-pointer"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 ease-in-out hover:-translate-y-1 flex flex-col">
                      <div className="relative w-full h-[280px] overflow-hidden rounded-t-xl block group bg-white">
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => (e.target.src = "/img/default.jpg")}
                        />
                        {hasPromo && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-700 px-3 py-1 rounded-full shadow-md">
                            <span className="text-white font-bold text-xs uppercase">
                              ¡PROMO!
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wide mb-2 line-clamp-1 text-center">
                          {item.name}
                        </h3>

                        <div className="flex items-center justify-center flex-col">
                          <div className="flex flex-col items-center">
                            <span className="text-green-600 font-bold text-lg">
                              {formatCurrency(item.price)}
                            </span>
                            {item.oldPrice && (
                              <span className="text-gray-400 line-through text-sm">
                                {formatCurrency(item.oldPrice)}
                              </span>
                            )}
                          </div>

                          {ahorro && (
                            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mt-2">
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
