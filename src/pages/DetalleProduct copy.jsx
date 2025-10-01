import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DetalleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("Error cargando producto:", err));
  }, [id]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950">
        <p className="text-purple-400 text-xl animate-pulse">Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-purple-950 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900 via-black to-purple-950 rounded-3xl shadow-2xl p-10 flex flex-col md:flex-row gap-10 border border-purple-800/50">
        
        {/* Imagen del producto */}
        <div className="w-full md:w-1/2 relative">
          <img
            src={
              product.imageUrl
                ? `http://localhost:8080${product.imageUrl}`
                : "/img/default.jpg"
            }
            alt={product.name}
            className="w-full h-[450px] rounded-2xl object-cover shadow-lg border-2 border-purple-600"
          />
          {/* Etiqueta de categoría */}
          <span className="absolute top-4 left-4 bg-purple-700/80 backdrop-blur px-4 py-1 rounded-full text-sm font-semibold uppercase shadow-md">
            {product.categoryName}
          </span>
          {/* Badge promo */}
          {product.oldPrice && (
            <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-yellow-700 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ¡Oferta!
            </span>
          )}
        </div>

        {/* Info del producto */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-4xl font-extrabold mb-4 text-purple-300 drop-shadow-md uppercase tracking-wider">
            {product.name}
          </h1>

          {/* Precios */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-purple-400">
              ${product.price}
            </span>
            {product.oldPrice && (
              <span className="text-lg line-through text-gray-400">
                ${product.oldPrice}
              </span>
            )}
            {product.oldPrice && (
              <span className="bg-purple-800/50 px-3 py-1 rounded-full text-sm font-semibold text-purple-200 shadow-inner">
                Ahorra ${product.oldPrice - product.price}
              </span>
            )}
          </div>

          {/* Caja de descripción */}
          <div className="bg-black/50 border border-purple-700 rounded-xl p-5 text-gray-200 shadow-inner mb-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">
              Descripción del producto
            </h3>
            <p className="whitespace-pre-line leading-relaxed">
              {product.description ||
                "Este producto aún no tiene descripción disponible."}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-purple-900/50">
              🛒 Añadir al carrito
            </button>
            <button className="flex-1 px-6 py-4 border border-purple-600 hover:bg-purple-900/40 text-purple-300 font-semibold rounded-xl shadow-md transition transform hover:-translate-y-1">
              ❤️ Añadir a favoritos
            </button>
          </div>
        </div>
      </div>

      {/* Sección recomendados */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6 text-purple-400">
          Productos recomendados
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Placeholder de recomendados */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gray-900 via-black to-purple-950 rounded-xl shadow-md p-4 flex flex-col items-center hover:scale-105 transition transform border border-purple-700/40"
            >
              <div className="w-full h-40 bg-purple-900/30 rounded-lg mb-3"></div>
              <p className="text-sm text-gray-300">Producto {i}</p>
              <span className="text-purple-400 font-semibold">$99.99</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
