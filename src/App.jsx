import { useState } from 'react'
import { useFetch } from './hooks/useFetch'

function describirClima(codigo) {
  if (codigo === 0) return "☀️ Despejado"
  if (codigo <= 3) return "⛅ Parcialmente nublado"
  if (codigo <= 48) return "🌫️ Niebla"
  if (codigo <= 57) return "🌦️ Llovizna"
  if (codigo <= 67) return "🌧️ Lluvia"
  if (codigo <= 77) return "❄️ Nieve"
  if (codigo <= 82) return "🌧️ Chubascos"
  return "⛈️ Tormenta"
}

function App() {
  const [texto, setTexto] = useState('')
  const [ciudad, setCiudad] = useState(null)

  const urlCiudades =
    texto.trim().length >= 3
      ? `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(texto.trim())}&count=5&language=es`
      : null
  const ciudades = useFetch(urlCiudades)
  const lista = ciudades.datos?.results ?? []

  const urlClima = ciudad
    ? `https://api.open-meteo.com/v1/forecast?latitude=${ciudad.latitude}&longitude=${ciudad.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
    : null
  const clima = useFetch(urlClima)

  return (
    <main className="max-w-2xl mx-auto p-5 space-y-4">
      <h1 className="text-2xl font-bold">Clima</h1>

      <div className="flex gap-2">
        <input
          className="flex-1 border border-slate-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-red-300"
          type="text"
          placeholder="Escribe una ciudad (mínimo 3 letras)"
          value={texto}
          onChange={e => setTexto(e.target.value)}
        />
        <button 
          className="px-3 py-1 rounded border border-slate-300"
          onClick={() => {
            setTexto('')
            setCiudad(null)
            entrada.current.focus()
          }}
        >
          Limpiar
        </button>
      </div>

      {urlCiudades && (
        <div>
          {ciudades.cargando && <p className="text-slate-500">Buscando…</p>}
          {ciudades.error && <p className="text-red-600">{ciudades.error}</p>}
          {!ciudades.cargando && !ciudades.error && ciudades.datos && lista.length === 0 && (
            <p className="text-slate-500">Sin resultados</p>
          )}
          <ul className="space-y-1">
            {lista.map(c => (
              <li
                key={c.id}
                onClick={() => setCiudad(c)}
                className={`px-2 py-1 rounded cursor-pointer ${
                  ciudad?.id === c.id ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                {[c.name, c.admin1, c.country].filter(Boolean).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ciudad && (
        <section className="border border-slate-200 rounded p-4 space-y-3">
          <p className="text-lg font-bold">{ciudad.name}</p>

          {clima.cargando && <p className="text-slate-500">Cargando clima…</p>}
          {clima.error && <p className="text-red-600">{clima.error}</p>}

          {clima.datos && (
            <>
              <p>
                <span className="text-3xl font-bold">{clima.datos.current.temperature_2m} °C</span>
                {' · '}{describirClima(clima.datos.current.weather_code)}
                {' · '}viento {clima.datos.current.wind_speed_10m} km/h
              </p>
              <div className="bg-amber-50 rounded p-2">
                <p>Esta semana: máxima {Math.max(...clima.datos.daily.temperature_2m_max)} °C, mínima {Math.min(...clima.datos.daily.temperature_2m_min)} °C. El día más caluroso es el {clima.datos.daily.time[clima.datos.daily.temperature_2m_max.indexOf(Math.max(...clima.datos.daily.temperature_2m_max))]}</p>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {clima.datos.daily.time.map((fecha, i) => (
                  <div key={fecha} className="border border-slate-200 rounded p-1">
                    {new Date(fecha + 'T00:00').toLocaleDateString('es', { weekday: 'short' })}
                    <br />
                    {describirClima(clima.datos.daily.weather_code[i]).split(' ')[0]}
                    <br />
                    {Math.round(clima.datos.daily.temperature_2m_min[i])}–
                    {Math.round(clima.datos.daily.temperature_2m_max[i])}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  )
}

export default App
