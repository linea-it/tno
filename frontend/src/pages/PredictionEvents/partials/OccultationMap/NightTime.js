import React from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet' // Componentes do React para integração com Leaflet
// plugins do leaflet para desenhar as sombras
import terminator from '@joergdietrich/leaflet.terminator'
import 'leaflet-boundary-canvas'

const NightLayer = ({ datetime }) => {
  const map = useMap()

  const nightmask = terminator({
    fillColor: 'gray',
    weight: 1
    //color: 'black'
  }).addTo(map)

  // função que atualiza as sombra de acordo com o datetime
  const updateMapTime = (time) => {
    nightmask.setTime(time)

    const nightmaskJson = nightmask.toGeoJSON()

    var nightraster = L.TileLayer.boundaryCanvas(
      'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_SNPP_DayNightBand_AtSensor_M15/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
      {
        boundary: nightmaskJson,
        attribution:
          'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
        bounds: [
          [-85.0511287776, -179.999999975],
          [85.0511287776, 179.999999975]
        ],
        minZoom: 1,
        maxZoom: 8,
        format: 'jpg',
        time: '',
        tilematrixset: 'GoogleMapsCompatible_Level'
      }
    )

    nightraster.addTo(map)
  }
  updateMapTime(datetime)
}

export default NightLayer
