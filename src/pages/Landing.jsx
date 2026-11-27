import Hero from "../sections/Hero";
import { GallerySection } from "../sections/GallerySection";
import { KitsSection } from "../sections/KitsSection";
import { PaymentMethods } from "../Layout/PaymentMethods";
import ShippingSection from "../sections/ShippingSection";
import FeaturesSection from "../sections/FeaturesSection";
import FAQ from "../sections/FAQ";
import WhatsAppButton from "../components/WhatsAppButton";
import { Footer } from "../Layout/Footer";
export default function Landing() { return (
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
); }
