// src/sections/components/HeroBanner.jsx
import { Link } from "react-router-dom";
import SearchSection from "./SearchSection";
import CategoryCarousel from "./CategoryCarousel";


export default function HeroBanner({ image }) {
  return (
    <section className="relative overflow-hidden">
      {/* Background con imagen */}
      <div
        className="relative min-h-[500px] md:min-h-[600px] flex flex-col justify-center" // Se ajustó a flex-col
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Capa de gradiente diagonal */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-black-900 to-black text-white"></div>

        {/* Contenedor principal que permite a los hijos organizarse */}
        <div className="relative z-10 w-full">

          <img 
            src="../img/Banner.png"
            alt="Banner de oferta por Black Friday"
            className="w-full" 
          />
            <SearchSection />
            <CategoryCarousel />

        </div>
      </div>
    </section>
  );
}