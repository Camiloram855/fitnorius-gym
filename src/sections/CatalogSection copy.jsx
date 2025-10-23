import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom"; // 👈 Importa Link

export default function CatalogSection() {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.4 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div
        ref={cardRef}
        className="relative bg-white/5 border border-white/10 rounded-3xl p-12 md:p-16 shadow-2xl shadow-purple-900/20 backdrop-blur-xl overflow-hidden"
      >
        {/* Brillo infinito */}
        {isVisible && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="shine"></div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
          CATÁLOGO
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-purple-100 mb-12 leading-relaxed font-light">
          Descubre nuestros productos exclusivos para tu entrenamiento
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          <a
            href="./catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 rounded-2xl shadow-lg shadow-purple-900/25 transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 active:scale-95"
          >
            <span className="relative flex items-center gap-3">
              Ver Catálogo Completo
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </a>

        </div>
      </div>
    </div>
  );
}
