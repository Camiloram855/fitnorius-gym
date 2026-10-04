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

// Ritmo lento y continuo del desplazamiento automático.
const PIXELS_PER_SECOND = 26;
const GAP = 20;
const ITEM_WIDTH = 320;

// Al soltar el dedo se proyecta el movimiento para inferir la intención, y
// luego la cinta se asienta en la tarjeta más cercana.
const PROJECTION_MS = 140;
const VELOCITY_WINDOW_MS = 110;
const MIN_SETTLE_MS = 220;
const MAX_SETTLE_MS = 520;
// Máximo de tarjetas que puede avanzar un solo gesto, para que un tirón rápido
// no teletransporte al visitante de un extremo al otro.
const MAX_CARDS_PER_GESTURE = 3;
// Tiempo tras el cual el avance automático se reanuda tras interactuar.
const RESUME_DELAY = 1600;

/**
 * Carrusel infinito de productos en promoción.
 *
 * El desplazamiento se escribe directamente sobre el `transform` con
 * requestAnimationFrame, sin pasar por estado de React: así no hay un render
 * por fotograma y las tarjetas no parpadean. El bucle se crea una sola vez y
 * consulta las pausas por referencia, de modo que tocar la pantalla no lo
 * reinicia (eso era lo que hacía el arrastre brusco en móvil).
 *
 * Al deslizar se mide la velocidad del gesto y la cinta se asienta sola en la
 * tarjeta más cercana con una transición suave, en lugar de saltar de golpe.
 */
