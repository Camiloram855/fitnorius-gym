import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { User, ShoppingCart, X } from "lucide-react"
import { useCart } from "../../pages/CartContext" // 👈 asegúrate de que esta ruta sea correcta

const ScrollingHeader = () => {
  const messages = [
    "🚚 ENVÍOS GRATIS DESDE 580,900 A TODO COLOMBIA*",
    "🔥 OFERTAS EXCLUSIVAS EN PRODUCTOS DESTACADOS",
    "🔥 NUEVAS COLECCIONES DISPONIBLES YA",
  ]

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState("enter")
  const [showCart, setShowCart] = useState(false)
  const cartRef = useRef(null)

  const { cartItems, removeFromCart } = useCart()

  useEffect(() => {
    let timer
    if (phase === "enter") {
      timer = setTimeout(() => setPhase("stay"), 500)
    } else if (phase === "stay") {
      timer = setTimeout(() => setPhase("exit"), 3000)
    } else if (phase === "exit") {
      timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length)
        setPhase("enter")
      }, 500)
    }
    return () => clearTimeout(timer)
  }, [phase, messages.length])

  // Cerrar carrito al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCart(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith("http")) return imagePath
    return `http://localhost:8080/${imagePath}`
  }

  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-700 text-white font-medium text-sm md:text-base h-12 flex items-center justify-between px-6 shadow-lg">
      {/* Mensajes animados */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div
          key={index}
          className="absolute w-full text-center transition-transform duration-700 ease-in-out"
          style={{
            transform:
              phase === "enter"
                ? "translateX(100%)"
                : phase === "stay"
                ? "translateX(0)"
                : "translateX(-100%)",
          }}
        >
          <span className="tracking-wide">{messages[index]}</span>
        </div>
      </div>

      {/* Íconos de Login y Carrito */}
      <div className="flex items-center gap-4 relative">
        {/* Icono Login */}
        <Link
          to="/catalog/login"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all shadow-md"
          title="Iniciar sesión"
        >
          <User size={20} className="text-white" />
        </Link>

        {/* Icono Carrito */}
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all shadow-md"
          title="Ver carrito"
        >
          <ShoppingCart size={20} className="text-white" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
              {cartItems.length}
            </span>
          )}
        </button>

        {/* Mini Carrito */}
        {showCart && (
          <div
            ref={cartRef}
            className="absolute right-0 top-10 w-80 bg-white text-gray-800 rounded-xl shadow-2xl p-4 z-50 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-bold text-purple-700">Tu carrito</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Tu carrito está vacío 🛒
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-purple-50 rounded-lg p-2 shadow-sm"
                  >
                    <img
                      src={getImageUrl(item.image || item.imageUrl)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} × ${item.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Total y botón de checkout */}
            {cartItems.length > 0 && (
              <div className="mt-4 border-t pt-3 text-right">
                <p className="font-semibold text-purple-700">
                  Total: ${total.toLocaleString()}
                </p>
                <Link
                  to="/catalog/checkout"
                  onClick={() => setShowCart(false)}
                  className="mt-3 inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  Finalizar compra
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScrollingHeader
