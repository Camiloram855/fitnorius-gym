import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
