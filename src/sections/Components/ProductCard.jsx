import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../pages/AuthContext";
import { useCart } from "../../pages/CartContext";
import {
  CartIcon,
  HexagonIcon,
  PRODUCT_FEATURE_ICON_MAP,
  ShieldBadgeIcon,
} from "../../components/SVG/ProductCardIcons";
import ProductHighlightsEditor from "./ProductHighlightsEditor";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, "")) || "http://localhost:8080";

const formatCurrency = (value) =>
  Number(value).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const optimizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("f_auto") || url.includes("q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

const parseHighlights = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getInitialHighlights = (product) => {
  const parsed = parseHighlights(product.highlightsJson || product.highlights);
  return parsed.length ? parsed : [];
};

const FeatureLine = ({ icon: Icon, label }) => (
  <li className="flex items-center gap-2 text-[0.78rem] leading-tight text-slate-500">
    <Icon className="h-3.5 w-3.5 shrink-0 text-violet-500" />
    <span>{label}</span>
  </li>
);

export default function ProductCard({ product, onDelete, onUpdate }) {
  const { isAdmin } = useAuth();
  const cart = useCart();
  const addToCart = cart?.addToCart || (() => {});
  const [showHighlightsModal, setShowHighlightsModal] = useState(false);
  const [highlightDrafts, setHighlightDrafts] = useState([]);
  const [added, setAdded] = useState(false);

  const hasPromo =
    product.oldPrice !== null &&
    product.oldPrice !== undefined &&
    Number(product.price) < Number(product.oldPrice);

  const ahorro = hasPromo ? Number(product.oldPrice) - Number(product.price) : null;

  const rawImageUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${API_BASE_URL}${product.imageUrl.startsWith("/") ? "" : "/"}${product.imageUrl}`
    : "/img/default.jpg";

  const imageSrc = optimizeCloudinaryUrl(rawImageUrl);
  const formattedPrice = product.price ? formatCurrency(product.price) : "$0";
  const formattedOldPrice = product.oldPrice ? formatCurrency(product.oldPrice) : null;
  const formattedAhorro = ahorro ? formatCurrency(ahorro) : null;

  const manualHighlights = useMemo(
    () => getInitialHighlights(product),
    [product.highlightsJson, product.highlights]
  );

  useEffect(() => {
    if (showHighlightsModal) setHighlightDrafts(manualHighlights);
  }, [showHighlightsModal, manualHighlights]);

  const featureItems = manualHighlights.map((item, index) => ({
    icon:
      PRODUCT_FEATURE_ICON_MAP[item.icon] ||
      [ShieldBadgeIcon, HexagonIcon][index % 2] ||
      ShieldBadgeIcon,
    label: item.text || item.label || "",
  }));

  const handleDelete = (e) => {
    e.preventDefault();
    if (onDelete) onDelete(product.id);
  };

  const handleToggleAgotado = async (estado) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${product.id}/agotado?estado=${estado}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error("Error actualizando estado");
      const updatedProduct = await response.json();
      if (onUpdate) onUpdate(updatedProduct);
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo actualizar el estado");
    }
  };

  const handleAddToCart = () => {
    if (product.agotado) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: imageSrc,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleSaveHighlights = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${product.id}/highlights`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            highlightDrafts
              .filter((item) => item?.text?.trim())
              .map((item) => ({ icon: item.icon || "shield", text: item.text.trim() }))
          ),
        }
      );
      if (!response.ok) throw new Error("No se pudo guardar");
      const updated = await response.json();
      if (onUpdate) onUpdate(updated);
      setShowHighlightsModal(false);
    } catch (error) {
      console.error(error);
      alert("No se pudieron guardar los puntos destacados");
    }
  };

  return (
    <div className="mx-auto block h-full w-full max-w-[268px]">
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(109,40,217,0.10)] ring-1 ring-violet-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(109,40,217,0.18)]">

        {/* ── Imagen ── */}
        <Link
          to={`/catalog/producto/${product.id}`}
          onClick={() => {
            sessionStorage.setItem("scrollPosition", window.scrollY);
            if ("scrollRestoration" in window.history)
              window.history.scrollRestoration = "manual";
          }}
          className="relative block overflow-hidden"
          style={{ aspectRatio: "1 / 1" }}
        >
          {/* Fondo degradado suave */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#f5f0ff_0%,#fdfcff_60%,#f9f6ff_100%)]" />

          {/* Logo marca de agua */}
          <div className="absolute left-3 top-3 z-10 opacity-50">
            <img
              src="/img/logo-letra.png"
              alt="FitnoriosGym"
              className="h-3 w-auto select-none"
              draggable="false"
            />
          </div>
           {/* Badge PROMO — cinta lado derecho */}
{hasPromo && (
  <div className="absolute bottom-3 left-3 z-10">
    <span
      className="rounded-full px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white shadow-lg"
      style={{ background: "linear-gradient(135deg, #dba100 0%, #d89400 50%, #9b5c03 100%)" }}
    >
      Promo
    </span>
  </div>
)}

          {/* Badge AGOTADO */}
          {product.agotado && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
              <span className="rounded-full bg-black/70 px-4 py-1.5 text-[0.63rem] font-black uppercase tracking-[0.2em] text-white">
                Agotado
              </span>
            </div>
          )}

          <img
            src={imageSrc}
            alt={product.name}
            className="relative z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            onError={(e) => (e.target.src = "/img/default.jpg")}
          />

          {/* Sombra difusa inferior */}
          <div className="absolute inset-x-0 bottom-0 z-[2] h-10 bg-gradient-to-t from-white/60 to-transparent" />
        </Link>

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">

          {/* Nombre */}
          <h3 className="text-[0.82rem] font-black uppercase leading-snug tracking-tight text-slate-800 line-clamp-2">
            {product.name}
          </h3>

          {/* Separador delgado */}
          {featureItems.length > 0 && (
            <div className="my-2.5 h-px bg-violet-100" />
          )}

          {/* Features */}
          {featureItems.length > 0 && (
            <ul className="space-y-1.5">
              {featureItems.map((item, i) => (
                <FeatureLine key={`${item.label}-${i}`} icon={item.icon} label={item.label} />
              ))}
            </ul>
          )}

          {/* Precios */}
          <div className="mt-3 flex flex-col gap-0.5">
            <span className="text-[1.1rem] font-black leading-none text-emerald-600">
              {formattedPrice}
            </span>
            {formattedOldPrice && (
              <span className="text-[0.75rem] font-medium leading-none text-slate-400 line-through">
                {formattedOldPrice}
              </span>
            )}
          </div>

          {/* Badge ahorra */}
          {formattedAhorro && (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[0.7rem] font-semibold text-violet-700 ring-1 ring-violet-200/70">
                Ahorras {formattedAhorro}
              </span>
            </div>
          )}

          {/* Highlights admin */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowHighlightsModal(true)}
              className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[0.66rem] font-medium text-violet-700 transition hover:bg-violet-100"
            >
              ✦ Puntos destacados
            </button>
          )}

          {/* ── Botón agregar al carrito ── */}
          <div className="mt-auto pt-3.5">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.agotado}
              className={`
                w-full rounded-xl py-2.5 text-[0.75rem] font-bold tracking-wide
                transition-all duration-200 active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-50
                ${added
                  ? "bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_3px_12px_rgba(109,40,217,0.28)] hover:from-violet-700 hover:to-purple-700 hover:shadow-[0_5px_16px_rgba(109,40,217,0.36)]"
                }
              `}
            >
              <span className="flex items-center justify-center gap-2">
                {added ? (
                  <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <CartIcon className="h-3.5 w-3.5" />
                    Agregar al carrito
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Controles admin */}
          {isAdmin && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                onClick={handleDelete}
                className="rounded-lg bg-rose-500 py-1.5 text-[0.66rem] font-semibold text-white transition hover:bg-rose-600"
              >
                Eliminar
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleAgotado(!product.agotado);
                }}
                className={`rounded-lg py-1.5 text-[0.66rem] font-semibold text-white transition ${
                  product.agotado
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-slate-400 hover:bg-slate-500"
                }`}
              >
                {product.agotado ? "Disponible" : "Agotado"}
              </button>
            </div>
          )}
        </div>
      </article>

      {/* ── Modal Highlights ── */}
      {showHighlightsModal && isAdmin && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-violet-800/60 bg-gradient-to-br from-violet-950 to-black p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-white">Puntos destacados</h4>
                <p className="text-xs text-violet-300/70">Elige un icono y escribe el texto.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHighlightsModal(false)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
              >
                Cerrar
              </button>
            </div>

            <ProductHighlightsEditor value={highlightDrafts} onChange={setHighlightDrafts} />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowHighlightsModal(false)}
                className="rounded-lg border border-gray-600 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveHighlights}
                className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
