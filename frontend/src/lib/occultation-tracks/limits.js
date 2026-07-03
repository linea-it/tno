/**
 * Limites operacionais do módulo occultation-tracks.
 * Constantes de tuning que afetam tradeoffs qualidade vs performance.
 * Todas são export const — sem estado global mutável.
 * Funções consumidoras aceitam overrides via `options`.
 *
 * AUMENTAR estes valores = mais qualidade visual, risco de travar a thread principal.
 * DIMINUIR = mais performance, menos precisão visual.
 */

/** Número máximo de amostras em paths (central, corpo, incerteza). */
export const MAX_PATH_SAMPLES = 5000;

/** Passo em pixels para amostragem de fração noturna no disco ortográfico. */
export const NIGHT_FRACTION_SAMPLE_STEP = 8;

/** Número máximo absoluto de amostras para fração noturna. */
export const NIGHT_FRACTION_MAX_SAMPLES = 5000;

/** Máximo de entradas no cache de camada do globo (LRU). */
export const GLOBE_LAYER_CACHE_MAX_ENTRIES = 100;

/** Máximo de iterações no refinamento de orthoprojinv. */
export const ORTHOPROJ_INV_MAX_ITERATIONS = 100;

/** Número de passos na amostragem do terminador dia/noite. */
export const TERMINATOR_STEPS = 360;

/** Número de passos na amostragem do limbo do disco para regiões dia/noite. */
export const DISK_BOUNDARY_STEPS = 720;

/** Passo em graus para amostragem de meridianos e paralelos no graticule. */
export const GRATICULE_SAMPLE_STEP_DEG = 2;
