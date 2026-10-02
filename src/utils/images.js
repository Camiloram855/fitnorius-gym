/**
 * Utilidades de imagen compartidas entre catálogo, tarjetas y panel de detalle.
 *
 * IMPORTANTE: el placeholder debe existir realmente en /public/img. Antes se
 * apuntaba a "/img/default.jpg", que no existe, y eso convertía cada fallback
 * en una nueva petición 404 que disparaba el onError otra vez (bucle de
 * cientos de peticiones).
 */

/** Placeholder local y real (public/img/product-placeholder.svg). */
export const PLACEHOLDER_IMAGE = "/img/product-placeholder.svg";

const ABSOLUTE_URL = /^(https?:)?\/\//i;
const INLINE_URL = /^(data|blob):/i;

/**
 * Normaliza la URL de una imagen:
 * - absoluta (http/https/protocol-relative), data: o blob: -> sin cambios
 * - relativa -> se le antepone la base del backend
 * - vacía o inválida -> placeholder
 */
export function resolveImageUrl(url, apiBaseUrl = "") {
  if (typeof url !== "string") return PLACEHOLDER_IMAGE;

  const trimmed = url.trim();
  if (!trimmed) return PLACEHOLDER_IMAGE;
  if (ABSOLUTE_URL.test(trimmed) || INLINE_URL.test(trimmed)) return trimmed;
  if (!apiBaseUrl) return trimmed;

  return `${apiBaseUrl.replace(/\/+$/, "")}/${trimmed.replace(/^\/+/, "")}`;
}

/** Cloudinary: deja que el CDN sirva AVIF/WebP y ajuste la calidad. */
export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("f_auto") || url.includes("q_auto")) return url;

  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

/** URL de imagen lista para usar en un <img src>. */
export function buildImageUrl(url, apiBaseUrl = "") {
  return optimizeCloudinaryUrl(resolveImageUrl(url, apiBaseUrl));
}
