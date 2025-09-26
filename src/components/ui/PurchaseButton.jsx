import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const PurchaseButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [total, setTotal] = useState(0); // 👈 estado para el total
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    ciudad: "",
    direccion: "",
    barrio: "",
    torre: "",
    comentario: "",
  });

  // Abrir / cerrar modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isModalOpen]);

  // Traer productos del backend
  useEffect(() => {
    fetch("http://localhost:8080/api/productos")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener productos");
        return res.json();
      })
      .then((data) => {
        const productosConNumeros = data.map((p) => ({
          ...p,
          idProducto: Number(p.idProducto),
          precio: Number(p.precio) || 0,
        }));
        console.log("Productos desde backend ✅:", productosConNumeros);
        setProductos(productosConNumeros);
      })
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  // Manejar inputs del formulario
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle productos (solo actualiza selectedExtras)
  const toggleExtra = (idProducto) => {
    const id = Number(idProducto);
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // Calcular total en tiempo real
  useEffect(() => {
    console.log("🔥 selectedExtras:", selectedExtras);
    console.log("🔥 productos:", productos);
    if (productos.length > 0) {
      const nuevoTotal = productos
        .filter((p) => selectedExtras.includes(p.idProducto))
        .reduce((sum, p) => sum + (p.precio || 0), 0);

      console.log("Extras seleccionados:", selectedExtras, "Total:", nuevoTotal); // ✅ Debug
      setTotal(nuevoTotal);
    }
  }, [selectedExtras, productos]);

  // Enviar orden al backend
  const handleSubmit = (e) => {
    e.preventDefault();

    const orderRequest = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      correo: formData.correo,
      ciudad: formData.ciudad,
      direccion: formData.direccion,
      barrio: formData.barrio,
      torreApto: formData.torre || null,
      comentario: formData.comentario || null,
      departamento: selectedDepartamento,
      items: selectedExtras.map((idProducto) => ({
        productoId: Number(idProducto),
        cantidad: 1,
      })),
      total: total,
    };

    fetch("http://localhost:8080/api/ordenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderRequest),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al registrar orden");
        return res.json();
      })
      .then((data) => {
        console.log("Orden registrada ✅:", data);

        // 🔥 Armar mensaje de WhatsApp
        const productosSeleccionados = productos
          .filter((p) => selectedExtras.includes(p.idProducto))
          .map((p) => `- ${p.nombre} ($${p.precio.toLocaleString()})`)
          .join("\n");

      const mensaje = `
      🤩 *Nueva Orden de Compra*

      👤 Cliente: ${formData.nombre} ${formData.apellido}
      📞 Teléfono: ${formData.telefono}
      ✉️ Correo: ${formData.correo}

      🏠 Dirección: ${formData.direccion}, ${formData.barrio}, ${formData.ciudad}, ${selectedDepartamento}
      🏢 Torre/Apto: ${formData.torre || "N/A"}
      🗒️ Comentario: ${formData.comentario || "N/A"}

      🛒 *Productos:*
      ${productosSeleccionados}

      💰 *Total:* $${total.toLocaleString()}
              `.trim();

        const numero = "573043317223"; // 👈 número con prefijo Colombia (+57)
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank"); // abrir WhatsApp Web / App

        alert("¡Compra realizada con éxito!");
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        alert("Hubo un problema al registrar la orden.");
      });
  };

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
          onClick={(e) => e.target === e.currentTarget && closeModal()}
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
              {/* Datos cliente */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="nombre"
                  required
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="apellido"
                  required
                  onChange={handleInputChange}
                  placeholder="Tu apellido"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <input
                type="tel"
                name="telefono"
                required
                onChange={handleInputChange}
                placeholder="+57 300 123 4567"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="email"
                name="correo"
                required
                onChange={handleInputChange}
                placeholder="tu@email.com"
                className="w-full px-3 py-2 border rounded-lg"
              />
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
                  "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas","Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca","Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño","Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés y Providencia","Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada",
                ].map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="ciudad"
                required
                onChange={handleInputChange}
                placeholder="Ej: Bogotá"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                name="direccion"
                required
                onChange={handleInputChange}
                placeholder="Calle 123 #45-67"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                name="barrio"
                required
                onChange={handleInputChange}
                placeholder="Ej: Cedritos"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                name="torre"
                onChange={handleInputChange}
                placeholder="Ej: Torre 5 - Apto 302"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <textarea
                name="comentario"
                rows="3"
                onChange={handleInputChange}
                placeholder="Instrucciones de entrega..."
                className="w-full px-3 py-2 border rounded-lg"
              ></textarea>

              {/* Productos dinámicos */}
              <div>
                <h3 className="text-lg font-bold text-purple-700 mb-2">
                  Selecciona tus productos:
                </h3>
                <div className="space-y-3">
                  {productos.map((p) => (
                    <label
                      key={p.idProducto}
                      className="flex items-center gap-3 border border-orange-400 rounded-lg p-3 bg-orange-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(Number(p.idProducto))}
                        onChange={() => toggleExtra(Number(p.idProducto))}
                        className="w-5 h-5 border-2 border-black"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-sm">
                          {p.nombre}{" "}
                          <span className="text-yellow-700">
                            ${p.precio.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="text-right font-bold text-lg text-purple-800">
                Total: ${total.toLocaleString()}
              </div >

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
