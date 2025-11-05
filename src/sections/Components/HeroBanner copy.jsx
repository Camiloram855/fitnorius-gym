// src/sections/components/HeroBanner.jsx
import { useState, useEffect } from "react";
import SearchSection from "./SearchSection";
import CategoryCarousel from "./CategoryCarousel";
import { useAuth } from "../../pages/AuthContext"; // ✅ Contexto de autenticación

export default function HeroBanner({ image }) {
  const [bannerImage, setBannerImage] = useState(image || null);
  const [preview, setPreview] = useState(null);
  const { isAdmin } = useAuth();

  const API_URL =
    import.meta.env.VITE_API_URL || "https://fitnorius-production.up.railway.app";

  // ✅ Cargar imagen desde el backend
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${API_URL}/api/banner`);
        if (!res.ok) throw new Error("Error al cargar banner");
        const data = await res.json();

        if (data && data.imageUrl) {
          const fullUrl = data.imageUrl.startsWith("http")
            ? data.imageUrl
            : `${API_URL}${data.imageUrl}`;
          setBannerImage(fullUrl);
        } else {
          SetBannerImage(image || null);
        }
      } catch (err) {
        console.error("❌ Error al obtener banner:", err);
        setBannerImage(image || null);
      }
    };
    fetchBanner();
  }, [image, API_URL]);

  // 📸 Subir nuevo banner
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

  // 🔙 Restablecer banner original
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
      <section className="relative overflow-hidden w-full">
        <div
          className="relative flex flex-col justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[650px] w-full"
          style={{
            backgroundImage: `url(${preview || bannerImage || image})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
          }}
        >
          {/* 🌈 Capa de gradiente morado */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-black-900 to-black opacity-0"></div>

          {/* Imagen de fondo (oculta, solo soporte visual) */}
          <img
            src={preview || bannerImage || "../img/Banner.png"}
            alt="Banner de oferta"
            className="w-full h-full object-cover opacity-0"
          />

          {/* 🎛️ Botones solo para admin */}
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
      <section className="relative z-10 bg-gradient-to-br from-purple-700 to-black-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <SearchSection />
          <div className="mt-8">
            <CategoryCarousel />
          </div>
        </div>
      </section>
    </>
  );
}
