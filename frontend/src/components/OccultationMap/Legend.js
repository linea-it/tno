import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet' // Biblioteca para manipulação de mapas

// Componente Legend
// Adiciona uma legenda dinamicamente ao mapa
const Legend = ({ hasBodyLimit, hasUncertainty, warning }) => {
  const map = useMap()

  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' })

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend')
      div.style.background = 'rgba(255, 255, 255, 0.95)'
      div.style.borderRadius = '8px'
      div.style.padding = '5px'
      div.style.marginRight = '10px'
      div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)'

      // if limits dont exist plot 'Path outside the limits of the map'
      // Estrutura fixa da legenda com elementos opcionais para "Body Limits" e "Uncertainty"

      if (warning == null) {
        div.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-around;">
          <div style="display: flex; align-items: center; margin: 0 10px;">
            <div style="width: 10px; height: 2px; background: #00468D; margin-right: 8px;"></div> Shadow Path
          </div>
          <div style="display: flex; align-items: center; margin: 0 10px;">
            <div style="width: 10px; height: 10px; background: #00468D; border-radius: 50%; margin-right: 8px;"></div> CA Instant
          </div>
          <div style="display: flex; align-items: center; margin: 0 10px;">
            <div style="width: 5px; height: 5px; background: #00468D; border-radius: 50%; margin-right: 8px;"></div> 60s steps
          </div>
          ${hasBodyLimit
            ? `
          <div style="display: flex; align-items: center; margin: 0 10px;">
            <div style="width: 10px; height: 4px; background: #00468D; margin-right: 8px;"></div> Body Limits
          </div>
          `
            : ''
          }
          ${hasUncertainty
            ? `
          <div style="display: flex; align-items: center; margin: 0 10px;">
            <div style="width: 10px; height: 2px; background: repeating-linear-gradient(to right, #D32F2F 0, #D32F2F 8px, transparent 2px, transparent 10px); margin-right: 8px;"></div> Uncertainty
          </div>
          `
            : ''
          }
        </div>
      `
        return div
      } else {
        div.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-around;">
          <div style="display: flex; align-items: center; margin: 0 10px; color: #D32F2F;">
           ${warning}
          </div>`
        return div
      }
    }

    legend.addTo(map)

    return () => {
      map.removeControl(legend)
    }
  }, [hasBodyLimit, hasUncertainty, warning, map])

  return null
}

export default Legend
