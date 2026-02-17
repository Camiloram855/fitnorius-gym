import React, { useState } from "react";
import { Instagram, Facebook, X } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export function Footer() {
  const [modalContent, setModalContent] = useState(null);

  const handleModalOpen = (content) => {
    setModalContent(content);
  };

  const handleModalClose = () => {
    setModalContent(null);
  };

  const modalData = {
    ayuda: {
      title: "💜 Centro de Ayuda",
      content: (
        <>
          <p className="mb-4">
            No importa si estás empezando hoy.
            <br />
            No importa si eres principiante o avanzado.
            <br />
            No importa tu peso actual.
            <br />
            No importa si eres principiante o avanzado.
            <br />
            No importa tu peso actual.
          </p>

          <p className="mb-4 font-semibold">
            Lo que importa es que decidiste hacer algo por ti.
          </p>
          <p className="mb-4">
            En Fitnoriosgym creemos que el cambio comienza en casa, con disciplina,
            decisión y las herramientas correctas 💪🔥
          </p>
          <p className="mb-4">
            Aquí encontrarás respuestas claras sobre nuestros productos, pagos, envíos y recomendaciones.
            <br /><br />
            Y si aún tienes dudas, escríbenos.
            <br />
            No estás comprando unas mancuernas…
            <br />
            Estás invirtiendo en tu proceso.
          </p>
          <p className="font-semibold">Y nosotros caminamos contigo.</p>
        </>
      ),
    },

    envios: {
      title: "🚚 Envíos y Devoluciones",
      content: (
        <>
          <p className="mb-4">
            No necesitas un gimnasio para cambiar tu cuerpo.
            Necesitas decisión… y empezar.
            <br />
            Por eso enviamos nuestros productos a todo el país, para que entrenes donde estés, sin excusas.
          </p>
          <p className="mb-4">
            Cada pedido que sale de Fitnoriosgym representa una persona que decidió dejar de postergar su cambio.
          </p>
          <p className="mb-4">
            Te enviamos número de guía para que sigas tu pedido paso a paso.
            Y si algo no llega como esperabas, estamos aquí para responder con responsabilidad y respeto.
          </p>
          <p className="font-semibold">
            Tu proceso es serio.
            <br></br>
            Y nosotros también.
          </p>
        </>
      ),
    },

    garantia: {
      title: "🛡  Garantía",
      content: (
        <>
          <p className="mb-4">
            Nuestros productos están diseñados para personas reales.
            Para quienes entrenan con disciplina, sudan en casa y no se rinden.
          </p>
          <p className="mb-4">
            Cada implemento cuenta con garantía por defectos de fabricación, porque confiamos en lo que vendemos.
          </p>
          <p className="font-semibold">
            Pero más que una garantía de producto, ofrecemos respaldo.
            Porque cuando decides cambiar tu cuerpo, necesitas seguridad.

            Aquí no vendemos algo común.
            Vendemos herramientas para transformar hábitos
          </p>
        </>
      ),
    },

    contacto: {
      title: "📲 Contacto",
      content: (
        <>
          <p className="mb-6 text-lg">
            ¿No sabes qué kit elegir?
            ¿Sientes que estás empezando desde cero?
            ¿Quieres avanzar al siguiente nivel?
            <br /><br />

            Escríbenos.
            <br /><br />

            No importa si estás comenzando o si ya llevas tiempo entrenando.
            No importa tu peso actual.
            No importa tu punto de partida.
            <br /><br />

            Lo único que importa es que empieces.
            <br /><br />

            📩 Instagram: @fitnoriosgym
        
            <br /><br />

            Fitnoriosgym no es solo una tienda.
            Es el recordatorio de que sí puedes cambiar…
            desde casa 💪💜
          </p>

          <a
            href="https://wa.me/573043317223?text=Hola%20quiero%20información%20sobre%20FitnoriosGYM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Enviar mensaje a FITNORIOS
          </a>
        </>
      ),
    },
  };

  return (
    <>
      <footer className="bg-gradient-to-r from-black via-purple-900 to-black py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            
            {/* Marca */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 animate-pulse">
                <img
                  src="/img/Logo.png"
                  alt="Logo FitnoriosGYM"
                  className="w-80 h-24 object-contain"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Tu tienda de confianza para equipos de fitness de alta calidad.
                Transforma tu hogar en el gimnasio perfecto.
              </p>
            </div>

            {/* Productos */}
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-400">Productos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Mancuernas Ajustables</a></li>
                <li><a href="#" className="hover:text-white">Mancuernas Rusas</a></li>
                <li><a href="#" className="hover:text-white">Barras Extensoras</a></li>
                <li><a href="#" className="hover:text-white">Accesorios</a></li>
              </ul>
            </div>

            {/* Soporte */}
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-400">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => handleModalOpen("ayuda")} className="hover:text-white text-left">
                    Centro de Ayuda
                  </button>
                </li>
                <li>
                  <button onClick={() => handleModalOpen("envios")} className="hover:text-white text-left">
                    Envíos y Devoluciones
                  </button>
                </li>
                <li>
                  <button onClick={() => handleModalOpen("garantia")} className="hover:text-white text-left">
                    Garantía
                  </button>
                </li>
                <li>
                  <button onClick={() => handleModalOpen("contacto")} className="hover:text-white text-left">
                    Contacto
                  </button>
                </li>
              </ul>
            </div>

            {/* Redes sociales */}
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-400">Síguenos</h4>
              <div className="flex gap-4">

                <a
                  href="https://www.instagram.com/fitnoriosgym?igsh=ZjhhZHQ2ODlzenRy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-transform hover:scale-110"
                >
                  <Instagram className="w-5 h-5" />
                </a>

                <a
                  href="https://www.facebook.com/share/1BiP3T84Rr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-transform hover:scale-110"
                >
                  <Facebook className="w-5 h-5" />
                </a>

                <a
                  href="https://www.tiktok.com/@fitnoriosgym?_r=1&_t=ZS-9181SY0Xszn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-transform hover:scale-110"
                >
                  <SiTiktok className="w-5 h-5" />
                </a>

              </div>

              <p className="text-xs text-gray-500">
                © 2024 FitnoriosGYM. Todos los derechos reservados.
              </p>
            </div>

          </div>
        </div>
      </footer>

      {/* Modal */}
      {modalContent && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={handleModalClose}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-900 to-purple-600 p-6 rounded-t-lg flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {modalData[modalContent].title}
              </h2>
              <button onClick={handleModalClose} className="text-white hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 text-gray-200 leading-relaxed">
              {modalData[modalContent].content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
