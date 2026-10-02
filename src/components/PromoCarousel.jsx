import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import API_URL from "../config";
import { useCart } from "../pages/CartContext";
import { useNavigate } from "react-router-dom";
import ProductImage from "./ProductImage";
import PromoBadge from "./PromoBadge";
import {
  discountPercent,
  formatCurrency,
  productImageUrl,
  savingsAmount,
} from "../utils/promo";

// Ritmo lento y continuo: ~26 px por segundo, se avanza por fotogramas reales.
const PIXELS_PER_SECOND = 26;
const GAP = 20;
const ITEM_WIDTH = 320;
const DRAG_THRESHOLD = 60;
const RESUME_DELAY = 1400;

/**
 * Carrusel infinito de productos en promoción.
 *
 * El desplazamiento se escribe directamente sobre el `transform` con
 * requestAnimationFrame en vez de guardarlo en estado de React: así no hay un
 * render por fotograma y las tarjetas no parpadean. Para que el ciclo no tenga
 * costura, la lista se repite las veces necesarias para cubrir el ancho y al
 * superar un juego completo se resta ese ancho (el contenido es idéntico, así
 * que el salto no se ve).
 */
export default function PromoCarousel({ products, onSeeAll }) {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const offsetRef = useRef(0);
  const setWidthRef = useRef(0);
  const frameRef = useRef(0);
  const pausedUntilRef = useRef(0);
  const dragRef = useRef(null);
  const reduceMotionRef = useRef(false);

  const [paused, setPaused] = useState(false);
  // Ancho real del viewport: define cuántas veces se repite la cinta para que
  // siempre cubra la pantalla más un juego completo.
  const [viewportWidth, setViewportWidth] = useState(0);
  const cart = useCart();
  const addToCart = cart?.addToCart || (() => {});
  const navigate = useNavigate();

  const items = products || [];
  const hasMultiple = items.length > 1;

  const loops = hasMultiple
    ? Math.max(2, Math.ceil((viewportWidth + ITEM_WIDTH) / (ITEM_WIDTH + GAP)) + 1)
    : 1;
  const repeated = hasMultiple ? Array.from({ length: loops }, () => items).flat() : items;

  const setOffset = useCallback((value) => {
    const track = trackRef.current;
    const setWidth = setWidthRef.current;
    if (!track || setWidth <= 0) return;

    let next = value;
    // Vuelta atrás: al cruzar el origen se salta un juego hacia delante.
    if (next <= -setWidth) next += setWidth;
    if (next > 0) next -= setWidth;

    offsetRef.current = next;
    track.style.transform = `translate3d(${next}px, 0, 0)`;
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return;
    // Primer y segundo juego: la distancia entre ambos es el ancho de un juego.
    const children = track.children;
    const first = children[0];
    const second = children[items.length || 1];
    if (!first || !second) return;

    const firstRect = first.getBoundingClientRect();
    const secondRect = second.getBoundingClientRect();
    const width = secondRect.left - firstRect.left;
    if (width > 0) {
      setWidthRef.current = width;
      setOffset(offsetRef.current);
    }
  }, [items.length, setOffset]);

  useEffect(() => {
    measure();

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width || 0;
      setViewportWidth((prev) => (Math.abs(prev - width) > 1 ? width : prev));
      measure();
    });
    if (viewportRef.current) observer.observe(viewportRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, repeated.length]);

  // Bucle de animación.
  useEffect(() => {
    if (!hasMultiple) return undefined;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = query.matches;
    const onMotionChange = (event) => {
      reduceMotionRef.current = event.matches;
    };
    query.addEventListener("change", onMotionChange);

    let last = performance.now();

    const tick = (now) => {
      const delta = (now - last) / 1000;
      last = now;

      const motionReduced = reduceMotionRef.current;
      const manualPause = pausedUntilRef.current > now;
      const isPaused = paused || motionReduced || manualPause || dragRef.current;

      if (!isPaused && setWidthRef.current > 0) {
        setOffset(offsetRef.current - PIXELS_PER_SECOND * delta);
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    // En segundo plano no se gasta CPU ni se mueve la cinta.
    const onVisibilityChange = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(frameRef.current);
      query.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [hasMultiple, paused, setOffset]);

  const pauseTemporarily = useCallback(() => {
    pausedUntilRef.current = performance.now() + RESUME_DELAY;
  }, []);

  const moveByCards = useCallback(
    (direction) => {
      const track = trackRef.current;
      if (!track) return;
      pauseTemporarily();

      // Se mide la distancia real entre tarjetas porque el ancho es responsive.
      const first = track.children[0];
      const second = track.children[1];
      if (!first || !second) return;
      const step = second.getBoundingClientRect().left - first.getBoundingClientRect().left;

      track.style.transition = "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
      setOffset(offsetRef.current + direction * step);
      window.setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = "";
      }, 440);
    },
    [pauseTemporarily, setOffset]
  );

  // Deslizamiento con el dedo (y también con el ratón).
  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = { startX: event.clientX, startOffset: offsetRef.current, moved: false };
    pauseTemporarily();
    if (event.pointerType !== "mouse") {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track) return;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 4) drag.moved = true;

    track.style.transition = "";
    offsetRef.current = drag.startOffset + delta;
    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track) return;
    dragRef.current = null;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > DRAG_THRESHOLD && track.children[1]) {
      const step =
        track.children[1].getBoundingClientRect().left -
        track.children[0].getBoundingClientRect().left;
      setOffset(offsetRef.current + (delta < 0 ? step : -step));
    } else {
      setOffset(offsetRef.current);
    }
  };

  if (!items.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Flechas */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => moveByCards(-1)}
            aria-label="Productos anteriores"
            className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/95 text-purple-800 shadow-lg p-2 sm:p-3 hover:bg-white hover:scale-110 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => moveByCards(1)}
            aria-label="Productos siguientes"
            className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/95 text-purple-800 shadow-lg p-2 sm:p-3 hover:bg-white hover:scale-110 transition-transform"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div
        ref={viewportRef}
        className="overflow-hidden touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(event) => {
          // Con ratón se cierra el arrastre; con el dedo lo decide pointerup.
          if (dragRef.current && event.pointerType === "mouse") endDrag(event);
          setPaused(false);
        }}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ gap: `${GAP}px`, cursor: "grab" }}
        >
          {repeated.map((product, index) => (
            <PromoCard
              key={`${product.id}-${index}`}
              product={product}
              onView={() => navigate(`/catalog/producto/${product.id}`)}
              onAdd={() =>
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  quantity: 1,
                  image: productImageUrl(product, API_URL),
                })
              }
            />
          ))}
        </div>
      </div>

      {hasMultiple && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => moveByCards(-1)}
            className="text-xs font-semibold text-purple-200 hover:text-white transition-colors"
          >
            ← Anteriores
          </button>
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="rounded-full bg-purple-600 hover:bg-purple-700 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors"
            >
              Ver todas
            </button>
          )}
          <button
            type="button"
            onClick={() => moveByCards(1)}
            className="text-xs font-semibold text-purple-200 hover:text-white transition-colors"
          >
            Siguientes →
          </button>
        </div>
      )}
    </div>
  );
}

