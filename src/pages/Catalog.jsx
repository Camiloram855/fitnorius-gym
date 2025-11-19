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
import { AuthProvider } from "./AuthContext";

export default function Catalog() {
  const location = useLocation();

  const isSpecialPage =
    location.pathname === "/catalog/login" ||
    location.pathname === "/catalog/checkout";



  return (
    <AuthProvider>
      <CartProvider>
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

          {!isSpecialPage && <WhatsAppButton />}
          {!isSpecialPage && <Footer />}
        </div>
      </CartProvider>
      
    </AuthProvider>
    
  );
}
