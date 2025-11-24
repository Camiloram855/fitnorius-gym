import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// Normalizador universal para imágenes
// Normalizador universal para imágenes con WebP automático
const normalizeImg = (url) => {
  if (!url) return "/no-image.webp";

  // Si es imagen de Cloudinary → convertir a WebP
  if (url.startsWith("http") && url.includes("res.cloudinary.com")) {
    return url.replace("/upload/", "/upload/f_webp,q_auto/");
  }

  // Si viene del backend (/uploads/xxx.png)
  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
};


export default function SearchSection() {

  // 🔥 FORZAR SCROLL ARRIBA SIEMPRE QUE ENTRES AQUÍ
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }, []);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (searchTerm) => {
    const trimmedQuery = searchTerm.trim();
    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      return;
    }
    if (trimmedQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/search?query=${encodeURIComponent(
          trimmedQuery
        )}`
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

  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch(query);
    }, 400);
    return () => clearTimeout(delay);
  }, [query]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(query);
    }
  };

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

        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      </div>

      {/* 🧾 Resultados */}
      <div className="mt-12 px-4 md:px-10">
        {results.length > 0 ? (
          <div
            className="
              grid 
              grid-cols-2 
              sm:grid-cols-2 
              md:grid-cols-3 
              lg:grid-cols-4 
              gap-5
              place-items-center
            "
          >
            {results.map((product) => {
              const imageSrc = normalizeImg(product.imageUrl);

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="
                    w-[170px] h-[310px]
                    sm:w-[180px] sm:h-[330px]
                    md:w-[200px] md:h-[360px]
                    lg:w-[230px] lg:h-[390px]
                    xl:w-[250px] xl:h-[420px]
                    bg-[#181818] rounded-2xl border border-white/10 
                    hover:border-purple-400/30 shadow-lg hover:shadow-purple-500/20 
                    transition-all duration-300 cursor-pointer group flex flex-col
                  "
                >
                  <div
                    className="
                      w-full 
                      h-[170px] sm:h-[180px] md:h-[200px] lg:h-[230px] xl:h-[250px]
                      bg-[#121212] 
                      rounded-t-2xl 
                      overflow-hidden 
                      flex items-center justify-center
                    "
                  >
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => (e.target.src = "/no-image.png")}
                    />
                  </div>

                  <div
                    className="
                      p-3 flex flex-col justify-between 
                      h-[140px] sm:h-[150px] md:h-[160px] lg:h-[170px] xl:h-[180px]
                    "
                  >
                    <h3 className="text-white text-sm md:text-base font-semibold mb-1 line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-gray-400 text-xs md:text-sm mb-2 line-clamp-2 whitespace-pre-line">
                      {product.description}
                    </p>

                    <p className="text-purple-400 font-bold text-base md:text-lg mt-auto">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 2,
                      }).format(product.price)}
                    </p>
                  </div>
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
