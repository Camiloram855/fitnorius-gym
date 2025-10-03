import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Pencil } from "lucide-react";
import CategoryForm from "./CategoryForm";
import ProductList from "./ProductList";

const CategoryCarousel = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // estado para confirmar eliminación
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // estado para editar
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", image: null });

  const scrollRef = useRef(null);

  // Cargar categorías desde el backend
  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar la categoría");

      // actualizar frontend
      setCategories(categories.filter((cat) => cat.id !== id));
      if (selectedCategory?.id === id) {
        setSelectedCategory(null); // limpiar si borramos la categoría seleccionada
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCategoryToDelete(null); // cerrar modal siempre
    }
  };

  const handleEditCategory = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editForm.name); // aquí va como RequestParam
      if (editForm.image) {
        formData.append("image", editForm.image); // aquí la imagen opcional
      }

      const response = await fetch(
        `http://localhost:8080/api/categories/${categoryToEdit.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error al editar categoría");

      const updatedCategory = await response.json();

      // actualizar frontend
      setCategories(
        categories.map((cat) =>
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      );
      setCategoryToEdit(null); // cerrar modal
    } catch (error) {
      console.error("Error editando categoría:", error);
    }
  };

  const handleCategoryCreated = (savedCategory) => {
    setCategories([...categories, savedCategory]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* ====== CARRUSEL ====== */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Categorías de Productos</h2>
        <p className="text-gray-300">Explora nuestras categorías destacadas</p>
      </div>

      <div className="relative">
        {/* Botones de scroll */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 shadow-lg rounded-full p-2 hover:bg-purple-600 transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 shadow-lg rounded-full p-2 hover:bg-purple-600 transition-colors duration-200"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Carrusel */}
        <div ref={scrollRef} className="flex gap-6 px-20 py-4 overflow-hidden scroll-smooth">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0 group cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              <div className="relative">
                <img
                  src={`http://localhost:8080${category.image}`}
                  alt={category.name}
                  className="w-28 h-28 rounded-full object-cover shadow-md border border-purple-500 group-hover:scale-105 transition-transform duration-300"
                />
                {/* Botón eliminar */}
                {categories.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryToDelete(category); // abrir modal eliminar
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {/* Botón editar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditForm({ name: category.name, image: null });
                    setCategoryToEdit(category);
                  }}
                  className="absolute -top-2 -left-2 bg-blue-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="text-center mt-3 text-sm font-medium text-white uppercase tracking-wide">
                {category.name}
              </p>
            </div>
          ))}

          {/* + AGREGAR CATEGORÍA */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowForm(true)}
              className="w-28 h-28 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-purple-500 hover:bg-purple-700/30 transition-all duration-300 group"
            >
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
            </button>
            <p className="text-center mt-3 text-sm font-medium text-gray-400 uppercase tracking-wide">
              Agregar
            </p>
          </div>
        </div>
      </div>

      {/* ====== PRODUCTOS DE LA CATEGORÍA ====== */}
      {selectedCategory && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            {selectedCategory.name} - Productos
          </h3>
          <ProductList category={selectedCategory} />
        </div>
      )}

      {/* ====== MODAL CATEGORÍA ====== */}
      {showForm && (
        <CategoryForm setShowForm={setShowForm} onCategoryCreated={handleCategoryCreated} />
      )}

      {/* ====== MODAL CONFIRMACIÓN ELIMINAR ====== */}
      {categoryToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-white mb-4">Confirmar eliminación</h3>
            <p className="text-gray-300 mb-6">
              ¿Seguro que deseas eliminar la categoría{" "}
              <span className="font-semibold text-purple-400">{categoryToDelete.name}</span>?
              <br /> Esto también eliminará sus productos.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCategory(categoryToDelete.id)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL EDITAR ====== */}
      {categoryToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-white mb-4">Editar categoría</h3>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              placeholder="Nombre de la categoría"
            />
            <input
              type="file"
              onChange={(e) => setEditForm({ ...editForm, image: e.target.files[0] })}
              className="w-full text-gray-300 mb-6"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCategoryToEdit(null)}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditCategory}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCarousel;
