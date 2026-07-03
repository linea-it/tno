/**
 * Tempo sideral e sub-ponto da estrela na Terra.
 */

import { W_EARTH, TROPICAL_YEAR_MS } from './constants.js';
import { rad, normalizeLongitude } from './angles.js';
import { fitDirectionToCoords } from './geodesy.js';

/**
 * Greenwich Sidereal Time em graus.
 * @param {Date} date
 * @returns {number} graus
 */
export function calculateGST(date) {
  const julianDate = (date.getTime() / 86400000) + 2440587.5;
  const d = julianDate - 2451545.0;
  const gmst = 18.697374558 + 24.06570982441908 * d;
  return (gmst % 24) * 15;
}

/**
 * RA/Dec da estrela em t, com PM Gaia (mas/ano).
 * @param {number} raDeg
 * @param {number} decDeg
 * @param {number} tMs
 * @param {number} tRefMs
 * @param {number} [pmraMasYr=0]
 * @param {number} [pmdecMasYr=0]
 * @returns {{ raDeg: number, decDeg: number }}
 */
export function getStarCoordsAtTime(raDeg, decDeg, tMs, tRefMs, pmraMasYr = 0, pmdecMasYr = 0) {
  const dtYr = (tMs - tRefMs) / TROPICAL_YEAR_MS;
  const cosDec = Math.cos(rad(decDeg));
  const raAtT = raDeg + (pmraMasYr * dtYr) / (3600000 * Math.max(Math.abs(cosDec), 1e-6));
  const decAtT = decDeg + (pmdecMasYr * dtYr) / 3600000;
  return { raDeg: raAtT, decDeg: decAtT };
}

/**
 * Longitude/latitude do sub-ponto da estrela na Terra.
 * @param {number} raDeg ascensão reta em graus (em tRefMs)
 * @param {number} decDeg declinação em graus (em tRefMs)
 * @param {number} tMs epoch em milissegundos
 * @param {number} t0Ms epoch de referência em milissegundos
 * @param {number} [pmraMasYr=0] mas/ano
 * @param {number} [pmdecMasYr=0] mas/ano
 * @returns {[number, number]} [subEarthLonDeg, subEarthLatDeg]
 */
export function getStarSubEarthPoint(raDeg, decDeg, tMs, t0Ms, pmraMasYr = 0, pmdecMasYr = 0) {
  const star = getStarCoordsAtTime(raDeg, decDeg, tMs, t0Ms, pmraMasYr, pmdecMasYr);
  const lstAtT0Deg = calculateGST(new Date(t0Ms));
  const tDays = (tMs - t0Ms) / (86400 * 1000);
  // NOTE: termo W_EARTH replicado de function.js; nao alterar unidade.
  let subEarthLonDeg = star.raDeg - lstAtT0Deg - tDays * W_EARTH;
  subEarthLonDeg = normalizeLongitude(subEarthLonDeg);
  return [subEarthLonDeg, star.decDeg];
}

/**
 * Posição equatorial aproximada do Sol (Meeus simplificado).
 * @param {Date} date
 * @returns {{ raDeg: number, decDeg: number }}
 */
export function sunRaDecDeg(date) {
  const julianDate = (date.getTime() / 86400000) + 2440587.5;
  const centuries = (julianDate - 2451545.0) / 36525;
  const meanLongitudeDeg = (280.46646 + 36000.76983 * centuries) % 360;
  const meanAnomalyRad = (357.52911 + 35999.05029 * centuries) * Math.PI / 180;
  const equationOfCenterDeg = (1.914602 - 0.004817 * centuries) * Math.sin(meanAnomalyRad)
    + (0.019993 - 0.000101 * centuries) * Math.sin(2 * meanAnomalyRad)
    + 0.000289 * Math.sin(3 * meanAnomalyRad);
  const sunLongitudeDeg = meanLongitudeDeg + equationOfCenterDeg;
  const obliquityDeg = 23.439291 - 0.0130042 * centuries;
  const sunLongitudeRad = sunLongitudeDeg * Math.PI / 180;
  const obliquityRad = obliquityDeg * Math.PI / 180;
  const raRad = Math.atan2(
    Math.cos(obliquityRad) * Math.sin(sunLongitudeRad),
    Math.cos(sunLongitudeRad),
  );
  const decRad = Math.asin(Math.sin(obliquityRad) * Math.sin(sunLongitudeRad));
  const raDeg = (raRad * 180 / Math.PI + 360) % 360;
  return { raDeg, decDeg: decRad * 180 / Math.PI };
}

/**
 * Vetor unitário do Sol no frame local da estrela (sx, sy, sz do Lucky Star).
 * @param {number} raStarDeg
 * @param {number} decStarDeg
 * @param {number} tMs
 * @returns {[number, number, number]}
 */
export function getSunDirectionInStarFrame(raStarDeg, decStarDeg, tMs) {
  const date = new Date(tMs);
  const lstDeg = calculateGST(date);
  const { raDeg, decDeg } = sunRaDecDeg(date);
  const sunSubEarthLonDeg = normalizeLongitude(raDeg - lstDeg);
  return fitDirectionToCoords(sunSubEarthLonDeg, decDeg, raStarDeg, decStarDeg, lstDeg);
}

