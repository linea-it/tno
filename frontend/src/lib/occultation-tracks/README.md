# occultation-tracks

Módulo JavaScript agnóstico (ES modules) que calcula a geometria das faixas (tracks) de ocultação estelar sobre a Terra. Zero dependências externas — sem React, D3, Leaflet, DOM ou `fetch` no core.

## Guia rápido para LLMs

Este módulo resolve dois problemas:

1. **Thumbnails em lista** — `buildThumbnailGeometry(rawEvent, options)` recebe um payload bruto da API e devolve geometria pronta para renderizar SVG (paths, pontos, layers). Use quando a tabela de eventos for carregada e precisar gerar miniaturas para cada linha.

2. **Dashboard em tempo real** — funções de baixo nível (`getPositionAtTime`, `generateShadowPlanePath`, `localCircumstances`) permitem plotar tracks sobre mapa interativo e calcular circunstâncias locais no clique.

O módulo **não renderiza SVG** — ele calcula coordenadas. O consumidor monta os elementos `<svg>`, `<canvas>`, Leaflet, Deck.gl, etc.

## Estrutura de arquivos

```
occultation-tracks/
├── index.js              # Barrel de exportação — importe daqui
├── constants.js           # Constantes físicas e defaults (AU_KM, R_EARTH_KM, etc.)
├── limits.js              # Limites operacionais de tuning (MAX_PATH_SAMPLES, cache, etc.)
├── angles.js              # Utilitários angulares: rad/deg, normalização, clamp, formatação
├── geodesy.js             # Projeção ortográfica SOFA/IAU, coordsObj, fitDirectionToCoords
├── time.js                # Tempo sideral (GST), sub-ponto da estrela, posição solar (Meeus)
├── event.js               # Normalização e validação de payload da API → modelo interno
├── geometry.js            # Cálculo da faixa de sombra: plano da sombra (metros) e lon/lat
├── view2d.js              # Projeção 2D → SVG: plano da sombra, globo ortográfico, dia/noite
├── statistics.js          # CDF normal (Abramowitz & Stegun), probabilidade de ocultação
├── thumbnail.js           # Montagem da geometria completa para miniatura SVG
├── globeLayer.js          # Camada base do globo: oceano, países, graticule (com cache LRU)
├── localCircumstances.js  # Terminador, polígono noturno, circunstâncias locais (Lucky Star)
├── package.json
├── data/
│   └── ne_110m_countries.json   # GeoJSON Natural Earth 110m (opcional, ~839 KB)
├── demo/
│   └── thumbnail.html           # Demo visual que carrega fixture ou API
└── __tests__/
    ├── core.test.mjs            # 19 testes com oráculo contra backend Astropy
    └── fixtures/
        ├── event.json           # BX12 (jmZgpRhws371uGGFXh3--w)
        ├── event-agni.json      # Agni (6p9v3C2EBzWY3gMdPS1YzQ)
        └── paths.json           # Oráculo: get_occultation_paths do backend
```

### O que cada arquivo faz e quando importar

