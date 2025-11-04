// src/sections/ShippingSection.jsx
const ShippingSection = () => {
  return (
    <section
      className="relative py-16 px-4 sm:px-6 lg:px-8 
      bg-gradient-to-bl from-purple-200 via-purple-100 to-white overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="relative max-w-5xl mx-auto">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
            Envíos a todo Colombia
          </h2>
          <p className="text-2xl md:text-3xl text-purple-800 font-medium">
            Pago contra entrega en todo el país
          </p>
          <div className="mt-6 w-24 h-1 bg-gradient-to-r from-purple-700 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Google Maps Section */}
        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-purple-200">
            <h3 className="text-2xl font-semibold text-purple-900 mb-4 text-center">
              Cobertura Nacional
            </h3>

            {/* Shipping Companies Logos */}
            <div className="flex flex-wrap justify-center items-center gap-10 mb-6">
              {["coordinadora.png", "servientrega.jpeg", "envia.png", "interrapidisimo.png", "dprisa.jpg", "tcc.png"].map(
                (img, index) => (
                  <img
                    key={index}
                    src={`/img/${img}`}
                    alt={img.replace(/\.(png|jpeg|jpg)/, "")}
                    className="h-16 object-contain transition duration-300"
                  />
                )
              )}
            </div>

            {/* Info Below Logos */}
            <p className="text-center text-purple-900 font-medium text-lg">
              Trabajamos con las principales empresas de mensajería en Colombia para garantizar{" "}
              <span className="font-bold">seguridad, rapidez y confianza</span> en cada entrega.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 bg-purple-50/80 backdrop-blur-sm rounded-full px-8 py-4 border border-purple-200">
            <svg
              className="w-6 h-6 text-purple-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <span className="text-purple-900 font-semibold text-lg">
              Paga cuando recibas tu pedido
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShippingSection
