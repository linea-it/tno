/**
 * Projeção geodésica ortográfica e rotinas SOFA/IAU.
 * orthoproj / orthoprojinv / rotateVector: via Lucky Star (function.js).
 * iauGd2gce / iauGc2gde: SOFA/IAU.
 */

import { APF, COFAP, W_EARTH } from './constants.js';
import { ORTHOPROJ_INV_MAX_ITERATIONS } from './limits.js';
import { deg, rad, normalizeLongitude } from './angles.js';

/**
 * Rotação de vetor 3D em torno de um eixo. [via Lucky Star]
 * @param {[number,number,number]} vector
 * @param {0|1|2} axis
 * @param {number} thetaRad
 * @returns {[number,number,number]}
 */
export function rotateVector(vector, axis, thetaRad) {
  const cosTheta = Math.cos(thetaRad);
  const sinTheta = Math.sin(thetaRad);
  const result = [0, 0, 0];
  const ic1 = (axis + 1) % 3;
  const ic2 = (axis + 2) % 3;
  result[ic1] = cosTheta * vector[ic1] + sinTheta * vector[ic2];
  result[ic2] = -sinTheta * vector[ic1] + cosTheta * vector[ic2];
  result[axis] = vector[axis];
  return result;
}

/**
 * Geodetic to geocentric (SOFA/IAU).
 * @param {number} semiMajorAxis
 * @param {number} flattening
 * @param {number} elongRad longitude em radianos
 * @param {number} phiRad latitude em radianos
 * @param {number} heightM altura em metros (normalizado: 0)
 * @returns {[number,number,number]}
 */
export function iauGd2gce(semiMajorAxis, flattening, elongRad, phiRad, heightM) {
  const sinPhi = Math.sin(phiRad);
  const cosPhi = Math.cos(phiRad);
  const w = (1.0 - flattening) * (1.0 - flattening);
  const d = cosPhi * cosPhi + w * sinPhi * sinPhi;
  const xyz = [0, 0, 0];
  if (d > 0.0) {
    const ac = semiMajorAxis / Math.sqrt(d);
    const as = w * ac;
    const r = (ac + heightM) * cosPhi;
    xyz[0] = r * Math.cos(elongRad);
    xyz[1] = r * Math.sin(elongRad);
    xyz[2] = (as + heightM) * sinPhi;
  }
  return xyz;
}

/**
 * Geocentric to geodetic (SOFA/IAU).
 * @param {number} semiMajorAxis
 * @param {number} flattening
 * @param {[number,number,number]} xyz
 * @returns {[number,number,number]} [elongRad, phiRad, height]
 */
export function iauGc2gde(semiMajorAxis, flattening, xyz) {
  const coord = [0, 0, 0];
  const aeps2 = semiMajorAxis * semiMajorAxis * 1e-16;
  const e2 = (2.0 - flattening) * flattening;
  const e4t = e2 * e2 * 1.5;
  const ec2 = 1.0 - e2;
  const ec = Math.sqrt(ec2);
  const b = semiMajorAxis * ec;

  const x = xyz[0];
  const y = xyz[1];
  const z = xyz[2];
  const p2 = x * x + y * y;

  let elongRad = (p2 > 0.0) ? Math.atan2(y, x) : 0.0;
  const absZ = Math.abs(z);

  if (p2 > aeps2) {
    const p = Math.sqrt(p2);
    const s0 = absZ / semiMajorAxis;
    const pn = p / semiMajorAxis;
    const zc = ec * s0;
    const c0 = ec * pn;
    const c02 = c0 * c0;
    const c03 = c02 * c0;
    const s02 = s0 * s0;
    const s03 = s02 * s0;
    const a02 = c02 + s02;
    const a0 = Math.sqrt(a02);
    const a03 = a02 * a0;
    const d0 = zc * a03 + e2 * s03;
    const f0 = pn * a03 - e2 * c03;
    const b0 = e4t * s02 * c02 * pn * (a0 - ec);
    const s1 = d0 * f0 - b0 * s0;
    const cc = ec * (f0 * f0 - b0 * c0);
    const phiRad = Math.atan(s1 / cc);
    const s12 = s1 * s1;
    const cc2 = cc * cc;
    const height = (p * cc + absZ * s1 - semiMajorAxis * Math.sqrt(ec2 * s12 + cc2)) / Math.sqrt(s12 + cc2);
    coord[0] = elongRad;
    coord[1] = phiRad;
    coord[2] = height;
  } else {
    coord[0] = elongRad;
    coord[1] = Math.PI * 0.5;
    coord[2] = absZ - b;
  }

  if (z < 0.0) coord[1] = -coord[1];
  return coord;
}

/**
 * Projeção ortográfica direta. [via Lucky Star]
 * @returns {[number,number,number,number]} [x, y, z, flag]
 */
