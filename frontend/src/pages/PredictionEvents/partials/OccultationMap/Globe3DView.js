import React, { useId, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Box } from '@mui/material'
import {
  buildGlobeLayer,
  buildGlobeDayNightPaths,
  buildSvgPath,
  createThumbnailView,
  getStarSubEarthPoint,
  projectGlobeLonLatPathToSvg,
  projectLonLatToGlobeSvg,
} from '../../../../lib/occultation-tracks/index'
import countries from '../../../../lib/occultation-tracks/data/ne_110m_countries.json'
import { splitLeafletPathByLongitudeJump, toLonLat } from './leafletHelpers'
import { SORA } from './palette'
import MapLegend from './MapLegend'

const GLOBE_WIDTH = 640
const GLOBE_HEIGHT = 420
const STEP_MARKER_RADIUS = 2.5
const CA_MARKER_RADIUS = 5

function projectGlobePoints(points, centerLonDeg, centerLatDeg, view) {
  return points
    .map(([lat, lon]) => projectLonLatToGlobeSvg(centerLonDeg, centerLatDeg, lon, lat, view))
    .filter((point) => point?.visible)
}

function renderGlobePoints(points, keyPrefix, radius, fill) {
  if (!points?.length) return null

  return points.map((point, index) => (
    <circle
      key={`${keyPrefix}-${index}`}
      cx={point.x}
      cy={point.y}
      r={radius}
      fill={fill}
      stroke='none'
    />
  ))
}

function renderGlobeSegments(segments, keyPrefix, stroke, strokeWidth, dashArray) {
  if (!segments?.length) return null

  return segments.map((seg, segIndex) => {
    if (!Array.isArray(seg) || seg.length < 2 || !seg[0]) return null
    const path = buildSvgPath(seg)
    if (!path) return null

    return (
      <path
        key={`${keyPrefix}-${segIndex}`}
        d={path}
        fill='none'
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    )
  })
}

