/**
 * Utilitários angulares e de formatação numérica.
 */

/**
 * @param {number} degrees
 * @returns {number} radianos
 */
export function rad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * @param {number} radians
 * @returns {number} graus
 */
export function deg(radians) {
  return radians * 180 / Math.PI;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Normaliza longitude para [-180, 180] graus.
 * @param {number} lonDeg
 * @returns {number}
 */
export function normalizeLongitude(lonDeg) {
  let lon = lonDeg;
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  return lon;
}

/**
 * Traz lonDeg para a janela de ±180° em torno de centerLonDeg (equivalente a rangelon).
 * @param {number} lonDeg
 * @param {number} centerLonDeg
 * @returns {number}
 */
export function normalizeLongitudeAround(lonDeg, centerLonDeg) {
  const centerRad = rad(centerLonDeg);
  let lonRad = rad(lonDeg);
  while (lonRad > Math.PI + centerRad) {
    lonRad -= 2 * Math.PI;
  }
  while (lonRad < centerRad - Math.PI) {
    lonRad += 2 * Math.PI;
  }
  return deg(lonRad);
}

/**
 * @param {number} angleRad
 * @returns {number} ângulo em [-π, π]
 */
export function normalizeAnglePi(angleRad) {
  let angle = angleRad;
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

/**
 * @param {number} angleRad
 * @returns {number} ângulo em [0, 2π)
 */
export function normalizeAngle2Pi(angleRad) {
  let angle = angleRad;
  while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
  while (angle < 0) angle += 2 * Math.PI;
  return angle;
}

/**
 * Ajusta ângulo de posição para o ramo usado no movimento da sombra.
 * Copiado de Physics.calculatePositionAngle (function.js).
 * @param {number} paDeg graus
 * @returns {number} graus
 */
export function normalizePositionAngle(paDeg) {
  const paRad = rad(paDeg);
  if (paRad > Math.PI / 2) {
    return deg(paRad - Math.PI);
  }
  if (paRad < -Math.PI / 2) {
    return deg(paRad + Math.PI);
  }
  return paDeg;
}

/** @param {number} value @returns {number} */
export function round0(value) {
  return Math.round(value);
}

/** @param {number} value @returns {number} */
export function round1(value) {
  return Math.round(value * 10) / 10;
}

/** @param {number} value @returns {number} */
export function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * @param {number} value
 * @returns {string} dois dígitos com zero à esquerda se necessário
 */
export function formatTwoDigits(value) {
  const intVal = Math.floor(value);
  return intVal > 9 ? String(intVal) : '0' + intVal;
}
