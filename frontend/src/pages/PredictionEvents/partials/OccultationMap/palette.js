/**
 * Paleta SORA — cores do plot_occ_map conforme backend/tno/prediction_map.py:
 *   lncolor="#00468D" ptcolor="#00468D" ercolor="#D32F2F" outcolor="#D3D3D3"
 *   mapstyle=1 (preto e branco: oceano cinza, terra branca)
 *
 * Única fonte de verdade para cores de todas as visualizações do OccultationMap
 * (Map2DView, Globe3DView, OccultationThumbnail, Legend).
 */

export const SORA = {
  ocean: '#e6e6e6',
  land: '#ffffff',
  borders: '#666666',
  graticule: '#b3b3b3',

  dayFill: '#ffffff',
  dayOpacity: 0.0,
  twilightFill: '#000000',
  twilightOpacity: 0.20,
  nightFill: '#000000',
  nightOpacity: 0.20,

  globeBorder: '#4d4d4d',

  centerLine: '#00468D',
  centerLineWidth: 1.8,

  bodyLimit: '#00468D',
  bodyLimitWidth: 1.2,

  uncertainty: '#D32F2F',
  uncertaintyWidth: 1.0,
  uncertaintyDash: '6,4',

  outLimit: '#D3D3D3',
  eventPoint: '#00468D',
  arrow: '#000000',
}
