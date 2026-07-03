import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  rad,
  deg,
  normalizeLongitude,
  normalizeAnglePi,
  normalizeAngle2Pi,
  orthoproj,
  orthoprojinv,
  coordsObj,
  fitDirectionToCoords,
  fctrep,
  normalizeOccultationEvent,
  validateOccultationEvent,
  applyPredictionOffsets,
  generateCentralPoint,
  getPositionAtTime,
  generateOccultationPath,
  buildThumbnailGeometry,
  generateShadowPlanePath,
  isLonLatOnNearHemisphere,
  projectLonLatToGlobeSvg,
  AU_KM,
} from '../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(__dirname, 'fixtures');
const eventRaw = JSON.parse(readFileSync(join(fixtureDir, 'event.json'), 'utf8'));
const pathsOracle = JSON.parse(readFileSync(join(fixtureDir, 'paths.json'), 'utf8'));
const countriesGeoJson = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'ne_110m_countries.json'), 'utf8'));

function medianAbsError(actual, expected) {
  const errors = actual.map((v, i) => Math.abs(v - expected[i]));
  errors.sort((a, b) => a - b);
  const mid = Math.floor(errors.length / 2);
  return errors.length % 2 === 0
    ? (errors[mid - 1] + errors[mid]) / 2
    : errors[mid];
}

function angularErrorDeg(lon1, lat1, lon2, lat2) {
  return Math.sqrt((lon1 - lon2) ** 2 + (lat1 - lat2) ** 2);
}

describe('angles', () => {
  it('rad/deg e normalizeLongitude', () => {
    assert.ok(Math.abs(rad(180) - Math.PI) < 1e-12);
    assert.ok(Math.abs(deg(Math.PI) - 180) < 1e-12);
    assert.equal(normalizeLongitude(190), -170);
    assert.equal(normalizeLongitude(-190), 170);
    assert.ok(Math.abs(normalizeAnglePi(5 * Math.PI) - Math.PI) < 1e-12);
    assert.ok(Math.abs(normalizeAngle2Pi(-5 * Math.PI) - Math.PI) < 1e-12);
  });
});

describe('geodesy', () => {
  it('orthoproj round-trip e ponto fora do disco', () => {
    const centerLonRad = rad(75);
    const centerLatRad = rad(19);
    // Pontos próximos ao centro da projeção — round-trip é estável aqui
    const testPoints = [
      [75, 25],
      [70, 19],
      [80, 15],
    ];

    for (const [lonDeg, latDeg] of testPoints) {
      const [xNorm, yNorm] = orthoproj(
        centerLonRad,
        centerLatRad,
        rad(lonDeg),
        rad(latDeg),
      );
      const inv = orthoprojinv(centerLonRad, centerLatRad, xNorm, yNorm);
      assert.ok(inv, `round-trip falhou para (${lonDeg}, ${latDeg})`);
      assert.ok(Math.abs(inv.lonDeg - lonDeg) < 0.01);
      assert.ok(Math.abs(inv.latDeg - latDeg) < 0.01);
    }

    assert.equal(orthoprojinv(centerLonRad, centerLatRad, 2, 2), null);
  });

  it('fitDirectionToCoords inverte coordsObj analiticamente', () => {
    const targetLonDeg = 42;
    const targetLatDeg = -18;
    const vector = fitDirectionToCoords(targetLonDeg, targetLatDeg, 349, 17, 274);
    const [lonDeg, latDeg] = coordsObj(vector[0], vector[1], vector[2], 349, 17, 274);
    assert.ok(Math.abs(lonDeg - targetLonDeg) < 1e-10);
    assert.ok(Math.abs(latDeg - targetLatDeg) < 1e-10);
  });
});

describe('statistics', () => {
  it('fctrep valores conhecidos', () => {
    assert.ok(fctrep(0) >= 0.499 && fctrep(0) <= 0.501);
    assert.ok(fctrep(1.96) >= 0.974 && fctrep(1.96) <= 0.976);
    assert.ok(fctrep(-1.96) >= 0.024 && fctrep(-1.96) <= 0.026);
  });
});

