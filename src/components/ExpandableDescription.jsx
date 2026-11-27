import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const MAX_LINES = 6;
const TEXT_CLASSES = "text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-line";

/**
 * Descripción de producto con límite de 6 líneas y botón Ver más / Ver menos.
 *
 * La altura contraída se calcula con el `line-height` real (que cambia entre
 * móvil y escritorio), y la altura completa se mide en un clon invisible con
 * el mismo ancho y tipografía. Así el botón solo aparece cuando el texto
 * realmente excede el límite, sin recortarlo ni depender de caracteres.
 */
export default function ExpandableDescription({ text = "" }) {
  const [expanded, setExpanded] = useState(false);
  const [heights, setHeights] = useState({ collapsed: 0, full: 0 });
  const [overflows, setOverflows] = useState(false);
  const contentRef = useRef(null);
  const measureRef = useRef(null);
  const contentId = useId();

  useLayoutEffect(() => {
    const content = contentRef.current;
    const measure = measureRef.current;
    if (!content || !measure) return undefined;

    const recalculate = () => {
      const lineHeight = parseFloat(window.getComputedStyle(content).lineHeight) || 24;
      const full = measure.getBoundingClientRect().height;
      const collapsed = Math.min(full, lineHeight * MAX_LINES);

      setHeights({ collapsed, full });
      setOverflows(full > collapsed + 1);
    };

    recalculate();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", recalculate);
      return () => window.removeEventListener("resize", recalculate);
    }

    const observer = new ResizeObserver(recalculate);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [text]);

  // Si el admin edita la descripción, vuelve a empezar contraído.
  useEffect(() => {
    setExpanded(false);
  }, [text]);

  return (
    <div className="relative min-w-0">
      {/* Clon invisible: mide la altura natural sin limitar líneas. */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className={`invisible absolute inset-x-0 top-0 ${TEXT_CLASSES}`}
      >
        {text}
      </div>

      <div className="relative">
        <div
          id={contentId}
          ref={contentRef}
          className={`${TEXT_CLASSES} overflow-hidden transition-[max-height] duration-300 ease-in-out motion-reduce:transition-none`}
          style={{
            maxHeight: expanded ? heights.full : heights.collapsed || undefined,
          }}
        >
          {text}
        </div>

        {/* Degradado sutil que avisa de que queda contenido oculto. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0b0714] via-[#0b0714]/85 to-transparent transition-opacity duration-200 motion-reduce:transition-none ${
            overflows && !expanded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-purple-300 transition-colors hover:text-purple-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
        >
          {expanded ? "Ver menos" : "Ver más"}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  );
}
