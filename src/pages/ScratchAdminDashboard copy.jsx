"use client"

import { useState, useEffect, useCallback } from "react"
import { useScratchVisible } from "./useScratchVisible"

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"
const API = `${API_BASE_URL}/api/admin/scratch`

const TYPE_OPTIONS = [
  { value: "percent", label: "% Porcentaje", hint: "Ej: 10 → 10% de descuento" },
  { value: "fixed",   label: "$ Valor fijo",  hint: "Ej: 5000 → $5.000 de descuento" },
  { value: "gift",    label: "🎁 Regalo",     hint: "Ej: Camiseta, botella de agua, etc." },
  { value: "none",    label: "🍀 Sin premio", hint: "El usuario no gana nada" },
]

const EMOJI_PRESETS = ["🎉","🌟","💰","🎁","🛍️","🏆","💎","🎊","🔥","🍀","⚡","🎯"]

const EMPTY_FORM = { label: "", emoji: "🎉", type: "percent", value: "", weight: 20, active: true }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function totalWeight(prizes) {
  return prizes.filter(p => p.active).reduce((s, p) => s + p.weight, 0)
}

function calcProb(prize, prizes) {
  const tw = totalWeight(prizes)
  if (!tw) return 0
  return ((prize.weight / tw) * 100).toFixed(1)
}

