import React, { useEffect } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet' // Componentes do React para integração com Leaflet
// plugins do leaflet para desenhar as sombras
// import terminator from '@joergdietrich/leaflet.terminator'
import terminator from './Terminator'
import 'leaflet-boundary-canvas'

const NightLayer = ({ datetime }) => {
  const map = useMap()

  useEffect(() => {
    const nightmask = terminator({
      fillColor: 'gray',
      weight: 1
      //color: 'black'
    }).addTo(map)

    nightmask.setTime(datetime)

    // Remove a camada ao desmontar ou ao atualizar
    return () => {
      if (map.hasLayer(nightmask)) {
        map.removeLayer(nightmask)
      }
    }
  }, [map, datetime]) // Executa sempre que `map` ou `datetime` mudar

  // função que atualiza as sombra de acordo com o datetime
  // const updateMapTime = (time) => {}
  // updateMapTime(datetime)

  return null
}

export default NightLayer
