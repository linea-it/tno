import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { SORA } from '../../pages/PredictionEvents/partials/OccultationMap/palette'

// Componente Legend — control Leaflet que renderiza via innerHTML
// Cores centralizadas em palette.js (única fonte de verdade)
const Legend = ({ hasBodyLimit, hasUncertainty, warning, motionRight }) => {
  const map = useMap()

  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' })

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend')
      div.style.background = 'rgba(255, 255, 255, 0.95)'
      div.style.borderRadius = '8px'
      div.style.padding = '5px 8px'
      div.style.marginRight = '10px'
      div.style.marginBottom = '10px'
      div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)'
      div.style.fontSize = '12px'
      div.style.maxWidth = 'calc(100vw - 20px)'
      div.style.overflowX = 'auto'

      if (warning == null) {
        const bodyLimitHtml = hasBodyLimit
          ? `<div style="display: flex; align-items: center; white-space: nowrap;">
              <div style="width: 10px; height: 3px; background: ${SORA.bodyLimit}; margin-right: 6px; flex-shrink: 0;"></div> Body Limits
            </div>`
          : ''

        const uncertaintyHtml = hasUncertainty
          ? `<div style="display: flex; align-items: center; white-space: nowrap;">
              <div style="width: 12px; height: 2px; background: repeating-linear-gradient(to right, ${SORA.uncertainty} 0, ${SORA.uncertainty} 6px, transparent 6px, transparent 10px); margin-right: 6px; flex-shrink: 0;"></div> Uncertainty
            </div>`
          : ''

        div.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px;">
          <div style="display: flex; align-items: center; white-space: nowrap;">
            <div style="width: 10px; height: 2px; background: ${SORA.centerLine}; margin-right: 6px; flex-shrink: 0;"></div> Shadow Path
          </div>
          <div style="display: flex; align-items: center; white-space: nowrap;">
            <div style="width: 8px; height: 8px; background: ${SORA.eventPoint}; border-radius: 50%; margin-right: 6px; flex-shrink: 0;"></div> CA Instant
          </div>
          <div style="display: flex; align-items: center; white-space: nowrap;">
            <div style="width: 4px; height: 4px; background: ${SORA.eventPoint}; border-radius: 50%; margin-right: 6px; flex-shrink: 0;"></div> 60s steps
          </div>
          <div style="display: flex; align-items: center; white-space: nowrap;">
            <span style="margin-right: 2px;">${motionRight ? '→' : '←'}</span> Motion
          </div>
          ${bodyLimitHtml}
          ${uncertaintyHtml}
        </div>
      `
        return div
      } else {
        div.innerHTML = `
        <div style="display: flex; align-items: center; white-space: nowrap; color: ${SORA.uncertainty};">
        </div>`
        // textContent para evitar XSS — warning vem da API
        div.firstChild.textContent = warning
        return div
      }
    }

    legend.addTo(map)

    return () => {
      map.removeControl(legend)
    }
  }, [hasBodyLimit, hasUncertainty, warning, motionRight, map])

  return null
}

export default Legend
