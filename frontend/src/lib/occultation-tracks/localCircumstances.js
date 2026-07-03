/**
 * Circunstâncias locais e terminador. [via Lucky Star opmap.js]
 */

import { APF, COFAP, R_EARTH_KM, W_EARTH } from './constants.js';
import {
  rad,
  deg,
  normalizeLongitudeAround,
  normalizeAngle2Pi,
  round1,
} from './angles.js';
import { orthoproj } from './geodesy.js';
import { occultationProbability } from './statistics.js';
import { calculateGST, getSunDirectionInStarFrame } from './time.js';

/**
 * Compara polígonos pelo segundo elemento (longitude) para ordenação.
 * @param {[number, number]} pointA [latDeg, lonDeg]
 * @param {[number, number]} pointB
 */
function compareByLongitude(pointA, pointB) {
  if (pointA[1] === pointB[1]) return 0;
  return pointA[1] < pointB[1] ? -1 : 1;
}

/**
 * Polígono do terminador (dia/noite). Port de terminateur (opmap.js L93).
 * @deprecated Use terminatorPolygonLonLat que segue a convenção [lonDeg, latDeg] do módulo.
 * @param {object} params
 * @param {number} params.dirX direção do corpo (ex.: Sol) componente x
 * @param {number} params.dirY componente y
 * @param {number} params.dirZ componente z
 * @param {number} params.cosDecStar cos(dec estrela)
 * @param {number} params.sinDecStar sin(dec estrela)
 * @param {number} params.dtimeDays deslocamento temporal em dias
 * @param {number} params.lstDeg LST em graus
 * @param {number} params.raStarDeg RA da estrela em graus
 * @param {number} params.centerLonDeg longitude central para normalização
 * @returns {Array<[number, number]>} [latDeg, lonDeg]
 */
export function terminatorPolygon({
  dirX,
  dirY,
  dirZ,
  cosDecStar,
  sinDecStar,
  dtimeDays,
  lstDeg,
  raStarDeg,
  centerLonDeg,
}) {
  const coords = [];
  let sinPhi = dirY * cosDecStar + dirZ * sinDecStar;
  const cosPhi = -dirY * sinDecStar + dirZ * cosDecStar;
  let heading = Math.atan2(dirX, cosPhi) - rad(lstDeg) + rad(raStarDeg);
  let lonRad = heading - W_EARTH * dtimeDays;
  let latRad = Math.asin(sinPhi);
  let latGeodeticDeg = deg(Math.atan(Math.tan(latRad) * COFAP));
  const latSouthSign = latGeodeticDeg;

  const declinationRad = Math.asin(dirZ);
  const alphaRad = dirX === 0.0 ? 0 : Math.atan2(dirY, dirX);

  let t = 0;
  while (t < 2 * Math.PI) {
    let u1 = Math.cos(t);
    let v1 = Math.sin(t);
    let w1 = 0.0;

    let theta = -Math.PI * 0.5 + declinationRad;
    let u2 = -Math.sin(theta) * w1 + Math.cos(theta) * u1;
    let v2 = v1;
    let w2 = Math.cos(theta) * w1 + Math.sin(theta) * u1;

    theta = -alphaRad;
    let u3 = Math.cos(theta) * u2 + Math.sin(theta) * v2;
    let v3 = -Math.sin(theta) * u2 + Math.cos(theta) * v2;
    let w3 = w2;

    sinPhi = v3 * cosDecStar + w3 * sinDecStar;
    const cphiLocal = -v3 * sinDecStar + w3 * cosDecStar;
    heading = Math.atan2(u3, cphiLocal) - rad(lstDeg) + rad(raStarDeg);
    lonRad = heading - W_EARTH * dtimeDays;
    const lonNormalizedDeg = normalizeLongitudeAround(deg(lonRad), centerLonDeg);
    latRad = Math.asin(sinPhi);
    latGeodeticDeg = deg(Math.atan(Math.tan(latRad) * COFAP));
    coords.push([latGeodeticDeg, lonNormalizedDeg]);

    t += Math.PI / 180;
  }

  coords.sort(compareByLongitude);
  const firstLon = coords[0][1];
  const lastLon = coords[coords.length - 1][1];
  const poleLat = latSouthSign >= 0 ? -89.9 : 89.9;
  coords.unshift([poleLat, firstLon]);
  coords.push([poleLat, lastLon]);

  return coords;
}

/**
 * Versão corrigida de terminatorPolygon com convenção [lonDeg, latDeg] do módulo.
 * @param {object} params mesmos parâmetros de terminatorPolygon
 * @returns {Array<[number, number]>} [lonDeg, latDeg]
 */
