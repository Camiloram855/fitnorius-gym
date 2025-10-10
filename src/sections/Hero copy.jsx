import React, { useState } from "react";
import { Button } from "../components/ui/Button"; // Ajusta la ruta según tu proyecto
import { Badge } from "../components/ui/Badge";  // Ajusta la ruta según tu proyecto
import { Star, Gift } from "lucide-react";
import PurchaseButton from "../components/ui/PurchaseButton";



export default function Hero() {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-purple-500 rounded-full"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 border border-purple-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-purple-300 rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1280px] w-full mx-auto px-6 sm:px-4 py-20 overflow-hidden">
        {/* Logo con efectos */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <div className="relative group cursor-pointer">
              {/* Glow externo */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-full opacity-60 group-hover:opacity-90 blur-lg transition-all duration-500 group-hover:blur-xl"></div>

              {/* Glow interno */}
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-yellow-300 rounded-full opacity-75 group-hover:opacity-100 blur transition-all duration-300"></div>

              {/* Contenedor principal del logo */}
              <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:border-white/50">
                {/* Brillo en movimiento */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out skew-x-12"></div>

                {/* Brillo radial */}
                <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Imagen del logo */}
                <img
                  src="/img/Logo.png"
                  alt="Logo EVS Fitness"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110 group-hover:contrast-110"
                />

                {/* Borde interno */}
                <div className="absolute inset-2 rounded-full border border-white/20 group-hover:border-white/40 transition-all duration-300"></div>
              </div>

              {/* Partículas flotantes */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-4 left-8 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
                <div className="absolute top-12 right-6 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-150"></div>
                <div className="absolute bottom-8 left-12 w-1 h-1 bg-pink-300 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-12 right-10 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenido Izquierdo */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                ¡NUEVA COLECCIÓN!
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-balance">
                BANDAS DE TELA
                <span className="block text-yellow-400">
                  INCLUYE: 3 BANDAS DE RESISTENCIA
                </span>
              </h1>
            </div>

            {/* Beneficio 1 */}
            <div className="flex items-start gap-4 bg-black/30 p-6 rounded-lg border border-purple-500/20">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Incluye 6 meses de rutina de entrenamiento con videos
                </h3>
                <p className="text-gray-300">
                  Acceso completo a nuestra plataforma de entrenamiento personalizado
                </p>
              </div>
            </div>

            {/* Beneficio 2 */}
            <div className="flex items-start gap-4 bg-black/30 p-6 rounded-lg border border-purple-500/20">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Star className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">OBSEQUIO:</h3>
                <p className="text-gray-300">1 barra extensora acolchada gratis</p>
              </div>
            </div>

            {/* Botones de compra */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg py-6 rounded-lg"
              >
                COMPRAR CON ENTREGA
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-bold text-lg py-6 rounded-lg bg-transparent"
              >
                COMPRAR A CRÉDITO
              </Button>
            </div>

          </div>

          {/* Contenido Derecho - Imagen con zoom */}
          <div className="relative">
            <div
              className="relative z-10 w-full h-auto"
              style={{
                backgroundImage: `url('/img/bandas-4.png')`,
                backgroundRepeat: "no-repeat",
                backgroundSize: isZoomed ? "200%" : "contain",
                backgroundPosition: isZoomed
                  ? `${mousePosition.x}% ${mousePosition.y}%`
                  : "center",
                cursor: isZoomed ? "zoom-out" : "zoom-in",
                aspectRatio: "1/1",
                borderRadius: "0.5rem",
              }}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* Imagen invisible para mantener proporciones */}
              <img
                src="/img/bandas-fit.png"
                alt="Set de Bandas de Resistencia"
                className="w-full h-auto object-contain opacity-0"
              />
            </div>
          </div>
        </div>
      </div>

      <PurchaseButton />
    </section>
  );
}
