import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"


export default function ProductDetail() {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = (item) => {
    console.log("Agregado al carrito:", item);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8080/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct({
          ...data,
          // 👇 Unificamos imageUrl e images en un array para evitar errores
          images: data.images?.length
            ? data.images.map((img) => `http://localhost:8080${img}`)
            : data.imageUrl
              ? [`http://localhost:8080${data.imageUrl}`]
              : ["/img/default.jpg"],
          variants: data.variants || [], 
          features: data.features || [],
          description: data.description || "Sin descripción disponible"
        });
      })
      .catch((err) => console.error("Error cargando producto:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950">
        <p className="text-purple-400 text-xl animate-pulse">Cargando producto...</p>
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
      onAddToCart={handleAddToCart} 
    />
  );
}

// --------------------
// Componente de diseño + edición
// --------------------
function ProductDetailContent({ product, onAddToCart }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.id || null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Nuevo: estado para edición
  const [isEditing, setIsEditing] = useState(false);
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

  const discountPercent = product.oldPrice
    ? Math.round((savings / Number.parseFloat(product.oldPrice)) * 100)
    : 0;

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const finalPrice = selectedVariant?.priceDiff
    ? (Number.parseFloat(product.price) + Number.parseFloat(selectedVariant.priceDiff)).toFixed(2)
    : product.price;

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAdd = () => {
    onAddToCart({
      productId: product.id,
      variantId: selectedVariantId,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Handlers para edición
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

      // 👇 Aquí mandamos el JSON completo bajo el campo "product"
      const productJson = {
        name: formData.name,
        price: formData.price,
        oldPrice: formData.oldPrice,
        discount: formData.discount,
        description: formData.description,
      };

      formDataToSend.append(
        "product",
        new Blob([JSON.stringify(productJson)], { type: "application/json" })
      );

      // 👇 Imagen aparte
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const res = await fetch(`http://localhost:8080/api/products/${product.id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Error al actualizar producto");

      alert("Producto actualizado correctamente ✅");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar cambios ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-950 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 px-5 py-2 bg-purple-700/30 hover:bg-purple-700/50 text-white rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/50"
        >
          ← Volver
        </button>

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
                <input type="file" name="image" onChange={handleChange} className="text-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col space-y-6">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Nombre del producto"
                  />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Precio"
                  />
                  <input
                    type="number"
                    name="oldPrice"
                    value={formData.oldPrice}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Precio anterior"
                  />
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Descuento"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg"
                    placeholder="Descripción"
                  />
                  <div className="flex gap-4">
                    <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded-lg">
                      Guardar cambios
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gray-600 text-white rounded-lg">
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg">{product.name}</h1>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-purple-400">${finalPrice}</span>
                      {product.oldPrice && <span className="text-2xl text-gray-400 line-through">${product.oldPrice}</span>}
                    </div>
                    {savings > 0 && <p className="text-green-400 font-semibold text-lg">¡Ahorras ${savings}!</p>}
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-purple-700/30">
                    <h2 className="text-lg font-semibold text-purple-300">Descripción</h2>
                    <p className="text-gray-200 text-base whitespace-pre-line mt-2">
                      {product.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Editar producto ✏️
                  </button>
                </>
              )}

              {/* Cantidad y carrito solo en vista normal */}
              {!isEditing && (
                <>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleQuantityChange(-1)} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-purple-700/40">−</button>
                    <span className="text-xl text-white">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-purple-700/40">+</button>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-xl shadow-lg shadow-purple-900/60 hover:scale-105 transition-all"
                  >
                    {addedToCart ? "✓ Agregado al carrito" : "Agregar al carrito"}
                  </button>

              {/* 👇 Botón "Finalizar compra / Ir al carrito" */}
            <Link
              to="/catalog/checkout" // 👈 Ruta absoluta correcta
              className="w-full py-4 text-center bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-900/60 hover:scale-105 transition-all"
            >
              Finalizar compra
            </Link>

                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
