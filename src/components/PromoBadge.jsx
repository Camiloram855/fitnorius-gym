/**
 * Etiqueta dorada de PROMO.
 *
 * Es la misma insignia que aparece sobre la imagen de cada producto cuando se
 * le asigna un precio anterior desde la edición del producto. Se replica aquí
 * para que la sección de promociones use exactamente la misma etiqueta, sin
 * modificar el componente original del catálogo.
 *
 * El color es el mismo gradiente de ProductCard:
 *   linear-gradient(135deg, #dba100 0%, #d89400 50%, #9b5c03 100%)
 */
export default function PromoBadge({ className = "", label = "¡Promo!" }) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white shadow-lg ${className}`}
      style={{ background: "linear-gradient(135deg, #dba100 0%, #d89400 50%, #9b5c03 100%)" }}
    >
      {label}
    </span>
  );
}