| Arquivo | Responsabilidade | Quando usar |
|---------|-----------------|-------------|
| `index.js` | Re-exporta tudo. Único ponto de entrada. | **Sempre.** Não importe arquivos internos diretamente. |
| `constants.js` | `AU_KM`, `R_EARTH_KM`, `DEFAULT_SAMPLES`, `MAS_TO_RAD`, `MIN_CENTRAL_MARKER_DIAMETER_PX` etc. | Se precisar de constantes físicas ou defaults de amostragem. |
| `limits.js` | `MAX_PATH_SAMPLES`, `NIGHT_FRACTION_SAMPLE_STEP`, `GLOBE_LAYER_CACHE_MAX_ENTRIES` etc. | Se precisar ajustar tradeoffs qualidade vs performance. Override via `options` nas funções. |
| `angles.js` | `rad()`, `deg()`, `clamp()`, `normalizeLongitude()`, `normalizeAnglePi()`, `round1()`, `round2()` | Utilitários genéricos — use em qualquer contexto angular. |
| `geodesy.js` | `orthoproj()`, `orthoprojinv()`, `rotateVector()`, `iauGd2gce()`, `coordsObj()`, `fitDirectionToCoords()` | Projeção de coordenadas lon/lat ↔ plano da sombra. Interno ao módulo; raramente necessário direto. |
| `time.js` | `calculateGST()`, `getStarSubEarthPoint()`, `sunRaDecDeg()`, `getSunDirectionInStarFrame()` | Cálculos temporais. `getStarSubEarthPoint` é o centro da projeção. |
| `event.js` | `normalizeOccultationEvent()`, `validateOccultationEvent()` | **Sempre use.** Converte payload bruto da API no modelo interno estável. |
| `geometry.js` | `generateOccultationPath()`, `generateBodyLimits()`, `generateUncertaintyLimits()`, `generateCentralPoint()`, `generateShadowPlanePath()`, `getPositionAtTime()` | **Caso 1 (thumbnail):** `generateShadowPlanePath` + `generateShadowPlaneCentralPoint`. **Caso 2 (dashboard):** `getPositionAtTime` + `generateOccultationPath`. |
| `view2d.js` | `createShadowPlaneView()`, `projectArcMetersToSvg()`, `projectShadowPlanePathToSvg()`, `projectLonLatToGlobeSvg()`, `buildGlobeDayNightPaths()`, `buildSvgPath()`, `buildGlobeDiskPath()`, `buildGlobeDiskCircle()` | Projeção final → coordenadas SVG. `buildSvgPath` serializa segmentos em string `M... L...`. |
| `statistics.js` | `fctrep()`, `occultationProbability()` | CDF normal e probabilidade de ocultação (%). |
| `thumbnail.js` | `buildThumbnailGeometry()` | **Caso 1: entrada única.** Orquestra normalização → geometria → projeção → SVG. |
| `globeLayer.js` | `buildGlobeLayer()`, `clearGlobeLayerCache()` | Camada base: oceano, países (polígonos GeoJSON), graticule. Cache LRU com precisão configurável. |
| `localCircumstances.js` | `terminatorPolygon()`, `terminatorPolygonLonLat()`, `generateNightTerminatorPolygon()`, `localCircumstances()` | **Caso 2:** circunstâncias locais no clique do mapa, polígono do terminador. |

## Dois casos de uso

### Caso 1: Lista de thumbnails (frontend)

```js
import {
  buildThumbnailGeometry,
  buildSvgPath,
  mapPalette,
} from './occultation-tracks/index.js';
import countries from './occultation-tracks/data/ne_110m_countries.json' with { type: 'json' };

// event = mesma linha da tabela/API
const geometry = buildThumbnailGeometry(event, {
  width: 160,
  height: 100,
  countries,              // opcional — sem isso, só oceano + graticule
  computeNightFraction: false,  // false por padrão (evita amostragem pesada em lista)
});

if (!geometry.isDrawable) {
  console.warn('Evento inválido:', geometry.reasons);
  return;
}

// geometry contém:
//   geometry.centralPath        — segmentos SVG do caminho central
//   geometry.upperLimit         — limite superior do corpo
//   geometry.lowerLimit         — limite inferior do corpo
//   geometry.uncertaintyUpper   — barra de incerteza superior
//   geometry.uncertaintyLower   — barra de incerteza inferior
//   geometry.centralPoint       — { kind:'circle', x, y, r, lonDeg, latDeg, visible }
//   geometry.globe              — { cx, cy, r }
//   geometry.dayNight           — { dayFill, twilightFill, nightFill, nightFraction }
//   geometry.globeLayer         — { ocean, land, borders, graticule }
//   geometry.starSubEarth       — { lonDeg, latDeg } centro da projeção

// Monte o SVG (exemplo mínimo):
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', `0 0 ${geometry.view.width} ${geometry.view.height}`);

// Globo base
const ocean = document.createElementNS(svgNS, 'path');
ocean.setAttribute('d', geometry.globeLayer.ocean.path);
ocean.setAttribute('fill', mapPalette.ocean);
svg.appendChild(ocean);

// Tracks (recortadas no disco)
for (const segments of [geometry.centralPath, geometry.upperLimit, geometry.lowerLimit]) {
  for (const seg of segments) {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', buildSvgPath(seg));
    path.setAttribute('stroke', mapPalette.centerLine);
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
  }
}

// Ponto central
if (geometry.centralPoint.visible) {
  const dot = document.createElementNS(svgNS, 'circle');
  dot.setAttribute('cx', geometry.centralPoint.x);
  dot.setAttribute('cy', geometry.centralPoint.y);
  dot.setAttribute('r', geometry.centralPoint.r);
  dot.setAttribute('fill', mapPalette.eventPoint);
  svg.appendChild(dot);
}
```

### Caso 2: Dashboard em tempo real (mapa interativo)

