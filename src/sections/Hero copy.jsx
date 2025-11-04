"use client"

import { useState } from "react"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Star, Gift } from "lucide-react"
import PurchaseButton from "../components/ui/PurchaseButton"

export default function Hero() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 sm:left-20 w-24 sm:w-32 h-24 sm:h-32 border border-purple-500 rounded-full"></div>
        <div className="absolute bottom-20 sm:bottom-40 right-10 sm:right-20 w-16 sm:w-24 h-16 sm:h-24 border border-purple-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-12 sm:w-16 h-12 sm:h-16 border border-purple-300 rounded-full"></div>
      </div>

      {/* Contenido principal CENTRADO */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center w-full max-w-[1280px] px-6 py-12 sm:px-4 sm:py-16 mx-auto min-h-[80vh] space-y-8">
        
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-full opacity-60 group-hover:opacity-90 blur-lg transition-all duration-500 group-hover:blur-xl"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-yellow-300 rounded-full opacity-75 group-hover:opacity-100 blur transition-all duration-300"></div>
            <div className="relative w-32 sm:w-40 md:w-44 h-32 sm:h-40 md:h-44 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:border-white/50">
              <img
                src="/img/Logo.png"
                alt="Logo EVS Fitness"
                className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110 group-hover:contrast-110"
              />
            </div>
          </div>
        </div>

        {/* Título */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Badge className="bg-purple-600 text-white hover:bg-purple-700 text-sm sm:text-base">
            ¡NUEVA COLECCIÓN!
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            BANDAS DE TELA
            <span className="block text-yellow-400">
              INCLUYE: 3 BANDAS DE RESISTENCIA
            </span>
          </h1>
        </div>

        {/* Imagen debajo del título */}
        <div className="flex justify-center w-full">
          <div
            className="relative w-full max-w-[500px] rounded-lg overflow-hidden cursor-pointer"
            style={{
              backgroundImage: `url('/img/bandas-4.png')`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center",
              aspectRatio: "1 / 1",
            }}
            onClick={() => setIsExpanded(true)}
          />
        </div>

        {/* Beneficios */}
        <div className="space-y-6 w-full max-w-[600px] mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-black/30 p-5 sm:p-6 rounded-lg border border-purple-500/20">
            <div className="bg-purple-600 p-3 rounded-lg flex-shrink-0">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-center sm:text-left">
                Incluye 6 meses de rutina de entrenamiento con videos
              </h3>
              <p className="text-gray-300 text-sm sm:text-base text-center sm:text-left">
                Acceso completo a nuestra plataforma de entrenamiento personalizado
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center  gap-4 bg-black/30 p-5 sm:p-6 rounded-lg border border-purple-500/20">
            <div className="bg-yellow-500 p-3 rounded-lg flex-shrink-0">
              <Star className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-center sm:text-left">
                OBSEQUIO:
              </h3>
              <p className="text-gray-300 text-sm sm:text-base text-center sm:text-left">
                1 barra extensora acolchada gratis
              </p>
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="w-full max-w-[400px] mx-auto">
          <Button
            size="lg"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg py-5 sm:py-6 rounded-lg"
          >
            VER DETALLES DE BANDAS
          </Button>
        </div>
      </div>

      {/* Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setIsExpanded(false)}
        >
          <img
            src="/img/bandas-4.png"
            alt="Imagen expandida"
            className="max-w-full max-h-full rounded-lg object-contain"
          />
        </div>
      )}

      <PurchaseButton />
    </section>
  )
}
