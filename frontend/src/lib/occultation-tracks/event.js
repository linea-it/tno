/**
 * Normalização e validação de eventos de ocultação (payload da API/tabela).
 */

import {
  AU_KM,
  MAS_TO_RAD,
  MAS_TO_ARCSEC,
  PATH_HALF_WINDOW_STEPS,
} from './constants.js';
import { rad, normalizePositionAngle } from './angles.js';

/**
 * @param {object} raw
 * @param {string} key
 * @param {string|null} fallbackKey
 * @param {number} [defaultValue=0]
 * @returns {number}
 */
export function getNumericEventValue(raw, key, fallbackKey = null, defaultValue = 0) {
  let value = parseFloat(raw[key]);
  if (Number.isNaN(value) && fallbackKey) {
    value = parseFloat(raw[fallbackKey]);
  }
  return Number.isNaN(value) ? defaultValue : value;
}

/**
 * @param {object} raw
 * @param {string} key
 * @param {string|null} fallbackKey
 * @param {string} [defaultValue='']
 * @returns {string}
 */
export function getStringEventValue(raw, key, fallbackKey = null, defaultValue = '') {
  if (raw[key] != null && raw[key] !== '') return String(raw[key]);
  if (fallbackKey && raw[fallbackKey] != null && raw[fallbackKey] !== '') {
    return String(raw[fallbackKey]);
  }
  return defaultValue;
}

/**
 * Ajusta t0 e CA com off_ra/off_dec (occviz _setup_initial_variables / occ_map_params).
 * @param {number} t0Ms
 * @param {number} closestApproachArcsec
 * @param {number} offRaMas
 * @param {number} offDecMas
 * @param {number} positionAngleRad
 * @param {number} deltaKm
 * @param {number} velocityKmSec
 * @returns {{ t0Ms: number, closestApproachArcsec: number }}
 */
export function applyPredictionOffsets(
  t0Ms,
  closestApproachArcsec,
  offRaMas,
  offDecMas,
  positionAngleRad,
  deltaKm,
  velocityKmSec,
) {
  if (offRaMas === 0 && offDecMas === 0) {
    return { t0Ms, closestApproachArcsec };
  }

  const deltaCaArcsec = offRaMas * MAS_TO_ARCSEC * Math.sin(positionAngleRad)
    + offDecMas * MAS_TO_ARCSEC * Math.cos(positionAngleRad);
  const adjustedCaArcsec = closestApproachArcsec + deltaCaArcsec;

  const deltaTSec = -(
    (offRaMas * MAS_TO_RAD * Math.cos(positionAngleRad)
      - offDecMas * MAS_TO_RAD * Math.sin(positionAngleRad))
    * deltaKm / Math.abs(velocityKmSec)
  );

  return {
    t0Ms: t0Ms + deltaTSec * 1000,
    closestApproachArcsec: adjustedCaArcsec,
  };
}

/**
 * @param {object} raw
 * @returns {{ raDeg: number, decDeg: number }}
 */
function resolveStarCoords(raw) {
  const raWithPm = raw.ra_star_with_pm;
  const decWithPm = raw.dec_star_with_pm;
  if (raWithPm != null && decWithPm != null) {
    const raDeg = parseFloat(raWithPm);
    const decDeg = parseFloat(decWithPm);
    if (Number.isFinite(raDeg) && Number.isFinite(decDeg)) {
      return { raDeg, decDeg };
    }
  }

  return {
    raDeg: getNumericEventValue(raw, 'ra_star_deg', 'ra'),
    decDeg: getNumericEventValue(raw, 'dec_star_deg', 'dec'),
  };
}

/* Precisamos usar Math.abs para tratar erros que foram
reportados negativamente.
*/
function resolveDiameterErrors(raw) {
  const errMin = Math.abs(getNumericEventValue(raw, 'diameter_err_min', null, 0));
  const errMax = Math.abs(getNumericEventValue(raw, 'diameter_err_max', null, 0));
  if (errMin > 0 && errMax > 0) return (errMin + errMax) / 4;
  if (errMax > 0) return errMax / 2;
  if (errMin > 0) return errMin / 2;
  return 0;
}

/**
 * Largura da sombra aparente (opmap radius1) e raio físico do objeto (occviz object_radius).
 * @param {object} raw
 * @returns {{
 *   shadowDiameterKm: number,
 *   hasKnownDiameter: boolean,
 *   objectRadiusKm: number,
 *   objectRadiusErrorKm: number,
 * }}
 */
function resolveShadowDiameter(raw) {
  const apparentDiameterKm = getNumericEventValue(raw, 'apparent_diameter', null, 0);
  const physicalDiameterKm = getNumericEventValue(raw, 'diameter', null, 0);
  const shadowDiameterKm = apparentDiameterKm > 0 ? apparentDiameterKm : physicalDiameterKm;
  return {
    shadowDiameterKm,
    hasKnownDiameter: shadowDiameterKm > 0,
    objectRadiusKm: physicalDiameterKm > 0 ? physicalDiameterKm / 2 : 0,
    objectRadiusErrorKm: resolveDiameterErrors(raw),
  };
}

/**
 * Distância lateral ao eixo central para a barra de erro (occviz error_dist_from_center).
 * Não é offset adicional sobre o caminho do corpo: é o raio total desde o eixo,
 * incluindo object_radius + object_radius_error + closest_approach_error.
 * @param {number} objectRadiusKm
 * @param {number} objectRadiusErrorKm
 * @param {number} closestApproachErrorKm
 * @returns {number}
 */
