import React, { useState, Suspense, useEffect } from "react";
import { Check, X } from "lucide-react";
import PurchaseButton from "../components/ui/PurchaseButton";

// ✅ Carga diferida de CatalogSection
const CatalogSection = React.lazy(() => import("../sections/CatalogSection"));

// ✅ Card transparente
function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-purple-800 bg-white/5 backdrop-blur-md p-6 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-bold text-white ${className}`}>{children}</h3>;
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={`px-3 py-1 text-xs font-bold rounded-full bg-purple-700/80 text-white shadow-md ${className}`}
    >
      {children}
    </span>
  );
}

function Button({ children, className = "", variant = "default" }) {
  const base = "px-4 py-2 rounded-lg font-semibold transition";
  const variants = {
    default: "bg-purple-600 hover:bg-purple-700 text-white",
    outline:
      "border border-purple-400 text-purple-300 hover:bg-purple-900/50 bg-transparent",
  };
  return <button className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
}

// ✅ Modal con carrusel (reinicia correctamente)
function ImageModal({ images, title, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reinicia el índice cuando se abre un nuevo set de imágenes
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  if (!images || images.length === 0) return null;

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleClose = () => {
    setCurrentIndex(0); // Reinicia al cerrar
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Fondo borroso */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Contenedor */}
      <div className="relative z-10 max-w-3xl w-[85%] md:w-[70%] animate-zoomIn">
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 text-white hover:text-yellow-400 transition"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Imagen principal */}
        <img
          src={images[currentIndex]}
          alt={title}
          className="w-full h-auto rounded-lg shadow-2xl max-h-[80vh] object-contain"
        />

        {/* Controles */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 hover:bg-black/70 text-white"
        >
          {"<"}
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 hover:bg-black/70 text-white"
        >
          {">"}
        </button>

        {/* Título */}
        <p className="text-center text-white mt-4 text-lg font-semibold">{title}</p>
      </div>
    </div>
  );
}

// ✅ Animaciones CSS
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes zoomIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes glow {
  0%, 100% { text-shadow: 0 0 10px #facc15, 0 0 20px #facc15, 0 0 40px #a855f7; transform: scale(1); }
  50% { text-shadow: 0 0 20px #facc15, 0 0 40px #a855f7, 0 0 60px #9333ea; transform: scale(1.05); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease forwards;
}
.animate-zoomIn {
  animation: zoomIn 0.3s ease forwards;
}
.animate-glow {
  animation: glow 2s ease-in-out infinite;
}
`;

const kitImages = {
  kit1: [
    "img/imagen_uno.png",
    "img/colchoneta.png",
    "img/detalle-banda.png",
    "img/tobilleras.png",
    "img/mancuernas pintadas.png",
  ],
  kit2: ["img/imagen_dos.png", "img/detalle-banda.png", "img/pesas-pies.png"],
  kit3: ["img/bandas-5.png", "img/detalle-banda.png"],
};

export function KitsSection() {
  const [selectedImages, setSelectedImages] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);

  // ✅ Estructura de kits
  const kits = [
    {
      title: "Precio promo $199.900",
      images: kitImages.kit1,
      features: [
        "colchoneta en Casata medidas 100cmx50cm x3 cm ",
        "Set x3 bandas de tela incluye:",
        "Bolsa de malla",
        "Banda rosado 90 lb ",
        "Banda blanca 120 lb",
        "Banda negra 150lb ",
        "pesas tobilleras de 5 kilos, peso total, peso removible",
        "2 mancuernas en hierro de 5 libras cada una",
      ],
      price: "$199.900",
      popular: false,
    },
    {
      title: "Precio $90.000",
      images: kitImages.kit2,
      features: [
        "Set x3 bandas de tela incluye:",
        "Bolsa de malla",
        "Banda rosado 90 lb ",
        "Banda blanca 120 lb",
        "Banda negra 150lb ",
        "pesas tobilleras de 5 kilos, peso total, peso removible",
      ],
      price: "$90.000",
      popular: true,
    },
    {
      title: "Precio $50.000",
      images: kitImages.kit3,
      features: [
        "Set x3 bandas",
        "Bolsa de malla",
        "Banda rosado 90 lb ",
        "Banda blanca 120 lb",
        "Banda negra 150lb ",
      ],
      price: "$50.000",
      popular: false,
    },
  ];

  return (
    <>
      <style>{styles}</style>

      <section className="relative py-20 bg-gradient-to-br from-purple-950 via-purple-900 to-black text-white">
        <div className="absolute inset-0 opacity-10 flex justify-center items-center">
          <img
            src="/img/LOGO2.png"
            alt="Logo de fondo"
            className="w-[1200px] h-[1200px] object-contain rotate-12 grayscale mt-[-390px]"
          />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-yellow-400">ELIGE TU KIT</h2>
            <p className="text-purple-200 max-w-2xl mx-auto">
              Selecciona el kit perfecto para tu nivel de entrenamiento y objetivos fitness.
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {kits.map((kit, index) => (
              <Card
                key={index}
                className={`relative ${
                  kit.popular ? "border-purple-500 shadow-xl" : "border-purple-700/40"
                } hover:shadow-purple-500/30 transition-all`}
              >
                {kit.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    MÁS POPULAR
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div
                    className="mx-auto cursor-pointer"
                    onClick={() => {
                      setSelectedImages(kit.images);
                      setSelectedTitle(kit.title);
                    }}
                  >
                    <img
                      src={kit.images[0]}
                      alt={kit.title}
                      className="w-90 h-90 object-contain mx-auto hover:scale-105 transition-transform"
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {kit.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-purple-100">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* 💥 Precio animado */}
                  <div className="text-center pt-4">
                    <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-glow drop-shadow-lg">
                      {kit.price}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Modal */}
        <ImageModal
          images={selectedImages}
          title={selectedTitle}
          onClose={() => setSelectedImages(null)}
        />

        <PurchaseButton />
        <br />

        {/* ✅ Carga diferida del catálogo */}
        <Suspense fallback={<div className="text-white text-center">Cargando catálogo...</div>}>
          <CatalogSection />
        </Suspense>
      </section>
    </>
  );
}
