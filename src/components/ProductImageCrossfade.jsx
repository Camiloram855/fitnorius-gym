import { useEffect, useRef, useState } from "react";
import ProductImage from "./ProductImage";

export default function ProductImageCrossfade({ src, alt }) {
  const [displayed, setDisplayed] = useState(src);
  const incomingRef = useRef(null);
  const animationRef = useRef(null);
  const generationRef = useRef(0);

  useEffect(() => {
    generationRef.current += 1;
    return () => { generationRef.current += 1; animationRef.current?.cancel(); };
  }, [src]);

  const reveal = async () => {
    const image = incomingRef.current;
    const generation = generationRef.current;
    if (!image) return;
    animationRef.current?.cancel();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(src);
      return;
    }
    const animation = image.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 600, easing: "ease-in-out", fill: "forwards",
    });
    animationRef.current = animation;
    try {
      await animation.finished;
      if (generation === generationRef.current) setDisplayed(src);
    } catch { /* A new selection cancels the previous transition. */ }
  };

  return (
    <>
      <ProductImage src={displayed} alt={src === displayed ? alt : ""} eager
        className="absolute inset-0 h-full w-full object-cover" />
      {src !== displayed && <ProductImage key={src || "placeholder"} ref={incomingRef}
        src={src} alt={alt} eager onLoad={reveal}
        className="absolute inset-0 h-full w-full bg-[#15121b] object-cover"
        style={{ opacity: 0 }} />}
    </>
  );
}