// Tiempo restante de bloqueo (2 horas desde playedAt). Null = ya puede jugar.
function timeLeft(playedAt) {
  const unlocksAt = new Date(new Date(playedAt).getTime() + 2 * 60 * 60 * 1000)
  const diff = unlocksAt - new Date()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}min` : `${m} min`
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ScratchAdminDashboard() {
  const [prizes, setPrizes]       = useState([])
  const [results, setResults]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState("prizes")
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [resetIP, setResetIP]     = useState("")
  const [toast, setToast]         = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // ── Switch visibilidad ────────────────────────────────────────────────────
  const { scratchVisible, setScratchVisible } = useScratchVisible()

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchPrizes = useCallback(async () => {
    try {
      const res = await fetch(`${API}/prizes`, { credentials: "include" })
      setPrizes(await res.json())
    } catch { showToast("Error al cargar premios", "error") }
  }, [])

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`${API}/results`, { credentials: "include" })
      setResults(await res.json())
    } catch { showToast("Error al cargar participaciones", "error") }
  }, [])

  useEffect(() => {
    Promise.all([fetchPrizes(), fetchResults()]).finally(() => setLoading(false))
  }, [fetchPrizes, fetchResults])

  // ── Toast ────────────────────────────────────────────────────────────────
  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── CRUD de premios ───────────────────────────────────────────────────────
  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(prize) {
    setForm({ ...prize })
    setEditingId(prize.id)
    setShowForm(true)
  }

  async function savePrize() {
    if (!form.label.trim()) return showToast("El nombre del premio es obligatorio", "error")
    if (form.type !== "none" && (!form.value || Number(form.value) <= 0))
      return showToast("Ingresa un valor mayor a 0", "error")
    if (Number(form.weight) <= 0)
      return showToast("El peso debe ser mayor a 0", "error")

    const payload = { ...form, value: Number(form.value), weight: Number(form.weight) }
    const url     = editingId ? `${API}/prizes/${editingId}` : `${API}/prizes`
    const method  = editingId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      await fetchPrizes()
      setShowForm(false)
      showToast(editingId ? "Premio actualizado ✅" : "Premio creado ✅")
    } catch { showToast("Error al guardar el premio", "error") }
  }

  async function toggleActive(prize) {
    try {
      await fetch(`${API}/prizes/${prize.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...prize, active: !prize.active }),
      })
      await fetchPrizes()
      showToast(prize.active ? "Premio desactivado" : "Premio activado ✅")
    } catch { showToast("Error al cambiar estado", "error") }
  }

  async function deletePrize(id) {
    try {
      await fetch(`${API}/prizes/${id}`, { method: "DELETE", credentials: "include" })
      await fetchPrizes()
      setConfirmDelete(null)
      showToast("Premio eliminado")
    } catch { showToast("Error al eliminar", "error") }
  }

  // ── Reiniciar IP ──────────────────────────────────────────────────────────
  async function handleResetIP() {
    const ip = resetIP.trim()
    if (!ip) return showToast("Ingresa una IP válida", "error")
    try {
      const res = await fetch(`${API}/results/ip?ip=${encodeURIComponent(ip)}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      await fetchResults()
      setResetIP("")
      showToast(data.message || "IP reiniciada ✅")
    } catch { showToast("Error al reiniciar IP", "error") }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4">
            <div className="text-3xl mb-3 text-center">⚠️</div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">¿Eliminar premio?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium">
                Cancelar
              </button>
              <button onClick={() => deletePrize(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition text-sm font-medium">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal form premio */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingId ? "✏️ Editar premio" : "✨ Nuevo premio"}
                </h3>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Emoji */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Emoji</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {EMOJI_PRESETS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      className={`w-9 h-9 text-xl rounded-lg border-2 transition
                        ${form.emoji === e ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}>
                      {e}
                    </button>
                  ))}
                </div>
                <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-lg"
                  placeholder="🎁" maxLength={2} />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del premio</label>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Ej: 10% de descuento"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de premio</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition
                        ${form.type === opt.value
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 text-gray-600 hover:border-purple-300"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {TYPE_OPTIONS.find(o => o.value === form.type)?.hint}
                </p>
              </div>

              {/* Valor */}
              {form.type !== "none" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {form.type === "percent" ? "Porcentaje (%)" : "Valor ($)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      {form.type === "percent" ? "%" : "$"}
                    </span>
                    <input type="number" min="0" value={form.value}
                      onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      placeholder={form.type === "percent" ? "10" : "5000"}
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" />
                  </div>
                </div>
              )}

              {/* Peso */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Peso de probabilidad
                  <span className="ml-2 text-xs font-normal text-gray-400">(mayor número = más probable)</span>
                </label>
                <input type="range" min="1" max="100" value={form.weight}
                  onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))}
                  className="w-full accent-purple-500 mb-1" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Raro (1)</span>
                  <span className="font-bold text-purple-600 text-sm">{form.weight}</span>
                  <span>Común (100)</span>
                </div>
              </div>

              {/* Preview probabilidad */}
              {prizes.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-3 text-sm">
                  <p className="text-purple-700 font-medium text-xs mb-1">Vista previa de probabilidad aproximada:</p>
                  <p className="text-purple-900 font-bold">
                    ~{(() => {
                      const others = prizes.filter(p => p.active && p.id !== editingId).reduce((s, p) => s + p.weight, 0)
                      const total = others + Number(form.weight)
                      return total ? ((form.weight / total) * 100).toFixed(1) : 0
                    })()}% de aparecer
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium">
                Cancelar
              </button>
              <button onClick={savePrize}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600
                  hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition shadow-md">
                {editingId ? "Guardar cambios" : "Crear premio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎰 Raspa y Gana</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gestiona los premios y participaciones</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600
              hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-5
              rounded-xl transition shadow-md text-sm">
            <span className="text-lg leading-none">+</span> Nuevo premio
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ══════════════════════════════════════════
            SWITCH DE VISIBILIDAD — nuevo bloque
        ══════════════════════════════════════════ */}
        <div className={`rounded-2xl border-2 p-5 flex items-center justify-between transition-all
          ${scratchVisible
            ? "bg-green-50 border-green-200"
            : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{scratchVisible ? "🟢" : "⭕"}</span>
            <div>
              <p className="font-bold text-gray-800">
                {scratchVisible ? "Raspa y Gana VISIBLE" : "Raspa y Gana OCULTO"}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {scratchVisible
                  ? "Los clientes pueden ver y jugar en el checkout"
                  : "Los clientes no ven el raspa y gana en el checkout"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setScratchVisible(!scratchVisible)
              showToast(scratchVisible ? "Raspa y Gana ocultado" : "Raspa y Gana activado ✅")
            }}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 flex-shrink-0
              ${scratchVisible ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300
              ${scratchVisible ? "translate-x-7" : "translate-x-0.5"}`} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[["prizes","🎁 Premios"], ["results","📋 Participaciones"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition
                ${tab === key ? "bg-white shadow text-purple-700" : "text-gray-500 hover:text-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ══ TAB: PREMIOS ══ */}
        {tab === "prizes" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total premios", value: prizes.length,                        color: "text-purple-700 bg-purple-50" },
                { label: "Activos",       value: prizes.filter(p => p.active).length,  color: "text-emerald-700 bg-emerald-50" },
                { label: "Inactivos",     value: prizes.filter(p => !p.active).length, color: "text-gray-600 bg-gray-100" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold rounded-lg px-2 py-0.5 w-fit ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {prizes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <p className="text-4xl mb-3">🎰</p>
                <p className="text-gray-500 font-medium">No hay premios configurados</p>
                <p className="text-gray-400 text-sm mt-1">Crea el primero con el botón de arriba</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-0
                  text-xs font-semibold text-gray-400 uppercase tracking-wide
                  px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="w-10">Emoji</span>
                  <span>Premio</span>
                  <span className="w-24 text-center">Tipo / Valor</span>
                  <span className="w-24 text-center">Probabilidad</span>
                  <span className="w-20 text-center">Estado</span>
                  <span className="w-20 text-center">Acciones</span>
                </div>

                {prizes.map((prize, i) => (
                  <div key={prize.id}
                    className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-0 items-center
                      px-5 py-4 transition hover:bg-gray-50
                      ${i !== prizes.length - 1 ? "border-b border-gray-100" : ""}
                      ${!prize.active ? "opacity-50" : ""}`}>
                    <div className="w-10 text-2xl">{prize.emoji}</div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{prize.label}</p>
                    </div>
                    <div className="w-24 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold
                        ${prize.type === "percent" ? "bg-blue-50 text-blue-700"
                          : prize.type === "fixed" ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-500"}`}>
                        {prize.type === "percent" ? `${prize.value}%`
                          : prize.type === "fixed" ? `$${prize.value.toLocaleString()}`
                          : "Sin premio"}
                      </span>
                    </div>
                    <div className="w-24 text-center">
                      {prize.active ? (
                        <div>
                          <p className="text-sm font-bold text-purple-700">{calcProb(prize, prizes)}%</p>
                          <div className="mt-1 h-1.5 bg-gray-100 rounded-full w-16 mx-auto">
                            <div className="h-1.5 bg-purple-400 rounded-full"
                              style={{ width: `${calcProb(prize, prizes)}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                    <div className="w-20 flex justify-center">
                      <button onClick={() => toggleActive(prize)}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-300
                          ${prize.active ? "bg-emerald-400" : "bg-gray-200"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300
                          ${prize.active ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                    <div className="w-20 flex justify-center gap-1">
                      <button onClick={() => openEdit(prize)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 text-purple-500 transition text-sm"
                        title="Editar">✏️</button>
                      <button onClick={() => setConfirmDelete(prize.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition text-sm"
                        title="Eliminar">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {prizes.filter(p => p.active).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">💡 ¿Cómo funciona la probabilidad?</p>
                <p>Los porcentajes se calculan automáticamente según el <strong>peso</strong> de cada premio activo.</p>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: PARTICIPACIONES ══ */}
        {tab === "results" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-1">🔄 Reiniciar participación por IP</h3>
              <p className="text-sm text-gray-500 mb-4">Permite que un usuario vuelva a jugar.</p>
              <div className="flex gap-3">
                <input value={resetIP} onChange={e => setResetIP(e.target.value)}
                  placeholder="Ej: 192.168.1.100"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2
                    focus:ring-purple-400 focus:border-transparent outline-none transition text-sm" />
                <button onClick={handleResetIP}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600
                    hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl
                    transition shadow-md text-sm whitespace-nowrap">
                  Reiniciar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Historial de participaciones</h3>
                <span className="text-sm text-gray-400">{results.length} registros</span>
              </div>
              {results.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-3xl mb-3">📋</p>
                  <p className="text-gray-400 text-sm">Nadie ha jugado todavía</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                      <tr>
                        {["IP", "Premio", "Tipo", "Valor", "Fecha", "⏳ Bloqueo"].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...results].reverse().map((r, i) => (
                        <tr key={r.id}
                          className={`border-t border-gray-100 hover:bg-gray-50 transition
                            ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                          <td className="px-5 py-3 font-mono text-xs text-gray-600">{r.ipAddress}</td>
                          <td className="px-5 py-3">
                            <span className="flex items-center gap-1.5">
                              <span>{r.prizeEmoji}</span>
                              <span className="font-medium text-gray-800">{r.prizeLabel}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold
                              ${r.prizeType === "percent" ? "bg-blue-50 text-blue-700"
                                : r.prizeType === "fixed" ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-500"}`}>
                              {r.prizeType === "percent" ? "%" : r.prizeType === "fixed" ? "$" : "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-700 font-medium">
                            {r.prizeType === "percent" ? `${r.prizeValue}%`
                              : r.prizeType === "fixed" ? `$${r.prizeValue.toLocaleString()}`
                              : "—"}
                          </td>
                          <td className="px-5 py-3 text-gray-400 text-xs">
                            {new Date(r.playedAt).toLocaleString("es-CO")}
                          </td>
                          <td className="px-5 py-3">
                            {timeLeft(r.playedAt) ? (
                              <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                ⏳ {timeLeft(r.playedAt)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                ✅ Puede jugar
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
