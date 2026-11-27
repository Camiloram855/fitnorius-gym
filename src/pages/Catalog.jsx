import { lazy, Suspense } from "react";
import { LoaderLogo } from "../components/GlobalLoader";
// src/pages/Catalog.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import HeroBanner from "../sections/Components/HeroBanner";
import PromotionPopup from "../sections/Components/PromotionPopup";
import { Footer } from "../Layout/Footer";
import ScrollingHeader from "../sections/Components/ScrollingHeader";
import WhatsAppButton from "../components/WhatsAppButton";
import FloatingCart from "../components/FloatingCart";

const DetalleProduct = lazy(() => import("./DetalleProduct"));
const Login = lazy(() => import("./Login"));
const Checkout = lazy(() => import("./Checkout"));
import { CartProvider } from "./CartContext";
import { AuthProvider, useAuth } from "./AuthContext";
const ScratchAdminDashboard = lazy(() => import("./ScratchAdminDashboard"));

// Componente interno que ya tiene acceso al AuthContext
function CatalogContent() {
  const location = useLocation();
  const { isAdmin } = useAuth(); // ← igual que CategoryCarousel

  const isSpecialPage =
    location.pathname === "/login" ||
    location.pathname === "/checkout";

  return (
    <div className="App">
      {!isSpecialPage && <ScrollingHeader />}
      {!isSpecialPage && <PromotionPopup />}

      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><LoaderLogo /></div>}>
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
      </Suspense>

      {/* Panel admin del Raspa y Gana — solo visible si isAdmin */}
      {isAdmin && location.pathname === "/checkout" && (
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <Suspense fallback={<LoaderLogo compact />}><ScratchAdminDashboard /></Suspense>
        </div>
      )}

      {!isSpecialPage && <FloatingCart />}
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