describe('event', () => {
  it('normaliza fixture real', () => {
    const event = normalizeOccultationEvent(eventRaw);
    assert.ok(Math.abs(event.velocityKmSec - (-14.9353)) < 0.001);
    assert.ok(Math.abs(event.deltaKm - 0.518 * AU_KM) < 1);
    assert.ok(Number.isFinite(event.t0Ms));
    assert.equal(event.maxTimeSec, 300);
    assert.equal(event.predictStepSec, 60);
    assert.ok(Math.abs(event.shadowDiameterKm - 439.191478540745) < 0.01);
    assert.equal(event.diameterKm, event.shadowDiameterKm);
    assert.equal(event.pmraMasYr, 19);
    const validation = validateOccultationEvent(event);
    assert.equal(validation.ok, true);
  });

  it('applyPredictionOffsets desloca t0 e CA', () => {
    const paRad = rad(45);
    const deltaKm = 1e8;
    const t0 = Date.parse('2026-01-01T00:00:00Z');
    const adjusted = applyPredictionOffsets(t0, 10, 1000, 500, paRad, deltaKm, 10);
    assert.notEqual(adjusted.closestApproachArcsec, 10);
    assert.notEqual(adjusted.t0Ms, t0);
  });
});

describe('geometry vs oraculo', () => {
  it('ponto central dentro de 0.35 graus (Astropy backend vs fisica simplificada)', () => {
    const event = normalizeOccultationEvent(eventRaw);
    const point = generateCentralPoint(event);
    assert.ok(point, 'centralPoint null');
    const err = angularErrorDeg(
      point[0],
      point[1],
      pathsOracle.longitude,
      pathsOracle.latitude,
    );
    // Backend usa Astropy/occviz; core replica function.js — ~0.32° típico neste evento
    if (err >= 0.35) {
      assert.fail(`centralPoint erro ${err}° — obtido [${point}], esperado [${pathsOracle.longitude}, ${pathsOracle.latitude}]`);
    }
  });

  it('serie 60s com erro mediano < 1.0 grau', () => {
    const event = normalizeOccultationEvent(eventRaw);
    const expectedLats = pathsOracle.central_path_latitude_60s_step;
    const expectedLons = pathsOracle.central_path_longitude_60s_step;

    const actualLats = [];
    const actualLons = [];

    for (let i = 0; i < 11; i++) {
      const dtimeSec = (i - 5) * 60;
      const tMs = event.t0Ms + dtimeSec * 1000;
      const pos = getPositionAtTime(event, tMs, 0);
      assert.ok(pos, `pos null em i=${i}`);
      actualLons.push(pos[0]);
      actualLats.push(pos[1]);
    }

    const medianLonErr = medianAbsError(actualLons, expectedLons);
    const medianLatErr = medianAbsError(actualLats, expectedLats);

    if (medianLonErr >= 1.0 || medianLatErr >= 1.0) {
      assert.fail(
        `erro mediano lon=${medianLonErr}° lat=${medianLatErr}°\n`
        + `esperado lons=${JSON.stringify(expectedLons)}\n`
        + `obtido  lons=${JSON.stringify(actualLons)}\n`
        + `esperado lats=${JSON.stringify(expectedLats)}\n`
        + `obtido  lats=${JSON.stringify(actualLats)}`,
      );
    }
  });

  it('sem salto de longitude > 180 entre pontos consecutivos', () => {
    const event = normalizeOccultationEvent(eventRaw);
    const path = generateOccultationPath(event, { samples: 50 });
    for (let i = 1; i < path.length; i++) {
      const delta = Math.abs(path[i][0] - path[i - 1][0]);
      assert.ok(delta <= 180, `salto ${delta}° entre ${i - 1} e ${i}`);
    }
  });
});

