const products = [
    {
      id: 1,
      name: "Banda Ligera",
      price: "$100.000",
      description: "Perfecta para principiantes y ejercicios de rehabilitación",
      image: "/img/bandas2.jpg",
    },
    {
      id: 2,
      name: "Banda Media",
      price: "$100.000",
      description: "Ideal para entrenamiento intermedio y tonificación",
      image: "/img/bandas2.jpg",
    },
    {
      id: 3,
      name: "Banda Fuerte",
      price: "$100.000",
      description: "Para atletas avanzados y entrenamiento intenso",
      image: "/img/bandas2.jpg",
    },
    {
      id: 4,
      name: "Set Completo",
      price: "$100.000",
      description: "Incluye 3 bandas de diferentes resistencias + accesorios",
      image: "/img/bandas2.jpg",
    },
  ];
  
  export default function ProductsSection() {
    return (
      <section id="productos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Encabezado */}
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Nuestras Bandas Elásticas
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentra la resistencia perfecta para tu nivel de entrenamiento.
              Todas nuestras bandas están fabricadas con materiales de alta
              calidad.
            </p>
          </div>
  
          {/* Grid de productos */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group border rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white"
              >
                {/* Imagen */}
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
  
                {/* Contenido */}
                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {product.price}
                  </p>
                  <p className="text-sm text-gray-500">{product.description}</p>
                </div>
  
                {/* Botón */}
                <div className="p-6 pt-0">
                  <button className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors">
                    Añadir al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  