export default function Globe3DView({ geometry, interactive, className }) {
  const clipId = useId().replace(/:/g, '-')

  const globeGeometry = useMemo(() => {
    if (!interactive?.ok || !interactive.event || geometry.status !== 'ready') {
      const reasons = !interactive?.ok
        ? interactive?.reasons || ['evento nao normalizado']
        : ['geometria nao disponivel']
      return { isDrawable: false, reasons }
    }

    const occEvent = interactive.event
    const [centerLonDeg, centerLatDeg] = getStarSubEarthPoint(
      occEvent.raDeg,
      occEvent.decDeg,
      occEvent.t0Ms,
      occEvent.t0Ms,
      occEvent.pmraMasYr,
      occEvent.pmdecMasYr,
    )

    const view = createThumbnailView({
      width: GLOBE_WIDTH,
      height: GLOBE_HEIGHT,
      centerLonDeg,
      centerLatDeg,
      margin: 0.08,
    })

    const projectPath = (points) => {
      if (!points.length) return []
      const segments = splitLeafletPathByLongitudeJump(points)
      return segments.flatMap((segment) =>
        projectGlobeLonLatPathToSvg(toLonLat(segment), centerLonDeg, centerLatDeg, view),
      )
    }

    const globeLayer = buildGlobeLayer({
      width: view.width,
      height: view.height,
      view,
      centerLonDeg,
      centerLatDeg,
      countriesGeoJson: countries,
      graticule: true,
    })

    const dayNight = buildGlobeDayNightPaths(
      view,
      centerLonDeg,
      centerLatDeg,
      geometry.datetime,
      { computeNightFraction: false },
    )

    const [caLat, caLon] = geometry.mapCenter

    return {
      isDrawable: true,
      view,
      globe: { cx: view.cx, cy: view.cy, r: view.radiusPx },
      globeLayer,
      dayNight,
      centralPath: projectPath(geometry.paths.lineCenter),
      upperLimit: projectPath(geometry.paths.bodyUpper),
      lowerLimit: projectPath(geometry.paths.bodyLower),
      uncertaintyUpper: projectPath(geometry.paths.uncertaintyUpper),
      uncertaintyLower: projectPath(geometry.paths.uncertaintyLower),
      centralPathSteps: projectGlobePoints(
        geometry.paths.centralPathSteps,
        centerLonDeg,
        centerLatDeg,
        view,
      ),
      caInstant: projectGlobePoints([[caLat, caLon]], centerLonDeg, centerLatDeg, view),
    }
  }, [geometry, interactive])

  if (!globeGeometry.isDrawable) {
    return (
      <Box
        className={className}
        sx={{
          minHeight: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
          px: 2,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        Globo 3D indisponivel: {globeGeometry.reasons?.join(', ') || 'dados insuficientes'}
      </Box>
    )
  }

  const {
    view,
    globe,
    globeLayer,
    dayNight,
    centralPath,
    upperLimit,
    lowerLimit,
    uncertaintyUpper,
    uncertaintyLower,
    centralPathSteps,
    caInstant,
  } = globeGeometry

  // Arrow direction: prograde → east, retrograde ← west
  const velocity = interactive?.event?.velocityKmSec ?? 0
  const motionRight = velocity >= 0
  const arrowChar = motionRight ? '→' : '←'
  const arrowX = view.width - 64
  const arrowY = view.height - 8

  // eslint-disable-next-line max-lines-per-function
  return (
    <Box sx={{ width: '100%' }}>
      {/* Globe SVG */}
      <Box sx={{ width: { xs: '100%', sm: '80%' }, mx: 'auto' }}>
        <svg
          className={className}
          viewBox={`0 0 ${view.width} ${view.height}`}
          xmlns='http://www.w3.org/2000/svg'
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            <clipPath id={`globe-clip-${clipId}`}>
              <circle cx={globe.cx} cy={globe.cy} r={globe.r} />
            </clipPath>
          </defs>

          <g clipPath={`url(#globe-clip-${clipId})`}>
            {globeLayer?.ocean?.path && (<path d={globeLayer.ocean.path} fill={SORA.ocean} stroke='none' />)}
            {globeLayer?.land?.map((seg, i) => seg.length >= 3 ? (<path key={`land-${i}`} d={`${buildSvgPath(seg)} Z`} fill={SORA.land} stroke='none' />) : null)}
            {dayNight?.dayFill?.path && (<path d={dayNight.dayFill.path} fill={SORA.dayFill} opacity={SORA.dayOpacity} stroke='none' />)}
            {dayNight?.twilightFill?.path && (<path d={dayNight.twilightFill.path} fill={SORA.twilightFill} opacity={SORA.twilightOpacity} stroke='none' />)}
            {dayNight?.nightFill?.path && (<path d={dayNight.nightFill.path} fill={SORA.nightFill} opacity={SORA.nightOpacity} stroke='none' />)}
            {globeLayer?.borders?.map((seg, i) => seg?.length >= 2 ? (<path key={`border-${i}`} d={buildSvgPath(seg)} fill='none' stroke={SORA.borders} strokeWidth={0.35} />) : null)}
            {globeLayer?.graticule?.parallels?.map((seg, i) => seg?.length >= 2 ? (<path key={`par-${i}`} d={buildSvgPath(seg)} fill='none' stroke={SORA.graticule} strokeWidth={0.3} />) : null)}
            {globeLayer?.graticule?.meridians?.map((seg, i) => seg?.length >= 2 ? (<path key={`mer-${i}`} d={buildSvgPath(seg)} fill='none' stroke={SORA.graticule} strokeWidth={0.3} />) : null)}
          </g>

          {renderGlobeSegments(uncertaintyUpper, 'uu', SORA.uncertainty, SORA.uncertaintyWidth, SORA.uncertaintyDash)}
          {renderGlobeSegments(uncertaintyLower, 'ul', SORA.uncertainty, SORA.uncertaintyWidth, SORA.uncertaintyDash)}
          {renderGlobeSegments(upperLimit, 'blu', SORA.bodyLimit, SORA.bodyLimitWidth)}
          {renderGlobeSegments(lowerLimit, 'bll', SORA.bodyLimit, SORA.bodyLimitWidth)}
          {renderGlobeSegments(centralPath, 'cp', SORA.centerLine, SORA.centerLineWidth)}

          {!geometry.warning && renderGlobePoints(centralPathSteps, 'step', STEP_MARKER_RADIUS, SORA.eventPoint)}
          {!geometry.warning && renderGlobePoints(caInstant, 'ca', CA_MARKER_RADIUS, SORA.eventPoint)}

          <circle cx={globe.cx} cy={globe.cy} r={globe.r} fill='none' stroke={SORA.globeBorder} strokeWidth={0.5} />

          <text x={arrowX} y={arrowY} fill={SORA.arrow} fontSize='26' fontFamily='sans-serif' fontWeight='bold'>{arrowChar}</text>
        </svg>
      </Box>

      {/* Legend */}
      <Box sx={{ width: '100%', mt: 2.25 }}>
        <MapLegend
          hasBodyLimit={geometry.hasBodyLimit}
          hasUncertainty={geometry.hasUncertainty}
          motionRight={motionRight}
        />
      </Box>
    </Box>
  )
}

Globe3DView.propTypes = {
  geometry: PropTypes.object.isRequired,
  interactive: PropTypes.object,
  className: PropTypes.string,
}
