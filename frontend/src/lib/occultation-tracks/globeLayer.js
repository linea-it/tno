/**
 * Camada de base do globo: oceano, países (polígonos), graticule.
 * Projeção ortográfica alinhada ao plano da sombra (orthoproj).
 */

import {
  createShadowPlaneView,
  projectGlobeLonLatPathToSvg,
  buildGlobeDiskPath,
} from './view2d.js';
import {
  GLOBE_LAYER_CACHE_MAX_ENTRIES,
  GRATICULE_SAMPLE_STEP_DEG,
} from './limits.js';

const globeLayerCache = new Map();
const geoJsonIds = new WeakMap();
let nextGeoJsonId = 1;

function getGeoJsonId(geoJson) {
  if (!geoJson || typeof geoJson !== 'object') return 'none';
  if (!geoJsonIds.has(geoJson)) {
    geoJsonIds.set(geoJson, nextGeoJsonId++);
  }
  return geoJsonIds.get(geoJson);
}

function roundCenter(value, precisionDeg) {
  if (!precisionDeg || precisionDeg <= 0) return value;
  return Math.round(value / precisionDeg) * precisionDeg;
}

function cacheKey({
  view,
  centerLonDeg,
  centerLatDeg,
  countriesGeoJson,
  graticule,
  meridianStepDeg,
  parallelStepDeg,
  sampleStepDeg,
  cachePrecisionDeg,
}) {
  return [
    view.width,
    view.height,
    view.radiusPx,
    roundCenter(centerLonDeg, cachePrecisionDeg),
    roundCenter(centerLatDeg, cachePrecisionDeg),
    getGeoJsonId(countriesGeoJson),
    graticule,
    meridianStepDeg,
    parallelStepDeg,
    sampleStepDeg,
  ].join('|');
}

function remember(key, value) {
  if (globeLayerCache.size >= GLOBE_LAYER_CACHE_MAX_ENTRIES) {
    globeLayerCache.delete(globeLayerCache.keys().next().value);
  }
  globeLayerCache.set(key, value);
  return value;
}

/**
 * @param {Array<[number, number]>} lonLatDeg
 * @param {number} centerLonDeg
 * @param {number} centerLatDeg
 * @param {object} view
 * @returns {Array<Array<{x: number, y: number}>>}
 */
function projectLonLatLineToSvg(lonLatDeg, centerLonDeg, centerLatDeg, view) {
  return projectGlobeLonLatPathToSvg(lonLatDeg, centerLonDeg, centerLatDeg, view);
}

/**
 * @param {number} lonDeg
 * @param {number} sampleStepDeg
 * @returns {Array<[number, number]>}
 */
function sampleMeridian(lonDeg, sampleStepDeg) {
  const points = [];
  for (let lat = -90; lat <= 90; lat += sampleStepDeg) {
    points.push([lonDeg, lat]);
  }
  return points;
}

/**
 * @param {number} latDeg
 * @param {number} sampleStepDeg
 * @returns {Array<[number, number]>}
 */
function sampleParallel(latDeg, sampleStepDeg) {
  const points = [];
  for (let lon = -180; lon <= 180; lon += sampleStepDeg) {
    points.push([lon, latDeg]);
  }
  return points;
}

/**
 * @param {object} geometry
 * @returns {Array<Array<Array<[number, number]>>>}
 */
function collectPolygonRings(geometry) {
  if (geometry.type === 'Polygon') {
    return [geometry.coordinates];
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates;
  }
  return [];
}

/**
 * @param {object} geometry GeoJSON geometry
 * @param {number} centerLonDeg
 * @param {number} centerLatDeg
 * @param {object} view
 * @returns {{ land: Array<Array<{x: number, y: number}>>, borders: Array<Array<{x: number, y: number}>> }}
 */
