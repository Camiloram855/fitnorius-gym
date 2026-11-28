import "./promo-gold.css";

/** Shared metallic finish for catalog and promotion cards. */
export default function PromoBadge({ className = "", label = "¡Promo!" }) {
  return <span className={`promo-gold-badge ${className}`}>{label}</span>;
}
