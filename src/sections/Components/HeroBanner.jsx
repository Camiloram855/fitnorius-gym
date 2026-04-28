import { useEffect, useMemo, useState } from "react";
import SearchSection from "./SearchSection";
import CategoryCarousel from "./CategoryCarousel";
import { useAuth } from "../../pages/AuthContext";

function getOptimizedImage(url) {
  if (!url) return url;
  if (url.includes("res.cloudinary.com")) {
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  }
  return url;
}

export default function HeroBanner({ image }) {
  const [bannerImages, setBannerImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isAdmin } = useAuth();

  const API_URL =
    import.meta.env.VITE_API_URL || "https://fitnorius-production.up.railway.app";

  const fallbackImage = getOptimizedImage(image) || null;

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/api/banner/all`);
        if (!res.ok) throw new Error("Error al cargar banners");
        const data = await res.json();

        const normalized = (Array.isArray(data) ? data : [])
          .map((item) => item?.imageUrl)
          .filter(Boolean)
          .map((url) =>
            url.startsWith("http")
              ? getOptimizedImage(url)
              : getOptimizedImage(`${API_URL}${url}`)
          );

        setBannerImages(
          normalized.length ? normalized : fallbackImage ? [fallbackImage] : []
        );
        setCurrentIndex(0);
      } catch (err) {
        console.error("Error al obtener banners:", err);
        setBannerImages(fallbackImage ? [fallbackImage] : []);
        setCurrentIndex(0);
      }
    };

    fetchBanners();
  }, [API_URL, fallbackImage]);

  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages]);

  const finalImage = useMemo(() => {
    if (!bannerImages.length) return fallbackImage;
    return bannerImages[currentIndex] || bannerImages[0];
  }, [bannerImages, currentIndex, fallbackImage]);

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
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

      if (data?.imageUrl) {
        const fullUrl = data.imageUrl.startsWith("http")
          ? getOptimizedImage(data.imageUrl)
          : getOptimizedImage(`${API_URL}${data.imageUrl}`);

        setBannerImages((prev) => [...prev, fullUrl]);
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error al subir banner:", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleResetBanner = async () => {
    try {
      await fetch(`${API_URL}/api/banner/reset`, {
        method: "DELETE",
      });
      setBannerImages(fallbackImage ? [fallbackImage] : []);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error al restablecer banner:", err);
    }
  };

  const goToPrev = () => {
    if (!bannerImages.length) return;
    setCurrentIndex(
      (prev) => (prev - 1 + bannerImages.length) % bannerImages.length
    );
  };

  const goToNext = () => {
    if (!bannerImages.length) return;
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
  };

  return (
    <>
      <section className="relative overflow-hidden w-full bg-neutral-950">
        <div className="relative flex items-center justify-center w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] xl:h-[600px] bg-neutral-950">
          {finalImage && (
            <img
              src={finalImage}
              alt={`Banner ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />

          {bannerImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-md"
              >
                {'<'}
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-md"
              >
                {'>'}
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {bannerImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 w-2.5 rounded-full ${
                      idx === currentIndex ? "bg-white" : "bg-white/40"
                    }`}
                    aria-label={`Ir al banner ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {isAdmin && (
            <div className="absolute top-5 right-5 z-20 flex gap-2 py-8">
              <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                Agregar al carrusel
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>

              {bannerImages.length > 0 && (
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

      <section className="relative z-10 bg-gradient-to-br from-purple-700 to-black-900 to-black">
        <div>
          <SearchSection />
          <div className="mt-8">
            <CategoryCarousel />
          </div>
        </div>
      </section>
    </>
  );
}
