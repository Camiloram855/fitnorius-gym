// src/sections/components/HeroBanner.jsx
import { Link } from "react-router-dom";
import SearchSection from "./SearchSection";
import CategoryCarousel from "./CategoryCarousel";

export default function HeroBanner({ image }) {
  return (
    <section className="relative overflow-hidden">
      {/* Background con imagen */}
      <div
        className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Capa de gradiente diagonal */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-black-900 to-black text-white"></div>
        
            
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <br />

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance">
            Hasta{" "}
            <span className="text-gradient bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              50% por Black Friday
            </span>
            <br />
            En todo nuestro catalogo
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-8 text-pretty max-w-2xl mx-auto">
            Descubre nuestra colección exclusiva con los mejores precios del año en implemento deportivos.
          </p>

          <SearchSection />
          <CategoryCarousel />
        </div>
      </div>
    </section>
  );
}
