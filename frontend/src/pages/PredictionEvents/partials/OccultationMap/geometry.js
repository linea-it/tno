/**
 * Geometria geoespacial pura — sem dependências de Leaflet ou API.
 * Funções matemáticas: distância perpendicular, deslocamento de trajetória, projeção local.
 */

const DEG_TO_KM = 111.32
const DEG_TO_M = 111320

function unwrapLongitudeToReference(lon, referenceLon) {
  let unwrapped = lon
  while (unwrapped - referenceLon > 180) unwrapped -= 360
  while (unwrapped - referenceLon < -180) unwrapped += 360
  return unwrapped
}

function unwrapPathLongitudes(points) {
  if (!points?.length) return []

  const unwrapped = [[points[0][0], points[0][1]]]
  for (let i = 1; i < points.length; i++) {
    const [lat, lon] = points[i]
    const previousLon = unwrapped[i - 1][1]
    unwrapped.push([lat, unwrapLongitudeToReference(lon, previousLon)])
  }
  return unwrapped
}

function latLonToLocal(lat, lon, refLat, refLon) {
  const cosRef = Math.cos((refLat * Math.PI) / 180)
  let dLon = lon - refLon
  if (dLon > 180) dLon -= 360
  else if (dLon < -180) dLon += 360
  return {
    x: dLon * DEG_TO_M * cosRef,
    y: (lat - refLat) * DEG_TO_M,
  }
}

function localToLatLon({ x, y }, refLat, refLon) {
  const cosRef = Math.cos((refLat * Math.PI) / 180)
  return [
    refLat + y / DEG_TO_M,
    normalizeLon(refLon + x / (DEG_TO_M * cosRef)),
  ]
}

function perpDistanceToSegmentM(a, b, p) {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const lenSq = abx * abx + aby * aby
  if (lenSq === 0) {
    const dx = p.x - a.x
    const dy = p.y - a.y
    return { distM: Math.sqrt(dx * dx + dy * dy), sign: 1, dx, dy }
  }

  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq
  t = Math.max(0, Math.min(1, t))

  const projX = a.x + t * abx
  const projY = a.y + t * aby
  const dx = p.x - projX
  const dy = p.y - projY
  const distM = Math.sqrt(dx * dx + dy * dy)

  const crossZ = abx * dy - aby * dx
  const sign = crossZ >= 0 ? 1 : -1

  return { distM, sign, dx, dy }
}

export function perpendicularDistanceKm(points, clickLat, clickLon) {
  if (!points || points.length < 2) return null

  const unwrappedPoints = unwrapPathLongitudes(points)
  const midLat = unwrappedPoints.reduce((s, p) => s + p[0], 0) / unwrappedPoints.length
  const midLon = unwrappedPoints.reduce((s, p) => s + p[1], 0) / unwrappedPoints.length
  const p = latLonToLocal(clickLat, unwrapLongitudeToReference(clickLon, midLon), midLat, midLon)

  let minDistM = Infinity
  let bestSign = 1
  for (let i = 0; i < unwrappedPoints.length - 1; i++) {
    const a = latLonToLocal(unwrappedPoints[i][0], unwrappedPoints[i][1], midLat, midLon)
    const b = latLonToLocal(unwrappedPoints[i + 1][0], unwrappedPoints[i + 1][1], midLat, midLon)
    const { distM, sign } = perpDistanceToSegmentM(a, b, p)
    if (distM < minDistM) {
      minDistM = distM
      bestSign = sign
    }
  }

  return (bestSign * minDistM) / 1000
}

function normalizeLon(lon) {
  return (((((lon + 180) % 360) + 360) % 360) - 180)
}

export function shiftPathThroughClick(points, clickLat, clickLon) {
  if (!points || points.length < 2) return points

  const unwrappedPoints = unwrapPathLongitudes(points)
  const midLat = unwrappedPoints.reduce((s, p) => s + p[0], 0) / unwrappedPoints.length
  const midLon = unwrappedPoints.reduce((s, p) => s + p[1], 0) / unwrappedPoints.length
  const p = latLonToLocal(clickLat, unwrapLongitudeToReference(clickLon, midLon), midLat, midLon)

  let best = null
  for (let i = 0; i < unwrappedPoints.length - 1; i++) {
    const a = latLonToLocal(unwrappedPoints[i][0], unwrappedPoints[i][1], midLat, midLon)
    const b = latLonToLocal(unwrappedPoints[i + 1][0], unwrappedPoints[i + 1][1], midLat, midLon)
    const result = perpDistanceToSegmentM(a, b, p)
    if (!best || result.distM < best.distM) best = result
  }

  if (!best) return points

  return unwrappedPoints.map(([lat, lon]) => {
    const point = latLonToLocal(lat, lon, midLat, midLon)
    return localToLatLon({ x: point.x + best.dx, y: point.y + best.dy }, midLat, midLon)
  })
}
