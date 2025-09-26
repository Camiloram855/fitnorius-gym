
import Hero from "./sections/Hero";
import { GallerySection } from "./sections/GallerySection";
import { Footer } from "./Layout/Footer";
import { KitsSection } from "./sections/KitsSection";
import { PaymentMethods } from "./Layout/PaymentMethods";
import { CountdownTimer } from "./sections/CountdownTimer"; 
import FAQ from "./sections/FAQ"
import PurchaseButton  from "./components/ui/PurchaseButton";
import  FeaturesSection  from "./sections/FeaturesSection";
import CatalogSection from "./sections/CatalogSection";
import WhatsAppButton from "./components/WhatsAppButton";
import ShippingSection  from "./sections/ShippingSection";







function App() {
  return (
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

  );
}

export default App;
