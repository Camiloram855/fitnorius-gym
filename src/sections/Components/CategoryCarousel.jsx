import { useState, useRef, useEffect, useCallback } from "react";
import { apiFetch } from "../../api/client";
import API_BASE_URL from "../../config";
import { ChevronLeft, ChevronRight, Plus, X, Pencil } from "lucide-react";
import CategoryForm from "./CategoryForm";
import ProductList from "./ProductList";
import PromoBanner from "../../components/PromoBanner";
import { useAuth } from "../../pages/AuthContext";
import Swal from "sweetalert2";

const CategoryCarousel = () => {
  const [categories, setCategories] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState("loading");
  const [categoryRetry, setCategoryRetry] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", image: null });

  const scrollRef = useRef(null);
  const inertiaFrameRef = useRef(null);
  const { isAdmin } = useAuth();

  const stopInertia = useCallback(() => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

  // ✅ Cargar categorías
  useEffect(() => {
    let cancelled = false;
    setCategoryStatus("loading");
    const fetchCategories = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/categories`);
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Respuesta de categorías inválida");
        if (cancelled) return;
        setCategories(data);
        setCategoryStatus("ready");
      } catch (err) {
        if (!cancelled) setCategoryStatus("error");
        console.error("Error cargando categorías:", err);
      }
    };
    fetchCategories();
    return () => { cancelled = true; };
  }, [categoryRetry]);

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
  if (categories.length > 0) {
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
    if (!container) return;
    stopInertia();
    container.scrollBy({
      left: direction === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  // ✅ Arrastre suave con Pointer Events (ratón y móvil por igual).
  // Antes había listeners de mouse/touch separados con un multiplicador de
  // 2.2: la cinta corría el doble que el dedo y, con scroll-behavior:smooth
  // activo, cada movimiento iniciaba una animación nueva y se "perdía".
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;

    // Durante el arrastre el seguimiento es inmediato; la suavidad se aplica
    // al soltar, con una inercia corta y limitada.
    const previousBehavior = container.style.scrollBehavior;
    container.style.scrollBehavior = "auto";

    let drag = null;

    const velocityOf = (samples) => {
      if (!samples || samples.length < 2) return 0;
      const last = samples[samples.length - 1];
      let first = samples[0];
      for (let i = samples.length - 1; i >= 0; i -= 1) {
        if (last.t - samples[i].t <= 100) first = samples[i];
        else break;
      }
      const elapsed = last.t - first.t;
      if (elapsed <= 0) return 0;
      return (last.x - first.x) / elapsed; // px por milisegundo
    };

    const onPointerDown = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      stopInertia();
      drag = {
        startX: event.clientX,
        startY: event.clientY,
        startScroll: container.scrollLeft,
        samples: [{ x: event.clientX, t: performance.now() }],
        moved: false,
      };
    };

    const onPointerMove = (event) => {
      if (!drag) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;

      if (!drag.moved) {
        // Gestos verticales: no los capturamos, la página sigue scrolleando.
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
          drag = null;
          return;
        }
        if (Math.abs(dx) < 4) return;
        drag.moved = true;
        try {
          container.setPointerCapture(event.pointerId);
        } catch {
          // Si el navegador no permite capturar, el arrastre continúa igual.
        }
      }

      drag.samples.push({ x: event.clientX, t: performance.now() });
      if (drag.samples.length > 6) drag.samples.shift();

      // Seguimiento 1:1 (antes * 2.2): el contenido acompaña al dedo y el
      // deslizamiento se percibe más lento, fluido y controlado.
      container.scrollLeft = drag.startScroll - dx;
    };

    const endDrag = () => {
      if (!drag) return;
      const gesture = drag;
      drag = null;
      if (!gesture.moved) return;

      const max = Math.max(0, container.scrollWidth - container.clientWidth);
      // Inercia corta y con tope: un latigazo no puede sacar la cinta.
      const velocity = Math.max(-1.4, Math.min(1.4, velocityOf(gesture.samples)));
      const projected = container.scrollLeft - velocity * 130;
      const target = Math.max(0, Math.min(max, projected));

      const start = container.scrollLeft;
      const distance = target - start;
      if (Math.abs(distance) < 2) return;

      const duration = Math.min(420, Math.max(180, Math.abs(distance) * 0.9));
      const started = performance.now();

      const tick = (now) => {
        const t = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        container.scrollLeft = start + distance * eased;
        if (t < 1) inertiaFrameRef.current = requestAnimationFrame(tick);
        else inertiaFrameRef.current = null;
      };
      inertiaFrameRef.current = requestAnimationFrame(tick);
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);
    container.addEventListener("lostpointercapture", endDrag);

    return () => {
      stopInertia();
      container.style.scrollBehavior = previousBehavior;
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", endDrag);
      container.removeEventListener("pointercancel", endDrag);
      container.removeEventListener("lostpointercapture", endDrag);
    };
  }, [stopInertia]);

  // ✅ Eliminar categoría
  const handleDeleteCategory = async (id) => {
    const category = categories.find((c) => c.id === id);

    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: `¿Seguro que deseas eliminar la categoría "${category?.name || "sin nombre"}"? Esto también eliminará sus productos asociados.`,
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
        const response = await apiFetch(`${API_BASE_URL}/api/categories/${id}`, {
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

      const response = await apiFetch(
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
      <style>{`
        @keyframes carouselHintLeft {
          0%, 100% { transform: translateX(0); opacity: 0.85; }
          50% { transform: translateX(-4px); opacity: 1; }
        }
        @keyframes carouselHintRight {
          0%, 100% { transform: translateX(0); opacity: 0.85; }
          50% { transform: translateX(4px); opacity: 1; }
        }
      `}</style>

      {/* ====== CARRUSEL ====== */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-1 text-center">
          Categorías de Productos
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Desliza para seleccionar mas productos.
        </p>
      </div>

      <div className="relative select-none">
        <div className="mb-3 flex items-center justify-center gap-8 text-white/95">
          <span
            className="text-3xl font-black drop-shadow-[0_0_14px_rgba(255,255,255,0.8)]"
            style={{ animation: "carouselHintLeft 1.6s ease-in-out infinite" }}
          >
            {"<"}
          </span>
          <span
            className="text-3xl font-black drop-shadow-[0_0_14px_rgba(255,255,255,0.8)]"
            style={{ animation: "carouselHintRight 1.6s ease-in-out infinite" }}
          >
            {">"}
          </span>
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
          className="flex gap-10 px-8 py-2 overflow-x-scroll touch-pan-y cursor-grab active:cursor-grabbing scrollbar-hide text-lg"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0 group cursor-pointer px-2 py-2 transition-all duration-200 hover:bg-white/5 rounded-2xl"
              onClick={() => {
              setSelectedCategory(category);
              sessionStorage.setItem("openCategoryId", category.id);
            }}

            >
              <div className="relative mx-auto w-fit">
                <div
                  className={`relative rounded-full p-[3px] transition-all duration-200 ${
                    selectedCategory?.id === category.id
                      ? "border-[4px] border-purple-400/90 p-[5px] scale-110"
                      : "border-[2px] border-transparent"
                  }`}
                >
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md border transition-all duration-300 ${
                    selectedCategory?.id === category.id
                      ? "border-purple-200/90 scale-110"
                      : "border-purple-500 group-hover:scale-105"
                  }`}
                />
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

      {/* ====== BANNER DE PROMOCIONES ======
          Va entre el carrusel de categorías y el listado de productos. */}
      <PromoBanner />

      {categoryStatus === "loading" && <p role="status" className="min-h-[300px] p-8 text-center text-purple-200">Cargando catálogo…</p>}
      {categoryStatus === "error" && <div role="alert" className="p-8 text-center">
        <p>No pudimos cargar el catálogo.</p>
        <button type="button" onClick={() => setCategoryRetry((value) => value + 1)} className="mt-4 rounded-full bg-purple-600 px-5 py-2">Reintentar</button>
      </div>}
      {categoryStatus === "ready" && categories.length === 0 && <p className="p-8 text-center">No hay categorías disponibles.</p>}
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