export function terminatorPolygonLonLat(params) {
  return terminatorPolygon(params).map(([latDeg, lonDeg]) => [lonDeg, latDeg]);
}

/**
 * Polígono do lado noturno em t0 (como opmap.js: terminateur(-sx,-sy,-sz,...)).
 * @param {object} event evento normalizado
 * @param {number} centerLonDeg longitude central para normalização do polígono
 * @returns {Array<[number, number]>} [lonDeg, latDeg]
 */
export function generateNightTerminatorPolygon(event, centerLonDeg) {
  const lstDeg = calculateGST(new Date(event.t0Ms));
  const cosDecStar = Math.cos(rad(event.decDeg));
  const sinDecStar = Math.sin(rad(event.decDeg));
  const [sunDirX, sunDirY, sunDirZ] = getSunDirectionInStarFrame(
    event.raDeg,
    event.decDeg,
    event.t0Ms,
  );

  return terminatorPolygonLonLat({
    dirX: -sunDirX,
    dirY: -sunDirY,
    dirZ: -sunDirZ,
    cosDecStar,
    sinDecStar,
    dtimeDays: 0,
    lstDeg,
    raStarDeg: event.raDeg,
    centerLonDeg,
  });
}

/**
 * Circunstâncias locais em um ponto clicado. Port simplificado de onMapClick (opmap.js L426).
 * @param {object} params
 * @param {number} params.clickLonDeg
 * @param {number} params.clickLatDeg
 * @param {number} params.mapCenterLonRad lo00
 * @param {number} params.mapCenterLatRad la00
 * @param {number} params.shadowOriginX x0 (raios terrestres)
 * @param {number} params.shadowOriginY y0
 * @param {number} params.shadowVelX xp
 * @param {number} params.shadowVelY yp
 * @param {number} params.bodyRadiusEarthRadii rap
 * @param {number} params.penumbraRadiusEarthRadii rap2
 * @param {number} params.uncertaintyEarthRadii sigdist
 * @param {number} params.cosDecStar cdel
 * @param {number} params.sinDecStar sdel
 * @param {number} params.sunDirX sx
 * @param {number} params.sunDirY sy
 * @param {number} params.sunDirZ sz
 * @param {number} [params.moonDirX]
 * @param {number} [params.moonDirY]
 * @param {number} [params.moonDirZ]
 * @returns {object}
 */
