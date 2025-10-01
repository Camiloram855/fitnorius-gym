// src/components/ProductCard.jsx
export default function ProductCard({ product }) {
  const hasPromo = product.oldPrice && product.price < product.oldPrice;
  const ahorro =
    hasPromo && product.oldPrice
      ? (product.oldPrice - product.price).toFixed(2)
      : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out overflow-hidden group">
      {/* Imagen */}
      <div className="relative overflow-hidden">
        <img
          src={
            product.imageUrl
              ? `http://localhost:8080${product.imageUrl}`
              : "/img/default.jpg"
          }
          alt={product.name}
          className="w-full h-48 sm:h-56 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
        />

        {hasPromo && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-700 px-3 py-1 rounded-full">
            <span className="text-white font-bold text-xs sm:text-sm">
              ¡PROMO!
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-6">
        {/* Nombre */}
        <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-3 uppercase tracking-wide leading-tight">
          {product.name}
        </h3>

        {/* Precios */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-green-500 font-bold text-lg sm:text-xl">
              ${product.price}
            </span>
            {product.oldPrice && (
              <span className="text-gray-400 line-through text-sm sm:text-base">
                ${product.oldPrice}
              </span>
            )}
          </div>

          {ahorro && (
            <div className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-full self-start sm:self-auto">
              AHORRA ${ahorro}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
