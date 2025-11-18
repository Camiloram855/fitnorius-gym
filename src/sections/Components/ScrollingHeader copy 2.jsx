import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { User, ShoppingCart, X, Pencil } from "lucide-react"
import { useCart } from "../../pages/CartContext"
import { useAuth } from "../../pages/AuthContext"

const ScrollingHeader = () => {
  const { isAdmin } = useAuth()

  const initialMessages =
    JSON.parse(localStorage.getItem("headerMessages")) || [
      "🚚 ENVÍOS GRATIS DESDE 580,900 A TODO COLOMBIA*",
      "🔥 OFERTAS EXCLUSIVAS EN PRODUCTOS DESTACADOS",
      "🔥 NUEVAS COLECCIONES DISPONIBLES YA",
    ]

  const [messages, setMessages] = useState(initialMessages)
  const [isEditing, setIsEditing] = useState(false)

  const [showCart, setShowCart] = useState(false)
  const cartRef = useRef(null)
  const { cartItems, removeFromCart } = useCart()

  // ---- SCROLL INFINITO REAL ----
  const scrollRef = useRef(null)
  const position = useRef(0)

  useEffect(() => {
    let frame

    const speed = 1.2 //  ⬅️🔥 VELOCIDAD AUMENTADA (más rápido)

    const animate = () => {
      if (scrollRef.current) {
        position.current -= speed

        const totalWidth = scrollRef.current.scrollWidth / 2

        // Reinicio exacto para evitar saltos
        if (Math.abs(position.current) >= totalWidth) {
          position.current = 0
        }

        scrollRef.current.style.transform = `translateX(${position.current}px)`
      }

      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [messages])


  // EDITAR MENSAJE
  const handleEditChange = (value) => {
    const m = [...messages]
    m[0] = value
    setMessages(m)
    localStorage.setItem("headerMessages", JSON.stringify(m))
  }

  // CERRAR CARRITO
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setShowCart(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () =>
      document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-700 text-white font-medium text-sm md:text-base h-12 flex items-center justify-between px-6 shadow-lg">

      {/* 🔥 SCROLL INFINITO */}
      <div className="flex-1 overflow-hidden h-full relative flex items-center">
        <div
          ref={scrollRef}
          className="absolute whitespace-nowrap flex gap-20 text-center"
          style={{
            willChange: "transform",
            whiteSpace: "nowrap",
            display: "flex",
          }}
        >
          {/* duplicado para loop perfecto */}
          {[...messages, ...messages].map((msg, i) => (
            <span key={i} className="px-10 tracking-wide">
              {msg}
            </span>
          ))}
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          title="Editar mensaje"
        >
          <Pencil size={18} className="text-white" />
        </button>
      )}

      {/* ICONOS */}
      <div className="flex items-center gap-4 relative">
        <Link
          to="/catalog/login"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all shadow-md"
        >
          <User size={20} className="text-white" />
        </Link>

        <button
          onClick={() => setShowCart(!showCart)}
          className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all shadow-md"
        >
          <ShoppingCart size={20} className="text-white" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
              {cartItems.length}
            </span>
          )}
        </button>

        {showCart && (
          <div
            ref={cartRef}
            className="absolute right-0 top-10 w-80 bg-white text-gray-800 rounded-xl shadow-2xl p-4 z-50 border border-gray-200"
          >
            {/* tu carrito... */}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScrollingHeader
