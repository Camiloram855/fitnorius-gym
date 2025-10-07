// src/pages/Catalog.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import HeroBanner from "../sections/Components/HeroBanner";
import { Footer } from "../Layout/Footer";
import ScrollingHeader from "../sections/Components/ScrollingHeader";
import WhatsAppButton from "../components/WhatsAppButton";
import FAQ from "../sections/FAQ";
import ScrollToTop from "../sections/Components/ScrollToTop";
import DetalleProduct from "./DetalleProduct";
import Login from "./Login";
import Checkout from "./Checkout";
import { CartProvider } from "./CartContext";
import { AuthProvider } from "./AuthContext"; // ✅ Importa desde la carpeta pages

export default function Catalog() {
  const location = useLocation();
  const isSpecialPage =
    location.pathname === "/catalog/login" ||
    location.pathname === "/catalog/checkout";

  return (
    <AuthProvider> {/* ✅ AHORA TODO ESTÁ DENTRO */}
      <CartProvider>
        <div className="App">
          <ScrollToTop />

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
