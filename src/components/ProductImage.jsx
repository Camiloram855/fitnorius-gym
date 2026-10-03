import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "../utils/images";

/**
 * <img> con fallback seguro para catálogo y panel de detalle.
 *
 * El fallback se controla con estado de React en lugar de mutar
 * `e.target.src`. Con la mutación anterior, si el placeholder fallaba el
 * onError volvía a dispararse sobre sí mismo en un bucle infinito de
 * peticiones; aquí, como mucho, se sustituye una vez y si el placeholder
 * tampoco carga no se reintenta nada.
 *
 * Cuando cambia `src` (otra miniatura, otro producto) el estado se reinicia
 * para poder volver a usar la imagen real.
 */
export default function ProductImage({
  src,
  alt = "",
  className = "",
  eager = false,
  ...rest
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const isBroken = !src || failedSrc === src;

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  return (
    <img
      src={isBroken ? PLACEHOLDER_IMAGE : src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => {
        if (!isBroken) setFailedSrc(src);
      }}
      {...rest}
    />
  );
}
