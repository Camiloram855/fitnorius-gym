import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "../pages/CartContext";
import API_URL from "../config";

export default function FloatingCart() {
  const { cartItems, removeFromCart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

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

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path}`;
  };

  return (
    <div ref={containerRef} className="fixed bottom-[5.5rem] right-3 z-50 sm:bottom-28 sm:right-4">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Abrir carrito, ${cartItems.length} productos`}
        aria-expanded={showCart}
        aria-controls="floating-cart-panel"
        onClick={() => setShowCart((open) => !open)}
        className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#25D366] text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:h-20 sm:w-20"
      >
        <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10" />
        {cartItems.length > 0 && (
          <span className="absolute -right-1 -top-1 min-w-6 rounded-full bg-pink-500 px-1.5 py-0.5 text-xs font-bold text-white">
            {cartItems.length}
          </span>
        )}
      </button>
        {showCart && (
          <div id="floating-cart-panel" role="region" aria-label="Tu carrito" className="absolute right-0 bottom-full mb-3 w-80 max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-12rem)] overflow-y-auto bg-white text-gray-800 rounded-xl shadow-2xl p-4 z-[999] border border-gray-200">

            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-bold text-purple-700">Tu carrito</h3>
              <button
                aria-label="Cerrar carrito"
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Tu carrito esta vacio.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-purple-50 rounded-lg p-2 shadow-sm"
                  >
                    <img
                      src={getImageUrl(item.image || item.imageUrl)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />

                    <div className="min-w-0 flex-1 break-words">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x ${item.price.toLocaleString()}
                      </p>
                    </div>

                    <button
                      aria-label={`Eliminar ${item.name} del carrito`}
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="mt-4 border-t pt-3 text-right">
                <p className="font-semibold text-purple-700">
                  Total: ${total.toLocaleString()}
                </p>
                <Link
                  to="/checkout"
                  aria-label="Cerrar carrito"
                onClick={() => setShowCart(false)}
                  className="mt-3 inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  Finalizar compra
                </Link>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
