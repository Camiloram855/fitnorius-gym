import { useState } from "react";

// ✅ URL base dinámica y segura
const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, "")) || "http://localhost:8080";

const ProductForm = ({ setShowProductForm, selectedCategory, onProductCreated }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    oldPrice: "",
    discount: "",
    image: null,
  });
  const [previewProductImage, setPreviewProductImage] = useState(null);

  // 🖼️ Vista previa de imagen
  const handleProductFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
      setPreviewProductImage(URL.createObjectURL(file));
    }
  };

  // 💰 Formateador visual COP (solo para mostrar)
  const formatCOP = (value) => {
    if (value === "" || value == null) return "";
    const number = Number(value);
    if (isNaN(number)) return value;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  // 🚀 Enviar nuevo producto al backend
  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      if (!newProduct.name || !newProduct.price || !newProduct.image) {
        alert("Por favor completa todos los campos obligatorios ⚠️");
        return;
      }

      // 🧮 Limpiar y convertir valores numéricos antes de enviar (manteniendo decimales)
      const cleanPrice = parseFloat(
        String(newProduct.price).replace(/[^\d.,]/g, "").replace(",", ".")
      );
      const cleanOldPrice = newProduct.oldPrice
        ? parseFloat(
            String(newProduct.oldPrice).replace(/[^\d.,]/g, "").replace(",", ".")
          )
        : null;
      const cleanDiscount = newProduct.discount
        ? parseFloat(String(newProduct.discount).replace(",", "."))
        : null;

      const formData = new FormData();
      formData.append(
        "product",
        new Blob(
          [
            JSON.stringify({
              name: newProduct.name.trim(),
              price: cleanPrice,
              oldPrice: cleanOldPrice,
              discount: cleanDiscount,
              categoryId: selectedCategory?.id || null,
            }),
          ],
          { type: "application/json" }
        )
      );

      if (newProduct.image) formData.append("image", newProduct.image);

      const response = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error del servidor:", errorText);
        throw new Error("Error al guardar el producto");
      }

      const savedProduct = await response.json();
      console.log("✅ Producto creado correctamente:", savedProduct);
      if (onProductCreated) onProductCreated(savedProduct);

      // 🔄 Resetear formulario
      setNewProduct({
        name: "",
        price: "",
        oldPrice: "",
        discount: "",
        image: null,
      });
      setPreviewProductImage(null);
      setShowProductForm(false);
    } catch (error) {
      console.error("❌ Error al guardar producto:", error);
      alert("Error al guardar el producto. Revisa la consola para más detalles.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-black rounded-2xl p-8 w-full max-w-md shadow-2xl border border-purple-700">
        <form onSubmit={handleAddProduct} className="space-y-6">
          {/* 🏷️ Nombre */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Nombre</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
              placeholder="Ej: Protein Fit Max"
              required
            />
          </div>

          {/* 💰 Precio actual */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Precio Actual</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 150000 o 150000.50"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {newProduct.price && `Vista previa: ${formatCOP(newProduct.price)}`}
            </p>
          </div>

          {/* 💸 Precio anterior */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Precio Anterior (opcional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 180000 o 180000.99"
              value={newProduct.oldPrice}
              onChange={(e) =>
                setNewProduct({ ...newProduct, oldPrice: e.target.value })
              }
              className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Este precio aparecerá tachado en la tarjeta del producto.
            </p>
          </div>

          {/* 📉 Descuento */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Descuento (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Ej: 10 o 15.5"
              value={newProduct.discount}
              onChange={(e) =>
                setNewProduct({ ...newProduct, discount: e.target.value })
              }
              className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
            />
          </div>

          {/* 🖼️ Imagen */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProductFileChange}
              required
            />
            {previewProductImage && (
              <img
                src={previewProductImage}
                alt="Preview"
                className="mt-4 w-32 h-32 rounded-lg object-cover border border-purple-500"
              />
            )}
          </div>

          {/* 🔘 Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowProductForm(false)}
              className="flex-1 px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