export function orthoproj(centerLonRad, centerLatRad, lonRad, latRad) {
  const xyz = iauGd2gce(1.0, APF, lonRad, latRad, 0.0);
  const u = rotateVector(xyz, 2, centerLonRad);
  const v = rotateVector(u, 1, -centerLatRad);
  return [v[1], v[2], v[0], 1];
}

/**
 * Projeção ortográfica inversa com refinamento iterativo. [via Lucky Star]
 * @param {number} centerLonRad
 * @param {number} centerLatRad
 * @param {number} xNorm coordenada x normalizada (raios terrestres)
 * @param {number} yNorm coordenada y normalizada (raios terrestres)
 * @returns {{ lonDeg: number, latDeg: number } | null}
 */
export function orthoprojinv(centerLonRad, centerLatRad, xNorm, yNorm) {
  const b2 = 1.0 + (APF * APF - 2 * APF) * Math.pow(Math.cos(centerLatRad), 2);
  const r2 = Math.sqrt(xNorm * xNorm + yNorm * yNorm / b2);

  if (r2 > 1.0) return null;

  const cc = Math.sqrt(1.0 - xNorm * xNorm - yNorm * yNorm);
  let v = [cc, xNorm, yNorm];
  let u = rotateVector(v, 1, centerLatRad);
  let xyz = rotateVector(u, 2, -centerLonRad);
  let ncoord = iauGc2gde(1.0, APF, xyz);
  let lonRad = ncoord[0];
  let latRad = ncoord[1];
  let height = ncoord[2];

  // Refinamento iterativo — decisão estrutural do algoritmo Lucky Star
  let iteration = 0;
  while (Math.abs(height) > 1e-10 && iteration < ORTHOPROJ_INV_MAX_ITERATIONS) {
    iteration++;
    const projectedPoint = orthoproj(centerLonRad, centerLatRad, lonRad, latRad);
    v[0] = projectedPoint[2];
    v[1] = xNorm;
    v[2] = yNorm;
    u = rotateVector(v, 1, centerLatRad);
    xyz = rotateVector(u, 2, -centerLonRad);
    ncoord = iauGc2gde(1.0, APF, xyz);
    lonRad = ncoord[0];
    latRad = ncoord[1];
    height = ncoord[2];
  }

  let lonDeg = deg(lonRad);
  lonDeg = normalizeLongitude(lonDeg);

  return { lonDeg, latDeg: deg(latRad) };
}

/**
 * Direção celeste → sub-ponto na Terra no frame da estrela. [via Lucky Star CoordsOBJ]
 * @returns {[number, number]} [lonDeg, latDeg]
 */
export function coordsObj(dirX, dirY, dirZ, raStarDeg, decStarDeg, lstDeg, dtimeDays = 0) {
  const cosDecStar = Math.cos(rad(decStarDeg));
  const sinDecStar = Math.sin(rad(decStarDeg));
  const sinPhi = dirY * cosDecStar + dirZ * sinDecStar;
  const cosPhi = -dirY * sinDecStar + dirZ * cosDecStar;
  const headingRad = Math.atan2(dirX, cosPhi) - rad(lstDeg) + rad(raStarDeg) - W_EARTH * dtimeDays;
  const latRad = Math.asin(Math.max(-1, Math.min(1, sinPhi)));
  const latGeodeticDeg = deg(Math.atan(Math.tan(latRad) * COFAP));
  return [normalizeLongitude(deg(headingRad)), latGeodeticDeg];
}

export function normalizeUnitVector(vector) {
  const norm = Math.hypot(vector[0], vector[1], vector[2]);
  if (norm < 1e-15) return [0, 0, 1];
  return [vector[0] / norm, vector[1] / norm, vector[2] / norm];
}

/**
 * Inversa de coordsObj: vetor unitário para um sub-ponto alvo. [via occ_map_params.py]
 * @returns {[number, number, number]}
 */
export function fitDirectionToCoords(
  targetLonDeg,
  targetLatDeg,
  raStarDeg,
  decStarDeg,
  lstDeg,
) {
  const alphaRad = rad(targetLonDeg - raStarDeg + lstDeg);
  const geocentricLatRad = Math.atan(Math.tan(rad(targetLatDeg)) / COFAP);
  const sinPhi = Math.sin(geocentricLatRad);
  const cosPhi = Math.cos(geocentricLatRad);
  const sinDecStar = Math.sin(rad(decStarDeg));
  const cosDecStar = Math.cos(rad(decStarDeg));
  const localY = cosPhi * Math.cos(alphaRad);

  return normalizeUnitVector([
    cosPhi * Math.sin(alphaRad),
    sinPhi * cosDecStar - localY * sinDecStar,
    sinPhi * sinDecStar + localY * cosDecStar,
  ]);
}
