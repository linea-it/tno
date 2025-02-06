import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
//import L from 'leaflet' // Biblioteca para manipulação de mapas

// Componente FlyToMap
// Responsável por mover progressivamente o mapa para a posição especificada (center) com zoom
const FlyToMap = ({ center, zoom }) => {
  const map = useMap() // Obtém a instância do mapa atual
  useEffect(() => {
    if (center && zoom) {
      // Verifica se os parâmetros são válidos
      map.flyTo(center, zoom, { animate: true, duration: 0.5 }) // Move o mapa com animação
    }
  }, [center, zoom, map]) // Efeito dispara quando center ou zoom mudam
  return null
}

export default FlyToMap
