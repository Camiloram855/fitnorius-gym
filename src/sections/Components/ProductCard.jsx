import { Link } from "react-router-dom";

export default function ProductCard({ product, onDelete }) {
  const hasPromo =
    product.oldPrice !== null &&
    product.oldPrice !== undefined &&
    Number(product.price) < Number(product.oldPrice);

  const ahorro = hasPromo
    ? (Number(product.oldPrice) - Number(product.price)).toFixed(2)
    : null;

  const handleDelete = async (e) => {
    e.preventDefault(); // evita que el Link redireccione
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      try {
        await fetch(`http://localhost:8080/api/products/${product.id}`, {
          method: "DELETE",
        });
        if (onDelete) {
          onDelete(product.id); // refresca la lista desde el padre
        }
      } catch (error) {
        console.error("Error eliminando producto:", error);
      }
    }
  };

  return (
    <div className="block w-full max-w-[250px] mx-auto">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 ease-in-out hover:-translate-y-1 flex flex-col cursor-pointer">
        {/* ✅ Imagen y enlace al detalle */}
        <Link
          to={`/catalog/producto/${product.id}`} // 🔥 ruta consistente con DetalleProduct
          className="relative w-full h-[280px] overflow-hidden rounded-t-xl block group"
        >
          <img
            src={
              product.imageUrl
                ? `http://localhost:8080${product.imageUrl}`
                : "/img/default.jpg"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => (e.target.src = "/img/default.jpg")}
          />
          {hasPromo && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-700 px-3 py-1 rounded-full shadow-md">
              <span className="text-white font-bold text-xs uppercase">
                ¡PROMO!
              </span>
            </div>
          )}
        </Link>

        {/* ✅ Contenido */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wide mb-2 line-clamp-1">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-green-600 font-bold text-lg">
                ${product.price}
              </span>
              {product.oldPrice && (
                <span className="text-gray-400 line-through text-sm">
                  ${product.oldPrice}
                </span>
              )}
            </div>

            {ahorro && (
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                -${ahorro}
              </span>
            )}
          </div>

          {/* ✅ Botón de eliminar */}
          <button
            onClick={handleDelete}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
