import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { useAuth } from "../pages/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react"; // ✨ Íconos modernos

// ✅ Detecta entorno
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
    setLoading(true);

    // ✅ Obtener producto
    fetch(`${API_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct({
          ...data,
          images:
            data.imageUrls?.length > 0
              ? data.imageUrls.map((url) =>
                  url.startsWith("http") ? url : `${API_URL}${url}`
                )
              : data.imageUrl
              ? [`${API_URL}${data.imageUrl}`]
              : ["/img/default.jpg"],
          description: data.description || "Sin descripción disponible",
        });
      })
      .catch((err) => console.error("Error cargando producto:", err))
      .finally(() => setLoading(false));

    // ✅ Obtener recomendados
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setRecommended(data.filter((p) => p.id !== parseInt(id)).slice(0, 5));
      })
      .catch((err) => console.error("Error cargando recomendados:", err));
  }, [id]);

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
      recommended={recommended}
      addToCart={addToCart}
      navigate={navigate}
      API_URL={API_URL}
    />
  );
}

function ProductDetailContent({ product, recommended, addToCart, navigate, API_URL }) {
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
    images: [], // 👈 soporte múltiple
  });

  const savings = product.oldPrice
    ? (parseFloat(product.oldPrice) - parseFloat(product.price)).toFixed(2)
    : 0;

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity,
      image: product.images?.[0] || "/img/default.jpg",
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleAdd = () => navigate("/catalog/checkout");

  // ✅ Cambios en inputs o imágenes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && name === "images") {
      setFormData((prev) => ({ ...prev, images: Array.from(files) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? currentImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      const productJson = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        description: formData.description,
      };

      formDataToSend.append(
        "product",
        new Blob([JSON.stringify(productJson)], { type: "application/json" })
      );

      if (formData.images.length > 0) {
        formData.images.forEach((file) => formDataToSend.append("images", file));
      }

      const res = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Error al actualizar producto");
      alert("✅ Producto actualizado correctamente");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar cambios");
    }
  };

  const currentImages =
    isEditing && formData.images.length > 0
      ? formData.images.map((f) => URL.createObjectURL(f))
      : product.images;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-950 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="mb-6 px-5 py-2 bg-purple-700/30 hover:bg-purple-700/50 text-white rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/50"
        >
          ← Volver
        </button>

        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-purple-800/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-8">
            {/* 🖼️ Carrusel */}
            <div className="relative">
              <div className="relative aspect-square bg-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={currentImages[selectedImageIndex]}
                  alt="producto"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />

                {/* ✨ Flechas más bonitas tipo v0 */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute top-1/2 left-4 -translate-y-1/2 bg-purple-800/60 hover:bg-purple-600/80 p-3 rounded-full text-white backdrop-blur-md shadow-lg transition-all duration-200"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute top-1/2 right-4 -translate-y-1/2 bg-purple-800/60 hover:bg-purple-600/80 p-3 rounded-full text-white backdrop-blur-md shadow-lg transition-all duration-200"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Input imágenes nuevas */}
              {isEditing && (
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleChange}
                  className="text-white mt-3"
                />
              )}
            </div>

            {/* 📝 Info del producto */}
            <div className="flex flex-col space-y-6">
              {isEditing ? (
                <>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Nombre del producto"
                  />
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Precio"
                  />
                  <input
                    name="oldPrice"
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Precio anterior"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Descripción"
                  />
                  <div className="flex gap-4">
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
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-white">
                    {product.name}
                  </h1>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold text-purple-400">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-2xl text-gray-400 line-through">
                        ${parseFloat(product.oldPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-green-400 font-semibold text-lg">
                      ¡Ahorras ${savings}!
                    </p>
                  )}
                  <p className="text-gray-200">{product.description}</p>

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
                  <div className="flex items-center gap-4">
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

        {/* 🔥 Recomendados */}
        {recommended.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-purple-400 mb-8 text-center">
              Productos Recomendados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recommended.map((item) => {
                const imgSrc = item.imageUrls?.[0]
                  ? `${API_URL}${item.imageUrls[0]}`
                  : item.imageUrl
                  ? `${API_URL}${item.imageUrl}`
                  : "/img/default.jpg";

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/catalog/producto/${item.id}`)}
                    className="cursor-pointer bg-[#181818] rounded-2xl p-4 shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300"
                  >
                    <img
                      src={imgSrc}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-xl mb-3"
                    />
                    <h3 className="text-white text-lg font-semibold mb-1">
                      {item.name}
                    </h3>
                    <p className="text-purple-400 font-bold">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>
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
