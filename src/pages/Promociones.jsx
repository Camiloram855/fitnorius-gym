import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutGrid, Sparkles, Tag } from "lucide-react";
import { apiFetch } from "../api/client";
import API_URL from "../config";
import PromoCarousel, { PromoCard } from "../components/PromoCarousel";
import { filterPromos, productImageUrl } from "../utils/promo";
import { useCart } from "./CartContext";

/**
 * Página de promociones.
 *
 * Reutiliza GET /api/products (la misma API pública que ya consume el
 * catálogo) y filtra con la regla PROMO ya existente: no hay endpoint ni
 * etiqueta nueva.
 *
 * Tiene dos vistas:
 * - Promociones: el carrusel con lo que está en descuento.
 * - Todos: la rejilla completa, con el mismo diseño de tarjeta.
 */
export default function Promociones() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [view, setView] = useState("promos");

  const navigate = useNavigate();
  const cart = useCart();
  const addToCart = cart?.addToCart || (() => {});

  const loadProducts = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await apiFetch(`${API_URL}/api/products`);
      if (!response.ok) {
        throw new Error("No se pudo cargar el catálogo");
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("No pudimos cargar los productos. Inténtalo de nuevo en un momento.");
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const promos = useMemo(() => filterPromos(products), [products]);

  const showAllProducts = () => {
    setView("todos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProduct = (id) => navigate(`/catalog/producto/${id}`);

  const addItem = (product) =>
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: productImageUrl(product, API_URL),
    });

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

          <h1 className="mt-5 bg-gradient-to-r from-fuchsia-300 via-purple-200 to-rose-300 bg-clip-text text-3xl font-black leading-tight text-transparent sm:text-5xl lg:text-6xl">
            {view === "todos" ? "Todos los productos" : "Ofertas y promociones"}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-purple-200/80 sm:text-base">
            {view === "todos"
              ? `${products.length} ${products.length === 1 ? "producto" : "productos"} en el catálogo.`
              : "Todos los productos con precio de descuento, reunidos en un solo lugar. El stock es limitado."}
          </p>
        </header>

        {/* Selector de vista */}
        {status === "ready" && (
          <nav className="mt-8 flex justify-center" aria-label="Cambiar vista">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
              <ViewTab active={view === "promos"} onClick={() => setView("promos")}>
                <Tag size={14} />
                Promociones
                {promos.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[0.65rem]">
                    {promos.length}
                  </span>
                )}
              </ViewTab>
              <ViewTab active={view === "todos"} onClick={() => setView("todos")}>
                <LayoutGrid size={14} />
                Todos
                <span className="ml-1.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[0.65rem]">
                  {products.length}
                </span>
              </ViewTab>
            </div>
          </nav>
        )}

        {/* Contenido */}
        <section className="mt-10">
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
                onClick={loadProducts}
                className="mt-5 rounded-full bg-purple-600 px-6 py-2.5 font-semibold text-white transition hover:bg-purple-700"
              >
                Reintentar
              </button>
            </div>
          )}

          {status === "ready" && view === "promos" && (
            <>
              {promos.length === 0 ? (
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
                  <button
                    type="button"
                    onClick={() => setView("todos")}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
                  >
                    <LayoutGrid size={16} />
                    Ver todos los productos
                  </button>
                </div>
              ) : (
                <>
                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-8 pl-2 pr-2 sm:pl-4 sm:pr-4">
                    <PromoCarousel products={promos} onSeeAll={showAllProducts} />
                  </div>

                  <p className="mt-6 text-center text-xs text-gray-500">
                    El carrusel se mueve solo. Pasa el cursor o desliza el dedo para
                    desplazarlo, y usa las flechas para avanzar o retroceder.
                  </p>
                </>
              )}
            </>
          )}

          {status === "ready" && view === "todos" && (
            <>
              <div className="mb-6 flex items-center justify-center gap-3">
                <h2 className="text-lg font-bold text-white">Catálogo completo</h2>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-purple-200">
                  {products.length}
                </span>
              </div>

              {products.length === 0 ? (
                <p className="py-20 text-center text-sm text-gray-400">
                  Todavía no hay productos en el catálogo.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <PromoCard
                      key={product.id}
                      product={product}
                      fluid
                      onView={() => openProduct(product.id)}
                      onAdd={() => addItem(product)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ViewTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition sm:px-5 sm:text-sm ${
        active
          ? "bg-purple-600 text-white shadow-lg"
          : "text-purple-200/80 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}