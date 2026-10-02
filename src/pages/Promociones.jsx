import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Tag } from "lucide-react";
import { apiFetch } from "../api/client";
import API_URL from "../config";
import PromoCarousel from "../components/PromoCarousel";
import { filterPromos } from "../utils/promo";

/**
 * Página de todas las promociones. Reutiliza GET /api/products (la misma API
 * pública que ya consume el catálogo) y filtra con la regla PROMO ya
 * existente: no hay endpoint ni etiqueta nueva.
 */
export default function Promociones() {
  const [promos, setPromos] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const loadPromos = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await apiFetch(`${API_URL}/api/products`);
      if (!response.ok) {
        throw new Error("No se pudo cargar el catálogo");
      }
      const data = await response.json();
      const promosFound = filterPromos(Array.isArray(data) ? data : []);
      setPromos(promosFound);
      setStatus(promosFound.length ? "ready" : "empty");
    } catch {
      setStatus("error");
      setError("No pudimos cargar las promociones. Inténtalo de nuevo en un momento.");
    }
  }, []);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-fuchsia-950 pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-10">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10"
        >
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>

        {/* Encabezado */}
        <header className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg">
            <Sparkles size={14} />
            Ofertas y promociones
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-fuchsia-300 via-purple-200 to-rose-300 bg-clip-text text-4xl font-black leading-tight text-transparent sm:text-5xl lg:text-6xl">
            Ofertas y promociones
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-purple-200/80 sm:text-base">
            Todos los productos con precio de descuento, reunidos en un solo lugar.
            El stock es limitado.
          </p>
        </header>

        {/* Contenido */}
        <section className="mt-12">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-400" />
              <p className="text-sm text-purple-300">Buscando ofertas...</p>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-10 text-center">
              <p className="text-lg font-semibold text-red-300">{error}</p>
              <button
                type="button"
                onClick={loadPromos}
                className="mt-5 rounded-full bg-purple-600 px-6 py-2.5 font-semibold text-white transition hover:bg-purple-700"
              >
                Reintentar
              </button>
            </div>
          )}

          {status === "empty" && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/20 to-amber-500/20">
                <Tag size={34} className="text-fuchsia-300" />
              </span>
              <h2 className="mt-6 text-2xl font-bold text-white">
                Próximamente habrá ofertas
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-gray-400">
                Todavía no hay productos en promoción. Vuelve pronto:
                actualizamos esta sección en cuanto lancemos nuevas rebajas.
              </p>
              <Link
                to="/catalog"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
              >
                Ver todo el catálogo
              </Link>
            </div>
          )}

          {status === "ready" && (
            <>
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">
                  Productos en descuento
                </h2>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-purple-200">
                  {promos.length}
                </span>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-8 pl-2 pr-2 sm:pl-4 sm:pr-4">
                <PromoCarousel
                  products={promos}
                  onSeeAll={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                />
              </div>

              <p className="mt-6 text-center text-xs text-gray-500">
                El carrusel se mueve solo. Pasa el cursor o desliza el dedo para
                desplazarlo, y usa las flechas para avanzar o retroceder.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}