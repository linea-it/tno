/**
 * Estatísticas para probabilidade de ocultação.
 * fctrep: CDF normal (Abramowitz & Stegun).
 * occultationProbability: uso via Lucky Star (opmap.js onMapClick).
 */

/**
 * Aproximação da função de repartição da normal padrão. [Abramowitz & Stegun]
 * @param {number} x
 * @returns {number}
 */
export function fctrep(x) {
  const varp = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const varx = Math.abs(x);
  const vart = 1.0 / (1.0 + varp * varx);
  let f = 1.0 - 1.0 / Math.sqrt(2 * Math.PI) * Math.exp(-0.5 * varx * varx)
    * (b1 * vart + b2 * Math.pow(vart, 2) + b3 * Math.pow(vart, 3)
      + b4 * Math.pow(vart, 4) + b5 * Math.pow(vart, 5));
  if (x < 0) f = 1.0 - f;
  return f;
}

/**
 * Probabilidade de ocultação dado distância ao eixo, raio e sigma. [uso via Lucky Star]
 * @param {number} distanceKm distância perpendicular ao eixo central em km
 * @param {number} radiusKm raio da sombra em km
 * @param {number} sigmaKm incerteza em km
 * @returns {number} percentual 0-100
 */
export function occultationProbability(distanceKm, radiusKm, sigmaKm) {
  if (sigmaKm <= 0) return 0;
  const x1 = (Math.abs(distanceKm) + radiusKm) / sigmaKm;
  const x2 = (Math.abs(distanceKm) - radiusKm) / sigmaKm;
  return (fctrep(x1) - fctrep(x2)) * 100;
}