```js
import {
  normalizeOccultationEvent,
  validateOccultationEvent,
  getPositionAtTime,
  generateOccultationPath,
  generateBodyLimits,
  generateUncertaintyLimits,
  generateCentralPoint,
  getStarSubEarthPoint,
  localCircumstances,
  occultationProbability,
} from './occultation-tracks/index.js';

// 1. Normaliza o evento uma vez
const event = normalizeOccultationEvent(rawPayload);
if (!validateOccultationEvent(event).ok) return;

// 2. Centro da projeção (sub-ponto da estrela em t0)
const [centerLon, centerLat] = getStarSubEarthPoint(
  event.raDeg, event.decDeg, event.t0Ms, event.t0Ms,
  event.pmraMasYr, event.pmdecMasYr,
);

// 3. Path central lon/lat para plotar no mapa (Leaflet, Deck.gl, etc.)
const centralPath = generateOccultationPath(event, { samples: 200 });
// centralPath = [[lonDeg, latDeg], ...]

const bodyLimits = generateBodyLimits(event, { samples: 200 });
// bodyLimits.upper, bodyLimits.lower

const uncertaintyLimits = generateUncertaintyLimits(event, { samples: 200 });
// uncertaintyLimits.upper, uncertaintyLimits.lower

const centralPoint = generateCentralPoint(event);
// [lonDeg, latDeg] | null

// 4. Posição da sombra em um instante arbitrário (animação)
const shadowPos = getPositionAtTime(event, someTimestampMs, radiusKmOffset);

// 5. Circunstâncias locais no clique do usuário
const circumstances = localCircumstances({
  clickLonDeg: clickedLon,
  clickLatDeg: clickedLat,
  mapCenterLonRad: rad(centerLon),
  mapCenterLatRad: rad(centerLat),
  shadowOriginX: /* shadowPlaneOriginX em raios terrestres */,
  shadowOriginY: /* shadowPlaneOriginY em raios terrestres */,
  shadowVelX: /* shadowPlaneVelX */,
  shadowVelY: /* shadowPlaneVelY */,
  bodyRadiusEarthRadii: event.shadowDiameterKm / 2 / 6371,
  uncertaintyEarthRadii: event.errorDistKm / 6371,
  cosDecStar: Math.cos(rad(event.decDeg)),
  sinDecStar: Math.sin(rad(event.decDeg)),
  sunDirX, sunDirY, sunDirZ,
});
// circumstances: { distanceKm, durationSec, probabilityPercent, starElevationDeg, twilight, ... }
```

## Projeções

O módulo usa **duas projeções distintas**:

### Projeção 1: Plano da sombra (shadow plane)
- Origem = sub-ponto da estrela em `t0`
- Coordenadas em **metros** a partir de `calculateArcCoordinates`
- O caminho central é uma **reta** nesse plano
- Usado para: recorte da faixa no disco terrestre (`extendArcLineToEarthLimb`)
- Funções: `generateShadowPlanePath`, `projectArcMetersToSvg`, `projectShadowPlanePathToSvg`

### Projeção 2: Globo ortográfico
- Hemisfério visível centrado no sub-ponto da estrela
- Lon/lat → projeção ortográfica (SOFA/IAU) → coordenadas SVG
- Usado para: países, graticule, dia/noite, terminador
- Funções: `projectLonLatToGlobeSvg`, `projectGlobeLonLatPathToSvg`, `buildGlobeDayNightPaths`

### Por que duas projeções?
A faixa de sombra é geometricamente reta no plano tangente ao sub-ponto da estrela, mas curva em lon/lat. Projetar lon/lat → SVG para a faixa introduziria curvatura artificial. Manter a faixa no plano da sombra e o globo em projeção ortográfica produz o resultado visual correto (estilo SORA `plot_occ_map`).

## Proveniência de dados — formato de entrada (raw payload)

`normalizeOccultationEvent(raw)` consome um objeto plano com os campos abaixo. Este é o **contrato de entrada** do módulo — toda função que gera geometria depende deste payload.

### Payload mínimo funcional

```json
{
  "id": "jmZgpRhws371uGGFXh3--w",
  "name": "2020 BX12",
  "date_time": "2026-07-01T21:17:56Z",
  "ra_star_deg": 349.5465475,
  "dec_star_deg": 17.65780333333333,
  "velocity": -14.9353,
  "delta": 0.518,
  "closest_approach": 9.281,
  "position_angle": 278.72,
  "apparent_diameter": 439.191478540745,
  "diameter": 165.0,
  "closest_approach_uncertainty_km": 58.40054257932094,
  "predict_step": 60,
  "off_ra": 0.0,
  "off_dec": 0.0,
  "pmra": 19.0,
  "pmdec": -37.0
}
```

### Todos os campos reconhecidos

