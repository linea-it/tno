/**
 * Parsing e validação do payload de geometria do endpoint de ocultação,
 * mais mapeamento de domínio (event → raw).
 *
 * Depende de:
 *  - leafletHelpers.js   (formatação Leaflet)
 *  - geometry.js         (matemática geoespacial, se necessário)
 */

import { buildLeafletLayersFromPoints, createPeriodicLeafletPoints } from './leafletHelpers'

export function zipLatLon(latitudes, longitudes, label) {
  if (!Array.isArray(latitudes) || !Array.isArray(longitudes)) {
    return { ok: false, error: `${label}: arrays ausentes`, points: [] }
  }
  if (latitudes.length !== longitudes.length) {
    return {
      ok: false,
      error: `${label}: tamanhos incompatíveis (${latitudes.length} lat / ${longitudes.length} lon)`,
      points: [],
    }
  }

  const points = []
  for (let i = 0; i < latitudes.length; i++) {
    const lat = Number(latitudes[i])
    const lon = Number(longitudes[i])
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    if (lat < -90 || lat > 90) continue
    points.push([lat, lon])
  }

  if (points.length === 0 && latitudes.length > 0) {
    return { ok: false, error: `${label}: nenhuma coordenada valida`, points: [] }
  }

  return { ok: true, error: null, points }
}

export function mapOccultationToRawEvent(event, pathsData) {
  if (!event) return null
  return {
    id: event.id,
    name: event.name,
    date_time: pathsData?.datetime ?? event.date_time,
    ra_star_deg: event.ra_star_deg,
    dec_star_deg: event.dec_star_deg,
    ra: event.ra,
    dec: event.dec,
    ra_star_with_pm: event.ra_star_with_pm,
    dec_star_with_pm: event.dec_star_with_pm,
    velocity: event.velocity,
    vel: event.vel,
    delta: event.delta,
    geocentric_distance: event.geocentric_distance,
    closest_approach: event.closest_approach,
    ca: event.ca,
    position_angle: event.position_angle,
    pa: event.pa,
    diameter: pathsData?.diameter ?? event.diameter,
    g_star: event.g_star,
    closest_approach_uncertainty_km: event.closest_approach_uncertainty_km,
    predict_step: event.predict_step,
    pmra: event.pmra,
    pmdec: event.pmdec,
    off_ra: event.off_ra,
    off_dec: event.off_dec,
    diameter_err_min: event.diameter_err_min,
    diameter_err_max: event.diameter_err_max,
  }
}

export function buildEndpointGeometry(pathsData) {
  if (!pathsData) {
    return { status: 'invalid-payload', error: 'Resposta vazia do endpoint' }
  }

  const warnings = []
  const zipResults = {
    lineCenter: zipLatLon(
      pathsData.central_path_latitude,
      pathsData.central_path_longitude,
      'central_path',
    ),
    centralPathSteps: zipLatLon(
      pathsData.central_path_latitude_60s_step,
      pathsData.central_path_longitude_60s_step,
      'central_path_60s_step',
    ),
    bodyUpper: zipLatLon(
      pathsData.body_upper_limit_latitude,
      pathsData.body_upper_limit_longitude,
      'body_upper_limit',
    ),
    bodyLower: zipLatLon(
      pathsData.body_lower_limit_latitude,
      pathsData.body_lower_limit_longitude,
      'body_lower_limit',
    ),
    uncertaintyUpper: zipLatLon(
      pathsData.uncertainty_upper_limit_latitude,
      pathsData.uncertainty_upper_limit_longitude,
      'uncertainty_upper_limit',
    ),
    uncertaintyLower: zipLatLon(
      pathsData.uncertainty_lower_limit_latitude,
      pathsData.uncertainty_lower_limit_longitude,
      'uncertainty_lower_limit',
    ),
  }

  Object.entries(zipResults).forEach(([_key, result]) => {
    if (!result.ok && result.error) warnings.push(result.error)
  })

  const lineCenter = zipResults.lineCenter.points
  if (!lineCenter.length) {
    const firstError = zipResults.lineCenter.error || 'central_path inválido'
    return { status: 'invalid-payload', error: firstError, warnings }
  }

  const lat = Number(pathsData.latitude)
  const lon = Number(pathsData.longitude)
  const mapCenter =
    Number.isFinite(lat) && Number.isFinite(lon)
      ? [lat, lon]
      : lineCenter[Math.floor(lineCenter.length / 2)]

  const diameter = pathsData.diameter == null ? null : Number(pathsData.diameter)
  const datetimeString = pathsData.datetime ?? ''
  const datetime = datetimeString ? new Date(datetimeString).getTime() : null

  if (datetime == null || !Number.isFinite(datetime)) {
    warnings.push('datetime invalido ou ausente')
  }

  const paths = {
    lineCenter,
    centralPathSteps: zipResults.centralPathSteps.points,
    bodyUpper: zipResults.bodyUpper.points,
    bodyLower: zipResults.bodyLower.points,
    uncertaintyUpper: zipResults.uncertaintyUpper.points,
    uncertaintyLower: zipResults.uncertaintyLower.points,
  }

  const layers = {
    lineCenter: buildLeafletLayersFromPoints(paths.lineCenter),
    bodyUpper: buildLeafletLayersFromPoints(paths.bodyUpper),
    bodyLower: buildLeafletLayersFromPoints(paths.bodyLower),
    uncertaintyUpper: buildLeafletLayersFromPoints(paths.uncertaintyUpper),
    uncertaintyLower: buildLeafletLayersFromPoints(paths.uncertaintyLower),
    centralPathSteps: createPeriodicLeafletPoints(paths.centralPathSteps),
  }

  return {
    status: 'ready',
    error: null,
    warnings,
    mapCenter,
    mapZoom: 4,
    datetime: Number.isFinite(datetime) ? datetime : null,
    warning: pathsData.warning ?? null,
    diameter: Number.isFinite(diameter) ? diameter : null,
    paths,
    layers,
    hasBodyLimit: paths.bodyUpper.length > 0 || paths.bodyLower.length > 0,
    hasUncertainty: paths.uncertaintyUpper.length > 0 || paths.uncertaintyLower.length > 0,
  }
}
