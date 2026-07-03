import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export default function MotionArrow({ motionRight }) {
  const map = useMap()

  useEffect(() => {
    const control = L.control({ position: 'bottomright' })

    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'motion-arrow')
      div.style.fontSize = '48px'
      div.style.lineHeight = '1'
      div.style.fontWeight = 'bold'
      div.style.color = '#00468D'
      div.style.textShadow = '0 0 4px rgba(255,255,255,0.8)'
      div.style.marginRight = '64px'
      div.innerHTML = motionRight ? '→' : '←'
      div.title = `Shadow motion: ${motionRight ? 'east' : 'west'}`
      return div
    }

    control.addTo(map)

    return () => {
      map.removeControl(control)
    }
  }, [motionRight, map])

  return null
}
