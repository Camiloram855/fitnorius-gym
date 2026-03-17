import { useState, useEffect } from "react"

export function useScratchVisible() {
  const [scratchVisible, setScratchVisibleState] = useState(() => {
    const stored = localStorage.getItem("scratchVisible")
    return stored === null ? true : stored === "true"  // ← true por defecto
  })

  useEffect(() => {
    function onStorage(e) {
      if (e.key === "scratchVisible") {
        setScratchVisibleState(e.newValue === "true")
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  function setScratchVisible(value) {
    setScratchVisibleState(value)
    localStorage.setItem("scratchVisible", String(value))
    window.dispatchEvent(new StorageEvent("storage", {
      key: "scratchVisible",
      newValue: String(value),
    }))
  }

  return { scratchVisible, setScratchVisible }
}