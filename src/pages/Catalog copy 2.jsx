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

export default function Catalog() {
  const location = useLocation()

  // Verifica si estamos en la página de login
  const isLoginPage = location.pathname === "/catalog/login"

  return (
    <div className="App">
      <ScrollToTop />

      {/* Mostrar solo si no es login */}
      {!isLoginPage && <ScrollingHeader />}

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
      </Routes>

      {/* Mostrar solo si no es login */}
      {!isLoginPage && <WhatsAppButton />}
      {!isLoginPage && <Footer />}
    </div>
  )
}
