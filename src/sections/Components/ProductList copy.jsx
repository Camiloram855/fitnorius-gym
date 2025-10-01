import { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import ProductCard from "./ProductCard"; // 👈 Usa este

const ProductPage = ({ selectedCategory }) => {
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/products/category/${selectedCategory.id}`
        );
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("❌ Error cargando productos:", err);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleProductCreated = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  return (
    <section className="relative bg-gradient-to-bl from-black via-black-900 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowProductForm(true)}
            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500"
          >
            + Agregar Producto
          </button>
        </div>

        {/* 👇 aquí aseguramos que usa tu ProductCard bonito */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {showProductForm && (
        <ProductForm
          setShowProductForm={setShowProductForm}
          selectedCategory={selectedCategory}
          onProductCreated={handleProductCreated}
        />
      )}
    </section>
  );
};

export default ProductPage;
