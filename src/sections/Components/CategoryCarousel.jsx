import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Pencil } from "lucide-react";
import CategoryForm from "./CategoryForm";
import ProductList from "./ProductList";
import { useAuth } from "../../pages/AuthContext";
import Swal from "sweetalert2";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const CategoryCarousel = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", image: null });

  const scrollRef = useRef(null);
  const { isAdmin } = useAuth();

  // ✅ Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Restaurar categoría abierta al regresar
useEffect(() => {
  const savedCatId = sessionStorage.getItem("openCategoryId");

  if (savedCatId && categories.length > 0) {
    const cat = categories.find((c) => String(c.id) === String(savedCatId));
    if (cat) {
      setSelectedCategory(cat);
      return;
    }
  }

  // 🔥 Si no había una categoría guardada → abre la primera automáticamente
  if (!savedCatId && categories.length > 0) {
    setSelectedCategory(categories[0]);
    sessionStorage.setItem("openCategoryId", categories[0].id);
  }
}, [categories]);


// ✅ Restaurar scroll
useEffect(() => {
  const lastScroll = sessionStorage.getItem("scrollPosition");
  if (lastScroll) {
    setTimeout(() => {
      window.scrollTo({
        top: Number(lastScroll),
        behavior: "auto",
      });
    }, 80);
  }
}, []);



  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -250 : 250,
        behavior: "smooth",
      });
    }
  };

  // ✅ Desplazamiento táctil rápido (para móviles)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const start = (e) => {
      isDown = true;
      startX = e.pageX || e.touches[0].pageX;
      scrollLeft = container.scrollLeft;
    };

    const end = () => (isDown = false);

    const move = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX || e.touches[0].pageX;
      const walk = (x - startX) * 2.2;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", start);
    container.addEventListener("mouseleave", end);
    container.addEventListener("mouseup", end);
    container.addEventListener("mousemove", move);
    container.addEventListener("touchstart", start);
    container.addEventListener("touchend", end);
    container.addEventListener("touchmove", move);

    return () => {
      container.removeEventListener("mousedown", start);
      container.removeEventListener("mouseleave", end);
      container.removeEventListener("mouseup", end);
      container.removeEventListener("mousemove", move);
      container.removeEventListener("touchstart", start);
      container.removeEventListener("touchend", end);
      container.removeEventListener("touchmove", move);
    };
  }, []);

  // ✅ Eliminar categoría
  const handleDeleteCategory = async (id) => {
    const category = categories.find((c) => c.id === id);

    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      html: `
        <p class="text-gray-200 mb-2">
          ¿Seguro que deseas eliminar la categoría 
          <b style="color:#a855f7;">${category?.name}</b>?
        </p>
        <p class="text-gray-400 text-sm">(Esto también eliminará sus productos asociados)</p>
      `,
      icon: "warning",
      background: "#1f1f1f",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Error al eliminar la categoría");

        setCategories(categories.filter((cat) => cat.id !== id));
        if (selectedCategory?.id === id) setSelectedCategory(null);

        await Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "La categoría se ha eliminado correctamente.",
          timer: 1500,
          showConfirmButton: false,
          background: "#1f1f1f",
          color: "#fff",
        });
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al eliminar la categoría.",
          background: "#1f1f1f",
          color: "#fff",
        });
      }
    }
  };

  // ✅ Editar categoría
  const handleEditCategory = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      if (editForm.image) formData.append("image", editForm.image);

      const response = await fetch(
        `${API_BASE_URL}/api/categories/${categoryToEdit.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error al editar categoría");

      const updatedCategory = await response.json();
      setCategories(
        categories.map((cat) =>
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      );

      setCategoryToEdit(null);
    } catch (error) {
      console.error("Error editando categoría:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la categoría.",
        background: "#1f1f1f",
        color: "#fff",
      });
    }
  };

  const handleCategoryCreated = (savedCategory) => {
    setCategories([...categories, savedCategory]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* ====== CARRUSEL ====== */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-1 text-center">
          Categorías de Productos
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Selecciona la categoria de productos que deseas ver.
        </p>
      </div>

      <div className="relative select-none">
        <div className="mb-3 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="animate-pulse">↔</span>
          <span>Desliza el carrusel</span>
          <span className="animate-pulse">↔</span>
        </div>

        <button
          onClick={() => scroll("left")}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-black/60 shadow-lg rounded-full p-1 hover:bg-purple-600 transition-colors duration-200"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-black/60 shadow-lg rounded-full p-1 hover:bg-purple-600 transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>

        {/* 🔹 Carrusel con márgenes reducidos */}
        <div
          ref={scrollRef}
          className="flex gap-10 px-8 py-2 overflow-x-scroll scroll-smooth cursor-grab active:cursor-grabbing scrollbar-hide text-lg"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className={`flex-shrink-0 group cursor-pointer rounded-2xl px-2 py-2 transition-all duration-200 ${
                selectedCategory?.id === category.id
                  ? "bg-purple-700/10"
                  : "hover:bg-white/5"
              }`}
              onClick={() => {
              setSelectedCategory(category);
              sessionStorage.setItem("openCategoryId", category.id);
            }}

            >
              <div className="relative mx-auto w-fit">
                <div
                  className={`relative rounded-full p-[3px] transition-all duration-200 ${
                    selectedCategory?.id === category.id
                      ? "bg-gradient-to-br from-purple-300 via-fuchsia-500 to-purple-700 shadow-[0_0_26px_rgba(168,85,247,0.55)]"
                      : "bg-transparent"
                  }`}
                >
                  <div
                    className={`rounded-full p-[2px] transition-all duration-200 ${
                      selectedCategory?.id === category.id
                        ? "bg-white/10"
                        : "bg-transparent"
                    }`}
                  >
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md border transition-all duration-300 ${
                    selectedCategory?.id === category.id
                      ? "border-white/80 scale-[1.09]"
                      : "border-purple-500 group-hover:scale-105"
                  }`}
                />
                  </div>
                </div>
                {isAdmin && categories.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {isAdmin && (
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
                )}
              </div>
              <p
                className={`text-center mt-2 text-sm font-medium uppercase tracking-wide whitespace-normal leading-tight max-w-[90px] mx-auto transition-colors duration-200 ${
                  selectedCategory?.id === category.id
                    ? "text-purple-100"
                    : "text-white"
                }`}
              >
                {category.name}
              </p>
            </div>
          ))}
       
          {/* + AGREGAR CATEGORÍA */}
          {isAdmin && (
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowForm(true)}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-purple-500 hover:bg-purple-700/30 transition-all duration-300 group"
              >
                <Plus className="w-7 h-7 text-gray-400 group-hover:text-purple-400" />
              </button>
              <p className="text-center mt-2 text-sm font-medium text-gray-400 uppercase tracking-wide">
                Agregar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ====== PRODUCTOS ====== */}
      {selectedCategory && (
        <div className="mt-4 p-2">
          <h3 className="text-lg font-semibold text-white mb-3">
            {selectedCategory.name}
          </h3>
          <ProductList category={selectedCategory} />
        </div>
      )}

      {/* ====== MODALES ====== */}
      {isAdmin && showForm && (
        <CategoryForm
          setShowForm={setShowForm}
          onCategoryCreated={handleCategoryCreated}
        />
      )}

      {isAdmin && categoryToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-white mb-4">Editar categoría</h3>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              placeholder="Nombre de la categoría"
            />
            <input
              type="file"
              onChange={(e) =>
                setEditForm({ ...editForm, image: e.target.files[0] })
              }
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

