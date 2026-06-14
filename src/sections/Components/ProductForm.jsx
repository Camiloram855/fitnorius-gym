import { useState } from "react";

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

  const handleProductFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
      setPreviewProductImage(URL.createObjectURL(file));
    }
  };

  const formatCOP = (value) => {
    if (value === "" || value == null) return "";
    const number = Number(value);
    if (Number.isNaN(number)) return value;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      if (!newProduct.name || !newProduct.price || !newProduct.image) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
      }

      const cleanPrice = parseFloat(
        String(newProduct.price).replace(/[^\d.,]/g, "").replace(",", ".")
      );
      const cleanOldPrice = newProduct.oldPrice
        ? parseFloat(String(newProduct.oldPrice).replace(/[^\d.,]/g, "").replace(",", "."))
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
        console.error("Error del servidor:", errorText);
        throw new Error("Error al guardar el producto");
      }

      const savedProduct = await response.json();
      if (onProductCreated) onProductCreated(savedProduct);

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
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto. Revisa la consola para más detalles.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-purple-700 bg-gradient-to-br from-purple-900 to-black p-8 shadow-2xl">
        <form onSubmit={handleAddProduct} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">Nombre</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full rounded-lg border border-purple-600 bg-black/50 px-4 py-2 text-white"
              placeholder="Ej: Protein Fit Max"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Precio actual</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 150000 o 150000.50"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full rounded-lg border border-purple-600 bg-black/50 px-4 py-2 text-white"
              required
            />
            <p className="mt-1 text-xs text-gray-400">
              {newProduct.price && `Vista previa: ${formatCOP(newProduct.price)}`}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Precio anterior (opcional)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 180000 o 180000.99"
              value={newProduct.oldPrice}
              onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
              className="w-full rounded-lg border border-purple-600 bg-black/50 px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Descuento (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Ej: 10 o 15.5"
              value={newProduct.discount}
              onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
              className="w-full rounded-lg border border-purple-600 bg-black/50 px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Imagen</label>
            <input type="file" accept="image/*" onChange={handleProductFileChange} required />
            {previewProductImage && (
              <img
                src={previewProductImage}
                alt="Preview"
                className="mt-4 h-32 w-32 rounded-lg border border-purple-500 object-cover"
              />
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowProductForm(false)}
              className="flex-1 rounded-lg border border-gray-500 px-4 py-2 text-gray-300 transition hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-500"
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
