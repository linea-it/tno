import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'
import { MapContainer, TileLayer, Polyline, Circle, CircleMarker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import DayLayer from '../../../../components/OccultationMap/DayTime'
import Legend from '../../../../components/OccultationMap/Legend'
import MotionArrow from '../../../../components/OccultationMap/MotionArrow'
import FlyToMap from '../../../../components/OccultationMap/FlyToMap'
import { computeLocalCircumstances } from './localCircumstancesHelper'
import { perpendicularDistanceKm, shiftPathPerpendicular } from './geometry'
import { splitLeafletPathByLongitudeJump, createPeriodicLeafletSegments } from './leafletHelpers'
import { fctrep } from '../../../../lib/occultation-tracks/index'
import { SORA } from './palette'
import MapLegend from './MapLegend'

const TILE_LAYER_URL = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en&gl=US'

const STEP_MARKER_RADIUS = 5
const CA_MARKER_RADIUS = 10

const stepMarkerOptions = {
  color: SORA.eventPoint,
  fillColor: SORA.eventPoint,
  fillOpacity: 1,
  weight: 1,
}

const caMarkerOptions = {
  color: SORA.eventPoint,
  fillColor: SORA.eventPoint,
  fillOpacity: 1,
  weight: 2,
}

const shadowCircleOptions = {
  color: SORA.eventPoint,
  fillColor: SORA.eventPoint,
  fillOpacity: 0.15,
  stroke: false,
}

const traceOptions = { color: SORA.uncertainty, weight: 1, dashArray: '15, 10' }
const blueOptions = { color: SORA.centerLine, weight: 1 }
const bodyOptions = { color: SORA.bodyLimit, weight: 2 }
const clickOffsetOptions = { color: '#FF9100', weight: 2 }
const clickPointOptions = {
  color: '#FF9100',
  fillColor: '#FF9100',
  fillOpacity: 1,
  weight: 2,
}

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(event) {
      onClick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

function MapResizeOnShow() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    const container = map.getContainer()
    if (container) observer.observe(container)
    return () => observer.disconnect()
  }, [map])
  return null
}

function MapResetControl({ center, zoom, onReset }) {
  const map = useMap()
  const initial = useRef(null)

  if (!initial.current) {
    initial.current = { center: [center[0], center[1]], zoom }
  }

  useEffect(() => {
    const { center: c, zoom: z } = initial.current
    const btn = L.DomUtil.create('button', 'leaflet-reset-control')
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>'
    btn.title = 'Reset view'
    btn.style.cssText = 'width:30px;height:30px;display:flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:4px;background:#fff;cursor:pointer;color:#333;box-shadow:0 1px 4px rgba(0,0,0,0.2);overflow:visible'

    L.DomEvent.disableClickPropagation(btn)
    L.DomEvent.on(btn, 'click', () => {
      map.setView(c, z)
      if (onReset) onReset()
    })

    const container = map.getContainer()
    container.appendChild(btn)

    return () => {
      btn.remove()
    }
  }, [map, onReset])

  return null
}

function toDms(deg, lat) {
  const dir = deg < 0 ? (lat ? 'S' : 'W') : lat ? 'N' : 'E'
  const abs = Math.abs(deg)
  const d = Math.floor(abs)
  const m = Math.floor((abs - d) * 60)
  const s = ((abs - d - m / 60) * 3600).toFixed(0)
  return `${d}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"${dir}`
}

function formatTime(ms) {
  if (!Number.isFinite(ms)) return '--:--:--'
  const d = new Date(ms)
  return d.toISOString().slice(11, 19)
}

const POPUP_STYLE = `
  font-family: Roboto, -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #212121;
  padding: 0;
  min-width: 220px;
`

const ROW = 'display:flex;justify-content:space-between;align-items:center;padding:2px 0'

