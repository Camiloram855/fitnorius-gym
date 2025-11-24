"use client"

import { useState } from "react"
import { useCart } from "./CartContext"
import { X } from "lucide-react" // Ícono para eliminar

export default function Checkout() {
  const { cartItems, removeFromCart /*, clearCart*/ } = useCart()

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    departamento: "",
    ciudad: "",
    direccion: "",
    barrio: "",
    apartamento: "",
    comentario: "",
  })

  // ✅ Manejo del cambio de los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // 🧮 Calcular total del carrito
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // 🧠 Función para resolver correctamente la URL de la imagen
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.jpg" // Imagen de respaldo
    if (imagePath.startsWith("http")) return imagePath // Ya tiene URL completa
    return `http://localhost:8080/${imagePath}` // Ajusta si usas otro dominio
  }

  // ✅ Función para enviar el pedido por WhatsApp
  const handleSubmit = (e) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      alert("Tu carrito está vacío 🛒")
      return
    }

    if (!formData.telefono.match(/^\d{10}$/)) {
      alert("Por favor ingresa un número de teléfono válido (10 dígitos).")
      return
    }

    // 🧾 Crear resumen del pedido
    const orderDetails = cartItems
      .map(
        (item) =>
          `• ${item.name} (x${item.quantity}) - $${(
            item.price * item.quantity
          ).toLocaleString()}`
      )
      .join("\n")

    const totalPrice = total.toLocaleString()

    // 💬 Mensaje completo para WhatsApp
    const message = `
📦 *NUEVO PEDIDO - FITNORIOSGYM*

👤 *Cliente:*
Nombre: ${formData.nombre} ${formData.apellido}
Teléfono: ${formData.telefono}
Email: ${formData.email}

🏠 *Dirección de envío:*
Departamento: ${formData.departamento}
Ciudad: ${formData.ciudad}
Dirección: ${formData.direccion}
Barrio: ${formData.barrio || "-"}
Apartamento/Torre: ${formData.apartamento || "-"}
Comentario: ${formData.comentario || "-"}

🛍️ *Productos:*
${orderDetails}

💰 *Total: $${totalPrice}*

🚚 Gracias por tu compra 💜
    `.trim()

    // 📲 Número de WhatsApp (formato internacional sin + ni espacios)
    const phone = "573043317223"

    // 🧠 Codificar mensaje para la URL
    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    // 📱 Detección de iPhone para compatibilidad total
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isIOS) {
      // En iPhone, Safari bloquea window.open() — usamos redirección directa
      window.location.href = whatsappURL
    } else {
      // En Android y PC funciona perfecto abrir en una nueva pestaña
      window.open(whatsappURL, "_blank")
    }

    // 🧹 (Opcional) limpiar el carrito después del envío
    // clearCart()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ---------------------- Columna Formulario ---------------------- */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Información de Envío</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Apellido */}
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 3001234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Correo */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Departamento */}
              <div>
                <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Departamento
                </label>
                <select
                  id="departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  required
                >
                  <option value="">Seleccione un departamento</option>
                  <option value="Amazonas">Amazonas</option>
                  <option value="Antioquia">Antioquia</option>
                  <option value="Arauca">Arauca</option>
                  <option value="Atlántico">Atlántico</option>
                  <option value="Bolívar">Bolívar</option>
                  <option value="Boyacá">Boyacá</option>
                  <option value="Caldas">Caldas</option>
                  <option value="Caquetá">Caquetá</option>
                  <option value="Casanare">Casanare</option>
                  <option value="Cauca">Cauca</option>
                  <option value="Cesar">Cesar</option>
                  <option value="Chocó">Chocó</option>
                  <option value="Córdoba">Córdoba</option>
                  <option value="Cundinamarca">Cundinamarca</option>
                  <option value="Guainía">Guainía</option>
                  <option value="Guaviare">Guaviare</option>
                  <option value="Huila">Huila</option>
                  <option value="La Guajira">La Guajira</option>
                  <option value="Magdalena">Magdalena</option>
                  <option value="Meta">Meta</option>
                  <option value="Nariño">Nariño</option>
                  <option value="Norte de Santander">Norte de Santander</option>
                  <option value="Putumayo">Putumayo</option>
                  <option value="Quindío">Quindío</option>
                  <option value="Risaralda">Risaralda</option>
                  <option value="San Andrés y Providencia">San Andrés y Providencia</option>
                  <option value="Santander">Santander</option>
                  <option value="Sucre">Sucre</option>
                  <option value="Tolima">Tolima</option>
                  <option value="Valle del Cauca">Valle del Cauca</option>
                  <option value="Vaupés">Vaupés</option>
                  <option value="Vichada">Vichada</option>

                </select>
              </div>

              {/* Ciudad */}
              <div>
                <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Dirección */}
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Barrio */}
              <div>
                <label htmlFor="barrio" className="block text-sm font-medium text-gray-700 mb-2">
                  Barrio
                </label>
                <input
                  type="text"
                  id="barrio"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Apartamento */}
              <div>
                <label htmlFor="apartamento" className="block text-sm font-medium text-gray-700 mb-2">
                  Ej: Apartamento - Torre
                </label>
                <input
                  type="text"
                  id="apartamento"
                  name="apartamento"
                  value={formData.apartamento}
                  onChange={handleChange}
                  placeholder="Apto 301, Torre B"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Comentario */}
              <div>
                <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario
                </label>
                <textarea
                  id="comentario"
                  name="comentario"
                  value={formData.comentario}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Instrucciones especiales de entrega..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Confirmar Pedido
              </button>
            </form>
          </div>

          {/* ---------------------- Columna Resumen ---------------------- */}
          <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl shadow-lg p-8 lg:sticky lg:top-8 h-fit">
            <h3 className="text-2xl font-bold text-purple-900 mb-6">Resumen del Pedido</h3>

            {cartItems.length === 0 ? (
              <p className="text-purple-800">Tu carrito está vacío 🛒</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm relative"
                  >
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                      title="Eliminar producto"
                    >
                      <X size={18} />
                    </button>

                    <img
                      src={getImageUrl(item.image || item.imageUrl)}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900">{item.name}</h4>
                      <p className="text-sm text-purple-700">Cantidad: {item.quantity}</p>
                    </div>

                    <p className="font-semibold text-purple-900">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t border-purple-400 text-right">
                  <p className="text-lg font-bold text-purple-900">
                    Total: ${total.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-900 font-medium mb-2">Compra 100% Segura</p>
                <p className="text-purple-800 text-sm">
                  Todos los pedidos son procesados con la máxima seguridad y cuidado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
