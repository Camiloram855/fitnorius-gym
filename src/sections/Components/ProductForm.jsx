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
    images: [], // ✅ ahora guarda varias imágenes
  });

  const [previewImages, setPreviewImages] = useState([]); // ✅ múltiples previews

  // 🖼️ Manejar selección de múltiples imágenes
  const handleProductFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewProduct({ ...newProduct, images: files });
      setPreviewImages(files.map((file) => URL.createObjectURL(file)));
    }
  };

  // 🚀 Enviar nuevo producto
  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      if (!newProduct.name || !newProduct.price || newProduct.images.length === 0) {
        alert("Por favor completa todos los campos obligatorios ⚠️");
        return;
      }

      const formData = new FormData();

      // ✅ Producto JSON en el multipart
      formData.append(
        "product",
        new Blob(
          [
            JSON.stringify({
              name: newProduct.name.trim(),
              price: parseFloat(newProduct.price) || 0,
              oldPrice: newProduct.oldPrice ? parseFloat(newProduct.oldPrice) : null,
              discount: newProduct.discount ? parseFloat(newProduct.discount) : null,
              categoryId: selectedCategory?.id || null,
            }),
          ],
          { type: "application/json" }
        )
      );

      // ✅ Agregar todas las imágenes seleccionadas
      newProduct.images.forEach((img) => formData.append("images", img));

      // ✅ Petición al backend
      const response = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Respuesta del servidor:", errorText);
        throw new Error("Error al guardar el producto");
      }

      const savedProduct = await response.json();
      console.log("✅ Producto creado:", savedProduct);

      if (onProductCreated) onProductCreated(savedProduct);

      // 🔄 Resetear formulario
      setNewProduct({
        name: "",
        price: "",
        oldPrice: "",
        discount: "",
        images: [],
      });
      setPreviewImages([]);
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
          {/* Nombre */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Nombre</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
              required
            />
          </div>

          {/* Precio actual */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Precio Actual</label>
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
              required
            />
          </div>

          {/* Precio anterior */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Precio Anterior (opcional)
            </label>
            <input
              type="number"
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

          {/* Descuento */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Descuento (%)</label>
            <input
              type="number"
              value={newProduct.discount}
              onChange={(e) =>
                setNewProduct({ ...newProduct, discount: e.target.value })
              }
              className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
            />
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Imágenes del Producto
            </label>
            <input
              type="file"
              accept="image/*"
              multiple // ✅ permite varias imágenes
              onChange={handleProductFileChange}
              required
            />

            {previewImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {previewImages.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 rounded-lg object-cover border border-purple-500"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowProductForm(false)}
              className="flex-1 px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500"
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