export function resolveErrorDistKm(objectRadiusKm, objectRadiusErrorKm, closestApproachErrorKm) {
  return objectRadiusKm + objectRadiusErrorKm + closestApproachErrorKm;
}

/**
 * Janela temporal: predict_step × PATH_HALF_WINDOW_STEPS, ou 6371/|v| (Lucky Star).
 * @param {object} raw
 * @param {number} velocityKmSec
 * @returns {number} meio da janela em segundos
 */
export function resolveMaxTimeSec(raw, velocityKmSec) {
  const predictStepSec = getNumericEventValue(raw, 'predict_step', null, 0);
  if (predictStepSec > 0) {
    return predictStepSec * PATH_HALF_WINDOW_STEPS;
  }
  if (velocityKmSec === 0) return 0;
  return Math.floor(6371 / Math.abs(velocityKmSec));
}

/**
 * Converte payload bruto da API em modelo interno estável.
 * Baseado em Physics.setupEvent (function.js) + occviz _setup_initial_variables.
 * @param {object} raw
 * @returns {object}
 */
export function normalizeOccultationEvent(raw) {
  const { raDeg, decDeg } = resolveStarCoords(raw);
  const velocityKmSec = getNumericEventValue(raw, 'velocity', 'vel');
  const deltaAu = getNumericEventValue(raw, 'delta', 'geocentric_distance') || 1.0;
  let closestApproachArcsec = getNumericEventValue(raw, 'closest_approach', 'ca');
  let positionAngleDeg = getNumericEventValue(raw, 'position_angle', 'pa');

  while (positionAngleDeg > 180) positionAngleDeg -= 360;
  while (positionAngleDeg < -180) positionAngleDeg += 360;

  const deltaKm = deltaAu * AU_KM;
  const positionAngleRad = rad(positionAngleDeg);
  const motionAngleDeg = normalizePositionAngle(positionAngleDeg);
  const motionAngleRad = rad(motionAngleDeg);

  const offRaMas = getNumericEventValue(raw, 'off_ra', null, 0);
  const offDecMas = getNumericEventValue(raw, 'off_dec', null, 0);
  let t0Ms = Date.parse(raw.date_time);

  const adjusted = applyPredictionOffsets(
    t0Ms,
    closestApproachArcsec,
    offRaMas,
    offDecMas,
    positionAngleRad,
    deltaKm,
    velocityKmSec,
  );
  t0Ms = adjusted.t0Ms;
  closestApproachArcsec = adjusted.closestApproachArcsec;

  const closestApproachRad = rad(closestApproachArcsec / 3600);
  const maxTimeSec = resolveMaxTimeSec(raw, velocityKmSec);
  const { shadowDiameterKm, hasKnownDiameter, objectRadiusKm, objectRadiusErrorKm } =
    resolveShadowDiameter(raw);
  const closestApproachErrorKm = getNumericEventValue(
    raw,
    'closest_approach_uncertainty_km',
    null,
    0,
  );
  const errorDistKm = resolveErrorDistKm(
    objectRadiusKm,
    objectRadiusErrorKm,
    closestApproachErrorKm,
  );
  const pmraMasYr = getNumericEventValue(raw, 'pmra', null, 0);
  const pmdecMasYr = getNumericEventValue(raw, 'pmdec', null, 0);

  return {
    id: raw.id,
    name: raw.name ?? raw.principal_designation ?? raw.alias ?? 'Object',
    t0Ms,
    raDeg,
    decDeg,
    pmraMasYr,
    pmdecMasYr,
    velocityKmSec,
    deltaKm,
    closestApproachRad,
    closestApproachArcsec,
    positionAngleRad,
    motionAngleRad,
    shadowDiameterKm,
    /** @deprecated removido em v2.0.0 — use shadowDiameterKm */
    diameterKm: shadowDiameterKm,
    hasKnownDiameter,
    hasKnownObjectRadius: objectRadiusKm > 0,
    objectRadiusKm,
    objectRadiusErrorKm,
    closestApproachErrorKm,
    errorDistKm,
    /** @deprecated removido em v2.0.0 — use closestApproachErrorKm */
    uncertaintyKm: closestApproachErrorKm,
    /** @deprecated removido em v2.0.0 — use objectRadiusKm */
    physicalRadiusKm: objectRadiusKm,
    /** @deprecated removido em v2.0.0 — use objectRadiusErrorKm */
    diameterErrorRadiusKm: objectRadiusErrorKm,
    maxTimeSec,
    predictStepSec: getNumericEventValue(raw, 'predict_step', null, 0),
    visibleStartMs: t0Ms - maxTimeSec * 1000,
    visibleEndMs: t0Ms + maxTimeSec * 1000,
  };
}

/**
 * @param {object} event evento normalizado
 * @returns {{ ok: boolean, reasons: string[] }}
 */
export function validateOccultationEvent(event) {
  const reasons = [];

  if (!Number.isFinite(event.t0Ms)) {
    reasons.push('t0Ms inválido');
  }
  if (event.velocityKmSec === 0) {
    reasons.push('velocityKmSec é zero');
  }
  if (!Number.isFinite(event.raDeg)) {
    reasons.push('raDeg inválido');
  }
  if (!Number.isFinite(event.decDeg)) {
    reasons.push('decDeg inválido');
  }
  if (!Number.isFinite(event.deltaKm) || event.deltaKm <= 0) {
    reasons.push('deltaKm inválido');
  }

  return { ok: reasons.length === 0, reasons };
}
