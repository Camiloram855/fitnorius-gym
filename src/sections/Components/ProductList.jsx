import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { GripVertical, Plus } from "lucide-react";
import ProductForm from "./ProductForm";
import Swal from "sweetalert2";
import { useAuth } from "../../pages/AuthContext";
import API_BASE_URL from "../../config";

const EDGE_SCROLL_ZONE = 120;
const MAX_SCROLL_SPEED = 28;

const moveItem = (list, from, to) => {
  if (from === to || from < 0 || to < 0) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragPreview, setDragPreview] = useState(null);

  const { isAdmin } = useAuth();

  const dragStateRef = useRef({
    active: false,
    pointerId: null,
    startOrder: [],
    productId: null,
    startRect: null,
    offsetX: 0,
    offsetY: 0,
  });

  const pointerRef = useRef({ x: 0, y: 0 });
  const autoScrollFrameRef = useRef(null);

  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const loadProducts = async () => {
    if (!category?.id) return;
    try {
      const endpoint = `${API_BASE_URL}/api/products/category/${category.id}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
      Swal.fire("Error", "No se pudieron cargar los productos.", "error");
    }
  };

  useEffect(() => {
    loadProducts();
  }, [category]);

  const persistOrder = async (orderedProducts) => {
    const orderedIds = orderedProducts.map((p) => p.id);
    setSavingOrder(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });

      if (!res.ok) throw new Error("No se pudo guardar el orden");
    } catch (error) {
      console.error("Error guardando orden:", error);
      Swal.fire("Error", "No se pudo guardar el nuevo orden.", "error");
      await loadProducts();
    } finally {
      setSavingOrder(false);
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollFrameRef.current) {
      cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  };

  const startAutoScroll = () => {
    if (autoScrollFrameRef.current) return;

    const tick = () => {
      if (!dragStateRef.current.active) {
        stopAutoScroll();
        return;
      }

      const y = pointerRef.current.y;
      const viewportHeight = window.innerHeight;
      let velocity = 0;

      if (y < EDGE_SCROLL_ZONE) {
        const ratio = (EDGE_SCROLL_ZONE - y) / EDGE_SCROLL_ZONE;
        velocity = -Math.max(2, ratio * ratio * MAX_SCROLL_SPEED);
      } else if (y > viewportHeight - EDGE_SCROLL_ZONE) {
        const ratio = (y - (viewportHeight - EDGE_SCROLL_ZONE)) / EDGE_SCROLL_ZONE;
        velocity = Math.max(2, ratio * ratio * MAX_SCROLL_SPEED);
      }

      if (velocity !== 0) {
        window.scrollBy({ top: velocity, behavior: "auto" });
      }

      autoScrollFrameRef.current = requestAnimationFrame(tick);
    };

    autoScrollFrameRef.current = requestAnimationFrame(tick);
  };

  const stopDrag = async () => {
    if (!dragStateRef.current.active) return;

    const initial = dragStateRef.current.startOrder;
    const current = products.map((p) => p.id);

    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = null;
    dragStateRef.current.productId = null;
    dragStateRef.current.startRect = null;

    stopAutoScroll();

    setDraggedId(null);
    setOverId(null);
    setDragPreview(null);

    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      await persistOrder(products);
    }
  };

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!dragStateRef.current.active || draggedId == null) return;

      pointerRef.current = { x: e.clientX, y: e.clientY };

      const offsetX = dragStateRef.current.offsetX;
      const offsetY = dragStateRef.current.offsetY;
      setDragPreview((prev) =>
        prev
          ? {
              ...prev,
              x: e.clientX - offsetX,
              y: e.clientY - offsetY,
            }
          : prev
      );

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const dropZone = el?.closest?.("[data-product-id]");
      if (!dropZone) return;

      const targetId = Number(dropZone.getAttribute("data-product-id"));
      if (!targetId || targetId === draggedId) return;

      setOverId(targetId);

      setProducts((prev) => {
        const from = prev.findIndex((p) => p.id === draggedId);
        const to = prev.findIndex((p) => p.id === targetId);
        if (from === -1 || to === -1 || from === to) return prev;
        return moveItem(prev, from, to);
      });
    };

    const onPointerUp = async () => {
      await stopDrag();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [draggedId, products]);

  const handleDragStart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAdmin || savingOrder) return;

    const cardRoot = e.currentTarget.closest("[data-product-id]");
    if (!cardRoot) return;

    const rect = cardRoot.getBoundingClientRect();
    pointerRef.current = { x: e.clientX, y: e.clientY };

    dragStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startOrder: products.map((p) => p.id),
      productId: product.id,
      startRect: rect,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };

    setDraggedId(product.id);
    setOverId(product.id);
    setDragPreview({
      product,
      width: rect.width,
      height: rect.height,
      x: rect.left,
      y: rect.top,
    });

    startAutoScroll();
  };

  const handleDeleteProduct = async (id) => {
    const confirm = await Swal.fire({
      title: "Estas seguro?",
      text: "Esta accion eliminara el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        Swal.fire("Eliminado", "El producto fue eliminado correctamente.", "success");
      } else {
        Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      Swal.fire("Error", "Hubo un problema con la conexion al servidor.", "error");
    }
  };

  const handleProductCreated = (savedProduct) => {
    setProducts((prev) => [...prev, savedProduct]);
    setShowProductForm(false);
  };

  useEffect(() => {
    return () => stopAutoScroll();
  }, []);

  return (
    <div className="mt-6">
      {isAdmin && (
        <div className="mb-3 text-xs text-gray-500 flex items-center justify-between">
          <span>Manten presionado el icono y arrastra para reordenar.</span>
          {savingOrder && <span className="text-purple-600 font-semibold">Guardando orden...</span>}
        </div>
      )}

      <div className="grid justify-center gap-6 sm:gap-7 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.length === 0 && (
          <p className="text-gray-400 col-span-full text-center">No hay productos en esta categoria</p>
        )}

        {products.map((product) => {
          const isDragging = draggedId === product.id;
          const isDropTarget = overId === product.id && draggedId !== product.id;

          return (
            <div
              key={product.id}
              data-product-id={product.id}
              className={`relative h-full transition-all duration-200 ${
                isDragging ? "opacity-20 scale-95" : "opacity-100"
              } ${isDropTarget ? "ring-2 ring-purple-500 ring-offset-2 rounded-xl" : ""}`}
            >
              {isDropTarget && (
                <div className="absolute -top-1 left-3 right-3 h-1 rounded-full bg-purple-500 z-30 shadow" />
              )}

              {isAdmin && (
                <button
                  type="button"
                  onPointerDown={(e) => handleDragStart(e, product)}
                  className="absolute top-2 right-2 z-20 p-2.5 sm:p-2 rounded-lg bg-purple-700/95 text-white border border-white/40 shadow-lg hover:bg-purple-800 active:scale-95 touch-none"
                  style={{ touchAction: "none" }}
                  title="Arrastrar para reordenar"
                >
                  <GripVertical size={20} />
                </button>
              )}

              <ProductCard
                product={product}
                onDelete={handleDeleteProduct}
                onUpdate={handleUpdateProduct}
              />
            </div>
          );
        })}

        {isAdmin && (
          <div
            onClick={() => setShowProductForm(true)}
            className="w-full flex-1 h-full rounded-xl border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-700/30 transition-all duration-300"
          >
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
            <p className="mt-2 text-sm text-gray-400 text-center">Agregar Producto</p>
          </div>
        )}
      </div>

      {dragPreview && dragPreview.product && (
        <div
          className="fixed z-[999] pointer-events-none"
          style={{
            left: `${dragPreview.x}px`,
            top: `${dragPreview.y}px`,
            width: `${dragPreview.width}px`,
            transform: "scale(1.03)",
          }}
        >
          <div className="rounded-xl shadow-2xl ring-2 ring-purple-500/70">
            <ProductCard product={dragPreview.product} />
          </div>
        </div>
      )}

      {showProductForm && (
        <ProductForm
          setShowProductForm={setShowProductForm}
          selectedCategory={category}
          onProductCreated={handleProductCreated}
        />
      )}
    </div>
  );
};

export default ProductList;
