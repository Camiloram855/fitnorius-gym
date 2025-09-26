import React, { useState, useEffect } from "react";
import { X } from "lucide-react";


const extras = [
  {
    id: 1,
    title: "Set de bandas de resistencia, ( heavy, medium, light )",
    price: 89900,
    image: "./img/Bandas-3.png",
  },
  {
    id: 2,
    title: "Set de bandas super combo",
    price: 99900,
    image: "./img/bandas-4.png",
    description: "Más músculo y menos grasa en menos tiempo. Déjalo en manos de profesionales.",
  },
    {
    id: 3,
    title: "Set de bandas mega combo",
    price: 99900,
    image: "./img/bandas-5.png",
    description: "Más músculo y menos grasa en menos tiempo. Déjalo en manos de profesionales.",
  },
];

const PurchaseButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [selectedExtras, setSelectedExtras] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const toggleExtra = (id) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado ✅");
    console.log("Departamento seleccionado:", selectedDepartamento);
    console.log("Extras seleccionados:", selectedExtras);
    closeModal();
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isModalOpen]);

  return (
    <div className="flex items-center justify-center p-4 mt-10">
      {/* Botón principal */}
      <button
        onClick={openModal}
        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-purple-900 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 animate-bounce hover:animate-none overflow-hidden"
      >
        Comprar contra entrega
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex justify-center mb-4">
                <div className="w-40 h-40 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src="/img/Logo.png"
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-800">
                Información de Compra
              </h2>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de celular
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="+57 300 123 4567"
                />
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <select
                  required
                  value={selectedDepartamento}
                  onChange={(e) => setSelectedDepartamento(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="" disabled>
                    Selecciona un departamento
                  </option>
                  {[
                    "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar",
                    "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar",
                    "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare",
                    "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
                    "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
                    "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
                    "Valle del Cauca", "Vaupés", "Vichada",
                  ].map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Bogotá"
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Calle 123 #45-67"
                />
              </div>

              {/* Barrio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barrio
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Cedritos"
                />
              </div>

              {/* Torre o Apartamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Torre o Apartamento
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Torre 5 - Apto 302"
                />
              </div>

              {/* Comentario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentario
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Instrucciones de entrega..."
                ></textarea>
              </div>

              {/* 🔥 Sección de extras con checkbox */}
              <div>
                <h3 className="text-lg font-bold text-purple-700 mb-2">
                  Agrega tu combos:
                </h3>
                <div className="space-y-3">
                  {extras.map((extra) => (
                    <label
                      key={extra.id}
                      className="flex items-center gap-3 border border-orange-400 rounded-lg p-3 bg-orange-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(extra.id)}
                        onChange={() => toggleExtra(extra.id)}
                        className="w-5 h-5 accent-purple-600"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-sm">
                          {extra.title}{" "}
                          <span className="text-yellow-700">
                            ${extra.price.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <img
                        src={extra.image}
                        alt={extra.title}
                        className="w-14 h-14 object-cover rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Botón Confirmar */}
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-lg mt-6"
              >
                Confirmar Compra
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseButton;
