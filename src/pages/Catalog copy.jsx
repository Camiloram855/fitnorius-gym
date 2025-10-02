// src/pages/Catalog.jsx
import { Routes, Route } from "react-router-dom"
import HeroBanner from "../sections/Components/HeroBanner"
import { Footer } from "../Layout/Footer"
import ScrollingHeader from "../sections/Components/ScrollingHeader"
import WhatsAppButton from "../components/WhatsAppButton"
import FAQ from "../sections/FAQ"
import ScrollToTop from "../sections/Components/ScrollToTop"
import DetalleProduct from "./DetalleProduct"
import Login from "./Login"  // 👈 importa tu login

export default function Catalog() {
  return (
    <div className="App">
      <ScrollToTop />
      <ScrollingHeader />

      {/* Rutas internas de catálogo */}
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
        <Route path="login" element={<Login />} /> {/* 👈 nota: sin / al inicio */}
      </Routes>

      <WhatsAppButton />
      <Footer />
    </div>
  )
}
