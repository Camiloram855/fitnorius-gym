import { useCallback, useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import API_URL from "../config";
import ProductImage from "./ProductImage";
import { buildImageUrl } from "../utils/images";

const BANNER_UPDATED_EVENT = "fitnorius:promo-banner-updated";

// Límites de proporción de la tarjeta. Evitan que una imagen vertical haga una
// tarjeta altísima y que una panorámica la deje ultradelgada.
const MIN_RATIO = 2.4;
const MAX_RATIO = 6;

/**
 * Banner de promociones de la portada.
 *
 * La tarjeta adopta las proporciones reales de la imagen que sube el
 * administrador, de modo que siempre se ve completa: no se recorta ni aparecen
 * franjas vacías a los lados. Si subes una imagen más panorámica, la tarjeta
 * sale más delgada, y viceversa.
 */
export default function PromoBanner() {
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratio, setRatio] = useState(3);

  const loadBanner = useCallback(async () => {
    try {
      const response = await apiFetch(`${API_URL}/api/promo-banner`);
      if (!response.ok) {
        throw new Error("No se pudo cargar el banner");
      }
      const data = await response.json();
      setBanner(data && data.active ? data : null);
      setRatio(3);
    } catch {
      // Si el backend no responde, la portada sigue igual: sin banner.
      setBanner(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanner();
    const refresh = () => loadBanner();
    window.addEventListener(BANNER_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(BANNER_UPDATED_EVENT, refresh);
  }, [loadBanner]);

  // La proporción real se lee de la imagen ya cargada en el navegador.
  const handleImageLoad = useCallback((event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    const measured = naturalWidth / naturalHeight;
    setRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, measured)));
  }, []);

  if (isLoading || !banner) return null;

  const imageSrc = banner.imageUrl ? buildImageUrl(banner.imageUrl, API_URL) : null;

  // Sin textos: la tarjeta es la imagen del admin más el botón de acceso.
  return (
    <section className="w-full px-4 pb-10 pt-1 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative isolate min-h-[120px] overflow-hidden rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-purple-800 via-fuchsia-700 to-rose-700 shadow-2xl shadow-fuchsia-950/40"
          style={{ aspectRatio: ratio }}
        >
          {imageSrc && (
            <ProductImage
              src={imageSrc}
              alt="Promociones"
              className="absolute inset-0 h-full w-full object-cover"
              onLoad={handleImageLoad}
              eager
            />
          )}

          {/* Solo un velo suave abajo, para que el botón se lea bien. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="relative flex h-full items-end p-5 sm:p-6">
            <Link
              to="/promociones"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-fuchsia-700 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Tag size={16} />
              Ver todas las promociones
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}