Campos **obrigatórios** (sem eles o evento é inválido):

| Campo | Tipo | Descrição | Se ausente |
|-------|------|-----------|------------|
| `date_time` | string | ISO 8601 do instante central | `t0Ms` = `NaN` → validação falha |
| `ra_star_deg` | number | RA da estrela em graus (J2000) | `validateOccultationEvent` rejeita |
| `dec_star_deg` | number | Dec da estrela em graus (J2000) | `validateOccultationEvent` rejeita |
| `velocity` | number | Velocidade da sombra em km/s (negativo = movimento retrógrado) | fallback: `vel`; se ambos ausentes = 0 → validação falha |
| `delta` | number | Distância geocêntrica em AU | fallback: `geocentric_distance`; se ambos ausentes = 1.0 AU |
| `closest_approach` | number | Distância mínima aparente (CA) em arcsec | fallback: `ca`; se ambos ausentes = 0 |
| `position_angle` | number | Ângulo de posição em graus | fallback: `pa`; se ambos ausentes = 0 |

Campos **opcionais** (melhoram precisão mas têm fallback):

| Campo | Tipo | Default | O que afeta |
|-------|------|---------|-------------|
| `apparent_diameter` | number | `diameter` (fallback) | `shadowDiameterKm` — largura da faixa de sombra |
| `diameter` | number | 0 | `objectRadiusKm = diameter / 2` — limites do corpo e marcador central |
| `off_ra` | number (mas) | 0 | Correção Gaia em RA — desloca `t0` e `closest_approach` |
| `off_dec` | number (mas) | 0 | Correção Gaia em Dec — desloca `t0` e `closest_approach` |
| `closest_approach_uncertainty_km` | number | 0 | `errorDistKm` — barra de incerteza |
| `diameter_err_min` | number | 0 | Erro no raio do objeto → `objectRadiusErrorKm` |
| `diameter_err_max` | number | 0 | Erro no raio do objeto → `objectRadiusErrorKm` |
| `predict_step` | number (s) | — | Janela temporal: `±5 × predict_step`. Se ausente: `6371 / \|v\|` |
| `pmra` | number (mas/ano) | 0 | Movimento próprio em RA — posição da estrela em `t ≠ t0` |
| `pmdec` | number (mas/ano) | 0 | Movimento próprio em Dec — posição da estrela em `t ≠ t0` |
| `ra_star_with_pm` | number | — | RA já corrigida por PM (tem precedência sobre `ra_star_deg`) |
| `dec_star_with_pm` | number | — | Dec já corrigida por PM (tem precedência sobre `dec_star_deg`) |

Campos **de apresentação** (não afetam geometria, mas preservados no modelo interno):

| Campo | Tipo | Uso |
|-------|------|-----|
| `id` | string | Identificador único do evento |
| `name` | string | Nome do objeto — fallback: `principal_designation` → `alias` → `'Object'` |
| `principal_designation` | string | Designação oficial (fallback de `name`) |
| `alias` | string | Apelido (último fallback de `name`) |

### Fallback e aliases

Vários campos aceitam nomes alternativos (compatibilidade com APIs diferentes):

| Nome primário | Aliases aceitos |
|---------------|-----------------|
| `velocity` | `vel` |
| `delta` | `geocentric_distance` |
| `closest_approach` | `ca` |
| `position_angle` | `pa` |
| `apparent_diameter` | (usa `diameter` como fallback) |
| `ra_star_deg` | `ra` |
| `dec_star_deg` | `dec` |

### Como gerar o payload

O payload esperado é um registro típico de predição de ocultação — mesma estrutura de APIs como LINEA, Lucky Star, Occult, ou backend próprio. Os campos mapeiam diretamente para as tabelas de eventos (cada linha da tabela = um `raw`).

**Se você está implementando um backend**, os campos obrigatórios são:
- Posição da estrela: `ra_star_deg`, `dec_star_deg` (catálogo Gaia DR3)
- Geometria do evento: `date_time`, `closest_approach`, `position_angle`, `velocity`, `delta`
- Esses 7 campos + opcionais de precisão (`apparent_diameter`, `diameter`, `closest_approach_uncertainty_km`, `predict_step`) são suficientes para gerar thumbnails corretos.

**Se você está consumindo uma API existente**, passe o objeto de resposta diretamente — o normalizador extrai o que precisa e ignora o resto.

### Saída: modelo interno

`normalizeOccultationEvent(raw)` retorna um objeto com esta forma:

