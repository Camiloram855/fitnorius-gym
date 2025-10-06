import { useState } from "react"
import { Search } from "lucide-react"

export default function SearchSection({ onResults }) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ✅ Manejar búsqueda
  const handleSearch = async () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `http://localhost:8080/api/products/search?query=${encodeURIComponent(trimmedQuery)}`
      )

      if (!response.ok) {
        throw new Error("Error al buscar productos")
      }

      const data = await response.json()

      // ✅ Enviar resultados al padre si existe el callback
      if (onResults) {
        onResults(data)
      }
    } catch (err) {
      console.error("Error al buscar productos:", err)
      setError("Ocurrió un error al buscar productos. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Permitir búsqueda con la tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
            ¿Qué estás buscando?
          </h2>
          <p className="text-gray-300 text-lg">
            Encuentra exactamente lo que necesitas en nuestra amplia selección
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Buscar productos, marcas, categorías..."
              className="w-full pl-12 pr-6 py-4 bg-transparent border border-white/40 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
            />
          </div>

          {/* Botón Buscar */}
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <p className="text-red-400 text-center mt-4">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}
