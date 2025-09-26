"use client"

import { useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import PurchaseButton from "../components/ui/PurchaseButton";

const FAQ = () => {
  const [openItems, setOpenItems] = useState([])

  const faqData = [
    {
      id: 1,
      question: "¿Cómo funciona el pago contra entrega?",
      answer:
        "El pago contra entrega te permite recibir tu producto primero y pagar directamente al repartidor cuando llegue a tu domicilio. Es una forma segura y confiable de realizar tu compra sin necesidad de pagar por adelantado.",
    },
    {
      id: 2,
      question: "¿Cuánto tiempo tarda la entrega?",
      answer:
        "Nuestros tiempos de entrega varían según tu ubicación. Generalmente, las entregas se realizan entre 24 a 72 horas hábiles después de confirmar tu pedido. Te notificaremos el estado de tu envío en todo momento.",
    },
    {
      id: 3,
      question: "¿Qué métodos de pago aceptan en la entrega?",
      answer:
        "Aceptamos efectivo, tarjetas de débito y crédito al momento de la entrega. Nuestros repartidores cuentan con terminales de pago para tu comodidad y seguridad.",
    },
    {
      id: 4,
      question: "¿Puedo cambiar o cancelar mi pedido?",
      answer:
        "Sí, puedes modificar o cancelar tu pedido sin costo alguno antes de que sea despachado. Una vez que el producto esté en camino, podrás rechazarlo en el momento de la entrega si no cumple con tus expectativas.",
    },
    {
      id: 5,
      question: "¿Qué pasa si no estoy en casa al momento de la entrega?",
      answer:
        "Si no te encuentras disponible, nuestro repartidor intentará contactarte. Puedes reprogramar la entrega para otro momento conveniente o designar a otra persona para recibir el pedido en tu nombre.",
    },
    {
      id: 6,
      question: "¿Ofrecen garantía en los productos?",
      answer:
        "Todos nuestros productos cuentan con garantía. Puedes revisar el producto al momento de la entrega y si no cumple con tus expectativas, puedes rechazarlo sin ningún costo adicional.",
    },
  ]

  const toggleItem = (id) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const isOpen = (id) => openItems.includes(id)

  return (
    <section className="py-20 bg-gradient-to-r from-purple-50 to-purple-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-purple-900 mb-4">Preguntas Frecuentes</h2>
          <p className="text-lg text-purple-700 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre nuestro servicio de entrega
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {faqData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200"
              >
                <h3 className="text-lg font-semibold text-purple-900 pr-4">{item.question}</h3>
                <ChevronDownIcon
                  className={`w-6 h-6 text-purple-600 transition-transform duration-300 flex-shrink-0 ${
                    isOpen(item.id) ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen(item.id) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-8 pb-6">
                  <div className="h-px bg-gradient-to-r from-purple-200 to-transparent mb-4"></div>
                  <p className="text-purple-700 leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PurchaseButton />
    </section>
  )
}

export default FAQ
