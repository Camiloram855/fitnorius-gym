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

  // ✅ Control completo del scroll
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Forzar scroll al tope inmediatamente
    window.scrollTo(0, 0);

    // 🔁 Refuerzo en caso de que el navegador intente restaurar la posición anterior
    const fixScroll = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);

    return () => clearTimeout(fixScroll);
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
