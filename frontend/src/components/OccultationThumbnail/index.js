import React, { useMemo, useId } from 'react'
import Box from '@mui/material/Box'
import PropTypes from 'prop-types'
import {
  buildThumbnailGeometry,
  buildSvgPath,
  mapPalette,
} from '../../lib/occultation-tracks/index.js'
import countries from '../../lib/occultation-tracks/data/ne_110m_countries.json'

function renderSegments(segments, renderPath) {
  return segments.map((seg, i) => renderPath(seg, i))
}

/**
 * Miniatura SVG da faixa de ocultacao renderizada no cliente.
 *
 * Ordem de renderizacao segue o padrao SORA: oceano → paises → dia/noite →
 * bordas → grade → tracks → ponto central.
 */
/**
 * React.memo justificado: buildThumbnailGeometry envolve projecao ortografica,
 * calculo do terminador e paths da sombra — operacoes CPU-bound que nao devem
 * ser re-executadas em re-renders de scroll ou colunas da grid.
 */
const OccultationThumbnail = React.memo(function OccultationThumbnail({
  event,
  width,
  height,
}) {
  const clipId = useId().replace(/:/g, '-')

  const geometry = useMemo(() => {
    return buildThumbnailGeometry(event, {
      width,
      height,
      samples: 41,
      graticule: true,
      countries,
      computeNightFraction: false,
    })
  }, [event, width, height])

  if (!geometry.isDrawable) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          flexShrink: 0,
        }}
      >
        <Box component='span' sx={{ color: 'grey.500', fontSize: '0.75rem' }}>
          No Image
        </Box>
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
    centralPoint,
  } = geometry

  return (
    <Box
      component='svg'
      viewBox={`0 0 ${view.width} ${view.height}`}
      sx={{
        width,
        height,
        flexShrink: 0,
        shapeRendering: 'geometricPrecision',
      }}
    >
      <defs>
        <clipPath id={`globe-clip-${clipId}`}>
          <circle cx={globe.cx} cy={globe.cy} r={globe.r} />
        </clipPath>
      </defs>

      <g clipPath={`url(#globe-clip-${clipId})`}>
        {/* Oceano */}
        {globeLayer?.ocean?.path && (
          <path
            d={globeLayer.ocean.path}
            fill={mapPalette.ocean}
            stroke='none'
          />
        )}

        {/* Paises (poligonos preenchidos) */}
        {globeLayer?.land?.map((seg, i) =>
          seg.length >= 3 ? (
            <path
              key={`land-${i}`}
              d={`${buildSvgPath(seg)} Z`}
              fill={mapPalette.land}
              stroke='none'
            />
          ) : null
        )}

        {/* Dia / crepusculo / noite */}
        {dayNight?.dayFill?.path && (
          <path
            d={dayNight.dayFill.path}
            fill={mapPalette.day}
            opacity={mapPalette.dayOpacity}
            stroke='none'
          />
        )}
        {dayNight?.twilightFill?.path && (
          <path
            d={dayNight.twilightFill.path}
            fill={mapPalette.twilight}
            opacity={mapPalette.twilightOpacity}
            stroke='none'
          />
        )}
        {dayNight?.nightFill?.path && (
          <path
            d={dayNight.nightFill.path}
            fill={mapPalette.night}
            opacity={mapPalette.nightOpacity}
            stroke='none'
          />
        )}

        {/* Bordas dos paises */}
        {globeLayer?.borders?.map((seg, i) => (
          <path
            key={`border-${i}`}
            d={buildSvgPath(seg)}
            fill='none'
            stroke={mapPalette.borders}
            opacity={mapPalette.bordersOpacity}
            strokeWidth={mapPalette.bordersWidth}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        ))}

        {/* Grade de meridianos e paralelos */}
        {globeLayer?.graticule?.parallels?.map((seg, i) => (
          <path
            key={`par-${i}`}
            d={buildSvgPath(seg)}
            fill='none'
            stroke={mapPalette.graticule}
            opacity={mapPalette.graticuleOpacity}
            strokeWidth={mapPalette.graticuleWidth}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        ))}
        {globeLayer?.graticule?.meridians?.map((seg, i) => (
          <path
            key={`mer-${i}`}
            d={buildSvgPath(seg)}
            fill='none'
            stroke={mapPalette.graticule}
            opacity={mapPalette.graticuleOpacity}
            strokeWidth={mapPalette.graticuleWidth}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        ))}
      </g>

      {/* Contorno do globo */}
      <circle
        cx={globe.cx}
        cy={globe.cy}
        r={globe.r}
        fill='none'
        stroke={mapPalette.globeBorder}
        strokeWidth={mapPalette.globeBorderWidth}
      />

      {/* Faixas da ocultacao (fora do clip, para aparecer sobre o contorno) */}
      {renderSegments(uncertaintyUpper, (seg, i) => (
        <path
          key={`uu-${i}`}
          d={buildSvgPath(seg)}
          fill='none'
          stroke={mapPalette.uncertainty}
          strokeWidth={mapPalette.uncertaintyWidth}
          strokeDasharray={mapPalette.uncertaintyDash}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      ))}
      {renderSegments(uncertaintyLower, (seg, i) => (
        <path
          key={`ul-${i}`}
          d={buildSvgPath(seg)}
          fill='none'
          stroke={mapPalette.uncertainty}
          strokeWidth={mapPalette.uncertaintyWidth}
          strokeDasharray={mapPalette.uncertaintyDash}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      ))}
      {renderSegments(upperLimit, (seg, i) => (
        <path
          key={`blu-${i}`}
          d={buildSvgPath(seg)}
          fill='none'
          stroke={mapPalette.bodyLimit}
          strokeWidth={mapPalette.bodyLimitWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      ))}
      {renderSegments(lowerLimit, (seg, i) => (
        <path
          key={`bll-${i}`}
          d={buildSvgPath(seg)}
          fill='none'
          stroke={mapPalette.bodyLimit}
          strokeWidth={mapPalette.bodyLimitWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      ))}
      {renderSegments(centralPath, (seg, i) => (
        <path
          key={`cp-${i}`}
          d={buildSvgPath(seg)}
          fill='none'
          stroke={mapPalette.centerLine}
          strokeWidth={mapPalette.centerLineWidth}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      ))}

      {/* Ponto central */}
      {centralPoint.visible && (
        <circle
          cx={centralPoint.x}
          cy={centralPoint.y}
          r={Math.max(centralPoint.r, 1)}
          fill={mapPalette.eventPoint}
          stroke={mapPalette.eventPointStroke}
          strokeWidth={mapPalette.eventPointStrokeWidth}
        />
      )}
    </Box>
  )
})

OccultationThumbnail.propTypes = {
  event: PropTypes.object.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
}

OccultationThumbnail.defaultProps = {
  width: 150,
  height: 100,
}

export default OccultationThumbnail
