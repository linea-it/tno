/**
 * Montagem da geometria SVG para thumbnail de ocultação.
 * Globo: ortográfico (dia/noite). Faixa: plano da sombra (SORA).
 */

import { DEFAULT_SAMPLES, MIN_CENTRAL_MARKER_DIAMETER_PX } from './constants.js';
import { normalizeOccultationEvent, validateOccultationEvent } from './event.js';
import {
  generateShadowPlanePath,
  generateShadowPlaneBodyLimits,
  generateShadowPlaneUncertaintyLimits,
  generateShadowPlaneCentralPoint,
  generateCentralPoint,
  calculateArcCoordinates,
} from './geometry.js';
import { getStarSubEarthPoint } from './time.js';
import {
  createShadowPlaneView,
  projectArcMetersToSvg,
  projectShadowPlanePathToSvg,
  buildGlobeDayNightPaths,
} from './view2d.js';
import { buildGlobeLayer } from './globeLayer.js';

/**
 * @param {object} rawEvent payload bruto da API/tabela
 * @param {object} [options]
 * @param {number} [options.width=160]
 * @param {number} [options.height=100]
 * @param {number} [options.samples=DEFAULT_SAMPLES]
 * @param {boolean} [options.graticule=true] meridianos e paralelos
 * @param {object|null} [options.countries=null] FeatureCollection GeoJSON opcional
 * @param {boolean} [options.computeNightFraction=false]
 * @param {number} [options.globeCachePrecisionDeg=1]
 * @param {number} [options.meridianStepDeg=30]
 * @param {number} [options.parallelStepDeg=30]
 * @returns {object}
 */
export function buildThumbnailGeometry(rawEvent, options = {}) {
  const width = options.width ?? 160;
  const height = options.height ?? 100;
  const samples = options.samples ?? DEFAULT_SAMPLES;
  const graticule = options.graticule !== false;
  const countriesGeoJson = (options.countries && typeof options.countries === 'object')
    ? options.countries
    : null;

  const event = normalizeOccultationEvent(rawEvent);
  const validation = validateOccultationEvent(event);

  if (!validation.ok) {
    return { isDrawable: false, reasons: validation.reasons };
  }

  const [starLonDeg, starLatDeg] = getStarSubEarthPoint(
    event.raDeg,
    event.decDeg,
    event.t0Ms,
    event.t0Ms,
    event.pmraMasYr,
    event.pmdecMasYr,
  );

  const view = createShadowPlaneView({ width, height });

  const centralArcMeters = generateShadowPlaneCentralPoint(event);
  const pathOptions = { samples, extendToLimb: true };
  const centralPathArc = generateShadowPlanePath(event, 0, pathOptions);
  const bodyLimits = generateShadowPlaneBodyLimits(event, pathOptions);
  const uncertaintyLimits = generateShadowPlaneUncertaintyLimits(event, pathOptions);

  const centralPointProjected = projectArcMetersToSvg(centralArcMeters, view);
  const groundCentral = generateCentralPoint(event);
  const centralPoint = buildCentralMarker(
    event,
    view,
    centralPointProjected,
    groundCentral,
    starLonDeg,
    starLatDeg,
  );

  const dayNight = buildGlobeDayNightPaths(
    view,
    starLonDeg,
    starLatDeg,
    event.t0Ms,
    { computeNightFraction: options.computeNightFraction ?? false },
  );

  const globeLayer = buildGlobeLayer({
    view,
    width,
    height,
    centerLonDeg: starLonDeg,
    centerLatDeg: starLatDeg,
    graticule,
    countriesGeoJson,
    meridianStepDeg: options.meridianStepDeg,
    parallelStepDeg: options.parallelStepDeg,
    cachePrecisionDeg: options.globeCachePrecisionDeg,
  });

  return {
    isDrawable: true,
    projection: 'shadowPlane',
    view: {
      width: view.width,
      height: view.height,
      cx: view.cx,
      cy: view.cy,
      radiusPx: view.radiusPx,
    },
    globe: {
      cx: view.cx,
      cy: view.cy,
      r: view.radiusPx,
    },
    dayNight,
    globeLayer,
    starSubEarth: {
      lonDeg: starLonDeg,
      latDeg: starLatDeg,
    },
    centralPoint,
    centralPath: projectShadowPlanePathToSvg(centralPathArc, view),
    upperLimit: projectShadowPlanePathToSvg(bodyLimits.upper, view),
    lowerLimit: projectShadowPlanePathToSvg(bodyLimits.lower, view),
    uncertaintyUpper: projectShadowPlanePathToSvg(uncertaintyLimits.upper, view),
    uncertaintyLower: projectShadowPlanePathToSvg(uncertaintyLimits.lower, view),
  };
}

function finalizeCentralMarker(centerProjected, projectedDiameterPx, lonDeg, latDeg) {
  const diameterPx = Math.max(projectedDiameterPx, MIN_CENTRAL_MARKER_DIAMETER_PX);
  return {
    kind: 'circle',
    x: centerProjected.x,
    y: centerProjected.y,
    r: diameterPx / 2,
    diameterPx,
    projectedDiameterPx,
    visible: centerProjected.visible,
    lonDeg,
    latDeg,
  };
}

/**
 * Marcador do instante central: círculo com diâmetro projetado do corpo (mín. 2 px).
 */
function buildCentralMarker(event, view, centerProjected, groundCentral, starLonDeg, starLatDeg) {
  const lonDeg = groundCentral ? groundCentral[0] : starLonDeg;
  const latDeg = groundCentral ? groundCentral[1] : starLatDeg;
  const objectRadiusKm = event.objectRadiusKm ?? 0;

  if (objectRadiusKm > 0) {
    const arcParams = [
      event.deltaKm,
      event.closestApproachRad,
      event.positionAngleRad,
      0,
      event.velocityKmSec,
      event.motionAngleRad,
    ];
    const upper = projectArcMetersToSvg(
      calculateArcCoordinates(...arcParams, objectRadiusKm),
      view,
    );
    const lower = projectArcMetersToSvg(
      calculateArcCoordinates(...arcParams, -objectRadiusKm),
      view,
    );
    const projectedDiameterPx = Math.hypot(upper.x - lower.x, upper.y - lower.y);
    return finalizeCentralMarker(centerProjected, projectedDiameterPx, lonDeg, latDeg);
  }

  return finalizeCentralMarker(centerProjected, 0, lonDeg, latDeg);
}
