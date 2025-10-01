import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Plus } from "lucide-react";
import ProductForm from "./ProductForm";

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);

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

  // 🗑 Eliminar producto
  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar producto");
      setProducts(products.filter((prod) => prod.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // ➕ Agregar producto nuevo
  const handleProductCreated = (savedProduct) => {
    console.log("📦 Nuevo producto creado:", savedProduct);
    // Se agrega directamente al state para no recargar todo
    setProducts((prev) => [...prev, savedProduct]);
    setShowProductForm(false);
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        {category.name} - Productos
      </h3>

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

        {/* 📌 Botón Agregar Producto */}
        <div
          onClick={() => setShowProductForm(true)}
          className="w-60 h-40 rounded-xl border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-700/30 transition-all duration-300"
        >
          <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
          <p className="mt-2 text-sm text-gray-400">Agregar Producto</p>
        </div>
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
