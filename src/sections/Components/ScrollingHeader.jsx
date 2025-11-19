import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { User, ShoppingCart, X, Pencil, Check } from "lucide-react"
import { useCart } from "../../pages/CartContext"
import { useAuth } from "../../pages/AuthContext"

const ScrollingHeader = () => {
  const { isAdmin } = useAuth()

  const initialMessages =
    JSON.parse(localStorage.getItem("headerMessages")) || []

  const [messages, setMessages] = useState(initialMessages)
  const [isEditing, setIsEditing] = useState(false)
  const [editIndex, setEditIndex] = useState(0)
  const [editValue, setEditValue] = useState("")

  const [showCart, setShowCart] = useState(false)
  const cartRef = useRef(null)
  const { cartItems } = useCart()

  // ======================================
  // 🔁 BUCLE INFINITO REAL (CINTA DUPLICADA)
  // ======================================
  const scrollRef = useRef(null)
  const pos = useRef(0)
  const speed = 1.1

  useEffect(() => {
    if (!scrollRef.current || messages.length === 0) return

    let frame
    const totalWidth = scrollRef.current.scrollWidth / 2

    const animate = () => {
      pos.current -= speed

      if (Math.abs(pos.current) >= totalWidth) {
        pos.current = 0
      }

      scrollRef.current.style.transform = `translateX(${pos.current}px)`
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [messages])

  // ======================================
  // 💾 GUARDAR MENSAJE
  // ======================================
  const saveMessage = () => {
    const newMessages = [...messages]

    if (!messages.length) {
      newMessages.push(editValue)
    } else {
      newMessages[editIndex] = editValue
    }

    setMessages(newMessages)
    localStorage.setItem("headerMessages", JSON.stringify(newMessages))
    setIsEditing(false)
  }

  // ======================================
  // ❌ CERRAR CARRITO AFUERA
  // ======================================
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

      {/* CINTA SCROLL INFINITO */}
      <div className="flex-1 overflow-hidden h-full relative flex items-center">
        {messages.length > 0 ? (
          <div
            ref={scrollRef}
            className="absolute flex whitespace-nowrap gap-20"
            style={{ willChange: "transform" }}
          >
            {[...messages, ...messages].map((msg, i) => (
              <span
                key={i}
                className="px-20 tracking-wide cursor-pointer"
                onClick={() => {
                  if (!isAdmin) return
                  setEditIndex(i % messages.length)
                  setEditValue(messages[i % messages.length])
                  setIsEditing(true)
                }}
              >
                {msg}
              </span>
            ))}
          </div>
        ) : (
          isAdmin && (
            <span
              className="text-gray-300 cursor-pointer"
              onClick={() => {
                setEditIndex(0)
                setEditValue("")
                setIsEditing(true)
              }}
            >
              + Añadir mensaje
            </span>
          )
        )}
      </div>

      {/* ✏️ Editar */}
      {isAdmin && messages.length > 0 && (
        <button
          onClick={() => {
            setEditIndex(0)
            setEditValue(messages[0])
            setIsEditing(true)
          }}
          className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
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
            {/* tu carrito */}
          </div>
        )}
      </div>

      {/* 📝 EDITOR */}
      {isEditing && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-gray-300 text-black p-3 rounded-xl shadow-2xl w-[350px] flex flex-col gap-3 z-[999]">

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-800">
              Editar mensaje
            </span>

            <button onClick={() => setIsEditing(false)}>
              <X size={18} className="text-gray-700" />
            </button>
          </div>

          <textarea
            className="w-full p-2 border rounded-md h-20 text-sm bg-gray-100 focus:bg-white focus:border-black focus:outline-none transition-all"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />

          <button
            onClick={saveMessage}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2 transition-all"
          >
            <Check size={18} />
            Guardar
          </button>
        </div>
      )}
    </div>
  )
}

export default ScrollingHeader
