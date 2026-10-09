import { useState, useEffect } from 'react'

export function useFetch(url) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) return

    const controller = new AbortController()

    async function pedir() {
      setCargando(true)
      setError(null)
      try {
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const json = await res.json()
        setDatos(json)
      } catch (e) {
        if (e.name === 'AbortError') return
        setError(e.message)
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    pedir()

    return () => controller.abort()
  }, [url])

  return { datos, cargando, error }
}