function PromoCard({ product, onView, onAdd }) {
  const percent = discountPercent(product);
  const savings = savingsAmount(product);
  const agotado = Boolean(product.agotado);

  return (
    <article
      className="shrink-0 w-[280px] sm:w-[320px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] hover:border-purple-400/40 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/50"
    >
      <button
        type="button"
        onClick={onView}
        className="relative block w-full aspect-[4/3] overflow-hidden"
        aria-label={`Ver ${product.name}`}
      >
        <ProductImage
          src={productImageUrl(product, API_URL)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        <span className="absolute bottom-3 left-3 z-10">
          <PromoBadge />
        </span>

        {percent > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-black/85 px-3 py-1 text-sm font-black text-white shadow-lg">
            -{percent}%
          </span>
        )}

        {agotado && (
          <span className="absolute inset-x-0 bottom-0 bg-black/80 py-2 text-center text-xs font-black uppercase tracking-[0.2em] text-white">
            Agotado
          </span>
        )}
      </button>

      <div className="flex flex-col gap-3 p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold uppercase leading-snug tracking-tight text-gray-100">
          {product.name}
        </h3>

        <div className="flex flex-col">
          <span className="text-2xl font-black leading-none text-emerald-400">
            {formatCurrency(product.price)}
          </span>
          {product.oldPrice != null && (
            <span className="mt-1 text-sm text-gray-500 line-through">
              {formatCurrency(product.oldPrice)}
            </span>
          )}
          {savings > 0 && (
            <span className="mt-1 text-xs font-semibold text-emerald-400/90">
              Ahorras {formatCurrency(savings)}
            </span>
          )}
        </div>

        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onView}
            className="flex-1 rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors"
          >
            Ver producto
          </button>
          <button
            type="button"
            onClick={onAdd}
            disabled={agotado}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-3 py-2 text-xs font-bold text-white hover:from-purple-700 hover:to-purple-600 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {agotado ? "Agotado" : "Añadir"}
          </button>
        </div>
      </div>
    </article>
  );
}