import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { User } from "lucide-react"

const ScrollingHeader = () => {
  const messages = [
    "🚚 ENVÍOS GRATIS DESDE 580,900 A TODO COLOMBIA*",
    "🔥 OFERTAS EXCLUSIVAS EN PRODUCTOS DESTACADOS",
    "🔥 NUEVAS COLECCIONES DISPONIBLES YA",
  ]

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState("enter")

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

      {/* Icono de Login */}
      <Link
        to="/catalog/login"
        className="ml-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all shadow-md"
        title="Iniciar sesión"
      >
        <User size={20} className="text-white" />
      </Link>
    </div>
  )
}

export default ScrollingHeader
