import { useId } from "react";
import "./CartAnimatedIcon.css";

export default function CartAnimatedIcon({ addition }) {
  const fillId = `cart-bag-${useId().replace(/:/g, "")}`;
  return (
    <span className={`cart-animated-icon${addition > 0 ? " cart-animated-icon--added" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id={fillId} x1="12" y1="22" x2="37" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9c18ee" />
            <stop offset="1" stopColor="#6900cc" />
          </linearGradient>
        </defs>
        <g className="cart-bag-handle" stroke="white" strokeWidth="2.1" strokeLinecap="round">
          <path d="M18.5 25V18a5.5 5.5 0 0 1 11 0v7" />
        </g>
        {/* The weights fall behind the front of the bag, then disappear inside. */}
        {[0, 1].map((weight) => (
          <g key={weight} transform={`translate(${weight ? 28 : 21} 0)`}>
            <g className={`cart-falling-weight cart-falling-weight--${weight}`} fill="#f3d5ff" stroke="#fff" strokeWidth=".65">
              <rect x="-4" y="-1.1" width="8" height="2.2" rx=".7" />
              <rect x="-5.5" y="-3.5" width="2.7" height="7" rx=".8" />
              <rect x="2.8" y="-3.5" width="2.7" height="7" rx=".8" />
            </g>
          </g>
        ))}
        <g className="cart-bag-body">
          <path d="M16 22h16c2.1 0 3.2 1.3 3.5 3.3l1.4 10.1C37.3 38 35.8 40 33 40H15c-2.8 0-4.3-2-3.9-4.6l1.4-10.1C12.8 23.3 13.9 22 16 22Z"
            fill={`url(#${fillId})`} stroke="white" strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M18.5 22v4.5M29.5 22v4.5" stroke="white" strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="18.5" cy="26.5" r="1.6" fill="white" />
          <circle cx="29.5" cy="26.5" r="1.6" fill="white" />
        </g>
      </svg>
    </span>
  );
}
