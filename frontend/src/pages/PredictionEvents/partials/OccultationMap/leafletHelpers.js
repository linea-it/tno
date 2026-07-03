/**
 * Helpers de formatação para Leaflet — segmentação, periodicidade, conversão lat/lon.
 * Não dependem de dados da API nem de geometria pura.
 */

const PERIODIC_REPETITIONS = 2

export function splitLeafletPathByLongitudeJump(points, threshold = 180) {
  if (!points.length) return []
  if (points.length === 1) return [points]

  const segments = []
  let current = [points[0]]

  for (let i = 1; i < points.length; i++) {
    const [, prevLon] = points[i - 1]
    const [, lon] = points[i]
    if (Math.abs(lon - prevLon) > threshold) {
      segments.push(current)
      current = [points[i]]
    } else {
      current.push(points[i])
    }
  }

  if (current.length) segments.push(current)
  return segments
}

export function createPeriodicLeafletSegments(segments, repetitions = PERIODIC_REPETITIONS) {
  const periodicSegments = []
  segments.forEach((segment) => {
    for (let i = -repetitions; i <= repetitions; i++) {
      periodicSegments.push(segment.map(([lat, lon]) => [lat, lon + i * 360]))
    }
  })
  return periodicSegments
}

export function createPeriodicLeafletPoints(points, repetitions = PERIODIC_REPETITIONS) {
  const periodicPoints = []
  for (let i = -repetitions; i <= repetitions; i++) {
    points.forEach(([lat, lon]) => {
      periodicPoints.push([lat, lon + i * 360])
    })
  }
  return periodicPoints
}

export function toLonLat(points) {
  return points.map(([lat, lon]) => [lon, lat])
}

export function buildLeafletLayersFromPoints(points) {
  const segments = splitLeafletPathByLongitudeJump(points)
  return {
    segments,
    periodicSegments: createPeriodicLeafletSegments(segments),
  }
}
