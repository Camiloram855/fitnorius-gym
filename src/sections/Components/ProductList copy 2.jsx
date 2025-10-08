import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Plus } from "lucide-react";
import ProductForm from "./ProductForm";
import Swal from "sweetalert2";
import { useAuth } from "../../pages/AuthContext"; // ✅ Importamos el contexto

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const { isAdmin } = useAuth(); // ✅ Saber si el admin está logueado

  // 🔎 Cargar productos de la categoría seleccionada
  const loadProducts = async () => {
    if (!category) return;
    try {
      console.log("🔎 Cargando productos de la categoría:", category.id);
      const res = await fetch(
        `http://localhost:8080/api/products/category/${category.id}`
      );

      if (!res.ok) throw new Error("Error cargando productos");

      const data = await res.json();
      console.log("✅ Productos recibidos:", data);

      setProducts(data);
    } catch (err) {
      console.error("❌ Error cargando productos:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [category]);

  // 🗑 Eliminar producto con confirmación SweetAlert2
// 🗑 Eliminar producto con confirmación SweetAlert2
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

  if (confirm.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: "DELETE",
      });

      // ✅ Si el backend devuelve 204 o 200, se considera éxito
      if (response.ok) {
        setProducts((prev) => prev.filter((prod) => prod.id !== id));

        Swal.fire("Eliminado", "El producto fue eliminado con éxito.", "success");
      } else {
        const errorText = await response.text(); // leer texto en lugar de JSON
        console.error("❌ Error del servidor:", errorText);
        Swal.fire("Error", "Hubo un problema al eliminar el producto.", "error");
      }
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error);
      Swal.fire("Error", "Hubo un problema al eliminar el producto.", "error");
    }
  }
};


  // ➕ Agregar producto nuevo
  const handleProductCreated = (savedProduct) => {
    console.log("📦 Nuevo producto creado:", savedProduct);
    setProducts((prev) => [...prev, savedProduct]); // Se agrega directo al state
    setShowProductForm(false);
  };

  return (
    <div className="mt-6">
      <div className="flex gap-4 flex-wrap">
        {products.length === 0 && (
          <p className="text-gray-400">No hay productos en esta categoría</p>
        )}

        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={handleDeleteProduct}
          />
        ))}

        {/* 🔒 Botón Agregar Producto solo visible si el admin está logueado */}
        {isAdmin && (
          <div
            onClick={() => setShowProductForm(true)}
            className="w-60 h-40 rounded-xl border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-700/30 transition-all duration-300"
          >
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
            <p className="mt-2 text-sm text-gray-400">Agregar Producto</p>
          </div>
        )}
      </div>

      {/* 📌 Modal de Formulario Producto */}
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
