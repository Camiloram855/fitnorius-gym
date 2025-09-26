const features = [
  {
    id: 1,
    image: "/img/Bandas-3.png",
    title: "Diseño Responsivo",
    description:
      "Interfaces que se adaptan perfectamente a cualquier dispositivo y tamaño de pantalla.",
  },
  {
    id: 2,
    image: "/img/bandas-4.png",
    title: "Alto Rendimiento",
    description:
      "Optimización avanzada para cargas rápidas y experiencias fluidas.",
  },
  {
    id: 3,
    image: "/img/bandas-5.png",
    title: "Seguridad Avanzada",
    description:
      "Protección de datos con los más altos estándares de seguridad.",
  },
  {
    id: 4,
    image: "/img/bandas-5.png",
    title: "Soporte 24/7",
    description:
      "Asistencia técnica disponible las 24 horas del día, todos los días del año.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-black to-purple-900 text-white py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Grid de features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <img
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  className="w-28 h-28 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de reseñas */}
        <div className="bg-black/40 border border-purple-700/30 rounded-2xl p-10 shadow-lg text-center">
          <h2 className="text-3xl font-bold mb-6 text-yellow-400">
            Opiniones de Nuestros Clientes
          </h2>
          <p className="text-lg text-gray-300 mb-10">
            Mira lo que dicen quienes ya confiaron en{" "}
            <span className="text-purple-400 font-semibold">Fitnorius GYM</span>
          </p>

          <div className="flex flex-col items-center gap-6">
            {/* Imagen del producto recibido */}
            <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-purple-500 shadow-md">
              <img
                src="/img/cliente-1.jpeg" // <-- aquí va la foto real que suba el cliente
                alt="Producto recibido por cliente"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Testimonio */}
            <div className="text-center space-y-4 max-w-2xl">
              <p className="text-xl italic text-gray-200 leading-relaxed">
                “El set de mancuernas llegó súper rápido y en excelente estado.
                Me encantó la calidad del producto y el servicio al cliente.”
              </p>
              <h3 className="font-bold text-yellow-400 text-2xl">
                ⭐⭐⭐⭐⭐
              </h3>
              <span className="block text-gray-400 text-sm">
                — Juan Pérez, Bogotá
              </span>
            </div>
          </div>

          <br /> <br /> <br />

          <div className="flex flex-col items-center gap-6">
            {/* Imagen del producto recibido */}
            <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-purple-500 shadow-md">
              <img
                src="/img/cliente-1.jpeg" // <-- aquí va la foto real que suba el cliente
                alt="Producto recibido por cliente"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Testimonio */}
            <div className="text-center space-y-4 max-w-2xl">
              <p className="text-xl italic text-gray-200 leading-relaxed">
                “El set de mancuernas llegó súper rápido y en excelente estado.
                Me encantó la calidad del producto y el servicio al cliente.”
              </p>
              <h3 className="font-bold text-yellow-400 text-2xl">
                ⭐⭐⭐⭐⭐
              </h3>
              <span className="block text-gray-400 text-sm">
                — Juan Pérez, Bogotá
              </span>
            </div>
          </div>

                    <br /> <br /> <br />

          <div className="flex flex-col items-center gap-6">
            {/* Imagen del producto recibido */}
            <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-purple-500 shadow-md">
              <img
                src="/img/cliente.jpeg" // <-- aquí va la foto real que suba el cliente
                alt="Producto recibido por cliente"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Testimonio */}
            <div className="text-center space-y-4 max-w-2xl">
              <p className="text-xl italic text-gray-200 leading-relaxed">
                “El set de mancuernas llegó súper rápido y en excelente estado.
                Me encantó la calidad del producto y el servicio al cliente.”
              </p>
              <h3 className="font-bold text-yellow-400 text-2xl">
                ⭐⭐⭐⭐⭐
              </h3>
              <span className="block text-gray-400 text-sm">
                — Juan Pérez, Bogotá
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
