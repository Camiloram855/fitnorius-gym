

const mockProducts = [
  {
    id: 1,
    title: "PRODUCTO",
    currentPrice: 599.99,
    originalPrice: 799.99,
    image: "/img/imgaaa.jpeg",
    hasPromo: true,
  },
  {
    id: 2,
    title: "PRODUCTO",
    currentPrice: 149.99,
    originalPrice: 199.99,
    image: "/img/imgaaa.jpeg",
    hasPromo: true,
  },
  {
    id: 3,
    title: "PRODUCTO",
    currentPrice: 1299.99,
    originalPrice: 1599.99,
    image: "/img/imgaaa.jpeg",
    hasPromo: true,
  },
  {
    id: 4,
    title: "PRODUCTO",
    currentPrice: 249.99,
    originalPrice: 329.99,
    image: "/img/imgaaa.jpeg",
    hasPromo: true,
  },
  {
    id: 5,
    title: "PRODUCTO",
    currentPrice: 899.99,
    originalPrice: 1199.99,
    image: "/img/imgaaa.jpeg",
    hasPromo: true,
  },
  {
    id: 6,
    title: "PRODUCTO",
    currentPrice: 449.99,
    originalPrice: 599.99,
    image: "/img/imgaaa.jpeg",
    hasPromo: true,
  },
  {
    id: 7,
    title: "PRODUCTO",
    currentPrice: 79.99,
    originalPrice: 119.99,
    image: "/img/imgaaa.jpeg",
    hasPromo: true,
  },
  {
    id: 8,
    title: "PRODUCTO",
    currentPrice: 399.99,
    originalPrice: 549.99,
    image: "/img/imgaaa.jpeg",
    hasPromo: true,
  },
]

export default function ProductCatalog() {
  return (
    <section className="relative bg-gradient-to-bl from-black via-black-900 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">
        {/* Header */}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out overflow-hidden group">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-48 sm:h-56 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
        />

        {/* Promo Badge */}
        {product.hasPromo && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-700 px-3 py-1 rounded-full">
            <span className="text-white font-bold text-xs sm:text-sm">
              ¡PROMO!
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Title */}
        <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-3 uppercase tracking-wide leading-tight">
          {product.title}
        </h3>

        {/* Prices */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-green-500 font-bold text-lg sm:text-xl">
              ${product.currentPrice}
            </span>
            <span className="text-gray-400 line-through text-sm sm:text-base">
              ${product.originalPrice}
            </span>
          </div>

          {/* Savings Badge */}
          <div className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-full self-start sm:self-auto">
            AHORRA ${(product.originalPrice - product.currentPrice).toFixed(2)}
          </div>
        </div>
      </div>

</div>

  )
  
}


