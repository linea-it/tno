import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import { SORA } from './palette'

const LEGEND_ITEMS = [
  { key: 'path', label: 'Shadow Path', compact: 'Shadow Path', color: SORA.centerLine, indicator: 'line', width: 12, height: 2 },
  { key: 'ca', label: 'CA Instant', compact: 'CA', color: SORA.eventPoint, indicator: 'circle', size: 8 },
  { key: 'steps', label: '60s steps', compact: '60s', color: SORA.eventPoint, indicator: 'circle', size: 4 },
]

const ITEM_GAP = { xs: 1.5, sm: 2.5 }
const FONT_SIZE = { xs: '0.8rem', sm: '1rem' }

function LegendItem({ item, compact }) {
  const label = compact ? (item.compact || item.label) : item.label

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
      {item.indicator === 'line' && (
        <Box sx={{ width: item.width, height: item.height, bgcolor: item.color, flexShrink: 0 }} />
      )}
      {item.indicator === 'circle' && (
        <Box sx={{ width: item.size, height: item.size, bgcolor: item.color, borderRadius: '50%', flexShrink: 0 }} />
      )}
      {label}
    </Box>
  )
}

LegendItem.propTypes = {
  item: PropTypes.object.isRequired,
  compact: PropTypes.bool,
}

/**
 * Legenda compartilhada entre Globe3DView, Map2DView mobile e demais
 * visualizações do OccultationMap.
 *
 * Usa a paleta SORA como única fonte de cores.
 */
export default function MapLegend({
  hasBodyLimit = false,
  hasUncertainty = false,
  motionRight = true,
  compact = false,
  dense = false,
}) {
  const extraItems = []

  extraItems.push({
    key: 'motion',
    label: `${motionRight ? '→' : '←'} Motion`,
    indicator: 'text',
  })

  if (hasBodyLimit) {
    extraItems.push({
      key: 'body',
      label: 'Body Limits',
      compact: 'Body',
      color: SORA.bodyLimit,
      indicator: 'line',
      width: 10,
      height: 3,
    })
  }

  if (hasUncertainty) {
    extraItems.push({
      key: 'uncertainty',
      label: 'Uncertainty',
      compact: 'Unc',
      color: SORA.uncertainty,
      indicator: 'dash',
    })
  }

  const allItems = [...LEGEND_ITEMS, ...extraItems]

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: dense ? 1 : ITEM_GAP,
        fontSize: FONT_SIZE,
        color: 'text.secondary',
      }}
    >
      {allItems.map((item) => {
        if (item.indicator === 'text') {
          return (
            <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
              <span>{compact && item.compact ? item.compact : item.label}</span>
            </Box>
          )
        }
        if (item.indicator === 'dash') {
          return (
            <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
              <Box
                sx={{
                  width: 14,
                  height: 2,
                  background: `repeating-linear-gradient(to right, ${item.color} 0 6px, transparent 6px 10px)`,
                  flexShrink: 0,
                }}
              />
              {compact && item.compact ? item.compact : item.label}
            </Box>
          )
        }
        if (item.indicator === 'line' || item.indicator === 'circle') {
          return <LegendItem key={item.key} item={item} compact={compact} />
        }
        // Fallback defensivo — indicador desconhecido
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`MapLegend: indicador desconhecido "${item.indicator}" para chave "${item.key}"`)
        }
        return (
          <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
            {compact && item.compact ? item.compact : item.label}
          </Box>
        )
      })}
    </Box>
  )
}

MapLegend.propTypes = {
  hasBodyLimit: PropTypes.bool,
  hasUncertainty: PropTypes.bool,
  motionRight: PropTypes.bool,
  compact: PropTypes.bool,
  dense: PropTypes.bool,
}
