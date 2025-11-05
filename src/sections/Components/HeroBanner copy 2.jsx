// src/sections/components/HeroBanner.jsx
import { useState, useEffect } from "react";
import SearchSection from "./SearchSection";
import CategoryCarousel from "./CategoryCarousel";
import { useAuth } from "../../pages/AuthContext"; // ✅ Contexto de autenticación

export default function HeroBanner({ image }) {
  const [bannerImage, setBannerImage] = useState(image || null);
  const [preview, setPreview] = useState(null);
  const { isAdmin } = useAuth();

  // 🌍 URL base del backend (usa variable de entorno si existe)
  const API_URL =
    import.meta.env.VITE_API_URL || "https://fitnorius-production.up.railway.app";

  // ✅ Cargar imagen desde el backend al iniciar
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${API_URL}/api/banner`);
        if (!res.ok) throw new Error("Error al cargar banner");
        const data = await res.json();

        if (data && data.imageUrl) {
          // 🧩 Si la URL es relativa, la completamos con el dominio del backend
          const fullUrl = data.imageUrl.startsWith("http")
            ? data.imageUrl
            : `${API_URL}${data.imageUrl}`;
          setBannerImage(fullUrl);
        } else {
          setBannerImage(image || null);
        }
      } catch (err) {
        console.error("❌ Error al obtener banner:", err);
        setBannerImage(image || null);
      }
    };

    fetchBanner();
  }, [image, API_URL]);

  // 📸 Subir nuevo banner al backend
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/banner/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir el banner");

      const data = await res.json();

      if (data.imageUrl) {
        // 🧩 También ajustamos la URL al formato completo
        const fullUrl = data.imageUrl.startsWith("http")
          ? data.imageUrl
          : `${API_URL}${data.imageUrl}`;

        setBannerImage(fullUrl);
        setPreview(fullUrl);
        localStorage.setItem("bannerImage", fullUrl);
      }
    } catch (err) {
      console.error("❌ Error al subir banner:", err);
    }
  };

  // 🔙 Restablecer al banner original
  const handleResetBanner = async () => {
    try {
      await fetch(`${API_URL}/api/banner/reset`, {
        method: "DELETE",
      });

      localStorage.removeItem("bannerImage");
      setBannerImage(image || null);
      setPreview(null);
    } catch (err) {
      console.error("❌ Error al restablecer banner:", err);
    }
  };

  return (
    <>
      {/* 🖼️ Banner principal */}
      <section className="relative overflow-hidden">
        <div
          className="relative min-h-[500px] md:min-h-[600px] flex flex-col justify-center"
          style={{
            backgroundImage: `url(${preview || bannerImage || image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Capa de gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-black to-black opacity-60"></div>

          {/* Imagen de fondo (por compatibilidad visual) */}
          <img
            src={preview || bannerImage || "../img/Banner.png"}
            alt="Banner de oferta"
            className="w-full h-full object-cover opacity-0"
          />

          {/* Botones solo para admin */}
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
        </div>
      </section>

      {/* 🔽 Secciones debajo del banner */}
      <div className="relative z-10 bg-black">
        <SearchSection />
        <CategoryCarousel />
      </div>
    </>
  );
}