export function localCircumstances({
  clickLonDeg,
  clickLatDeg,
  mapCenterLonRad,
  mapCenterLatRad,
  shadowOriginX,
  shadowOriginY,
  shadowVelX,
  shadowVelY,
  bodyRadiusEarthRadii,
  penumbraRadiusEarthRadii = 0,
  uncertaintyEarthRadii,
  cosDecStar,
  sinDecStar,
  sunDirX,
  sunDirY,
  sunDirZ,
  moonDirX = 0,
  moonDirY = 0,
  moonDirZ = 0,
}) {
  const clickLonRad = rad(clickLonDeg);
  const clickLatRad = rad(clickLatDeg);

  let mapLonRad = mapCenterLonRad;
  const mapLatRad = mapCenterLatRad;
  let dtimeDays = 0;
  let clickLonIterRad = clickLonRad;
  let clickLatIterRad = clickLatRad;

  const shadowSpeedNorm = Math.sqrt(shadowVelX * shadowVelX + shadowVelY * shadowVelY);

  let u = 0;
  let v = 0;
  let w = 0;
  let u1 = 0;
  let v1 = 0;
  let w1 = 0;

  for (let j = 0; j < 6; j++) {
    mapLonRad = mapCenterLonRad - W_EARTH * dtimeDays;
    const xyz = orthoproj(mapLonRad, mapLatRad, clickLonIterRad, clickLatIterRad);
    u = xyz[0];
    v = xyz[1];
    w = xyz[2];

    const deltaLonRad = clickLonIterRad - mapLonRad;
    const tanFlat = (1.0 - APF) * Math.tan(clickLatIterRad);
    const fLat = Math.atan(tanFlat);
    const cosFlat = Math.cos(fLat);
    const sinFlat = (1.0 - APF) * Math.sin(fLat);
    const latCorrectedRad = Math.atan2(sinFlat, cosFlat);

    u1 = Math.cos(latCorrectedRad) * Math.sin(deltaLonRad);
    v1 = Math.sin(latCorrectedRad) * Math.cos(mapLatRad)
      - Math.cos(latCorrectedRad) * Math.sin(mapLatRad) * Math.cos(deltaLonRad);
    w1 = Math.sin(latCorrectedRad) * Math.sin(mapLatRad)
      + Math.cos(latCorrectedRad) * Math.cos(mapLatRad) * Math.cos(deltaLonRad);

    dtimeDays = ((u - shadowOriginX) * shadowVelX + (v - shadowOriginY) * shadowVelY)
      / (shadowSpeedNorm * shadowSpeedNorm);
  }

  const dx = u - shadowOriginX;
  const dy = v - shadowOriginY;
  dtimeDays = (dx * shadowVelX + dy * shadowVelY) / (shadowSpeedNorm * shadowSpeedNorm);

  let perpendicularDistEarthRadii = Math.sqrt(
    (shadowOriginX - u + shadowVelX * dtimeDays) ** 2
    + (shadowOriginY - v + shadowVelY * dtimeDays) ** 2,
  );
  const crossZ = dx * shadowVelY - shadowVelX * dy;
  if (crossZ > 0.0) {
    perpendicularDistEarthRadii = -perpendicularDistEarthRadii;
  }

  const distanceKm = round1(perpendicularDistEarthRadii * R_EARTH_KM);

  let chordEarthRadii = 0;
  if (Math.abs(perpendicularDistEarthRadii) < bodyRadiusEarthRadii) {
    chordEarthRadii = Math.sqrt(
      bodyRadiusEarthRadii * bodyRadiusEarthRadii
      - perpendicularDistEarthRadii * perpendicularDistEarthRadii,
    );
  }
  const durationSec = chordEarthRadii > 0
    ? 2 * chordEarthRadii * 86400 / shadowSpeedNorm
    : null;

  let penumbraChordEarthRadii = 0;
  if (penumbraRadiusEarthRadii > 0
    && Math.abs(perpendicularDistEarthRadii) < penumbraRadiusEarthRadii) {
    penumbraChordEarthRadii = Math.sqrt(
      penumbraRadiusEarthRadii * penumbraRadiusEarthRadii
      - perpendicularDistEarthRadii * perpendicularDistEarthRadii,
    );
  }
  const penumbraDurationSec = penumbraChordEarthRadii > 0
    ? 2 * penumbraChordEarthRadii * 86400 / shadowSpeedNorm
    : null;

  const sunElevationDeg = deg(Math.asin(sunDirX * u1 + sunDirY * v1 + sunDirZ * w1));
  const starElevationDeg = deg(Math.asin(w1));
  const moonElevationDeg = deg(Math.asin(moonDirX * u1 + moonDirY * v1 + moonDirZ * w1));

  const deltaLonRad = clickLonIterRad - mapLonRad;
  const latCorrectedRad = Math.atan2(
    (1.0 - APF) * Math.sin(clickLatIterRad),
    Math.cos(clickLatIterRad),
  );
  const azNumerator = -cosDecStar * Math.sin(deltaLonRad);
  const azDenominator = sinDecStar * Math.cos(latCorrectedRad)
    - cosDecStar * Math.cos(deltaLonRad) * Math.sin(latCorrectedRad);
  const azimuthDeg = round1(deg(normalizeAngle2Pi(Math.atan2(azNumerator, azDenominator))));

  const bodyRadiusKm = bodyRadiusEarthRadii * R_EARTH_KM;
  const uncertaintyKm = uncertaintyEarthRadii * R_EARTH_KM;
  const probabilityPercent = uncertaintyKm > 0 && uncertaintyKm < 999 && bodyRadiusEarthRadii != null && bodyRadiusEarthRadii > 0
    ? occultationProbability(distanceKm, bodyRadiusKm, uncertaintyKm)
    : null;

  const penumbraRadiusKm = penumbraRadiusEarthRadii * R_EARTH_KM;
  const penumbraProbabilityPercent = penumbraRadiusKm > 0 && uncertaintyKm > 0 && uncertaintyKm < 999
    ? occultationProbability(distanceKm, penumbraRadiusKm, uncertaintyKm)
    : null;

  let twilight = 'night';
  if (sunElevationDeg > 0) {
    twilight = 'daylight';
  } else if (sunElevationDeg > -18) {
    twilight = 'twilight';
  }

  return {
    dtimeDays,
    distanceKm,
    durationSec: durationSec != null ? round1(durationSec) : null,
    penumbraDurationSec: penumbraDurationSec != null ? round1(penumbraDurationSec) : null,
    starElevationDeg: round1(starElevationDeg),
    sunElevationDeg: round1(sunElevationDeg),
    moonElevationDeg: round1(moonElevationDeg),
    azimuthDeg,
    probabilityPercent: probabilityPercent != null ? round1(probabilityPercent) : null,
    penumbraProbabilityPercent: penumbraProbabilityPercent != null
      ? round1(penumbraProbabilityPercent)
      : null,
    twilight,
    starAboveHorizon: w1 > 0,
  };
}
