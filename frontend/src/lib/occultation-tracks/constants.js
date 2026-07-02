/** Constantes físicas e defaults do módulo occultation-tracks. */

/** Distância astronômica em km (function.js Physics.AU). */
export const AU_KM = 149597870.7;

/** Raio equatorial da Terra em km (function.js EARTH_RADIUS_KM). */
export const R_EARTH_KM = 6378.137;

/** Achatamento (flattening) do elipsoide de referência. */
export const APF = 0.003352810665;

/** Fator de correção geodética derivado de APF. */
export const COFAP = 1.0 / Math.pow(1.0 - APF, 2);

/** Velocidade angular da Terra em rad/dia (function.js Physics.w_earth). */
export const W_EARTH = 6.300387486749;

/** Amostras padrão do path (ímpar => inclui t0 no meio). */
export const DEFAULT_SAMPLES = 121;

/** mas → radianos (occ_map_params.py MAS_TO_RAD). */
export const MAS_TO_RAD = Math.PI / (180 * 3600 * 1000);

/** mas → arcsegundos. */
export const MAS_TO_ARCSEC = 1 / 1000;

/** Meio da janela em passos de predict_step (±5 min com step 60 s, como a API). */
export const PATH_HALF_WINDOW_STEPS = 5;

/** Diâmetro mínimo visível do marcador do instante central na thumbnail (px SVG). */
export const MIN_CENTRAL_MARKER_DIAMETER_PX = 4;

/** Ano tropical em ms (projeção PM). */
export const TROPICAL_YEAR_MS = 365.25 * 86400000;
