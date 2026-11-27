// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useLayoutEffect } from "react";

import { LoadingProvider, LoaderLogo } from "./components/GlobalLoader";
import Catalog from "./pages/Catalog";
import { CartProvider } from "./pages/CartContext";
const Landing = lazy(() => import("./pages/Landing"));
const Promociones = lazy(() => import("./pages/Promociones"));

// 🔄 Nuevo componente global para controlar el scroll en TODAS las rutas
function ScrollToTopOnRouteChange() {
  
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}


function AppContent() {
  return (
    <>
      <ScrollToTopOnRouteChange /> {/* 👈 Aquí se aplica a TODA la app */}

      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><LoaderLogo /></div>}>
      <Routes>
        {/* Ruta de la landing page */}
        <Route
          path="/landing"
          element={
            <Landing />
          }
        />

        {/* Ruta principal: el catálogo */}
        <Route path="/*" element={<Catalog />} />

        {/* Ruta de promociones: necesita carrito para "Añadir al carrito" */}
        <Route
          path="/promociones"
          element={
            <CartProvider>
              <Promociones />
            </CartProvider>
          }
        />
      </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <Router>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </Router>
  );
}

export default App;
