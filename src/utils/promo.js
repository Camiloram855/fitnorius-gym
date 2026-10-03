/**
 * Reglas de promoción del catálogo.
 *
 * La insignia PROMO del catálogo es la etiqueta dorada `¡Promo!` que aparece
 * sobre la imagen del producto cuando, al editarlo, se le asigna un precio
 * anterior. Esta función reproduce exactamente ese criterio para saber qué
 * productos pertenecen a la sección de promociones:
 *
 *   oldPrice != null  &&  price < oldPrice
 *
 * Si algún día cambia el criterio en ProductCard, hay que cambiarlo también
 * aquí; si no, la sección de promociones dejaría de coincidir con el catálogo.
 *
 * No se añadió ninguna etiqueta nueva en la base de datos.
 */

const PLACEHOLDER_IMAGE = "/img/product-placeholder.svg";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Mismo criterio que aplica el badge dorado de ProductCard. */
export function isPromo(product) {
  if (!product) return false;
  const oldPrice = toNumber(product.oldPrice);
  const price = toNumber(product.price);

  return (
    product.oldPrice !== null &&
    product.oldPrice !== undefined &&
    oldPrice !== null &&
    price !== null &&
    price < oldPrice
  );
}

/** Porcentaje de descuento calculado con los precios reales. */
export function discountPercent(product) {
  if (!isPromo(product)) return 0;
  const oldPrice = toNumber(product.oldPrice);
  const price = toNumber(product.price);
  if (!oldPrice || oldPrice <= 0) return 0;

  const calculated = Math.round(((oldPrice - price) / oldPrice) * 100);
  // Si por algún motivo el cálculo no cuadra, se usa el campo discount guardado.
  if (calculated > 0) return calculated;

  const stored = toNumber(product.discount);
  return stored && stored > 0 ? Math.round(stored) : 0;
}

/** Cuánto se ahorra en pesos. */
export function savingsAmount(product) {
  if (!isPromo(product)) return 0;
  return Math.max(0, toNumber(product.oldPrice) - toNumber(product.price));
}

/** Solo los productos en promoción, en el orden en que llegan de la API. */
export function filterPromos(products) {
  return Array.isArray(products) ? products.filter(isPromo) : [];
}

export function formatCurrency(value) {
  return Number(value).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** Normaliza la URL de la imagen del producto (Cloudinary o backend local). */
export function productImageUrl(product, apiBaseUrl = "") {
  const url = product?.imageUrl;
  if (!url) return PLACEHOLDER_IMAGE;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  if (!apiBaseUrl) return url;
  return `${apiBaseUrl.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

export { PLACEHOLDER_IMAGE };