import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { User } from "lucide-react" // 👈 importamos el icono


const ScrollingHeader = () => {
  const messages = [
    " ENVÍOS GRATIS DESDE 580,900 A Todo Colombia*",
    " OFERTAS EXCLUSIVAS EN PRODUCTOS DESTACADOS",
    " NUEVAS COLECCIONES DISPONIBLES YA",
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
    <div className="w-full bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-800 text-white font-bold text-sm md:text-base h-10 flex items-center justify-between px-4 relative">
      {/* Mensajes animados */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div
          key={index}
          className="absolute w-full text-center transition-transform duration-500"
          style={{
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
            transform:
              phase === "enter"
                ? "translateX(100%)"
                : phase === "stay"
                ? "translateX(0)"
                : "translateX(-100%)",
          }}
        >
          {messages[index]}
        </div>
      </div>

      {/* Icono de Login */}
      <Link
        to="/catalog/login"
        className="ml-4 p-1 rounded-full bg-black/40 hover:bg-black/70 transition-colors"
        title="Iniciar sesión"
      >
        <User size={20} className="text-white" /> {/* 👤 icono */}
      </Link>
    </div>
  )
}

export default ScrollingHeader
