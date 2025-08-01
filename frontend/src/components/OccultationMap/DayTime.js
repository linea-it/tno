import { useEffect } from 'react'
import { useMap } from 'react-leaflet' // Componentes do React para integração com Leaflet
// plugins do leaflet para desenhar as sombras
import terminator from './Terminator'
import 'leaflet-boundary-canvas'

const DayLayer = ({ datetime }) => {
  const map = useMap()

  useEffect(() => {
    const daymask = terminator({
      fillColor: '#FFFACD',
      fillOpacity: 0.65,
      daytime: true
    }).addTo(map)

    daymask.setTime(datetime)

    // Remove a camada ao desmontar ou ao atualizar
    return () => {
      if (map.hasLayer(daymask)) {
        map.removeLayer(daymask)
      }
    }
  }, [map, datetime]) // Executa sempre que `map` ou `datetime` mudar

  // função que atualiza as sombra de acordo com o datetime
  // const updateMapTime = (time) => {}
  // updateMapTime(datetime)

  return null
}

export default DayLayer