describe('globe hemisphere', () => {
  it('antipoda fica no hemisfério oculto', () => {
    const centerLon = 75;
    const centerLat = 19;
    assert.equal(
      isLonLatOnNearHemisphere(centerLon, centerLat, centerLon + 180, -centerLat),
      false,
    );
    assert.equal(
      isLonLatOnNearHemisphere(centerLon, centerLat, centerLon, centerLat),
      true,
    );
  });

  it('antipoda não projeta no globo visível', () => {
    const view = { cx: 100, cy: 100, radiusPx: 90, earthRadiusMeters: 6371000 };
    const p = projectLonLatToGlobeSvg(75, 19, -105, -19, view);
    assert.equal(p.visible, false);
  });
});

describe('thumbnail', () => {
  it('evento invalido retorna isDrawable false', () => {
    const invalid = { ...eventRaw, velocity: 0 };
    const geom = buildThumbnailGeometry(invalid);
    assert.equal(geom.isDrawable, false);
  });

  it('evento valido retorna geometria desenhavel (plano da sombra)', () => {
    const geom = buildThumbnailGeometry(eventRaw);
    assert.equal(geom.isDrawable, true);
    assert.equal(geom.projection, 'shadowPlane');
    assert.ok(geom.globe.r > 0);
    assert.ok(geom.centralPath.length > 0);
    assert.ok(geom.centralPoint.visible);
    assert.equal(geom.centralPoint.kind, 'circle');
    assert.ok(geom.centralPoint.diameterPx >= 2);
    assert.ok(Math.abs(geom.centralPoint.r - geom.centralPoint.diameterPx / 2) < 1e-6);
    assert.ok(Number.isFinite(geom.starSubEarth.lonDeg));
  });

  it('inclui dia/noite ortografico (~50% do disco)', () => {
    const geom = buildThumbnailGeometry(eventRaw, { width: 200, height: 200, computeNightFraction: true });
    assert.ok(geom.dayNight);
    assert.ok(geom.dayNight.dayFill.path.length > 0);
    assert.ok(geom.dayNight.twilightFill.path.length > 0);
    assert.ok(geom.dayNight.nightFill.path.length > 0);
    assert.ok(geom.dayNight.nightFraction > 0.35);
    assert.ok(geom.dayNight.nightFraction < 0.65);
  });

  it('inclui graticule e fronteiras no globo', () => {
    const geom = buildThumbnailGeometry(eventRaw, { width: 200, height: 200, countries: null });
    assert.ok(geom.globeLayer);
    assert.ok(geom.globeLayer.ocean.path.length > 0);
    assert.ok(geom.globeLayer.graticule.meridians.length > 0);
    assert.ok(geom.globeLayer.graticule.parallels.length > 0);
    assert.equal(geom.globeLayer.land.length, 0);
    assert.equal(geom.globeLayer.borders.length, 0);

    const withCountries = buildThumbnailGeometry(eventRaw, { width: 200, height: 200, countries: countriesGeoJson });
    assert.ok(withCountries.globeLayer.land.length > 0);
    assert.ok(withCountries.globeLayer.borders.length > 0);

    const cached = buildThumbnailGeometry(eventRaw, { width: 200, height: 200, countries: countriesGeoJson });
    assert.equal(cached.globeLayer, withCountries.globeLayer);
  });

  it('caminho central no plano da sombra e colinear', () => {
    const event = normalizeOccultationEvent(eventRaw);
    const path = generateShadowPlanePath(event, 0, { samples: 20 });
    assert.ok(path.length >= 3);

    const [x0, y0] = path[0];
    const [x1, y1] = path[1];
    const dirX = x1 - x0;
    const dirY = y1 - y0;
    const dirLen = Math.hypot(dirX, dirY);
    assert.ok(dirLen > 0);

    for (let i = 2; i < path.length; i++) {
      const cross = dirX * (path[i][1] - y0) - dirY * (path[i][0] - x0);
      assert.ok(Math.abs(cross) / dirLen < 1, `ponto ${i} fora da reta: cross=${cross}`);
    }
  });

  it('barra de erro segue occviz: raio total desde o eixo, além do corpo', () => {
    const event = normalizeOccultationEvent(eventRaw);
    assert.equal(event.objectRadiusKm, 82.5);
    assert.equal(event.closestApproachErrorKm, 58.40054257932094);
    assert.ok(Math.abs(event.errorDistKm - 140.90054257932093) < 1e-6);
    assert.ok(event.errorDistKm > event.objectRadiusKm);

    const clat = pathsOracle.latitude;
    const clon = pathsOracle.longitude;

    function closestOffsetKm(lats, lons) {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < lats.length; i++) {
        const d = (lats[i] - clat) ** 2 + (lons[i] - clon) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      const lat = lats[best];
      const lon = lons[best];
      return angularErrorDeg(clon, clat, lon, lat) * 111;
    }

    const oracleBodyKm = closestOffsetKm(
      pathsOracle.body_upper_limit_latitude,
      pathsOracle.body_upper_limit_longitude,
    );
    const oracleUncKm = closestOffsetKm(
      pathsOracle.uncertainty_upper_limit_latitude,
      pathsOracle.uncertainty_upper_limit_longitude,
    );

    const ourCentral = getPositionAtTime(event, event.t0Ms, 0);
    const ourBody = getPositionAtTime(event, event.t0Ms, event.objectRadiusKm);
    const ourUnc = getPositionAtTime(event, event.t0Ms, event.errorDistKm);
    const ourBodyKm = angularErrorDeg(ourCentral[0], ourCentral[1], ourBody[0], ourBody[1]) * 111;
    const ourUncKm = angularErrorDeg(ourCentral[0], ourCentral[1], ourUnc[0], ourUnc[1]) * 111;

    assert.ok(Math.abs(ourBodyKm - oracleBodyKm) < 15,
      `corpo nosso ${ourBodyKm} vs oraculo ${oracleBodyKm}`);
    assert.ok(Math.abs(ourUncKm - oracleUncKm) < 15,
      `incerteza nossa ${ourUncKm} vs oraculo ${oracleUncKm}`);
    assert.ok(ourUncKm > ourBodyKm);
    assert.ok(oracleUncKm > oracleBodyKm);
  });

  it('extendToLimb alcança o limbo terrestre na thumbnail', () => {
    const event = normalizeOccultationEvent(eventRaw);
    const path = generateShadowPlanePath(event, 0, { extendToLimb: true });
    assert.equal(path.length, 101);
    const R = 6371 * 1000;
    for (const [x, y] of [path[0], path[path.length - 1]]) {
      const norm = Math.hypot(x, y) / R;
      assert.ok(Math.abs(norm - 1) < 0.01, `norm=${norm}`);
    }
  });
});

const agniRaw = JSON.parse(readFileSync(join(fixtureDir, 'event-agni.json'), 'utf8'));

describe('fixture Agni (6p9v3C2EBzWY3gMdPS1YzQ)', () => {
  it('recorta faixa central no disco quando um limbo fica fora', () => {
    const geom = buildThumbnailGeometry(agniRaw, { width: 200, height: 130, samples: 81 });
    assert.equal(geom.isDrawable, true);
    assert.ok(geom.centralPath.length > 0);
    const longest = Math.max(...geom.centralPath.map((segment) => segment.length));
    assert.ok(longest >= 100, `faixa central precisa manter amostragem densa, obtido ${longest}`);
    assert.ok(geom.centralPoint.diameterPx >= 2);
    assert.equal(geom.centralPoint.r, geom.centralPoint.diameterPx / 2);
    assert.equal(agniRaw.id, '6p9v3C2EBzWY3gMdPS1YzQ');
  });
});
