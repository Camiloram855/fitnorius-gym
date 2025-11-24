import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Plus } from "lucide-react";
import ProductForm from "./ProductForm";
import Swal from "sweetalert2";
import { useAuth } from "../../pages/AuthContext";
import API_BASE_URL from "../../config";

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const { isAdmin } = useAuth();

  // 🔄 Actualizar producto (agotado / disponible)
  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      )
    );
  };

  // 🔎 Cargar productos
  const loadProducts = async () => {
    if (!category?.id) return;
    try {
      const endpoint = `${API_BASE_URL}/api/products/category/${category.id}`;
      console.log("🔎 Cargando productos desde:", endpoint);

      const res = await fetch(endpoint);
      if (!res.ok) {
        console.error("❌ Error HTTP:", res.status, res.statusText);
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setProducts(data);
      console.log("✅ Productos recibidos:", data);
    } catch (err) {
      console.error("❌ Error cargando productos:", err);
      Swal.fire("Error", "No se pudieron cargar los productos.", "error");
    }
  };

  useEffect(() => {
    loadProducts();
  }, [category]);

  // 🗑 Eliminar producto
  const handleDeleteProduct = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
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
        const errorText = await response.text();
        console.error("❌ Error del servidor:", errorText);
        Swal.fire("Error", "No se pudo eliminar el producto.", "error");
      }
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error);
      Swal.fire("Error", "Hubo un problema con la conexión al servidor.", "error");
    }
  };

  // ➕ Producto creado
  const handleProductCreated = (savedProduct) => {
    console.log("📦 Nuevo producto creado:", savedProduct);
    setProducts((prev) => [...prev, savedProduct]);
    setShowProductForm(false);
  };

  return (
    <div className="mt-6">
      {/* GRID */}
      <div className="grid gap-4 justify-center grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        
        {products.length === 0 && (
          <p className="text-gray-400 col-span-full text-center">
            No hay productos en esta categoría
          </p>
        )}

        {products.map((product) => (
          <ProductCard
            key={product.id} // 🔥 key limpio (antes causaba bugs)
            product={product}
            onDelete={handleDeleteProduct}
            onUpdate={handleUpdateProduct}
          />
        ))}

        {/* Botón agregar producto */}
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

      {/* MODAL */}
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