/**
 * Posicao equatorial aproximada da Lua (Meeus, Astronomical Algorithms, Cap. 47).
 * Precisao: ~10' em longitude, ~4' em latitude — suficiente para calculo de elevacao.
 * @param {Date} date
 * @returns {{ raDeg: number, decDeg: number }}
 */
export function moonRaDecDeg(date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const t = (jd - 2451545.0) / 36525;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const lp = toRad((218.3164591 + 481267.88134236 * t) % 360);
  const d = toRad((297.8502042 + 445267.1115168 * t) % 360);
  const m = toRad((357.5291092 + 35999.0502909 * t) % 360);
  const mp = toRad((134.9634114 + 477198.8676313 * t) % 360);
  const f = toRad((93.2720993 + 483202.0175273 * t) % 360);
  const a1 = toRad((119.75 + 131.849 * t) % 360);
  const a2 = toRad((53.09 + 479264.290 * t) % 360);

  const e = 1 - 0.002516 * t - 0.0000074 * t * t;

  let sumLon = 6288774 * Math.sin(mp)
    + 1274027 * Math.sin(2 * d - mp)
    + 658314 * Math.sin(2 * d)
    + 213618 * Math.sin(2 * mp)
    - 185116 * e * Math.sin(m)
    - 114332 * Math.sin(2 * f)
    + 58793 * Math.sin(2 * (d - mp))
    + 57066 * e * Math.sin(2 * d - m - mp)
    + 53322 * Math.sin(2 * d + mp)
    + 45758 * e * Math.sin(2 * d - m)
    - 40923 * e * Math.sin(m - mp)
    - 34720 * Math.sin(d)
    - 30383 * e * Math.sin(m + mp)
    + 15327 * Math.sin(2 * (d - f))
    - 12528 * Math.sin(mp + 2 * f)
    + 10980 * Math.sin(mp - 2 * f)
    + 10675 * Math.sin(4 * d - mp)
    + 10034 * Math.sin(3 * mp)
    + 8548 * Math.sin(4 * d - 2 * mp)
    - 7888 * e * Math.sin(2 * d + m - mp)
    - 6766 * e * Math.sin(2 * d + m)
    - 5163 * Math.sin(d - mp)
    + 4987 * e * Math.sin(d + m)
    + 4036 * e * Math.sin(2 * d - m + mp)
    + 3994 * Math.sin(2 * (d + mp))
    + 3861 * Math.sin(4 * d)
    + 3665 * Math.sin(2 * d - 3 * mp)
    - 2689 * e * Math.sin(m - 2 * mp)
    - 2602 * Math.sin(2 * d - mp + 2 * f)
    + 2390 * e * Math.sin(2 * d - m - 2 * mp)
    - 2348 * Math.sin(d + mp)
    + 2236 * e * e * Math.sin(2 * d - 2 * m)
    - 2120 * e * Math.sin(m + 2 * mp)
    - 2069 * e * e * Math.sin(2 * m)
    + 2048 * e * e * Math.sin(4 * d - 2 * m - mp)
    - 1773 * Math.sin(2 * d + mp - 2 * f)
    - 1595 * Math.sin(2 * f + 2 * d)
    + 1215 * e * Math.sin(4 * d - m - mp)
    - 1110 * Math.sin(2 * mp + 2 * f)
    - 892 * Math.sin(3 * d - mp)
    - 810 * e * Math.sin(2 * d + m + mp)
    + 759 * e * Math.sin(4 * d - m - 2 * mp)
    - 713 * e * e * Math.sin(2 * m - mp)
    - 700 * e * e * Math.sin(2 * d + 2 * m - mp)
    + 691 * e * Math.sin(2 * d + m - 2 * mp)
    + 596 * e * Math.sin(2 * d - m - 2 * f)
    + 549 * Math.sin(4 * d + mp)
    + 537 * Math.sin(4 * mp)
    + 520 * e * Math.sin(4 * d - m)
    - 487 * Math.sin(d - 2 * mp)
    - 399 * e * Math.sin(2 * d + m - 2 * f)
    - 381 * Math.sin(2 * mp - 2 * f)
    + 351 * e * Math.sin(d + m + mp)
    - 340 * Math.sin(3 * d - 2 * mp)
    + 330 * Math.sin(4 * d - 3 * mp)
    + 327 * e * Math.sin(2 * d - m + 2 * mp)
    - 323 * e * Math.sin(2 * m + mp)
    + 299 * e * Math.sin(d + m - mp)
    + 294 * Math.sin(2 * d + 3 * mp)
    + 284 * e * Math.sin(2 * a1)
    + 283 * e * Math.sin(2 * a2);

  let sumLat = 5128122 * Math.sin(f)
    + 280602 * Math.sin(mp + f)
    + 277693 * Math.sin(mp - f)
    + 173237 * Math.sin(2 * d - f)
    + 55413 * Math.sin(2 * d - mp + f)
    + 46271 * Math.sin(2 * d - mp - f)
    + 32573 * Math.sin(2 * d + f)
    + 17198 * Math.sin(2 * mp + f)
    + 9266 * Math.sin(2 * d + mp - f)
    + 8822 * Math.sin(2 * mp - f)
    + 8216 * Math.sin(2 * d - m - f)
    + 4324 * Math.sin(2 * d - 2 * mp - f)
    + 4200 * Math.sin(2 * d + mp + f)
    - 3359 * e * Math.sin(2 * d + m - f)
    + 2463 * e * Math.sin(2 * d - m - mp + f)
    + 2211 * e * Math.sin(2 * d - m + f)
    + 2065 * e * Math.sin(2 * d - m - mp - f)
    - 1870 * e * Math.sin(m - mp - f)
    + 1828 * Math.sin(4 * d - mp - f)
    - 1794 * e * Math.sin(m + f)
    - 1749 * Math.sin(3 * f)
    - 1565 * e * Math.sin(m - mp + f)
    - 1491 * Math.sin(d + f)
    - 1475 * e * Math.sin(m + mp + f)
    - 1410 * e * Math.sin(m + mp - f)
    - 1344 * e * Math.sin(m - f)
    - 1335 * Math.sin(d - f)
    + 1107 * Math.sin(3 * mp + f)
    + 1021 * Math.sin(4 * d - f)
    + 833 * Math.sin(4 * d - mp + f)
    + 777 * Math.sin(mp - 3 * f)
    + 671 * Math.sin(4 * d - 2 * mp + f)
    + 607 * Math.sin(2 * d - 3 * f)
    + 596 * Math.sin(2 * d + 2 * mp - f)
    + 491 * e * Math.sin(2 * d - m + mp - f)
    - 451 * Math.sin(2 * d - 2 * mp - f)
    + 439 * Math.sin(3 * mp - f)
    + 422 * Math.sin(2 * d + 2 * mp + f)
    + 421 * Math.sin(2 * d - 3 * mp - f)
    - 366 * e * Math.sin(2 * d + m - mp + f)
    - 351 * e * Math.sin(2 * d + m + f)
    + 331 * Math.sin(4 * d + f)
    + 315 * e * Math.sin(2 * d - m + mp + f)
    + 302 * e * e * Math.sin(2 * d - 2 * m - f)
    - 283 * Math.sin(mp + 3 * f)
    - 229 * e * Math.sin(2 * d + m + mp - f)
    + 223 * e * Math.sin(d + m - f)
    + 223 * e * Math.sin(d + m + f)
    - 220 * e * Math.sin(m - 2 * mp - f)
    - 220 * e * Math.sin(2 * d + m - mp - f)
    - 185 * Math.sin(d + mp + f)
    + 181 * e * Math.sin(2 * d - m - 2 * mp - f)
    - 177 * e * Math.sin(m + 2 * mp + f)
    + 176 * Math.sin(4 * d - 2 * mp - f)
    + 166 * e * Math.sin(4 * d - m - mp - f)
    - 164 * Math.sin(d + mp - f)
    + 132 * Math.sin(4 * d + mp - f)
    - 119 * Math.sin(d - mp - f)
    + 115 * e * Math.sin(4 * d - m - f)
    + 107 * e * e * Math.sin(2 * d - 2 * m + f);

  const lonDeg = (lp * 180 / Math.PI + sumLon / 1000000 + 0.00417 * Math.sin(a1) + 0.00402 * Math.sin(a2)) % 360;
  const latDeg = sumLat / 1000000;

  const obliquityDeg = 23.439291 - 0.0130042 * t;
  const obliquityRad = toRad(obliquityDeg);
  const lonRad = toRad(lonDeg);
  const latRad = toRad(latDeg);

  const raRad = Math.atan2(
    Math.cos(obliquityRad) * Math.sin(lonRad) - Math.sin(obliquityRad) * Math.tan(latRad),
    Math.cos(lonRad),
  );
  const decRad = Math.asin(
    Math.sin(obliquityRad) * Math.cos(latRad) * Math.sin(lonRad) + Math.cos(obliquityRad) * Math.sin(latRad),
  );

  return { raDeg: (raRad * 180 / Math.PI + 360) % 360, decDeg: decRad * 180 / Math.PI };
}

/**
 * Vetor unitario da Lua no frame local da estrela.
 * @param {number} raStarDeg
 * @param {number} decStarDeg
 * @param {number} tMs
 * @returns {[number, number, number]}
 */
export function getMoonDirectionInStarFrame(raStarDeg, decStarDeg, tMs) {
  const date = new Date(tMs);
  const lstDeg = calculateGST(date);
  const { raDeg, decDeg } = moonRaDecDeg(date);
  const moonSubEarthLonDeg = normalizeLongitude(raDeg - lstDeg);
  return fitDirectionToCoords(moonSubEarthLonDeg, decDeg, raStarDeg, decStarDeg, lstDeg);
}
