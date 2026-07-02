/**
 * occultation-tracks — API pública.
 * Cálculo de faixas de ocultação estelar no browser (agnóstico).
 */

export {
  AU_KM,
  R_EARTH_KM,
  APF,
  COFAP,
  W_EARTH,
  DEFAULT_SAMPLES,
  MAS_TO_RAD,
  MAS_TO_ARCSEC,
  PATH_HALF_WINDOW_STEPS,
  TROPICAL_YEAR_MS,
  MIN_CENTRAL_MARKER_DIAMETER_PX,
} from './constants.js';

export {
  MAX_PATH_SAMPLES,
  NIGHT_FRACTION_SAMPLE_STEP,
  NIGHT_FRACTION_MAX_SAMPLES,
  GLOBE_LAYER_CACHE_MAX_ENTRIES,
  ORTHOPROJ_INV_MAX_ITERATIONS,
  TERMINATOR_STEPS,
  DISK_BOUNDARY_STEPS,
  GRATICULE_SAMPLE_STEP_DEG,
} from './limits.js';

export {
  rad,
  deg,
  clamp,
  normalizeLongitude,
  normalizeLongitudeAround,
  normalizeAnglePi,
  normalizeAngle2Pi,
  normalizePositionAngle,
  round0,
  round1,
  round2,
  formatTwoDigits,
} from './angles.js';

export {
  rotateVector,
  iauGd2gce,
  iauGc2gde,
  orthoproj,
  orthoprojinv,
  coordsObj,
  fitDirectionToCoords,
  normalizeUnitVector,
} from './geodesy.js';

export {
  calculateGST,
  getStarCoordsAtTime,
  getStarSubEarthPoint,
  sunRaDecDeg,
  getSunDirectionInStarFrame,
  moonRaDecDeg,
  getMoonDirectionInStarFrame,
} from './time.js';

export {
  getNumericEventValue,
  getStringEventValue,
  applyPredictionOffsets,
  resolveMaxTimeSec,
  resolveErrorDistKm,
  normalizeOccultationEvent,
  validateOccultationEvent,
} from './event.js';

export {
  calculateArcCoordinates,
  getPositionAtTime,
  generateTimeSamples,
  handleLongitudeDiscontinuities,
  generateOccultationPath,
  generateOffsetPath,
  generateShadowPlanePath,
  generateShadowPlaneBodyLimits,
  generateShadowPlaneUncertaintyLimits,
  generateShadowPlaneCentralPoint,
  shadowPlaneVelocityMetersPerSec,
  extendArcLineToEarthLimb,
  generateBodyLimits,
  generateUncertaintyLimits,
  generateCentralPoint,
} from './geometry.js';

export {
  fctrep,
  occultationProbability,
} from './statistics.js';

export {
  createShadowPlaneView,
  projectArcMetersToSvg,
  projectShadowPlanePathToSvg,
  lonLatDegToArcMeters,
  projectLatLonPolygonToSvg,
  buildSvgPolygonPath,
  buildGlobeDiskPath,
  buildGlobeDiskCircle,
  buildGlobeDayNightPaths,
  createThumbnailView,
  projectLonLatToSvg,
  projectLonLatToGlobeSvg,
  isLonLatOnNearHemisphere,
  projectGlobeLonLatPathToSvg,
  projectPathToSvg,
  buildSvgPath,
} from './view2d.js';

export { buildThumbnailGeometry } from './thumbnail.js';
export { buildGlobeLayer, clearGlobeLayerCache } from './globeLayer.js';

export {
  terminatorPolygon,
  terminatorPolygonLonLat,
  generateNightTerminatorPolygon,
  localCircumstances,
} from './localCircumstances.js';

/**
 * Paleta padrão de ocultações (estilo SORA/classico).
 * - Linha central: azul (#3333ff)
 * - Limites de incerteza: vermelho (#ff3333) tracejado
 * - Limites do corpo: azul claro (#9999ff)
 */
export const mapPalette = {
  ocean: '#B8D8F8',
  land: '#ECEFF1',

  day: '#FFFFFF',
  dayOpacity: 0.15,

  twilight: '#455A64',
  twilightOpacity: 0.30,

  night: '#000000',
  nightOpacity: 0.26,

  globeBorder: '#5E97F6',
  globeBorderWidth: 0.25,

  borders: '#90A4AE',
  bordersOpacity: 0.30,
  bordersWidth: 0.35,

  graticule: '#37474F',
  graticuleOpacity: 0.20,
  graticuleWidth: 0.35,

  centerLine: 'rgb(0, 70, 141)',
  centerLineWidth: 1.0,

  bodyLimit: 'rgb(0, 70, 141)',
  bodyLimitWidth: 0.25,

  uncertainty: 'rgb(255, 51, 51)',
  uncertaintyWidth: 0.25,
  uncertaintyDash: '0.25',

  eventPoint: 'rgb(0, 70, 141)',
  eventPointStroke: 'rgb(0, 70, 141)',
  eventPointStrokeWidth: 0.00,
};
