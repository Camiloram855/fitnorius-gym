// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Secciones
import Hero from "./sections/Hero";
import { GallerySection } from "./sections/GallerySection";
import { KitsSection } from "./sections/KitsSection";
import { PaymentMethods } from "./Layout/PaymentMethods";
import ShippingSection from "./sections/ShippingSection";
import FeaturesSection from "./sections/FeaturesSection";
import FAQ from "./sections/FAQ";
import CatalogSection from "./sections/CatalogSection";
import WhatsAppButton from "./components/WhatsAppButton";
import { Footer } from "./Layout/Footer";

// Página independiente
import Catalog from "./pages/Catalog";

// 🔄 Nuevo componente global para controlar el scroll en TODAS las rutas
function ScrollToTopOnRouteChange() {
  
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


function AppContent() {
  return (
    <>
      <ScrollToTopOnRouteChange /> {/* 👈 Aquí se aplica a TODA la app */}

      <Routes>
        {/* Ruta principal (Home) */}
        <Route
          path="/"
          element={
            <div className="App">
              <Hero />
              <GallerySection />
              <KitsSection />
              <PaymentMethods />
              <ShippingSection />
              <FeaturesSection />
              <FAQ />
              <WhatsAppButton />
              <Footer />
            </div>
          }
        />

        {/* Ruta para el Catálogo */}
        <Route path="/catalog/*" element={<Catalog />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