function probColor(pct) {
  if (pct == null) return '#757575'
  if (pct >= 80) return '#2E7D32'
  if (pct >= 50) return '#F9A825'
  if (pct >= 20) return '#E65100'
  return '#C62828'
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str ?? ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function ClickPopup({ clickPoint, circumstances, circumstancesError, eventName }) {
  const map = useMap()

  useEffect(() => {
    if (!clickPoint) return

    let content = `<div style="${POPUP_STYLE}">`
    let copyText = ''
    const uid = `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    if (circumstancesError) {
      content += `<div style="color:${SORA.uncertainty};padding:4px 0">${escapeHtml(circumstancesError)}</div>`
    } else if (circumstances) {
      const pct = circumstances.probabilityPercent

      content += `<div style="font-size:15px;font-weight:500;margin-bottom:6px">${escapeHtml(eventName) || 'Occultation'}</div>`

      content += `<div style="font-size:11px;color:#757575;margin-bottom:8px">`
      content += `${toDms(clickPoint.lat, true)} &nbsp; ${toDms(clickPoint.lon, false)}`
      content += `</div>`

      if (pct != null) {
        content += `<div style="font-size:22px;font-weight:400;color:${probColor(pct)};margin-bottom:2px">`
        content += `${pct}%`
        content += `</div>`
        content += `<div style="font-size:11px;color:#757575;margin-bottom:8px">occultation probability</div>`
      }

      content += `<div style="border-top:1px solid #E0E0E0;margin:4px 0"></div>`

      content += `<div style="${ROW}"><span style="color:#757575">Mid time</span><span>${formatTime(circumstances.midTimeMs)}</span></div>`

      content += `<div style="${ROW}"><span style="color:#757575">Duration</span><span>${circumstances.durationSec} s</span></div>`

      content += `<div style="${ROW}"><span style="color:#757575">Distance from center (&rho;)</span><span>${Math.abs(circumstances.distanceKm).toFixed(1)} km</span></div>`

      if (circumstances.deltaSigma != null) {
        content += `<div style="${ROW}"><span style="color:#757575">Distance in sigmas (&Delta;d)</span><span>${circumstances.deltaSigma.toFixed(1)} &sigma;</span></div>`
      }

      content += `<div style="border-top:1px solid #E0E0E0;margin:4px 0"></div>`

      content += `<div style="${ROW}"><span style="color:#757575">Elevation</span><span>${circumstances.starElevationDeg}&deg;</span></div>`
      content += `<div style="${ROW}"><span style="color:#757575">Azimuth</span><span>${circumstances.azimuthDeg}&deg;</span></div>`

      const sunLabel = circumstances.twilight === 'daylight' ? 'Sun elevation (day)' : circumstances.twilight === 'twilight' ? 'Sun elevation (twilight)' : 'Sun elevation (night)'
      content += `<div style="${ROW}"><span style="color:#757575">${sunLabel}</span><span>${circumstances.sunElevationDeg}&deg;</span></div>`

      if (circumstances.moonElevationDeg != null) {
        content += `<div style="${ROW}"><span style="color:#757575">Moon elevation</span><span>${circumstances.moonElevationDeg}&deg;</span></div>`
      }
    }

    if (circumstances && !circumstancesError) {
      const lines = []
      if (eventName) lines.push(eventName)
      lines.push(`${toDms(clickPoint.lat, true)}  ${toDms(clickPoint.lon, false)}`)
      lines.push(`ρ: ${Math.abs(circumstances.distanceKm).toFixed(1)} km  Δd: ${(circumstances.deltaSigma || 0).toFixed(1)} σ`)
      lines.push(`Mid time: ${formatTime(circumstances.midTimeMs)}`)
      lines.push(`Duration: ${circumstances.durationSec} s`)
      if (circumstances.probabilityPercent != null) {
        lines.push(`Probability: ${circumstances.probabilityPercent}%`)
      }
      const objLabel = eventName || 'Object'
      lines.push(`${objLabel} elevation: ${circumstances.starElevationDeg}°`)
      lines.push(`${objLabel} azimut: ${circumstances.azimuthDeg}°`)
      lines.push(`Sun elevation: ${circumstances.sunElevationDeg}° (${circumstances.twilight})`)
      if (circumstances.moonElevationDeg != null) {
        lines.push(`Moon elevation: ${circumstances.moonElevationDeg}°`)
      }
      copyText = lines.join('\n')
    }

    content += `</div>`

    const popup = L.popup({
      className: 'click-popup',
      maxWidth: Math.min(280, window.innerWidth - 40),
      minWidth: 220,
      closeButton: true,
      autoPan: true,
    })
      .setLatLng([clickPoint.lat, clickPoint.lon])
      .setContent(content)
      .openOn(map)

    setTimeout(() => {
      const container = popup._container
      if (!container) return

      const btn = document.createElement('button')
      btn.id = uid
      btn.title = 'Copy'
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
      btn.style.cssText = 'position:absolute;top:0;right:22px;display:inline-flex;align-items:center;justify-content:center;width:22px;height:30px;padding:0;border:none;background:none;cursor:pointer;color:#757575;opacity:0.7'
      btn.onmouseover = () => { btn.style.opacity = '1' }
      btn.onmouseout = () => { btn.style.opacity = '0.7' }
      btn.onclick = () => {
        navigator.clipboard.writeText(copyText).then(() => {
          btn.style.color = '#4CAF50'
          setTimeout(() => { btn.style.color = '#757575' }, 1500)
        }).catch(() => {
          btn.style.color = '#F44336'
          setTimeout(() => { btn.style.color = '#757575' }, 1500)
        })
      }
      container.appendChild(btn)
    }, 50)

    return () => {
      popup.remove()
    }
  }, [map, clickPoint, circumstances, circumstancesError, eventName])

  return null
}

export default function Map2DView({
  className,
  geometry,
  interactive,
}) {
  const [clickPoint, setClickPoint] = useState(null)
  const [circumstances, setCircumstances] = useState(null)
  const [circumstancesError, setCircumstancesError] = useState(null)
  const [offsetPath, setOffsetPath] = useState(null)

  const clickEnabled = interactive?.ok === true

  const handleReset = useCallback(() => {
    setClickPoint(null)
    setCircumstances(null)
    setCircumstancesError(null)
    setOffsetPath(null)
  }, [])

  const handleMapClick = useCallback((lat, lon) => {
    if (!clickEnabled) {
      setCircumstances(null)
      setCircumstancesError(
        interactive?.reasons?.join(', ') || 'Clique indisponivel para este evento',
      )
      setClickPoint({ lat, lon })
      setOffsetPath(null)
      return
    }

    const result = computeLocalCircumstances(interactive, lat, lon)
    setClickPoint({ lat, lon })
    if (!result.ok) {
      setCircumstances(null)
      setCircumstancesError(result.reasons.join(', '))
      setOffsetPath(null)
      return
    }

    setCircumstancesError(null)

    if (result.circumstances.starElevationDeg < 0) {
      setCircumstances(null)
      setCircumstancesError('Event not visible at this location')
      setOffsetPath(null)
      return
    }

    const rho = perpendicularDistanceKm(geometry.paths.lineCenter, lat, lon)
      ?? result.circumstances.distanceKm

    const absDistKm = Math.abs(rho)
    const r = result.circumstances._bodyRadiusKm
    const v = result.circumstances._speedKmPerSec
    const s = result.circumstances.sigmaKm

    let durationSec = 0
    if (r != null && v != null && v > 0 && absDistKm < r) {
      const chordKm = 2 * Math.sqrt(r * r - absDistKm * absDistKm)
      durationSec = Math.round(chordKm / v)
    }

    let probPercent = result.circumstances.probabilityPercent
    if (r != null && s != null && s > 0) {
      const x1 = (absDistKm + r) / s
      const x2 = (absDistKm - r) / s
      probPercent = Math.round((fctrep(x1) - fctrep(x2)) * 1000) / 10
    }

    setCircumstances({
      ...result.circumstances,
      distanceKm: rho,
      durationSec,
      probabilityPercent: probPercent,
      deltaSigma: s > 0 ? absDistKm / s : null,
    })

    const shifted = shiftPathPerpendicular(geometry.paths.lineCenter, rho)
    const segments = splitLeafletPathByLongitudeJump(shifted)
    setOffsetPath(createPeriodicLeafletSegments(segments))
  }, [clickEnabled, interactive, geometry])

  const shadowRadiusMeters = geometry.diameter > 0 ? geometry.diameter : null

  // Motion direction: prograde (positive velocity) = east →
  const velocity = interactive?.event?.velocityKmSec ?? 0
  const motionRight = velocity >= 0

  return (
    <>
      <MapContainer
        className={className}
        center={geometry.mapCenter}
        zoom={geometry.mapZoom}
        scrollWheelZoom
        style={clickEnabled ? { cursor: 'pointer' } : undefined}
      >
        <TileLayer url={TILE_LAYER_URL} subdomains={['mt0', 'mt1', 'mt2', 'mt3']} />
        <FlyToMap center={geometry.mapCenter} zoom={geometry.mapZoom} />
        <DayLayer datetime={geometry.datetime} />
        <Legend
          hasBodyLimit={geometry.hasBodyLimit}
          hasUncertainty={geometry.hasUncertainty}
          warning={geometry.warning}
          motionRight={motionRight}
        />
        <MotionArrow motionRight={motionRight} />
        <MapClickHandler onClick={handleMapClick} />
        <MapResizeOnShow />
        <MapResetControl center={geometry.mapCenter} zoom={geometry.mapZoom} onReset={handleReset} />
        <ClickPopup
          clickPoint={clickPoint}
          circumstances={circumstances}
          circumstancesError={circumstancesError}
          eventName={interactive?.event?.name}
        />

        {geometry.layers.lineCenter.periodicSegments.map((segment, index) => (
          <Polyline key={`center-${index}`} pathOptions={blueOptions} positions={segment} />
        ))}

        {geometry.layers.centralPathSteps.map((point, index) => (
          <CircleMarker
            key={`step-${index}`}
            center={point}
            radius={STEP_MARKER_RADIUS}
            pathOptions={stepMarkerOptions}
          />
        ))}

        {!geometry.warning && (
          <>
            <CircleMarker
              center={geometry.mapCenter}
              radius={CA_MARKER_RADIUS}
              pathOptions={caMarkerOptions}
            />
            {shadowRadiusMeters != null && (
              <Circle
                center={geometry.mapCenter}
                radius={shadowRadiusMeters}
                pathOptions={shadowCircleOptions}
              />
            )}
          </>
        )}

        {geometry.layers.bodyUpper.periodicSegments.map((segment, index) => (
          <Polyline key={`upper-${index}`} pathOptions={bodyOptions} positions={segment} />
        ))}
        {geometry.layers.bodyLower.periodicSegments.map((segment, index) => (
          <Polyline key={`lower-${index}`} pathOptions={bodyOptions} positions={segment} />
        ))}

        {geometry.layers.uncertaintyUpper.periodicSegments.map((segment, index) => (
          <Polyline key={`unc-upper-${index}`} pathOptions={traceOptions} positions={segment} />
        ))}
        {geometry.layers.uncertaintyLower.periodicSegments.map((segment, index) => (
          <Polyline key={`unc-lower-${index}`} pathOptions={traceOptions} positions={segment} />
        ))}

        {offsetPath?.map((segment, index) => (
          <Polyline key={`click-offset-${index}`} pathOptions={clickOffsetOptions} positions={segment} />
        ))}
        {clickPoint && (
          <CircleMarker
            center={[clickPoint.lat, clickPoint.lon]}
            radius={6}
            pathOptions={clickPointOptions}
          />
        )}
      </MapContainer>

      {/* Mobile legend — outside map, visible only on small screens */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, mt: 1, px: 0.5 }}>
        <MapLegend
          hasBodyLimit={geometry.hasBodyLimit}
          hasUncertainty={geometry.hasUncertainty}
          motionRight={motionRight}
          compact
          dense
        />
      </Box>

      {!clickEnabled && (
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5, px: 0.5 }}>
          Clique no mapa indisponivel: {interactive?.reasons?.join(', ')}
        </Typography>
      )}
    </>
  )
}

Map2DView.propTypes = {
  className: PropTypes.string,
  geometry: PropTypes.object.isRequired,
  interactive: PropTypes.object,
}
