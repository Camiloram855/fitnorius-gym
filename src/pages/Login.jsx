"use client"

import { useState } from "react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login attempt:", { email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1a0b2e] to-[#6D28D9] p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo/Título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Fitnorius Login</h1>
            <p className="text-gray-300 text-sm">Bienvenido de vuelta</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-white text-sm font-medium">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/30 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/50 transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-white text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/30 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/50 transition-all"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold rounded-xl h-12 shadow-lg hover:shadow-xl transition-all duration-200">
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
