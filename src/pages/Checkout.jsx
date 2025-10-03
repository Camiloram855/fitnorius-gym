"use client"

import { useState } from "react"

export default function Checkout() {
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

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Aquí manejas el envío del formulario
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Formulario */}
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
                  <option value="antioquia">Antioquia</option>
                  <option value="cundinamarca">Cundinamarca</option>
                  <option value="valle">Valle del Cauca</option>
                  <option value="atlantico">Atlántico</option>
                  <option value="santander">Santander</option>
                  <option value="bolivar">Bolívar</option>
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

          {/* Columna Resumen */}
          <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl shadow-lg p-8 lg:sticky lg:top-8 h-fit">
            <h3 className="text-2xl font-bold text-purple-900 mb-6">Resumen del Pedido</h3>
            <div className="space-y-4">
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-900 font-medium mb-2">Información de Entrega</p>
                <p className="text-purple-800 text-sm leading-relaxed">
                  Complete el formulario con sus datos de envío para procesar su pedido de manera rápida y segura.
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-900 font-medium mb-2">Envío Seguro</p>
                <p className="text-purple-800 text-sm leading-relaxed">
                  Todos los pedidos son procesados con la máxima seguridad y cuidado.
                </p>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <p className="text-purple-900 font-medium mb-2">Soporte 24/7</p>
                <p className="text-purple-800 text-sm leading-relaxed">
                  Nuestro equipo está disponible para ayudarte en cualquier momento.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-purple-400">
                <div className="flex items-center justify-center gap-2 text-purple-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Compra 100% Segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
