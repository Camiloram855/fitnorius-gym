"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080"
const SCRATCH_THRESHOLD = 0.55

function calcScratchedPercent(ctx, width, height) {
  const pixels = ctx.getImageData(0, 0, width, height)
  let transparent = 0
  for (let i = 3; i < pixels.data.length; i += 4) {
    if (pixels.data[i] === 0) transparent++
  }
  return transparent / (width * height)
}

export default function ScratchCard({ onPrizeApplied, userId = null }) {
  const canvasRef  = useRef(null)
  const isDrawing  = useRef(false)
  const lastPos    = useRef({ x: 0, y: 0 })

  // status: idle | loading | hidden | ready | scratching | revealed | blocked | error
  const [status, setStatus]         = useState("idle")
  const [prize, setPrize]           = useState(null)
  const [scratchPct, setScratchPct] = useState(0)
  const [applied, setApplied]       = useState(false)

  const W = 320
  const H = 180

  useEffect(() => { checkIfPlayed() }, [])

  async function checkIfPlayed() {
    setStatus("loading")
    try {
      const res  = await fetch(`${API_BASE}/api/scratch/check`)
      const data = await res.json()

      // El admin lo ocultó → no mostrar nada
      if (data.visible === false) { setStatus("hidden"); return }

      if (data.alreadyPlayed) {
        setPrize(data.prize)
        setStatus("blocked")
      } else {
        setStatus("ready")
      }
    } catch {
      setStatus("error")
    }
  }

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, "#c0c0c0")
    grad.addColorStop(0.4, "#e8e8e8")
    grad.addColorStop(0.6, "#a8a8a8")
    grad.addColorStop(1, "#d0d0d0")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = "rgba(255,255,255,0.15)"
    for (let x = 0; x < W; x += 12) {
      for (let y = 0; y < H; y += 12) {
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill()
      }
    }
    ctx.font = "bold 15px Georgia, serif"
    ctx.fillStyle = "rgba(100,100,100,0.7)"
    ctx.textAlign = "center"
    ctx.fillText("🪙  RASPA AQUÍ  🪙", W / 2, H / 2 - 8)
    ctx.font = "11px Georgia, serif"
    ctx.fillStyle = "rgba(120,120,120,0.6)"
    ctx.fillText("Descubre tu premio", W / 2, H / 2 + 14)
    ctx.globalCompositeOperation = "destination-out"
  }, [])

  useEffect(() => { if (status === "ready") initCanvas() }, [status, initCanvas])

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const src = e.touches ? e.touches[0] : e
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY }
  }

  function scratch(e) {
    e.preventDefault()
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const pos = getPos(e, canvas)
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.lineWidth = 44; ctx.lineCap = "round"
    ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke()
    lastPos.current = pos
    const pct = calcScratchedPercent(ctx, canvas.width, canvas.height)
    setScratchPct(pct)
    setStatus("scratching")
    if (pct >= SCRATCH_THRESHOLD) revealPrize()
  }

  function startScratch(e) {
    e.preventDefault()
    if (status !== "ready" && status !== "scratching") return
    isDrawing.current = true
    lastPos.current = getPos(e, canvasRef.current)
  }

  function stopScratch() { isDrawing.current = false }

  async function revealPrize() {
    if (status === "revealed") return
    setStatus("revealed")
    try {
      const res  = await fetch(`${API_BASE}/api/scratch/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.visible === false) { setStatus("hidden"); return }
      if (data.alreadyPlayed)    { setPrize(data.prize); setStatus("blocked"); return }
      setPrize(data.prize)
      clearCanvas()
    } catch { setStatus("error") }
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    ctx.globalCompositeOperation = "destination-out"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function applyPrize() {
    if (!prize || applied) return
    setApplied(true)
    if (onPrizeApplied) onPrizeApplied(prize)
  }

  // ── Renders ───────────────────────────────────────────────────────────────

  if (status === "hidden")  return null
  if (status === "blocked") return null
  if (status === "idle")    return null

  if (status === "loading") return (
    <div className="flex items-center justify-center h-44 rounded-2xl bg-gray-100">
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Verificando...</span>
      </div>
    </div>
  )

  if (status === "error") return (
    <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center text-red-600 text-sm">
      ⚠️ No pudimos conectar con el servidor. Intenta de nuevo más tarde.
    </div>
  )

  if (status === "ready" || status === "scratching") return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-purple-700 font-medium">
        🎉 ¡Tienes un Raspa y Gana! Desliza el dedo sobre la tarjeta
      </p>
      <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-purple-300"
        style={{ width: W, height: H }}>
        <PrizeBackground />
        <canvas ref={canvasRef} width={W} height={H}
          className="absolute inset-0 cursor-crosshair touch-none"
          onMouseDown={startScratch} onMouseMove={scratch} onMouseUp={stopScratch} onMouseLeave={stopScratch}
          onTouchStart={startScratch} onTouchMove={scratch} onTouchEnd={stopScratch} />
      </div>
      <div className="w-full max-w-xs bg-purple-100 rounded-full h-2">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-100"
          style={{ width: `${Math.min(scratchPct * 100, 100).toFixed(1)}%` }} />
      </div>
      <p className="text-xs text-purple-500">{Math.min(scratchPct * 100, 100).toFixed(0)}% raspado</p>
    </div>
  )

  if (status === "revealed" && prize) return (
    <RevealedCard prize={prize} applied={applied} onApply={applyPrize} />
  )

  return null
}

function PrizeBackground() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center
      bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 select-none">
      <span className="text-5xl mb-1">🎁</span>
      <p className="text-white font-bold text-lg tracking-wide">TU PREMIO</p>
      <p className="text-purple-200 text-xs mt-1">Sigue raspando...</p>
    </div>
  )
}

function RevealedCard({ prize, applied, onApply }) {
  const isNoPrize = prize?.type === "none"
  return (
    <div className={`rounded-2xl p-6 text-center border-2 shadow-xl transition-all
      ${isNoPrize ? "bg-gray-50 border-gray-200" : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300"}`}>
      <div className="text-5xl mb-3">{prize?.emoji || "🎊"}</div>
      <h3 className={`text-xl font-bold mb-1 ${isNoPrize ? "text-gray-600" : "text-purple-900"}`}>
        {isNoPrize ? "¡Suerte la próxima!" : "¡Felicidades!"}
      </h3>
      <p className={`text-sm mb-4 ${isNoPrize ? "text-gray-500" : "text-purple-700"}`}>{prize?.label}</p>
      {!isNoPrize && !applied && (
        <button onClick={onApply}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-6
            rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md text-sm">
          Aplicar descuento al pedido ✅
        </button>
      )}
      {applied && (
        <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm
          bg-green-50 rounded-lg py-2 px-4">
          ✅ ¡Descuento aplicado al pedido!
        </div>
      )}
    </div>
  )
}