function projectCountryGeometry(geometry, centerLonDeg, centerLatDeg, view) {
  const land = [];
  const borders = [];

  for (const polygon of collectPolygonRings(geometry)) {
    const [exterior, ...holes] = polygon;
    if (!exterior?.length) continue;

    const exteriorSegments = projectLonLatLineToSvg(exterior, centerLonDeg, centerLatDeg, view);
    for (const segment of exteriorSegments) {
      if (segment.length >= 3) {
        land.push(segment);
      }
      if (segment.length >= 2) {
        borders.push(segment);
      }
    }

    for (const hole of holes) {
      const holeSegments = projectLonLatLineToSvg(hole, centerLonDeg, centerLatDeg, view);
      for (const segment of holeSegments) {
        if (segment.length >= 3) {
          land.push(segment);
        }
      }
    }
  }

  return { land, borders };
}

/**
 * @param {object} params
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.centerLonDeg
 * @param {number} params.centerLatDeg
 * @param {object} [params.view]
 * @param {object} [params.countriesGeoJson] FeatureCollection com polígonos (Natural Earth)
 * @param {boolean} [params.graticule=true]
 * @param {number} [params.meridianStepDeg=30]
 * @param {number} [params.parallelStepDeg=30]
 * @param {number} [params.sampleStepDeg=2]
 * @param {number} [params.cachePrecisionDeg=1]
 * @param {boolean} [params.useCache=true]
 * @returns {{ ocean: { path: string }, land: Array, borders: Array, graticule: object }}
 */
export function buildGlobeLayer({
  width,
  height,
  centerLonDeg,
  centerLatDeg,
  view: existingView,
  countriesGeoJson = null,
  graticule = true,
  meridianStepDeg = 30,
  parallelStepDeg = 30,
  sampleStepDeg = GRATICULE_SAMPLE_STEP_DEG,
  cachePrecisionDeg = 1,
  useCache = true,
}) {
  const view = existingView ?? createShadowPlaneView({ width, height });
  const roundedCenterLonDeg = roundCenter(centerLonDeg, cachePrecisionDeg);
  const roundedCenterLatDeg = roundCenter(centerLatDeg, cachePrecisionDeg);
  const key = cacheKey({
    view,
    centerLonDeg,
    centerLatDeg,
    countriesGeoJson,
    graticule,
    meridianStepDeg,
    parallelStepDeg,
    sampleStepDeg,
    cachePrecisionDeg,
  });

  if (useCache && globeLayerCache.has(key)) {
    return globeLayerCache.get(key);
  }

  const result = {
    ocean: { path: buildGlobeDiskPath(view) },
    land: [],
    borders: [],
    graticule: { meridians: [], parallels: [] },
  };

  if (countriesGeoJson?.features) {
    for (const feature of countriesGeoJson.features) {
      if (!feature.geometry) continue;
      const projected = projectCountryGeometry(
        feature.geometry,
        roundedCenterLonDeg,
        roundedCenterLatDeg,
        view,
      );
      result.land.push(...projected.land);
      result.borders.push(...projected.borders);
    }
  }

  if (graticule) {
    for (let lon = -180; lon < 180; lon += meridianStepDeg) {
      const segments = projectLonLatLineToSvg(
        sampleMeridian(lon, sampleStepDeg),
        roundedCenterLonDeg,
        roundedCenterLatDeg,
        view,
      );
      result.graticule.meridians.push(...segments);
    }

    const parallelLats = new Set([0]);
    for (let lat = -90 + parallelStepDeg; lat < 90; lat += parallelStepDeg) {
      parallelLats.add(lat);
    }

    const sortedLats = [...parallelLats].sort((a, b) => a - b);
    for (const lat of sortedLats) {
      const segments = projectLonLatLineToSvg(
        sampleParallel(lat, sampleStepDeg),
        roundedCenterLonDeg,
        roundedCenterLatDeg,
        view,
      );
      result.graticule.parallels.push(...segments);
    }
  }

  return useCache ? remember(key, result) : result;
}

export function clearGlobeLayerCache() {
  globeLayerCache.clear();
}
