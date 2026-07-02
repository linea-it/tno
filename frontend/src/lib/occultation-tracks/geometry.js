/**
 * Geometria da faixa de sombra (ground track) de uma ocultação.
 * Baseado em Physics (function.js L552-697).
 */

import { R_EARTH_KM, DEFAULT_SAMPLES } from './constants.js';
import { MAX_PATH_SAMPLES } from './limits.js';
import { rad } from './angles.js';
import { orthoprojinv } from './geodesy.js';
import { getStarSubEarthPoint } from './time.js';

/**
 * Coordenadas do arco no plano da projeção, em metros.
 * @param {number} deltaKm distância geocêntrica em km
 * @param {number} closestApproachRad CA em radianos
 * @param {number} positionAngleRad PA em radianos
 * @param {number} dtimeSec deslocamento temporal em segundos
 * @param {number} velocityKmSec velocidade em km/s
 * @param {number} motionAngleRad PA de movimento em radianos
 * @param {number} radiusKm deslocamento lateral em km (limite do corpo/incerteza)
 * @returns {[number, number]} [arcXMeters, arcYMeters]
 */
export function calculateArcCoordinates(
  deltaKm,
  closestApproachRad,
  positionAngleRad,
  dtimeSec,
  velocityKmSec,
  motionAngleRad,
  radiusKm,
) {
  const arcKm = deltaKm * closestApproachRad;

  const motionXKm = (dtimeSec * velocityKmSec) * Math.cos(motionAngleRad);
  const motionYKm = -(dtimeSec * velocityKmSec) * Math.sin(motionAngleRad);

  let arcXKm = arcKm * Math.sin(positionAngleRad) + motionXKm;
  let arcYKm = arcKm * Math.cos(positionAngleRad) + motionYKm;

  if (radiusKm !== 0) {
    arcXKm += radiusKm * Math.sin(motionAngleRad);
    arcYKm += radiusKm * Math.cos(motionAngleRad);
  }

  return [arcXKm * 1000, arcYKm * 1000];
}

/**
 * Vetor velocidade no plano da sombra (m/s).
 * @param {object} event
 * @returns {[number, number]}
 */
export function shadowPlaneVelocityMetersPerSec(event) {
  const v = event.velocityKmSec * 1000;
  return [
    v * Math.cos(event.motionAngleRad),
    -v * Math.sin(event.motionAngleRad),
  ];
}

/**
 * Amostra a reta do plano da sombra no trecho visível entre limbos terrestres.
 * @param {[number, number]} pointAtT0 metros no instante t0
 * @param {[number, number]} velocityMetersPerSec d(arc)/dt
 * @param {number} [samples=101]
 * @param {number} [earthRadiusMeters=R_EARTH_KM * 1000]
 * @returns {Array<[number, number]>}
 */
export function extendArcLineToEarthLimb(
  pointAtT0,
  velocityMetersPerSec,
  samples = 101,
  earthRadiusMeters = R_EARTH_KM * 1000,
) {
  const [cx, cy] = pointAtT0;
  const [dx, dy] = velocityMetersPerSec;
  const a = dx * dx + dy * dy;
  if (a < 1e-12) return [pointAtT0];

  const radiusSquared = earthRadiusMeters * earthRadiusMeters;
  const b = 2 * (cx * dx + cy * dy);
  const c = cx * cx + cy * cy - radiusSquared;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [pointAtT0];

  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  const count = Math.max(2, Math.floor(samples));
  const points = [];
  for (let i = 0; i < count; i++) {
    const fraction = i / (count - 1);
    const t = t1 + (t2 - t1) * fraction;
    points.push([cx + t * dx, cy + t * dy]);
  }
  return points;
}

/**
 * Posição [lonDeg, latDeg] da sombra em um instante.
 * @param {object} event evento normalizado
 * @param {number} tMs epoch em milissegundos
 * @param {number} [radiusKm=0]
 * @returns {[number, number] | null}
 */
export function getPositionAtTime(event, tMs, radiusKm = 0) {
  const dtimeSec = (tMs - event.t0Ms) / 1000;

  const [arcXMeters, arcYMeters] = calculateArcCoordinates(
    event.deltaKm,
    event.closestApproachRad,
    event.positionAngleRad,
    dtimeSec,
    event.velocityKmSec,
    event.motionAngleRad,
    radiusKm,
  );

  const xNorm = arcXMeters / (R_EARTH_KM * 1000);
  const yNorm = arcYMeters / (R_EARTH_KM * 1000);

  const [starLonDeg, starLatDeg] = getStarSubEarthPoint(
    event.raDeg,
    event.decDeg,
    tMs,
    event.t0Ms,
    event.pmraMasYr,
    event.pmdecMasYr,
  );

  const geo = orthoprojinv(
    rad(starLonDeg),
    rad(starLatDeg),
    xNorm,
    yNorm,
  );

  if (geo) {
    return [geo.lonDeg, geo.latDeg];
  }
  return null;
}

/**
 * @param {object} event
 * @param {number} [samples=DEFAULT_SAMPLES]
 * @returns {number[]} array de tMs
 */
export function generateTimeSamples(event, samples = DEFAULT_SAMPLES) {
  const clampedSamples = Math.min(samples, MAX_PATH_SAMPLES);
  if (samples > MAX_PATH_SAMPLES) {
    if (typeof console !== 'undefined') {
      console.warn(`occultation-tracks: samples=${samples} excede MAX_PATH_SAMPLES=${MAX_PATH_SAMPLES}, truncando.`);
    }
  }
  const maxTimeSec = event.maxTimeSec
    ?? Math.floor(6371 / Math.abs(event.velocityKmSec));
  const timesMs = [];
  for (let i = 0; i < clampedSamples; i++) {
    const fraction = clampedSamples > 1 ? i / (clampedSamples - 1) : 0;
    const dtimeSec = (fraction * 2 - 1) * maxTimeSec;
    timesMs.push(event.t0Ms + dtimeSec * 1000);
  }
  return timesMs;
}

