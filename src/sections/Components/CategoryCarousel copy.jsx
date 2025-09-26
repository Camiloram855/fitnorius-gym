// src/sections/components/CategoryCarousel.jsx
import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"

const CategoryCarousel = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Todo",
      image: "img/imgaaa.jpeg",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", image: "" })
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = 200
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (newCategory.name.trim() && newCategory.image.trim()) {
      const category = {
        id: Date.now(),
        name: newCategory.name.trim(),
        image: newCategory.image.trim(),
      }
      setCategories([...categories, category])
      setNewCategory({ name: "", image: "" })
      setShowForm(false)
    }
  }

  const handleDeleteCategory = (id) => {
    if (categories.length > 1) {
      setCategories(categories.filter((cat) => cat.id !== id))
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Categorías de Productos
        </h2>
        <p className="text-gray-300">Explora nuestras categorías destacadas</p>
      </div>

      <div className="relative">
        {/* Botón Izquierda */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 shadow-lg rounded-full p-2 hover:bg-purple-600 transition-colors duration-200"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Botón Derecha */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 shadow-lg rounded-full p-2 hover:bg-purple-600 transition-colors duration-200"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Carrusel */}
        <div
          ref={scrollRef}
          className="flex gap-6 px-20 py-4 overflow-hidden scroll-smooth"
          style={{ scrollPadding: "3rem" }} // espacio invisible para que no se corten
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0 group cursor-pointer relative"
            >
              <div className="relative">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-28 h-28 rounded-full object-cover shadow-md border border-purple-500 group-hover:scale-105 transition-transform duration-300"
                />
                {categories.length > 1 && (
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Eliminar categoría"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-center mt-3 text-sm font-medium text-white uppercase tracking-wide">
                {category.name}
              </p>
            </div>
          ))}

          {/* Botón Agregar */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowForm(true)}
              className="w-28 h-28 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-purple-500 hover:bg-purple-700/30 transition-all duration-300 group"
            >
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
            </button>
            <p className="text-center mt-3 text-sm font-medium text-gray-400 uppercase tracking-wide">
              Agregar
            </p>
          </div>
        </div>
      </div>

      {/* Modal Crear Categoría */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black rounded-2xl p-8 w-full max-w-md shadow-2xl border border-purple-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Nueva Categoría</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-purple-600 rounded-lg bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Electrónicos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de la imagen
                </label>
                <input
                  type="url"
                  value={newCategory.image}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, image: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-purple-600 rounded-lg bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryCarousel
