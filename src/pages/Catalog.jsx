// src/pages/Catalog.jsx
import HeroBanner from "../sections/Components/HeroBanner";
import { Footer } from "../Layout/Footer";
import ScrollingHeader from "../sections/Components/ScrollingHeader";

import WhatsAppButton from "../components/WhatsAppButton";
import FAQ from "../sections/FAQ";
import ScrollToTop from "../sections/Components/ScrollToTop";


export default function Catalog() {
  return (
    <div className="App">
      
      <ScrollToTop />
      <ScrollingHeader />
      <HeroBanner />

      <FAQ />
      <WhatsAppButton />
      <Footer />
      
    </div>
  );
}
