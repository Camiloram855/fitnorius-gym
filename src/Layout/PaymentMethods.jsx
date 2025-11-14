export function PaymentMethods() {
  const paymentMethods = [
    
    { name: "Visa", logo: "img/bancolombia.png" },
    { name: "Nequi", logo: "img/nequi.png" },
    { name: "Visa", logo: "img/addi-3.png" },
    { name: "Nequi", logo: "img/bold.png" },
    { name: "Nequi", logo: "img/contra-entrega.png" },

  ];

  return (
    <section className="py-16 bg-gradient-to-bl from-black via-purple-900 to-purple-950 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-10 text-yellow-400">
          MÉTODOS DE PAGO
        </h2>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="p-6 rounded-xl bg-white border border-purple-200 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
            >
              <img
                src={method.logo}
                alt={`${method.name} logo`}
                className="h-12 w-auto mx-auto opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>

        <p className="text-purple-200 mt-8 font-light">
          Elige tu método de pago favorito y recive tus 
          productos sin complicaciones.
        </p>
      </div>
    </section>
  );
}
