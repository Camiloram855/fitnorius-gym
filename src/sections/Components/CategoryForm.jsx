import { useState } from "react";

const CategoryForm = ({ setShowForm, onCategorySaved }) => {
  const [newCategory, setNewCategory] = useState({ name: "", image: null });
  const [previewImage, setPreviewImage] = useState(null);

  const handleCategoryFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategory({ ...newCategory, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (newCategory.name.trim() && newCategory.image) {
      const formData = new FormData();
      formData.append("name", newCategory.name.trim());
      formData.append("image", newCategory.image);

      try {
        const response = await fetch("http://localhost:8080/api/categories", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Error al guardar la categoría");

        const savedCategory = await response.json();
        onCategorySaved(savedCategory);

        setNewCategory({ name: "", image: null });
        setPreviewImage(null);
        setShowForm(false);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-black rounded-2xl p-8 w-full max-w-md shadow-2xl border border-purple-700">
        <form onSubmit={handleAddCategory} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la categoría
            </label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-purple-600 rounded-lg bg-black/50 text-white"
              placeholder="Ej: Accesorios"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Imagen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCategoryFileChange}
              required
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-4 w-28 h-28 rounded-full object-cover border border-purple-500"
              />
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
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

export default CategoryForm;
