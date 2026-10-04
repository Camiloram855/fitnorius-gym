import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Modal común para los paneles de administración.
 *
 * Se resuelve en un portal al `body` porque el header que los abre lleva
 * `backdrop-blur`, y eso crea un bloque contenedor para `position: fixed`:
 * sin el portal, el modal queda encerrado en la franja de 48 px del header y
 * no se ve.
 *
 * El overlay es el que scrollea y el panel nunca supera el alto de la
 * pantalla, de modo que en móvil todo el contenido queda accesible con el
 * dedo, aunque sea más largo que la ventana.
 */
export default function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  eyebrow,
  size = "md",
  tone = "light",
  children,
  labelledBy = "admin-modal-title",
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // Evita que la página de detrás siga desplazándose con el dedo.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "sm:max-w-md",
    md: "sm:max-w-xl",
    lg: "sm:max-w-3xl",
  };

  const isDark = tone === "dark";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/70 px-3 py-4 backdrop-blur-sm sm:px-6 sm:py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={[
          "my-auto w-full rounded-2xl shadow-2xl sm:rounded-3xl",
          // 90vh como respaldo y 90dvh para ignorar la barra del navegador.
          "max-h-[88vh] max-h-[88dvh] overflow-y-auto overscroll-contain",
          widths[size],
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900",
        ].join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`sticky top-0 z-10 flex items-start justify-between gap-3 border-b px-4 py-3 sm:px-6 ${
            isDark ? "border-white/10 bg-gray-900" : "border-gray-200 bg-white"
          }`}
        >
          <div className="min-w-0">
            {eyebrow && (
              <p
                className={`text-[0.65rem] font-bold uppercase tracking-[0.25em] ${
                  isDark ? "text-purple-400" : "text-purple-600"
                }`}
              >
                {eyebrow}
              </p>
            )}
            <h3
              id={labelledBy}
              className="truncate text-base font-black sm:text-lg"
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className={`mt-0.5 text-xs sm:text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className={`shrink-0 rounded-full p-2 transition ${
              isDark
                ? "bg-white/5 text-gray-300 hover:bg-white/10"
                : "bg-black/5 text-gray-600 hover:bg-black/10"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}