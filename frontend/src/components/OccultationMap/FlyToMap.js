import React, { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

// Componente FlyToMap
// Responsável por mover progressivamente o mapa para a posição especificada (center) com zoom
const FlyToMap = ({ center, zoom }) => {
  const map = useMap()
  const fired = useRef(false)

  useEffect(() => {
    // Valida coordenadas — array com NaN passa em truthy check, mas quebra Leaflet
    const [lat, lon] = center || []
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !zoom) return

    // Evita re-disparo se já navegou para este centro
    if (fired.current) return
    fired.current = true

    map.flyTo([lat, lon], zoom, { animate: true, duration: 0.5 })
  }, [center, zoom, map])

  return null
}

export default FlyToMap
