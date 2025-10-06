// src/pages/Catalog.jsx
import { Routes, Route, useLocation } from "react-router-dom"
import HeroBanner from "../sections/Components/HeroBanner"
import { Footer } from "../Layout/Footer"
import ScrollingHeader from "../sections/Components/ScrollingHeader"
import WhatsAppButton from "../components/WhatsAppButton"
import FAQ from "../sections/FAQ"
import ScrollToTop from "../sections/Components/ScrollToTop"
import DetalleProduct from "./DetalleProduct"
import Login from "./Login"
import Checkout from "./Checkout"
import { CartProvider } from "./CartContext" // ✅ Importa tu contexto desde pages

export default function Catalog() {
  const location = useLocation()

  // Verifica si estamos en login o checkout
  const isSpecialPage =
    location.pathname === "/catalog/login" ||
    location.pathname === "/catalog/checkout"

  return (
    <CartProvider>
      <div className="App">
        <ScrollToTop />

        {/* Mostrar solo si no es login ni checkout */}
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
          <Route path="checkout" element={<Checkout />} /> {/* ✅ Ruta checkout */}
        </Routes>

        {/* Mostrar solo si no es login ni checkout */}
        {!isSpecialPage && <WhatsAppButton />}
        {!isSpecialPage && <Footer />}
      </div>
    </CartProvider>
  )
}
