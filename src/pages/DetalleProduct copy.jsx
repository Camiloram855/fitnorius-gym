import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { useAuth } from "../pages/AuthContext"; // ✅ Importamos el contexto

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    // ✅ Obtener el producto
    fetch(`http://localhost:8080/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct({
          ...data,
          images: data.images?.length
            ? data.images.map((img) => `http://localhost:8080${img}`)
            : data.imageUrl
            ? [`http://localhost:8080${data.imageUrl}`]
            : ["/img/default.jpg"],
          variants: data.variants || [],
          features: data.features || [],
          description: data.description || "Sin descripción disponible",
        });
      })
      .catch((err) => console.error("Error cargando producto:", err))
      .finally(() => setLoading(false));

    // ✅ Obtener productos recomendados
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        setRecommended(
          data.filter((p) => p.id !== parseInt(id)).slice(0, 5)
        );
      })
      .catch((err) => console.error("Error cargando recomendados:", err));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950">
        <p className="text-purple-400 text-xl animate-pulse">
          Cargando producto...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>No se encontró el producto</p>
      </div>
    );
  }

  return (
    <ProductDetailContent
      product={product}
      recommended={recommended}
      addToCart={addToCart}
      navigate={navigate}
    />
  );
}

function ProductDetailContent({ product, recommended, addToCart, navigate }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { isAdmin } = useAuth(); // ✅ Saber si el usuario es admin

  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice || "",
    discount: product.discount || "",
    description: product.description,
    image: null,
  });

  const savings = product.oldPrice
    ? (Number.parseFloat(product.oldPrice) - Number.parseFloat(product.price)).toFixed(2)
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

  const handleAdd = () => {
    navigate("/catalog/checkout");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();

      // ✅ Construimos el JSON del producto incluyendo su ID
      const productJson = {
        id: product.id,
        name: formData.name,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        description: formData.description,
      };

      // ✅ Agregamos el JSON correctamente al FormData
      formDataToSend.append(
        "product",
        new Blob([JSON.stringify(productJson)], { type: "application/json" })
      );

      // ✅ Solo agregamos imagen si se cambió
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // ✅ NO agregues headers: el navegador define el boundary automáticamente
      const res = await fetch(
        `http://localhost:8080/api/products/${product.id}/upload`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Respuesta del backend:", text);
        throw new Error("Error al actualizar producto");
      }

      const updated = await res.json();
      setProduct({
        ...updated,
        images: updated.imageUrl
          ? [`http://localhost:8080${updated.imageUrl}`]
          : product.images,
      });

      alert("Producto actualizado correctamente ✅");
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error al guardar:", err);
      alert("Error al guardar cambios ❌");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-950 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <br />
        <button
          onClick={() => window.history.back()}
          className="mb-6 px-5 py-2 bg-purple-700/30 hover:bg-purple-700/50 text-white rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/50"
        >
          ← Volver
        </button>

        {/* DETALLE DEL PRODUCTO */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-purple-800/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-8">
            {/* Imagen principal */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/60">
                {isEditing && formData.image ? (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
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
                    value={formData.price}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Precio"
                  />
                  <input
                    name="oldPrice"
                    type="number"
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
                      ${product.price}
                    </span>
                    {product.oldPrice && (
                      <span className="text-2xl text-gray-400 line-through">
                        ${product.oldPrice}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-green-400 font-semibold text-lg">
                      ¡Ahorras ${savings}!
                    </p>
                  )}
                  <p className="text-gray-200">{product.description}</p>

                  {/* 🔒 Solo admins pueden editar */}
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

        {/* 🔥 Sección de productos recomendados */}
        {recommended.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-purple-400 mb-8 text-center">
              Productos Recomendados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recommended.map((item) => {
                const imgSrc = item.imageUrl
                  ? `http://localhost:8080${item.imageUrl}`
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
                    <p className="text-purple-400 font-bold">${item.price}</p>
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
