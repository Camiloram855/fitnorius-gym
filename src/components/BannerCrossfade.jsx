import { useEffect, useRef, useState } from "react";

export default function BannerCrossfade({ src, alt }) {
  const [displayed, setDisplayed] = useState(src);
  const incomingRef = useRef(null);

  useEffect(() => {
    if (src === displayed) return;
    const incoming = incomingRef.current;
    let cancelled = false;
    let animation;
    async function reveal() {
      try {
        await incoming.decode();
        if (cancelled) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setDisplayed(src);
          return;
        }
        animation = incoming.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 750, easing: "ease-in-out", fill: "forwards",
        });
        await animation.finished;
        if (!cancelled) setDisplayed(src);
      } catch {
        // Keep the previous banner if the next image cannot be loaded.
      }
    }
    reveal();
    return () => { cancelled = true; animation?.cancel(); };
  }, [src, displayed]);

  return (
    <>
      <img src={displayed} alt={src === displayed ? alt : ""} className="absolute inset-0 h-full w-full object-contain" />
      {src !== displayed && <img key={src} ref={incomingRef} src={src} alt={alt}
        className="absolute inset-0 h-full w-full bg-neutral-950 object-contain" style={{ opacity: 0 }} />}
    </>
  );
}