/**
 * Remove saltos de 360° na longitude entre pontos consecutivos.
 * @param {Array<[number, number]>} points [lonDeg, latDeg]
 * @returns {Array<[number, number]>}
 */
export function handleLongitudeDiscontinuities(points) {
  if (points.length <= 1) return points;

  const result = points.map((p) => [p[0], p[1]]);
  let offset = 0;

  for (let i = 1; i < result.length; i++) {
    const deltaLon = result[i][0] - result[i - 1][0];
    if (deltaLon > 180) offset -= 360;
    else if (deltaLon < -180) offset += 360;
    result[i][0] += offset;
  }

  return result;
}

/**
 * @param {object} event
 * @param {object} [options]
 * @param {number} [options.samples]
 * @returns {Array<[number, number]>}
 */
export function generateOccultationPath(event, options = {}) {
  return generateOffsetPath(event, 0, options);
}

/**
 * @param {object} event
 * @param {number} radiusKm
 * @param {object} [options]
 * @param {number} [options.samples]
 * @returns {Array<[number, number]>}
 */
export function generateOffsetPath(event, radiusKm, options = {}) {
  const samples = options.samples ?? DEFAULT_SAMPLES;
  const timesMs = generateTimeSamples(event, samples);
  const points = [];

  for (const tMs of timesMs) {
    const pos = getPositionAtTime(event, tMs, radiusKm);
    if (pos) {
      points.push(pos);
    }
  }

  return handleLongitudeDiscontinuities(points);
}

/**
 * @param {object} event
 * @param {number} radiusKm
 * @param {object} [options]
 * @param {number} [options.samples]
 * @returns {Array<[number, number]>} [arcXMeters, arcYMeters]
 */
export function generateShadowPlanePath(event, radiusKm = 0, options = {}) {
  const extendToLimb = options.extendToLimb ?? false;

  if (extendToLimb) {
    const samples = options.earthTrackSamples ?? 101;
    const center = calculateArcCoordinates(
      event.deltaKm,
      event.closestApproachRad,
      event.positionAngleRad,
      0,
      event.velocityKmSec,
      event.motionAngleRad,
      radiusKm,
    );
    return extendArcLineToEarthLimb(center, shadowPlaneVelocityMetersPerSec(event), samples);
  }

  const samples = options.samples ?? DEFAULT_SAMPLES;
  const timesMs = generateTimeSamples(event, samples);
  const points = [];

  for (const tMs of timesMs) {
    const dtimeSec = (tMs - event.t0Ms) / 1000;
    const arc = calculateArcCoordinates(
      event.deltaKm,
      event.closestApproachRad,
      event.positionAngleRad,
      dtimeSec,
      event.velocityKmSec,
      event.motionAngleRad,
      radiusKm,
    );
    points.push(arc);
  }

  return points;
}

/**
 * @param {object} event
 * @param {object} [options]
 * @returns {{ upper: Array<[number, number]>, lower: Array<[number, number]> }}
 */
export function generateShadowPlaneBodyLimits(event, options = {}) {
  const objectRadiusKm = event.objectRadiusKm ?? 0;
  if (objectRadiusKm <= 0) {
    return { upper: [], lower: [] };
  }
  return {
    upper: generateShadowPlanePath(event, objectRadiusKm, options),
    lower: generateShadowPlanePath(event, -objectRadiusKm, options),
  };
}

/**
 * @param {object} event
 * @param {object} [options]
 * @returns {{ upper: Array<[number, number]>, lower: Array<[number, number]> }}
 */
export function generateShadowPlaneUncertaintyLimits(event, options = {}) {
  const errorDistKm = event.errorDistKm ?? 0;
  if (errorDistKm <= 0) {
    return { upper: [], lower: [] };
  }
  return {
    upper: generateShadowPlanePath(event, errorDistKm, options),
    lower: generateShadowPlanePath(event, -errorDistKm, options),
  };
}

/**
 * Ponto central no plano da sombra em t0 (metros).
 * @param {object} event
 * @returns {[number, number]}
 */
export function generateShadowPlaneCentralPoint(event) {
  return calculateArcCoordinates(
    event.deltaKm,
    event.closestApproachRad,
    event.positionAngleRad,
    0,
    event.velocityKmSec,
    event.motionAngleRad,
    0,
  );
}

/**
 * @param {object} event
 * @param {object} [options]
 * @returns {{ upper: Array<[number, number]>, lower: Array<[number, number]> }}
 */
export function generateBodyLimits(event, options = {}) {
  const objectRadiusKm = event.objectRadiusKm ?? 0;
  if (objectRadiusKm <= 0) {
    return { upper: [], lower: [] };
  }
  return {
    upper: generateOffsetPath(event, objectRadiusKm, options),
    lower: generateOffsetPath(event, -objectRadiusKm, options),
  };
}

/**
 * @param {object} event
 * @param {object} [options]
 * @returns {{ upper: Array<[number, number]>, lower: Array<[number, number]> }}
 */
export function generateUncertaintyLimits(event, options = {}) {
  const errorDistKm = event.errorDistKm ?? 0;
  if (errorDistKm <= 0) {
    return { upper: [], lower: [] };
  }
  return {
    upper: generateOffsetPath(event, errorDistKm, options),
    lower: generateOffsetPath(event, -errorDistKm, options),
  };
}

/**
 * @param {object} event
 * @returns {[number, number] | null}
 */
export function generateCentralPoint(event) {
  return getPositionAtTime(event, event.t0Ms, 0);
}
