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

function normalizeBannerItem(item, apiUrl) {
  if (!item?.imageUrl) return null;
  const fullUrl = item.imageUrl.startsWith("http")
    ? getOptimizedImage(item.imageUrl)
    : getOptimizedImage(`${apiUrl}${item.imageUrl}`);

  return {
    id: item.id ?? null,
    imageUrl: fullUrl,
  };
}

export default function HeroBanner({ image }) {
  const [bannerItems, setBannerItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showManager, setShowManager] = useState(false);
  const { isAdmin } = useAuth();

  const API_URL =
    import.meta.env.VITE_API_URL || "https://fitnorius-production.up.railway.app";

  const fallbackImage = getOptimizedImage(image) || null;

  const loadBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/banner/all`);
      if (!res.ok) throw new Error("Error al cargar banners");
      const data = await res.json();

      const normalized = (Array.isArray(data) ? data : [])
        .map((item) => normalizeBannerItem(item, API_URL))
        .filter(Boolean);

      if (normalized.length) {
        setBannerItems(normalized);
      } else if (fallbackImage) {
        setBannerItems([{ id: null, imageUrl: fallbackImage }]);
      } else {
        setBannerItems([]);
      }
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error al obtener banners:", err);
      setBannerItems(fallbackImage ? [{ id: null, imageUrl: fallbackImage }] : []);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [API_URL, fallbackImage]);

  useEffect(() => {
    if (bannerItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerItems]);

  const finalImage = useMemo(() => {
    if (!bannerItems.length) return fallbackImage;
    return bannerItems[currentIndex]?.imageUrl || bannerItems[0]?.imageUrl;
  }, [bannerItems, currentIndex, fallbackImage]);

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

      const newItem = normalizeBannerItem(data, API_URL);
      if (newItem?.imageUrl) {
        setBannerItems((prev) => [...prev, newItem]);
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error al subir banner:", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleDeleteSingleBanner = async (itemId) => {
    if (!itemId) return;
    try {
      const res = await fetch(`${API_URL}/api/banner/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo eliminar la imagen");

      setBannerItems((prev) => {
        const next = prev.filter((item) => item.id !== itemId);
        const safe = next.length ? next : fallbackImage ? [{ id: null, imageUrl: fallbackImage }] : [];
        setCurrentIndex((idx) => (safe.length ? Math.min(idx, safe.length - 1) : 0));
        return safe;
      });
    } catch (err) {
      console.error("Error al eliminar imagen del banner:", err);
    }
  };

  const handleResetBanner = async () => {
    try {
      await fetch(`${API_URL}/api/banner/reset`, {
        method: "DELETE",
      });
      setBannerItems(fallbackImage ? [{ id: null, imageUrl: fallbackImage }] : []);
      setCurrentIndex(0);
      setShowManager(false);
    } catch (err) {
      console.error("Error al restablecer banner:", err);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden w-full bg-neutral-950">
        <div className="relative w-full aspect-[8/3] bg-neutral-950">
          {finalImage && (
            <img
              src={finalImage}
              alt={`Banner ${currentIndex + 1}`}
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />

          {bannerItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {bannerItems.map((_, idx) => (
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
          )}

          {isAdmin && (
            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 flex flex-wrap gap-2">
              <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition">
                Agregar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowManager(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition"
              >
                Ver disponibles
              </button>

              {bannerItems.length > 0 && (
                <button
                  onClick={handleResetBanner}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition"
                >
                  Restablecer
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {showManager && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Imagenes disponibles del banner</h3>
              <button
                onClick={() => setShowManager(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
              {bannerItems.length === 0 && (
                <p className="text-gray-500 text-sm">No hay imagenes disponibles.</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bannerItems.map((item, idx) => (
                  <div key={item.id ?? `fallback-${idx}`} className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                    <div className="relative w-full aspect-[8/3] rounded-lg overflow-hidden bg-black">
                      <img
                        src={item.imageUrl}
                        alt={`Banner disponible ${idx + 1}`}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setCurrentIndex(idx)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                      >
                        Mostrar
                      </button>

                      {item.id ? (
                        <button
                          onClick={() => handleDeleteSingleBanner(item.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                        >
                          Eliminar
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-500">Imagen por defecto</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="relative z-10 bg-gradient-to-br from-purple-700 to-black-900 to-black">
        <div>
          <SearchSection />
          <div>
            <CategoryCarousel />
          </div>
        </div>
      </section>
    </>
  );
}
