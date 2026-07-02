/**
 * Geometria geoespacial pura — sem dependências de Leaflet ou API.
 * Funções matemáticas: distância perpendicular, deslocamento de trajetória, projeção local.
 */

const DEG_TO_KM = 111.32
const DEG_TO_M = 111320

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

function perpDistanceToSegmentM(a, b, p) {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const lenSq = abx * abx + aby * aby
  if (lenSq === 0) return { distM: Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2), sign: 1 }

  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq
  t = Math.max(0, Math.min(1, t))

  const projX = a.x + t * abx
  const projY = a.y + t * aby
  const dx = p.x - projX
  const dy = p.y - projY
  const distM = Math.sqrt(dx * dx + dy * dy)

  const crossZ = abx * dy - aby * dx
  const sign = crossZ >= 0 ? 1 : -1

  return { distM, sign }
}

export function perpendicularDistanceKm(points, clickLat, clickLon) {
  if (!points || points.length < 2) return null

  const midLat = points.reduce((s, p) => s + p[0], 0) / points.length
  const midLon = points.reduce((s, p) => s + p[1], 0) / points.length
  const p = latLonToLocal(clickLat, clickLon, midLat, midLon)

  let minDistM = Infinity
  let bestSign = 1
  for (let i = 0; i < points.length - 1; i++) {
    const a = latLonToLocal(points[i][0], points[i][1], midLat, midLon)
    const b = latLonToLocal(points[i + 1][0], points[i + 1][1], midLat, midLon)
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

export function shiftPathPerpendicular(points, distanceKm) {
  if (!points || points.length < 2 || !distanceKm) return points

  return points.map(([lat, lon], i) => {
    const prev = i > 0 ? points[i - 1] : points[0]
    const next = i < points.length - 1 ? points[i + 1] : points[points.length - 1]

    const cosLat = Math.cos((lat * Math.PI) / 180)

    // Normalize longitude delta to [-180, 180] to handle antimeridian crossing
    let dlonDeg = next[1] - prev[1]
    if (dlonDeg > 180) dlonDeg -= 360
    else if (dlonDeg < -180) dlonDeg += 360

    const dlatKm = (next[0] - prev[0]) * DEG_TO_KM
    const dlonKm = dlonDeg * DEG_TO_KM * cosLat

    const len = Math.sqrt(dlatKm * dlatKm + dlonKm * dlonKm)
    if (len === 0) return [lat, lon]

    const perpLatKm = dlonKm / len
    const perpLonKm = -dlatKm / len

    const shiftLatDeg = (distanceKm * perpLatKm) / DEG_TO_KM
    const shiftLonDeg = (distanceKm * perpLonKm) / (DEG_TO_KM * cosLat)

    return [lat + shiftLatDeg, normalizeLon(lon + shiftLonDeg)]
  })
}
