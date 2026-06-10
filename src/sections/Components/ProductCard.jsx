import { Link } from "react-router-dom";
import { useAuth } from "../../pages/AuthContext";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, "")) || "http://localhost:8080";

const optimizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("f_auto") || url.includes("q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

const paymentMethods = [
  { name: "Bancolombia", logo: "/img/bancolombia.png" },
  { name: "Nequi", logo: "/img/nequi.png" },
  { name: "Addi", logo: "/img/addi-3.png" },
  { name: "Bold", logo: "/img/bold.png" },
  { name: "Contra entrega", logo: "/img/contra-entrega.png" },
];

export default function ProductCard({ product, onDelete, onUpdate }) {
  const { isAdmin } = useAuth();

  const hasPromo =
    product.oldPrice !== null &&
    product.oldPrice !== undefined &&
    Number(product.price) < Number(product.oldPrice);

  const ahorro = hasPromo
    ? (Number(product.oldPrice) - Number(product.price)).toFixed(2)
    : null;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (onDelete) onDelete(product.id);
  };

  const handleToggleAgotado = async (id, estado) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${id}/agotado?estado=${estado}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error actualizando estado de agotado");
      }

      const updatedProduct = await response.json();

      if (onUpdate) onUpdate(updatedProduct);
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo actualizar el estado");
    }
  };

  const rawImageUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${API_BASE_URL}${product.imageUrl.startsWith("/") ? "" : "/"}${product.imageUrl}`
    : "/img/default.jpg";

  const imageSrc = optimizeCloudinaryUrl(rawImageUrl);

  const formatCurrency = (value) =>
    Number(value).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    });

  const formattedPrice = product.price ? formatCurrency(product.price) : "$0.00";
  const formattedOldPrice = product.oldPrice
    ? formatCurrency(product.oldPrice)
    : null;
  const formattedAhorro = ahorro ? formatCurrency(ahorro) : null;

  return (
    <div className="block w-full max-w-[240px] mx-auto h-full">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-transform duration-300 ease-in-out hover:-translate-y-1 flex flex-col cursor-pointer h-full min-h-[320px]">
        <Link
          to={`/catalog/producto/${product.id}`}
          onClick={() => {
            sessionStorage.setItem("scrollPosition", window.scrollY);
            if ("scrollRestoration" in window.history) {
              window.history.scrollRestoration = "manual";
            }
          }}
          className="relative w-full pt-[100%] overflow-hidden rounded-t-xl block group shrink-0"
        >
          <img
            src={imageSrc}
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => (e.target.src = "/img/default.jpg")}
          />

          {product.agotado && (
            <div className="absolute top-3 left-3 bg-red-600 px-2 py-1 rounded-full shadow-md">
              <span className="text-white font-bold text-xs uppercase">
                AGOTADO
              </span>
            </div>
          )}
        </Link>

        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-gray-800 font-semibold text-sm uppercase tracking-wide mb-0.5 line-clamp-2 min-h-[1.75rem]">
            {product.name}
          </h3>

          <div className="min-h-[2.7rem] flex flex-col justify-start">
            <span className="text-green-600 font-bold text-[0.98rem] leading-tight">
              {formattedPrice}
            </span>
            {formattedOldPrice && (
              <span className="text-gray-400 line-through text-[0.78rem] block -mt-1">
                {formattedOldPrice}
              </span>
            )}
          </div>

          <div className="mt-auto pt-1 flex flex-col gap-0.5 min-h-[2.9rem]">
            <div className="flex items-end justify-start min-h-[1.25rem]">
              {ahorro ? (
                <span className="inline-flex bg-purple-100 text-purple-700 text-[11px] font-semibold px-2 py-[2px] rounded-full whitespace-nowrap">
                  Ahorra: {formattedAhorro.replace("COP", "")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Precio regular
                </span>
              )}
            </div>

            <div className="flex items-end justify-start min-h-[1.15rem] -mt-0.5">
              {hasPromo ? (
                <span className="inline-flex bg-gradient-to-r from-yellow-500 to-yellow-700 text-white text-[10px] font-bold px-2.5 py-[2px] rounded-full whitespace-nowrap shadow-sm">
                  PROMO
                </span>
              ) : (
                <span className="inline-flex h-[1.15rem] opacity-0 select-none">PROMO</span>
              )}
            </div>

            <div className="mx-auto flex flex-wrap justify-center items-center gap-2 pt-1">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="flex h-6 w-6 items-center justify-center rounded-sm bg-white/90 border border-gray-200 shadow-sm overflow-hidden"
                  title={method.name}
                  aria-label={method.name}
                >
                  <img
                    src={method.logo}
                    alt={method.name}
                    className="h-full w-full object-contain p-[1px]"
                  />
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-500 text-center leading-tight pt-0.5">
              Múltiples medios de pago
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleDelete}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition min-h-[2rem]"
            >
              Eliminar
            </button>
          )}

          {isAdmin && (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleToggleAgotado(product.id, !product.agotado);
              }}
              className={`mt-3 ${
                product.agotado ? "bg-gray-500" : "bg-orange-500"
              } hover:opacity-80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition min-h-[2rem]`}
            >
              {product.agotado ? "Disponible" : "Marcar Agotado"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
