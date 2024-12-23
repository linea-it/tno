import React from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet' // Componentes do React para integração com Leaflet
// plugins do leaflet para desenhar as sombras
import terminator from '@joergdietrich/leaflet.terminator'
import 'leaflet-boundary-canvas'

const NightLayer = ({ datetime }) => {
  const map = useMap()

  // função que atualiza as sombra de acordo com o datetime
  const updateMapTime = (time) => {
    const nightmask = terminator({
      fillColor: 'gray',
      weight: 1
      //color: 'black'
    }).addTo(map)

    nightmask.setTime(time)
  }
  updateMapTime(datetime)
}

export default NightLayer
