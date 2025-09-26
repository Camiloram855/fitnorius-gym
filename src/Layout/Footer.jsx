import React from "react";
import { Dumbbell, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-black via-purple-900 to-black py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
          <div className="flex items-center gap-2 animate-pulse">
            <img
              src="/img/Logo.png"
              alt="Logo EVS Fitness"
              className="w-80 h-24 object-contain"
            />
          </div>
            <p className="text-gray-400 text-sm">
              Tu tienda de confianza para equipos de fitness de alta calidad. Transforma tu hogar en el gimnasio
              perfecto.
            </p>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-400">Productos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Mancuernas Ajustables
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Mancuernas Rusas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Barras Extensoras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Accesorios
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-400">Soporte</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Envíos y Devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Garantía
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-400">Síguenos</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-gray-500">© 2024 FitnoriusGYM. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
