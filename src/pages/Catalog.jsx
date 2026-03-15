// src/pages/Catalog.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HeroBanner from "../sections/Components/HeroBanner";
import { Footer } from "../Layout/Footer";
import ScrollingHeader from "../sections/Components/ScrollingHeader";
import WhatsAppButton from "../components/WhatsAppButton";

import DetalleProduct from "./DetalleProduct";
import Login from "./Login";
import Checkout from "./Checkout";
import { CartProvider } from "./CartContext";
import { AuthProvider, useAuth } from "./AuthContext";
import ScratchAdminDashboard from "./ScratchAdminDashboard"; // ← nuevo

// Componente interno que ya tiene acceso al AuthContext
function CatalogContent() {
  const location = useLocation();
  const { isAdmin } = useAuth(); // ← igual que CategoryCarousel

  const isSpecialPage =
    location.pathname === "/catalog/login" ||
    location.pathname === "/catalog/checkout";

  return (
    <div className="App">
      {!isSpecialPage && <ScrollingHeader />}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroBanner />
            </>
          }
        />
        <Route path="producto/:id" element={<DetalleProduct />} />
        <Route path="login" element={<Login />} />
        <Route path="checkout" element={<Checkout />} />
      </Routes>

      {/* Panel admin del Raspa y Gana — solo visible si isAdmin */}
      {isAdmin && location.pathname === "/catalog/checkout" && (
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <ScratchAdminDashboard />
        </div>
      )}

      {!isSpecialPage && <WhatsAppButton />}
      {!isSpecialPage && <Footer />}
    </div>
  );
}

export default function Catalog() {
  return (
    <AuthProvider>
      <CartProvider>
        <CatalogContent />
      </CartProvider>
    </AuthProvider>
  );
}
