import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"

const CategoryCarousel = () => {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null) // ✅ categoría seleccionada
  const [showForm, setShowForm] = useState(false) // modal categoría
  const [showProductForm, setShowProductForm] = useState(false) // modal producto
  const [newCategory, setNewCategory] = useState({ name: "", image: null })
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    discount: "",
    image: null,
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [previewProductImage, setPreviewProductImage] = useState(null)

  const scrollRef = useRef(null)

  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error cargando categorías:", err))
  }, [])

  const scroll = (direction) => {
    const container = scrollRef.current
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      })
    }
  }

  // ================= CATEGORÍAS =================
  const handleCategoryFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewCategory({ ...newCategory, image: file })
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()

    if (newCategory.name.trim() && newCategory.image) {
      const formData = new FormData()
      formData.append("name", newCategory.name.trim())
      formData.append("image", newCategory.image)

      try {
        const response = await fetch("http://localhost:8080/api/categories", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("Error al guardar la categoría")

        const savedCategory = await response.json()

        setCategories([...categories, savedCategory])
        setNewCategory({ name: "", image: null })
        setPreviewImage(null)
        setShowForm(false)
      } catch (error) {
        console.error("Error:", error)
      }
    }
  }

  const handleDeleteCategory = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/categories/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar la categoría")

      setCategories(categories.filter((cat) => cat.id !== id))
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // ================= PRODUCTOS =================
  const handleProductFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewProduct({ ...newProduct, image: file })
      setPreviewProductImage(URL.createObjectURL(file))
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!selectedCategory) return

    const formData = new FormData()
    formData.append("name", newProduct.name)
    formData.append("price", newProduct.price)
    formData.append("discount", newProduct.discount)
    formData.append("image", newProduct.image)
    formData.append("categoryId", selectedCategory.id)

    try {
      const response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Error al guardar producto")

      const savedProduct = await response.json()
      console.log("Producto creado:", savedProduct)

      setNewProduct({ name: "", price: "", discount: "", image: null })
      setPreviewProductImage(null)
      setShowProductForm(false)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* ====== CARRUSEL ====== */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Categorías de Productos
        </h2>
        <p className="text-gray-300">Explora nuestras categorías destacadas</p>
      </div>

      <div className="relative">
        {/* Botones de scroll */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 shadow-lg rounded-full p-2 hover:bg-purple-600 transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 shadow-lg rounded-full p-2 hover:bg-purple-600 transition-colors duration-200"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Carrusel */}
        <div ref={scrollRef} className="flex gap-6 px-20 py-4 overflow-hidden scroll-smooth">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0 group cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              <div className="relative">
                <img
                  src={`http://localhost:8080${category.image}`}
                  alt={category.name}
                  className="w-28 h-28 rounded-full object-cover shadow-md border border-purple-500 group-hover:scale-105 transition-transform duration-300"
                />
                {categories.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCategory(category.id)
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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

          {/* + AGREGAR CATEGORÍA (mantener como estaba) */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowForm(true)}
              className="w-28 h-28 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-purple-500 hover:bg-purple-700/30 transition-all duration-300 group"
            >
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
            </button>
            <p className="text-center mt-3 text-sm font-medium text-gray-400 uppercase tracking-wide">
              Agregar
            </p>
          </div>
        </div>
      </div>

      {/* ====== TARJETA + AGREGAR PRODUCTO ====== */}
      {selectedCategory && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            {selectedCategory.name} - Productos
          </h3>
          <div
            onClick={() => setShowProductForm(true)}
            className="w-60 h-40 rounded-xl border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-700/30 transition-all duration-300"
          >
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
            <p className="mt-2 text-sm text-gray-400">Agregar Producto</p>
          </div>
        </div>
      )}

      {/* ====== MODAL CREAR CATEGORÍA ====== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black rounded-2xl p-8 w-full max-w-md shadow-2xl border border-purple-700">
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-3 border border-purple-600 rounded-lg bg-black/50 text-white"
                  placeholder="Ej: Accesorios"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen
                </label>
                <input type="file" accept="image/*" onChange={handleCategoryFileChange} required />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="mt-4 w-28 h-28 rounded-full object-cover border border-purple-500"
                  />
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== MODAL CREAR PRODUCTO ====== */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black rounded-2xl p-8 w-full max-w-md shadow-2xl border border-purple-700">
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Precio</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Descuento</label>
                <input
                  type="number"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-600 rounded-lg bg-black/50 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Imagen</label>
                <input type="file" accept="image/*" onChange={handleProductFileChange} required />
                {previewProductImage && (
                  <img
                    src={previewProductImage}
                    alt="Preview"
                    className="mt-4 w-32 h-32 rounded-lg object-cover border border-purple-500"
                  />
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500"
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
