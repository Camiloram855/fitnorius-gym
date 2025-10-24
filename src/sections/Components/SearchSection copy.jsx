import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 🌍 Detecta si estás en local o producción (Railway)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function SearchSection() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // 🔍 Buscar productos
  const handleSearch = async (searchTerm) => {
    const trimmedQuery = searchTerm.trim();

    // 🧹 Si está vacío, limpiar resultados y errores
    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      return;
    }

    // 🔠 Solo buscar si hay al menos 3 caracteres
    if (trimmedQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/search?query=${encodeURIComponent(trimmedQuery)}`
      );

      if (!response.ok) throw new Error("Error al buscar productos");

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("❌ Error al buscar productos:", err);
      setError("Ocurrió un error al buscar productos. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Búsqueda con debounce (espera 400ms tras escribir)
  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch(query);
    }, 400);
    return () => clearTimeout(delay);
  }, [query]);

  // 🧠 Buscar al presionar Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(query);
    }
  };

  // 🚀 Ir al detalle del producto
  const handleProductClick = (id) => {
    navigate(`/catalog/producto/${id}`);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Qué estás buscando?
          </h2>
          <p className="text-gray-300 text-lg">
            Encuentra exactamente lo que necesitas en nuestra amplia selección
          </p>
        </div>

        {/* 🔎 Barra de búsqueda */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Buscar productos, marcas, categorías..."
              className="w-full pl-12 pr-24 py-4 bg-transparent border border-white/40 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
            />

            <button
              onClick={() => handleSearch(query)}
              disabled={loading || query.trim().length < 3}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>

        {/* ⚠️ Mensaje de error */}
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      </div>

      {/* 🧾 Resultados */}
      <div className="mt-12 px-4 md:px-10">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((product) => {
              // 🖼️ Construcción dinámica del URL de la imagen
              const imageSrc = product.imageUrl
                ? product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : `${API_BASE_URL}${product.imageUrl}`
                : "/no-image.png";

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-[#181818] rounded-2xl p-4 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-60 object-cover rounded-xl mb-3"
                    onError={(e) => (e.target.src = "/no-image.png")}
                  />
                  <h3 className="text-white text-lg font-semibold mb-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-purple-400 font-bold">${product.price}</p>
                </div>
              );
            })}
          </div>
        ) : (
          query.length >= 3 &&
          !loading && (
            <p className="text-gray-400 text-center mt-8">
              No se encontraron productos para “{query}”.
            </p>
          )
        )}
      </div>
    </section>
  );
}
