import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./motion-footer.css";

gsap.registerPlugin(ScrollTrigger);

export function CinematicFooter({ children }) {
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const [curtainHeight, setCurtainHeight] = useState(0);

  useEffect(() => {
    const panel = panelRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const measure = () => {
      const height = Math.max(600, panel.scrollHeight);
      setCurtainHeight(!motion.matches && window.innerWidth >= 1024 && height <= window.innerHeight ? height : 0);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    window.addEventListener("resize", measure);
    motion.addEventListener("change", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      motion.removeEventListener("change", measure);
    };
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(wrapper.querySelector(".motion-footer__word"),
        { y: 65, scale: 0.9, opacity: 0.3 },
        { y: 0, scale: 1, opacity: 1, ease: "none",
          scrollTrigger: { trigger: wrapper, start: "top bottom", end: "bottom bottom", scrub: 0.6 } });
      gsap.fromTo(wrapper.querySelectorAll("[data-footer-reveal]"),
        { y: 28, opacity: 0.4 },
        { y: 0, opacity: 1, stagger: 0.08, ease: "power2.out",
          scrollTrigger: { trigger: wrapper, start: "top 95%", end: "clamp(bottom bottom)", scrub: 0.5 } });
    }, wrapper);
    // Category changes and loaded images can move the footer after mounting.
    let frame;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    observer.observe(document.getElementById("root"));
    ScrollTrigger.refresh();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); media.revert(); };
  }, [curtainHeight]);

  return (
    <div ref={wrapperRef} className={`motion-footer${curtainHeight ? " motion-footer--curtain" : ""}`}
      style={curtainHeight ? { height: curtainHeight } : undefined}>
      <footer ref={panelRef} className="motion-footer__panel">
        <div className="motion-footer__glow" aria-hidden="true" />
        <div className="motion-footer__grid" aria-hidden="true" />
        <div className="motion-footer__word" aria-hidden="true">FITNORIOS</div>
        <div className="motion-footer__marquee" aria-hidden="true">
          <div>{[0, 1].map((copy) => <span key={copy}>ENTRENA EN CASA ✦ SUPERA TUS LÍMITES ✦ FITNORIOS GYM ✦ </span>)}</div>
        </div>
        <div className="motion-footer__content">
          <h2 data-footer-reveal className="motion-footer__heading">Tu próximo paso empieza aquí.</h2>
          <div data-footer-reveal>{children}</div>
          <div className="motion-footer__bottom">
            <span>FITNORIOS GYM · Entrena a tu manera</span>
            <button type="button" className="motion-footer__top" aria-label="Volver al inicio"
              onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}>
              <ArrowUp size={20} /> <span>Volver arriba</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
