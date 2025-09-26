import React from "react";
import PurchaseButton from "../components/ui/PurchaseButton";

export function GallerySection() {
  const images = [
    {
      src: "img/ejercicio-1.jpeg",
      alt: "Mujer entrenando en casa",
    },
    {
      src: "img/ejercicio-2.jpeg",
      alt: "Hombre entrenando al aire libre",
    },
    {
      src: "img/ejercicio-6.jpeg",
      alt: "Pareja entrenando juntos",
    },
  ];

  // 🎥 Aquí defines tu media (gif o video)
  const mediaFile = "img/banda-elastica.gif"; // cambia por demo.gif o lo que quieras

  // función para detectar si es gif
  const isGif = mediaFile.toLowerCase().endsWith(".gif");

  return (
    <section className="py-20 bg-gradient-to-r from-purple-50 to-purple-200">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-4">
            Entrena donde quieras
          </h2>
          <p className="text-purple-700 max-w-2xl mx-auto">
            Nuestras mancuernas ajustables te permiten tener un gimnasio completo en casa. 
            Perfectas para cualquier espacio y nivel de entrenamiento.
          </p>
        </div>

        {/* Galería de imágenes */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-full w-64 h-64 mx-auto bg-gradient-to-br from-purple-200 to-purple-50 hover:shadow-xl transition-all duration-300"
            >
              <img
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white px-2">
                  <p className="font-semibold text-sm">{image.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección dinámica de video/gif */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-purple-900 mb-6">
            Mira nuestras mancuernas en acción
          </h3>
          <div className="rounded-2xl overflow-hidden shadow-lg max-w-2xl mx-auto">
            {isGif ? (
              <img
                src={mediaFile}
                alt="Demostración en acción"
                className="w-full h-auto"
              />
            ) : (
              <video
                src={mediaFile}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              />
            )}
          </div>
          <p className="mt-4 text-purple-700">
            Un entrenamiento dinámico, compacto y al alcance de tu hogar
          </p>
        </div>
      </div>
    </section>
  );
}
