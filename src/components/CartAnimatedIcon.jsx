import { useEffect, useState } from "react";
import "./CartAnimatedIcon.css";

export default function CartAnimatedIcon({ addition }) {
  const [playing, setPlaying] = useState(addition > 0);

  useEffect(() => {
    if (!addition) return;
    const timer = window.setTimeout(() => setPlaying(false), 1670);
    return () => window.clearTimeout(timer);
  }, [addition]);

  return (
    <span className="cart-animated-icon" aria-hidden="true">
      {playing && (
        <img className="cart-animated-icon__gif"
          src={`/img/carrito-de-compras.gif?addition=${addition}`}
          alt="" width="640" height="640" />
      )}
      <svg className={`cart-animated-icon__still${playing ? " cart-animated-icon__still--hidden" : ""}`}
        viewBox="0 0 640 640" fill="none">
        <path d="M208 333H530" stroke="#9333ea" strokeWidth="20" />
        <g stroke="#000" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
          <path d="M88 149H141Q158 149 163 170L229 419M184 239H537Q557 239 551 260L518 406Q514 427 495 427H219C174 427 174 488 219 488H506M278 243L304 423M374 243V423M469 243L443 423" />
          <circle cx="283" cy="524" r="36" />
          <circle cx="465" cy="524" r="36" />
        </g>
      </svg>
    </span>
  );
}
