import { Search } from "lucide-react"

export default function SearchSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
            ¿Qué estás buscando?
          </h2>
          <p className="text-gray-300 text-lg">
            Encuentra exactamente lo que necesitas en nuestra amplia selección
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos, marcas, categorías..."
              className="w-full pl-12 pr-6 py-4 bg-transparent border border-white/40 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
            />
          </div>

          {/* Search Button */}
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
            Buscar
          </button>
        </div>


      </div>
    </section>
  )
}
