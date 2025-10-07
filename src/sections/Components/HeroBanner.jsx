// src/sections/components/HeroBanner.jsx
import { useState, useEffect } from "react";
import SearchSection from "./SearchSection";
import CategoryCarousel from "./CategoryCarousel";
import { useAuth } from "../../pages/AuthContext"; // ✅ Importamos el contexto de autenticación

export default function HeroBanner({ image }) {
  const [bannerImage, setBannerImage] = useState(image || null);
  const [preview, setPreview] = useState(null);
  const { isAdmin } = useAuth(); // ✅ Saber si el usuario es administrador

  // 🔄 Cargar imagen guardada si existe
  useEffect(() => {
    const savedImage = localStorage.getItem("bannerImage");
    if (savedImage) {
      setBannerImage(savedImage);
    }
  }, []);

  // 📸 Manejar imagen subida
  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result);
        setPreview(reader.result);
        localStorage.setItem("bannerImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 🔙 Restablecer al banner original
  const handleResetBanner = () => {
    localStorage.removeItem("bannerImage");
    setBannerImage(image || null);
    setPreview(null);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background con imagen */}
      <div
        className="relative min-h-[500px] md:min-h-[600px] flex flex-col justify-center"
        style={{
          backgroundImage: `url(${bannerImage || image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Capa de gradiente diagonal */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-black-900 to-black text-white"></div>

        {/* Contenedor principal */}
        <div className="relative z-10 w-full text-center">
          <img
            src={preview || bannerImage || "../img/Banner.png"}
            alt="Banner de oferta"
            className="w-full"
          />

          {/* 🔒 Solo visible para administradores */}
          {isAdmin && (
            <div className="absolute top-5 right-5 z-20 flex gap-2">
              <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                Cambiar banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>

              {bannerImage && (
                <button
                  onClick={handleResetBanner}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Restablecer
                </button>
              )}
            </div>
          )}

          {/* Secciones internas */}
          <SearchSection />
          <CategoryCarousel />
        </div>
      </div>
    </section>
  );
}
