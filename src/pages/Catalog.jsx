// src/pages/Catalog.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HeroBanner from "../sections/Components/HeroBanner";
import { Footer } from "../Layout/Footer";
import ScrollingHeader from "../sections/Components/ScrollingHeader";
import WhatsAppButton from "../components/WhatsAppButton";
import FAQ from "../sections/FAQ";
import DetalleProduct from "./DetalleProduct";
import Login from "./Login";
import Checkout from "./Checkout";
import { CartProvider } from "./CartContext";
import { AuthProvider } from "./AuthContext";

export default function Catalog() {
  const location = useLocation();

  const isSpecialPage =
    location.pathname === "/catalog/login" ||
    location.pathname === "/catalog/checkout";

  // ✅ Control total del scroll — evita restauración automática del navegador
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Forzar scroll al tope (instantáneo)
    window.scrollTo(0, 0);

    // Refuerzos para casos donde React Router monta contenido después
    const t1 = setTimeout(() => window.scrollTo(0, 0), 80);
    const t2 = setTimeout(() => window.scrollTo(0, 0), 200);
    const t3 = setTimeout(() => window.scrollTo(0, 0), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname]);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          {!isSpecialPage && <ScrollingHeader />}

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroBanner />
                  <FAQ />
                </>
              }
            />
            <Route path="producto/:id" element={<DetalleProduct />} />
            <Route path="login" element={<Login />} />
            <Route path="checkout" element={<Checkout />} />
          </Routes>

          {!isSpecialPage && <WhatsAppButton />}
          {!isSpecialPage && <Footer />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