```ts
{
  id: string;
  name: string;
  t0Ms: number;               // ms desde epoch
  raDeg: number;               // RA em t0 (graus)
  decDeg: number;              // Dec em t0 (graus)
  pmraMasYr: number;           // PM RA (mas/ano)
  pmdecMasYr: number;          // PM Dec (mas/ano)
  velocityKmSec: number;       // velocidade da sombra
  deltaKm: number;             // distância geocêntrica (km)
  closestApproachRad: number;  // CA (rad)
  closestApproachArcsec: number; // CA (arcsec)
  positionAngleRad: number;    // PA (rad)
  motionAngleRad: number;      // PA de movimento normalizado (rad)
  shadowDiameterKm: number;    // diâmetro aparente da sombra
  hasKnownDiameter: boolean;   // diâmetro conhecido?
  hasKnownObjectRadius: boolean; // raio físico conhecido?
  objectRadiusKm: number;      // raio físico do objeto
  objectRadiusErrorKm: number; // erro no raio
  closestApproachErrorKm: number; // incerteza da CA (km)
  errorDistKm: number;         // distância total de erro (objectRadius + radiusError + CA unc)
  maxTimeSec: number;          // meia-janela temporal
  predictStepSec: number;      // passo de predição (s)
  visibleStartMs: number;      // início da janela visível (ms)
  visibleEndMs: number;        // fim da janela visível (ms)
  // deprecated (removidos em v2.0.0):
  diameterKm: number;          // → use shadowDiameterKm
  uncertaintyKm: number;       // → use closestApproachErrorKm
  physicalRadiusKm: number;    // → use objectRadiusKm
  diameterErrorRadiusKm: number; // → use objectRadiusErrorKm
}
```

Validação: `validateOccultationEvent(event)` retorna `{ ok: boolean, reasons: string[] }`. Rejeita se `t0Ms`, `raDeg`, `decDeg` ou `deltaKm` forem inválidos/faltantes, ou se `velocityKmSec === 0`.

## Paleta de cores

`mapPalette` exporta um objeto com a paleta padrão LINEA (estilo SORA). Use como fonte única de verdade para cores no SVG:

```js
import { mapPalette } from './occultation-tracks/index.js';
// mapPalette.centerLine  → 'rgb(0, 70, 141)'
// mapPalette.uncertainty → 'rgb(255, 51, 51)'
// mapPalette.ocean       → '#B8D8F8'
// mapPalette.night       → '#000000'
// ... etc.
```

## Limites de performance

`limits.js` centraliza constantes de tuning. Para listas com muitos eventos, reduza:

```js
import { buildThumbnailGeometry } from './occultation-tracks/index.js';

// Modo econômico para 100+ thumbnails:
const geometry = buildThumbnailGeometry(event, {
  width: 120,
  height: 80,
  samples: 41,               // menos amostras = mais rápido
  graticule: false,          // pula graticule
  countries: null,           // sem países
  computeNightFraction: false, // padrão, evita amostragem pesada
});
```

Constantes ajustáveis em `limits.js` (importe e passe como `options` onde suportado):

| Constante | Default | Efeito |
|-----------|---------|--------|
| `MAX_PATH_SAMPLES` | 5000 | Cap no número de amostras dos paths |
| `NIGHT_FRACTION_SAMPLE_STEP` | 8 | Passo em px na amostragem noturna |
| `NIGHT_FRACTION_MAX_SAMPLES` | 5000 | Cap absoluto de amostras noturnas |
| `GLOBE_LAYER_CACHE_MAX_ENTRIES` | 100 | Entradas no cache LRU do globo |
| `ORTHOPROJ_INV_MAX_ITERATIONS` | 100 | Iterações máximas em orthoprojinv |

## Testes

```bash
node --test occultation-tracks/__tests__/core.test.mjs
```

19 testes, 8 suites. Fixtures offline — sem dependência de rede.
Oráculo: compara contra `paths.json` gerado pelo backend Astropy/occviz.

## Demo visual

Com qualquer servidor HTTP local (ex.: `python -m http.server` ou `npx serve .`):

```
http://localhost:8000/occultation-tracks/demo/thumbnail.html
```

O demo carrega fixtures locais (BX12 e Agni) ou busca eventos da API via `?id=...`.

## Atribuição

- `iauGd2gce` / `iauGc2gde`: SOFA/IAU
- `fctrep`: CDF normal (Abramowitz & Stegun)
- `orthoproj` / `orthoprojinv` / `rotateVector`: via Lucky Star (J. Desmars)
- `localCircumstances` / probabilidade em contexto de mapa: via Lucky Star `opmap.js`
