import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowUpRight, Trash2, X } from "lucide-react";
import { useCart } from "../pages/CartContext";
import ProductImage from "./ProductImage";
import { buildImageUrl } from "../utils/images";
import API_URL from "../config";

const currency = (value) => Number(value).toLocaleString("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
});

export default function FloatingCart() {
  const { cartItems, removeFromCart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const count = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (!showCart) return;
    const closeOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setShowCart(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setShowCart(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showCart]);

  return (
    <div ref={containerRef} className="fixed bottom-[5.5rem] right-3 z-50 sm:bottom-28 sm:right-4">
      <div className="flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
        <button
          ref={buttonRef}
          type="button"
          aria-label={`${showCart ? "Cerrar" : "Abrir"} carrito, ${count} artículos`}
          aria-expanded={showCart}
          aria-controls={showCart ? "floating-cart-panel" : undefined}
          onClick={() => setShowCart((open) => !open)}
          className="relative flex h-16 w-16 items-center justify-center rounded-full border border-purple-300/60 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 text-white shadow-[0_6px_24px_rgba(88,28,135,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:border-purple-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400 sm:h-20 sm:w-20"
        >
          <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.8} />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-purple-600 bg-purple-100 px-1 text-[10px] font-extrabold tabular-nums text-purple-900">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </div>

      {showCart && (
        <section
          id="floating-cart-panel"
          aria-label="Tu carrito"
          className="absolute bottom-full right-0 mb-4 flex max-h-[calc(100dvh-11rem)] w-[370px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-purple-300/30 bg-gradient-to-b from-purple-900 via-purple-950 to-[#1b102b] text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-br from-purple-500/30 to-purple-700/10 px-5 py-5">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-200">Tu selección</p>
              <h2 className="text-xl font-semibold tracking-tight">Mi carrito <span className="ml-1 text-sm font-normal text-purple-200/80">({count})</span></h2>
            </div>
            <button type="button" aria-label="Cerrar carrito" onClick={() => setShowCart(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-purple-100/80 hover:bg-white/10 hover:text-white">
              <X size={18} />
            </button>
          </header>

          {cartItems.length === 0 ? (
            <div className="overflow-y-auto px-7 py-9 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-300/30 bg-purple-400/15 text-purple-200">
                <ShoppingCart size={28} strokeWidth={1.3} />
              </div>
              <h3 className="text-base font-semibold">Tu próxima elección está aquí</h3>
              <p className="mt-2 text-sm leading-relaxed text-purple-200/80">Agrega tus favoritos del catálogo y los encontrarás en este espacio.</p>
              <button type="button" onClick={() => setShowCart(false)}
                className="mt-6 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium hover:bg-white/5">
                Seguir explorando
              </button>
            </div>
          ) : (
            <>
              <ul className="min-h-0 flex-1 divide-y divide-white/[0.07] overflow-y-auto overscroll-contain px-5">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-4">
                    <ProductImage
                      src={buildImageUrl(item.image || item.imageUrl, API_URL)}
                      alt={item.name}
                      className="h-[68px] w-[68px] shrink-0 rounded-xl border border-white/10 bg-white/5 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 break-words text-sm font-medium leading-snug text-white/90">{item.name}</p>
                      <p className="mt-1 text-xs text-purple-200/80">{item.quantity} × {currency(item.price)}</p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-purple-200">{currency(item.price * item.quantity)}</p>
                    </div>
                    <button type="button" aria-label={`Eliminar ${item.name} del carrito`}
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/35 hover:bg-red-400/10 hover:text-red-300">
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
              <footer className="shrink-0 border-t border-purple-300/15 bg-purple-950/70 p-5">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <span className="text-sm text-purple-100/80">Total de productos</span>
                  <span className="text-xl font-semibold tracking-tight tabular-nums text-white">{currency(total)}</span>
                </div>
                <Link to="/checkout" onClick={() => setShowCart(false)}
                  className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3.5 text-sm font-bold text-white hover:from-purple-400 hover:to-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300">
                  Finalizar compra <ArrowUpRight size={19} />
                </Link>
                <button type="button" onClick={() => setShowCart(false)}
                  className="mt-3 w-full py-1 text-xs font-medium text-purple-200/80 hover:text-white">
                  Seguir comprando
                </button>
              </footer>
            </>
          )}
        </section>
      )}
    </div>
  );
}