export default function PromoCarousel({ products, onSeeAll }) {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);

  const offsetRef = useRef(0);
  const setWidthRef = useRef(0);
  const stepRef = useRef(0);
  const frameRef = useRef(0);
  const settleTimerRef = useRef(0);

  const resumeAtRef = useRef(0);
  const hoverRef = useRef(false);
  const dragRef = useRef(null);
  const reduceMotionRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);

  const cart = useCart();
  const addToCart = cart?.addToCart || (() => {});
  const navigate = useNavigate();

  const items = products || [];
  const hasMultiple = items.length > 1;

  // Se repite la cinta hasta cubrir el viewport más un juego completo, para que
  // el ciclo no tenga costura visible.
  const loops = hasMultiple
    ? Math.max(2, Math.ceil((viewportWidth + ITEM_WIDTH) / (ITEM_WIDTH + GAP)) + 1)
    : 1;
  const repeated = hasMultiple ? Array.from({ length: loops }, () => items).flat() : items;

  /** Escribe la posición sin animación, normalizando dentro de un juego. */
  const setOffset = useCallback((value) => {
    const track = trackRef.current;
    const setWidth = setWidthRef.current;
    if (!track || setWidth <= 0) return;

    let next = value;
    if (next <= -setWidth) next += setWidth;
    if (next > 0) next -= setWidth;

    offsetRef.current = next;
    track.style.transform = `translate3d(${next}px, 0, 0)`;
  }, []);

  /** Distancia real entre dos tarjetas consecutivas. */
  const cardStep = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return 0;
    return (
      track.children[1].getBoundingClientRect().left -
      track.children[0].getBoundingClientRect().left
    );
  }, []);

  const clearTransition = useCallback(() => {
    const track = trackRef.current;
    if (track) track.style.transition = "";
  }, []);

  /**
   * Lleva la cinta a una posición concreta con transición. Ajusta el destino al
   * juego más cercano para que la distancia sea siempre corta y suave.
   */
  const animateTo = useCallback(
    (target, minDuration = MIN_SETTLE_MS) => {
      const track = trackRef.current;
      const setWidth = setWidthRef.current;
      const step = stepRef.current;
      if (!track || setWidth <= 0 || step <= 0) return;

      window.clearTimeout(settleTimerRef.current);

      let destination = target;

      // Reencaja el destino en el mismo juego que la posición actual: así el
      // recorrido nunca es de varios juegos de ancho.
      while (destination - offsetRef.current > setWidth / 2) destination -= setWidth;
      while (offsetRef.current - destination > setWidth / 2) destination += setWidth;

      const distance = Math.abs(destination - offsetRef.current);
      const duration = Math.min(
        MAX_SETTLE_MS,
        Math.max(minDuration, (distance / step) * 220)
      );

      track.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      setOffset(destination);

      settleTimerRef.current = window.setTimeout(() => {
        clearTransition();
        // Tras la transición el offset real es el destino exacto: se sincroniza
        // para que el avance automático continúe desde ahí.
        setOffset(offsetRef.current);
      }, duration + 20);
    },
    [clearTransition, setOffset]
  );

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < items.length + 1) return;

    const firstRect = track.children[0].getBoundingClientRect();
    const secondSetRect = track.children[items.length].getBoundingClientRect();

    const setWidth = secondSetRect.left - firstRect.left;
    if (setWidth > 0) {
      setWidthRef.current = setWidth;
      setOffset(offsetRef.current);
    }

    const step = cardStep();
    if (step > 0) stepRef.current = step;
  }, [items.length, cardStep, setOffset]);

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

  // Bucle de avance automático. Se crea una sola vez: las pausas se consultan
  // por referencia para que tocar la pantalla no lo reinicie.
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
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;

      const resting =
        !hoverRef.current &&
        !dragRef.current &&
        !reduceMotionRef.current &&
        resumeAtRef.current <= now;

      if (resting && setWidthRef.current > 0 && !settleTimerRef.current) {
        setOffset(offsetRef.current - PIXELS_PER_SECOND * delta);
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    const onVisibilityChange = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(settleTimerRef.current);
      query.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [hasMultiple, setOffset]);

  const holdAutoPlay = useCallback((ms = RESUME_DELAY) => {
    resumeAtRef.current = performance.now() + ms;
  }, []);

  const goByCards = useCallback(
    (direction) => {
      const step = stepRef.current || cardStep();
      if (!step) return;
      holdAutoPlay();
      animateTo(offsetRef.current + direction * step);
    },
    [animateTo, cardStep, holdAutoPlay]
  );

  const velocityOf = (samples) => {
    if (!samples || samples.length < 2) return 0;
    const last = samples[samples.length - 1];
    let first = samples[0];
    for (let i = samples.length - 1; i >= 0; i -= 1) {
      if (last.t - samples[i].t <= VELOCITY_WINDOW_MS) first = samples[i];
      else break;
    }
    const elapsed = last.t - first.t;
    if (elapsed <= 0) return 0;
    return (last.x - first.x) / elapsed; // px por milisegundo
  };

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    clearTransition();
    dragRef.current = {
      startX: event.clientX,
      startOffset: offsetRef.current,
      samples: [{ x: event.clientX, t: performance.now() }],
    };
    holdAutoPlay();
    setIsDragging(true);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track) return;

    // Ignora el gesto si es claramente vertical: así el scroll de la página
    // nunca queda capturado por el carrusel.
    if (drag.startY === undefined) drag.startY = event.clientY;
    if (!drag.moved) {
      const dx = Math.abs(event.clientX - drag.startX);
      const dy = Math.abs(event.clientY - drag.startY);
      if (dy > dx && dy > 8) {
        dragRef.current = null;
        setIsDragging(false);
        return;
      }
      if (dx < 4) return;
    }

    drag.moved = true;
    drag.samples.push({ x: event.clientX, t: performance.now() });
    if (drag.samples.length > 6) drag.samples.shift();

    offsetRef.current = drag.startOffset + (event.clientX - drag.startX);
    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  };

  const endDrag = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setIsDragging(false);
    holdAutoPlay();

    const step = stepRef.current || cardStep();
    if (!step) {
      setOffset(offsetRef.current);
      return;
    }

    const velocity = velocityOf(drag.samples);
    // Proyecta el movimiento para respetar la intención del gesto.
    const projected = offsetRef.current + velocity * PROJECTION_MS;

    let target = Math.round(projected / step) * step;

    // Un solo gesto no puede recorrer más de unas tarjetas.
    const shift = target - offsetRef.current;
    const limit = step * MAX_CARDS_PER_GESTURE;
    if (Math.abs(shift) > limit) {
      target = offsetRef.current + Math.sign(shift) * limit;
    }

    // Un toque sin arrastre devuelve la cinta a su sitio con suavidad.
    if (!drag.moved) {
      target = offsetRef.current;
    }

    animateTo(target);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goByCards(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goByCards(1);
    }
  };

  if (!items.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => goByCards(-1)}
            aria-label="Productos anteriores"
            className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/95 p-1.5 text-purple-800 shadow-lg transition-transform hover:bg-white hover:scale-110 active:scale-95 sm:left-3 sm:p-2.5"
          >
            <ChevronLeft size={16} className="sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={() => goByCards(1)}
            aria-label="Productos siguientes"
            className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/95 p-1.5 text-purple-800 shadow-lg transition-transform hover:bg-white hover:scale-110 active:scale-95 sm:right-3 sm:p-2.5"
          >
            <ChevronRight size={16} className="sm:h-5 sm:w-5" />
          </button>
        </>
      )}

      <div
        ref={viewportRef}
        role="region"
        aria-label="Productos en promoción"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="overflow-hidden touch-pan-y select-none outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 rounded-2xl"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ gap: `${GAP}px` }}
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
        <div className="mt-5 flex items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => goByCards(-1)}
            className="rounded-full px-3 py-2 text-xs font-semibold text-purple-200 transition-colors hover:bg-white/5 hover:text-white sm:px-4 sm:text-sm"
          >
            <span aria-hidden="true">←</span>
            <span className="ml-1 hidden sm:inline">Anteriores</span>
          </button>

          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="rounded-full bg-purple-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-purple-700 sm:px-5 sm:text-sm"
            >
              Ver todas
            </button>
          )}

          <button
            type="button"
            onClick={() => goByCards(1)}
            className="rounded-full px-3 py-2 text-xs font-semibold text-purple-200 transition-colors hover:bg-white/5 hover:text-white sm:px-4 sm:text-sm"
          >
            <span className="mr-1 hidden sm:inline">Siguientes</span>
            <span aria-hidden="true">→</span>
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
      className="w-[250px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors duration-300 hover:border-purple-400/40 hover:bg-white/[0.08] sm:w-[300px] sm:rounded-3xl"
    >
      <button
        type="button"
        onClick={onView}
        className="group relative block aspect-[4/3] w-full overflow-hidden"
        aria-label={`Ver ${product.name}`}
      >
        <ProductImage
          src={productImageUrl(product, API_URL)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute bottom-3 left-3 z-10">
          <PromoBadge />
        </span>

        {percent > 0 && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-black/85 px-2.5 py-1 text-xs font-black text-white shadow-lg sm:text-sm">
            -{percent}%
          </span>
        )}

        {agotado && (
          <span className="absolute inset-x-0 bottom-0 bg-black/80 py-2 text-center text-xs font-black uppercase tracking-[0.2em] text-white">
            Agotado
          </span>
        )}
      </button>

      <div className="flex flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.25rem] text-xs font-bold uppercase leading-snug tracking-tight text-gray-100 sm:min-h-[2.5rem] sm:text-sm">
          {product.name}
        </h3>

        <div className="flex flex-col">
          <span className="text-xl font-black leading-none text-emerald-400 sm:text-2xl">
            {formatCurrency(product.price)}
          </span>
          {product.oldPrice != null && (
            <span className="mt-1 text-xs text-gray-500 line-through sm:text-sm">
              {formatCurrency(product.oldPrice)}
            </span>
          )}
          {savings > 0 && (
            <span className="mt-1 text-[0.7rem] font-semibold text-emerald-400/90 sm:text-xs">
              Ahorras {formatCurrency(savings)}
            </span>
          )}
        </div>

        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onView}
            className="flex-1 rounded-xl border border-white/10 bg-white/10 px-2 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
          >
            Ver
          </button>
          <button
            type="button"
            onClick={onAdd}
            disabled={agotado}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-2 py-2 text-xs font-bold text-white transition hover:from-purple-700 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {agotado ? "Agotado" : "Añadir"}
          </button>
        </div>
      </div>
    </article>
  );
}