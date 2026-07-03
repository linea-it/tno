/**
 * Projeção 2D para thumbnails SVG.
 * Thumbnail usa plano da sombra (SORA): coordenadas ax/by no tangente ao sub-ponto da estrela.
 */

import { R_EARTH_KM, APF } from './constants.js';
import {
  NIGHT_FRACTION_SAMPLE_STEP,
  NIGHT_FRACTION_MAX_SAMPLES,
  TERMINATOR_STEPS,
  DISK_BOUNDARY_STEPS,
} from './limits.js';
import { rad, deg, normalizeLongitude } from './angles.js';
import { orthoproj, orthoprojinv, iauGd2gce, normalizeUnitVector } from './geodesy.js';
import { sunRaDecDeg, calculateGST } from './time.js';

const EARTH_RADIUS_METERS = R_EARTH_KM * 1000;

/**
 * View do plano da sombra: origem = sub-ponto da estrela em t0 (como SORA plot_occ_map).
 * @param {object} params
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} [params.margin=0.1]
 * @returns {object}
 */
export function createShadowPlaneView({ width, height, margin = 0.1 }) {
  const cx = width / 2;
  const cy = height / 2;
  const radiusPx = (Math.min(width, height) / 2) * (1 - margin);

  return {
    width,
    height,
    cx,
    cy,
    radiusPx,
    earthRadiusMeters: EARTH_RADIUS_METERS,
  };
}

/**
 * Projeta coordenadas do plano da sombra (metros) para SVG.
 * @param {[number, number]} arcMeters [arcXMeters, arcYMeters]
 * @param {object} view
 * @returns {{ x: number, y: number, visible: boolean }}
 */
export function projectArcMetersToSvg(arcMeters, view) {
  const xNorm = arcMeters[0] / view.earthRadiusMeters;
  const yNorm = arcMeters[1] / view.earthRadiusMeters;
  const visible = (xNorm * xNorm + yNorm * yNorm) <= 1.0;

  return {
    x: view.cx + xNorm * view.radiusPx,
    y: view.cy - yNorm * view.radiusPx,
    visible,
  };
}

function isInsideUnitDisk(xNorm, yNorm) {
  return (xNorm * xNorm + yNorm * yNorm) <= 1.0 + 1e-9;
}

/**
 * Recorta um segmento no disco unitário (plano da sombra normalizado).
 * @param {[number, number]} p0
 * @param {[number, number]} p1
 * @returns {Array<[number, number]>}
 */
export function clipSegmentToUnitDisk(p0, p1) {
  const [x0, y0] = p0;
  const [x1, y1] = p1;
  const inside0 = isInsideUnitDisk(x0, y0);
  const inside1 = isInsideUnitDisk(x1, y1);

  if (inside0 && inside1) {
    return [p0, p1];
  }

  const dx = x1 - x0;
  const dy = y1 - y0;
  const a = dx * dx + dy * dy;
  if (a < 1e-18) {
    if (inside0 && inside1) return [p0, p1]; // degenerado dentro do disco
    if (inside0) return [p0];
    if (inside1) return [p1];
    return [];
  }

  const b = 2 * (x0 * dx + y0 * dy);
  const c = x0 * x0 + y0 * y0 - 1;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    if (inside0) return [p0];
    if (inside1) return [p1];
    return [];
  }

  const sqrtDisc = Math.sqrt(discriminant);
  const intersections = [];
  for (const t of [(-b - sqrtDisc) / (2 * a), (-b + sqrtDisc) / (2 * a)]) {
    if (t >= -1e-9 && t <= 1 + 1e-9) {
      intersections.push([x0 + t * dx, y0 + t * dy]);
    }
  }

  if (inside0 && !inside1) {
    return intersections.length > 0 ? [p0, intersections[0]] : [p0];
  }
  if (!inside0 && inside1) {
    return intersections.length > 0 ? [intersections[intersections.length - 1], p1] : [p1];
  }

  if (intersections.length === 2) {
    return intersections;
  }
  return [];
}

function normToSvgPoint([xNorm, yNorm], view) {
  return {
    x: view.cx + xNorm * view.radiusPx,
    y: view.cy - yNorm * view.radiusPx,
  };
}

/**
 * Projeta path do plano da sombra; recorta segmentos na borda do disco terrestre.
 * @param {Array<[number, number]>} arcPoints [arcXMeters, arcYMeters]
 * @param {object} view
 * @returns {Array<Array<{x: number, y: number}>>}
 */
export function projectShadowPlanePathToSvg(arcPoints, view) {
  if (arcPoints.length === 0) return [];

  const segments = [];
  let current = [];

  const pushClippedSegment = (clippedNorm) => {
    if (clippedNorm.length < 2) return;

    const svgPoints = clippedNorm.map((point) => normToSvgPoint(point, view));
    if (current.length === 0) {
      current.push(...svgPoints);
      return;
    }

    const last = current[current.length - 1];
    const first = svgPoints[0];
    if (Math.hypot(last.x - first.x, last.y - first.y) < 1e-6) {
      current.push(...svgPoints.slice(1));
    } else {
      segments.push(current);
      current = [...svgPoints];
    }
  };

  for (let i = 0; i < arcPoints.length - 1; i++) {
    const p0 = [
      arcPoints[i][0] / view.earthRadiusMeters,
      arcPoints[i][1] / view.earthRadiusMeters,
    ];
    const p1 = [
      arcPoints[i + 1][0] / view.earthRadiusMeters,
      arcPoints[i + 1][1] / view.earthRadiusMeters,
    ];
    pushClippedSegment(clipSegmentToUnitDisk(p0, p1));
  }

  if (arcPoints.length === 1) {
    const projected = projectArcMetersToSvg(arcPoints[0], view);
    if (projected.visible) {
      current.push({ x: projected.x, y: projected.y });
    }
  }

  if (current.length > 0) {
    segments.push(current);
  }

  return segments;
}

/**
 * @param {object} params
 * @param {number} params.width
 * @param {number} params.height
 * @param {number} params.centerLonDeg
 * @param {number} params.centerLatDeg
 * @param {number} [params.margin=0.1]
 * @returns {object} view pré-computada (projeção geodésica; uso futuro)
 */
export function createThumbnailView({
  width,
  height,
  centerLonDeg,
  centerLatDeg,
  margin = 0.1,
}) {
  const cx = width / 2;
  const cy = height / 2;
  const radiusPx = (Math.min(width, height) / 2) * (1 - margin);
  const centerLonRad = rad(centerLonDeg);
  const centerLatRad = rad(centerLatDeg);
  const sinLat0 = Math.sin(centerLatRad);
  const cosLat0 = Math.cos(centerLatRad);

  return {
    width,
    height,
    cx,
    cy,
    radiusPx,
    centerLonDeg,
    centerLatDeg,
    centerLonRad,
    centerLatRad,
    sinLat0,
    cosLat0,
  };
}

/**
 * @param {[number, number]} lonLatDeg [lonDeg, latDeg]
 * @param {object} view
 * @returns {{ x: number, y: number, visible: boolean }}
 */
export function projectLonLatToSvg(lonLatDeg, view) {
  const lonDeg = lonLatDeg[0];
  const latDeg = lonLatDeg[1];
  const latRad = rad(latDeg);
  const dLonRad = rad(lonDeg) - view.centerLonRad;

  const cosC = view.sinLat0 * Math.sin(latRad)
    + view.cosLat0 * Math.cos(latRad) * Math.cos(dLonRad);
  const visible = cosC >= 0;

  const x = view.cx + view.radiusPx * Math.cos(latRad) * Math.sin(dLonRad);
  const y = view.cy - view.radiusPx * (
    view.cosLat0 * Math.sin(latRad) - view.sinLat0 * Math.cos(latRad) * Math.cos(dLonRad)
  );

  return { x, y, visible };
}

/**
 * Quebra o path em segmentos visíveis (não desenha pela face oculta do globo).
 * @param {Array<[number, number]>} points [lonDeg, latDeg]
 * @param {object} view
 * @returns {Array<Array<{x: number, y: number}>>}
 */
export function projectPathToSvg(points, view) {
  const segments = [];
  let current = [];

  for (const point of points) {
    const projected = projectLonLatToSvg(point, view);
    if (projected.visible) {
      current.push({ x: projected.x, y: projected.y });
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    segments.push(current);
  }

  return segments;
}

/**
 * @param {Array<{x: number, y: number}>} segment
 * @returns {string}
 */
export function buildSvgPath(segment) {
  if (segment.length === 0) return '';
  let path = `M ${segment[0].x} ${segment[0].y}`;
  for (let i = 1; i < segment.length; i++) {
    path += ` L ${segment[i].x} ${segment[i].y}`;
  }
  return path;
}

/**
 * Lon/lat geodésico → plano da sombra (metros) relativo ao centro da projeção.
 * @param {number} centerLonDeg
 * @param {number} centerLatDeg
 * @param {number} lonDeg
 * @param {number} latDeg
 * @returns {[number, number]}
 */
export function lonLatDegToArcMeters(centerLonDeg, centerLatDeg, lonDeg, latDeg) {
  const [uNorm, vNorm] = orthoproj(
    rad(centerLonDeg),
    rad(centerLatDeg),
    rad(lonDeg),
    rad(latDeg),
  );
  const metersPerEarthRadius = R_EARTH_KM * 1000;
  return [uNorm * metersPerEarthRadius, vNorm * metersPerEarthRadius];
}

/**
 * Hemisfério visível na projeção ortográfica (z >= 0 no frame do centro).
 * @param {number} centerLonDeg
 * @param {number} centerLatDeg
 * @param {number} lonDeg
 * @param {number} latDeg
 * @returns {boolean}
 */
export function isLonLatOnNearHemisphere(centerLonDeg, centerLatDeg, lonDeg, latDeg) {
  const [, , z] = orthoproj(
    rad(centerLonDeg),
    rad(centerLatDeg),
    rad(lonDeg),
    rad(latDeg),
  );
  return z >= 0;
}

/**
 * Lon/lat → SVG no globo; visível só no hemisfério próximo e dentro do disco.
 * @param {number} centerLonDeg
 * @param {number} centerLatDeg
 * @param {number} lonDeg
 * @param {number} latDeg
 * @param {object} view
 * @returns {{ x: number, y: number, visible: boolean }}
 */
export function projectLonLatToGlobeSvg(centerLonDeg, centerLatDeg, lonDeg, latDeg, view) {
  const [xNorm, yNorm, z] = orthoproj(
    rad(centerLonDeg),
    rad(centerLatDeg),
    rad(lonDeg),
    rad(latDeg),
  );
  const onDisk = (xNorm * xNorm + yNorm * yNorm) <= 1.0;
  const visible = onDisk && z >= 0;

  return {
    x: view.cx + xNorm * view.radiusPx,
    y: view.cy - yNorm * view.radiusPx,
    visible,
  };
}

function interpolateLimbLonLat(centerLonDeg, centerLatDeg, lonA, latA, lonB, latB) {
  const centerLonRad = rad(centerLonDeg);
  const centerLatRad = rad(centerLatDeg);
  let t0 = 0;
  let t1 = 1;

  for (let i = 0; i < 24; i++) {
    const t = (t0 + t1) / 2;
    const lon = lonA + t * (lonB - lonA);
    const lat = latA + t * (latB - latA);
    const [, , z] = orthoproj(centerLonRad, centerLatRad, rad(lon), rad(lat));
    if (z >= 0) {
      t0 = t;
    } else {
      t1 = t;
    }
  }

  const t = (t0 + t1) / 2;
  return [lonA + t * (lonB - lonA), latA + t * (latB - latA)];
}

/**
 * Projeta anel lon/lat no globo; descarta o hemisfério traseiro e recorta no limbo.
 * @param {Array<[number, number]>} lonLatPoints
 * @param {number} centerLonDeg
 * @param {number} centerLatDeg
 * @param {object} view
 * @returns {Array<Array<{x: number, y: number}>>}
 */
export function projectGlobeLonLatPathToSvg(lonLatPoints, centerLonDeg, centerLatDeg, view) {
  if (lonLatPoints.length === 0) return [];

  const segments = [];
  let current = [];

  const pushLimbIfNeeded = (lonA, latA, lonB, latB) => {
    const nearA = isLonLatOnNearHemisphere(centerLonDeg, centerLatDeg, lonA, latA);
    const nearB = isLonLatOnNearHemisphere(centerLonDeg, centerLatDeg, lonB, latB);
    if (nearA === nearB) return;

    const [limbLon, limbLat] = interpolateLimbLonLat(
      centerLonDeg,
      centerLatDeg,
      lonA,
      latA,
      lonB,
      latB,
    );
    const limb = projectLonLatToGlobeSvg(centerLonDeg, centerLatDeg, limbLon, limbLat, view);
    if (limb.visible) {
      current.push({ x: limb.x, y: limb.y });
    }
    if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  };

  for (let i = 0; i < lonLatPoints.length; i++) {
    const [lonDeg, latDeg] = lonLatPoints[i];

    if (i > 0) {
      const [prevLon, prevLat] = lonLatPoints[i - 1];
      pushLimbIfNeeded(prevLon, prevLat, lonDeg, latDeg);
    }

    const projected = projectLonLatToGlobeSvg(centerLonDeg, centerLatDeg, lonDeg, latDeg, view);
    if (projected.visible) {
      current.push({ x: projected.x, y: projected.y });
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    segments.push(current);
  }

  return segments;
}

/**
 * Projeta polígono [latDeg, lonDeg] para SVG no plano da sombra.
 * @param {Array<[number, number]>} latLonPoints
 * @param {number} centerLonDeg
 * @param {number} centerLatDeg
 * @param {object} view
 * @returns {Array<{ x: number, y: number, visible: boolean }>}
 */
export function projectLatLonPolygonToSvg(latLonPoints, centerLonDeg, centerLatDeg, view) {
  return latLonPoints.map(([latDeg, lonDeg]) => {
    const arcMeters = lonLatDegToArcMeters(centerLonDeg, centerLatDeg, lonDeg, latDeg);
    return projectArcMetersToSvg(arcMeters, view);
  });
}

/**
 * @param {Array<{ x: number, y: number }>} points
 * @returns {string}
 */
export function buildSvgPolygonPath(points) {
  if (points.length < 3) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  return `${path} Z`;
}

function geocentricSunUnitVector(tMs) {
  const date = new Date(tMs);
  const gstDeg = calculateGST(date);
  const { raDeg, decDeg } = sunRaDecDeg(date);
  const sunSubEarthLonDeg = normalizeLongitude(raDeg - gstDeg);
  return geocentricUnitVector(sunSubEarthLonDeg, decDeg);
}

function geocentricUnitVector(lonDeg, latDeg) {
  const xyz = iauGd2gce(1.0, APF, rad(lonDeg), rad(latDeg), 0.0);
  return normalizeUnitVector(xyz);
}

function isDayAtLonLat(lonDeg, latDeg, sunDir) {
  const normal = geocentricUnitVector(lonDeg, latDeg);
  return normal[0] * sunDir[0] + normal[1] * sunDir[1] + normal[2] * sunDir[2] > 0;
}

function isInsideAngularCap(lonDeg, latDeg, axis, radiusDeg) {
  const normal = geocentricUnitVector(lonDeg, latDeg);
  const cosRadius = Math.cos(rad(radiusDeg));
  return normal[0] * axis[0] + normal[1] * axis[1] + normal[2] * axis[2] >= cosRadius;
}

function perpendicularBasis(axis) {
  let anchor = [1, 0, 0];
  if (Math.abs(axis[0]) > 0.9) anchor = [0, 1, 0];
  const u = normalizeUnitVector([
    anchor[1] * axis[2] - anchor[2] * axis[1],
    anchor[2] * axis[0] - anchor[0] * axis[2],
    anchor[0] * axis[1] - anchor[1] * axis[0],
  ]);
  const v = normalizeUnitVector([
    axis[1] * u[2] - axis[2] * u[1],
    axis[2] * u[0] - axis[0] * u[2],
    axis[0] * u[1] - axis[1] * u[0],
  ]);
  return { u, v };
}

function angleDiff(fromRad, toRad) {
  let delta = toRad - fromRad;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
}

function collectCircularIndices(fromIdx, toIdx, length) {
  const indices = [];
  let idx = fromIdx;
  while (true) {
    indices.push(idx);
    if (idx === toIdx) break;
    idx = (idx + 1) % length;
  }
  return indices;
}

/**
 * Disco do globo em SVG (hemisfério visível ortográfico).
 * @param {object} view
 * @returns {string} path SVG com dois arcos
 */
export function buildGlobeDiskPath(view) {
  const { cx, cy, radiusPx: r } = view;
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}

/**
 * Disco do globo como círculo SVG semântico (evita artefatos de antialiasing na costura).
 * @param {object} view
 * @returns {{ cx: number, cy: number, r: number }}
 */
export function buildGlobeDiskCircle(view) {
  return { cx: view.cx, cy: view.cy, r: view.radiusPx };
}

const DISK_BOUNDARY_NORM = 0.995;

function sampleDiskBoundary(view, centerLonDeg, centerLatDeg, sunDir, steps = DISK_BOUNDARY_STEPS) {
  const centerLonRad = rad(centerLonDeg);
  const centerLatRad = rad(centerLatDeg);
  const boundary = [];

  for (let i = 0; i < steps; i++) {
    const theta = (2 * Math.PI * i) / steps;
    const xNorm = Math.cos(theta) * DISK_BOUNDARY_NORM;
    const yNorm = Math.sin(theta) * DISK_BOUNDARY_NORM;
    const inverse = orthoprojinv(centerLonRad, centerLatRad, xNorm, yNorm);
    if (!inverse) continue;

    boundary.push({
      x: view.cx + Math.cos(theta) * view.radiusPx,
      y: view.cy - Math.sin(theta) * view.radiusPx,
      day: isDayAtLonLat(inverse.lonDeg, inverse.latDeg, sunDir),
      theta,
    });
  }

  return boundary;
}

function sampleCapDiskBoundary(view, centerLonDeg, centerLatDeg, axis, radiusDeg, steps = DISK_BOUNDARY_STEPS) {
  const centerLonRad = rad(centerLonDeg);
  const centerLatRad = rad(centerLatDeg);
  const boundary = [];

  for (let i = 0; i < steps; i++) {
    const theta = (2 * Math.PI * i) / steps;
    const xNorm = Math.cos(theta) * DISK_BOUNDARY_NORM;
    const yNorm = Math.sin(theta) * DISK_BOUNDARY_NORM;
    const inverse = orthoprojinv(centerLonRad, centerLatRad, xNorm, yNorm);
    if (!inverse) continue;

    boundary.push({
      x: view.cx + Math.cos(theta) * view.radiusPx,
      y: view.cy - Math.sin(theta) * view.radiusPx,
      inside: isInsideAngularCap(inverse.lonDeg, inverse.latDeg, axis, radiusDeg),
      theta,
    });
  }

  return boundary;
}

function sampleTerminator(view, centerLonDeg, centerLatDeg, sunDir, steps = TERMINATOR_STEPS) {
  const { u, v } = perpendicularBasis(sunDir);
  const terminator = [];

  for (let i = 0; i <= steps; i++) {
    const t = (2 * Math.PI * i) / steps;
    const vec = [
      Math.cos(t) * u[0] + Math.sin(t) * v[0],
      Math.cos(t) * u[1] + Math.sin(t) * v[1],
      Math.cos(t) * u[2] + Math.sin(t) * v[2],
    ];
    const lonDeg = normalizeLongitude(deg(Math.atan2(vec[1], vec[0])));
    const latDeg = deg(Math.asin(Math.max(-1, Math.min(1, vec[2]))));
    const projected = projectLonLatToGlobeSvg(centerLonDeg, centerLatDeg, lonDeg, latDeg, view);
    if (!projected.visible) continue;

    terminator.push({
      x: projected.x,
      y: projected.y,
      theta: Math.atan2(projected.y - view.cy, projected.x - view.cx),
      t,
    });
  }

  return terminator;
}

function sampleAngularCircleSegments(view, centerLonDeg, centerLatDeg, axis, radiusDeg, steps = 1440) {
  const { u, v } = perpendicularBasis(axis);
  const radiusRad = rad(radiusDeg);
  const cosRadius = Math.cos(radiusRad);
  const sinRadius = Math.sin(radiusRad);
  const segments = [];
  let current = [];

  for (let i = 0; i <= steps; i++) {
    const t = (2 * Math.PI * i) / steps;
    const vec = normalizeUnitVector([
      cosRadius * axis[0] + sinRadius * (Math.cos(t) * u[0] + Math.sin(t) * v[0]),
      cosRadius * axis[1] + sinRadius * (Math.cos(t) * u[1] + Math.sin(t) * v[1]),
      cosRadius * axis[2] + sinRadius * (Math.cos(t) * u[2] + Math.sin(t) * v[2]),
    ]);
    const projected = projectGeocentricVectorToSvg(vec, centerLonDeg, centerLatDeg, view);

    if (projected.visible) {
      current.push({
        x: projected.x,
        y: projected.y,
        theta: Math.atan2(projected.y - view.cy, projected.x - view.cx),
        t,
      });
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    segments.push(current);
  }

  if (segments.length > 1 && segments[0][0].t === 0) {
    const last = segments[segments.length - 1];
    const first = segments.shift();
    segments[segments.length - 1] = [...last, ...first];
  }

  return segments;
}

function projectGeocentricVectorToSvg(vector, centerLonDeg, centerLatDeg, view) {
  const lonDeg = normalizeLongitude(deg(Math.atan2(vector[1], vector[0])));
  const latDeg = deg(Math.asin(Math.max(-1, Math.min(1, vector[2]))));
  return projectLonLatToGlobeSvg(centerLonDeg, centerLatDeg, lonDeg, latDeg, view);
}

function findBoundaryTransitions(boundary) {
  const transitions = [];
  for (let i = 0; i < boundary.length; i++) {
    const next = (i + 1) % boundary.length;
    if (boundary[i].day !== boundary[next].day) {
      transitions.push(next);
    }
  }
  return transitions;
}

function selectTerminatorArc(terminator, angleStart, angleEnd) {
  if (terminator.length < 2) return [];

  const sorted = [...terminator].sort((a, b) => a.t - b.t);
  const total = angleDiff(angleStart, angleEnd);
  const forward = [];

  for (const point of sorted) {
    const delta = angleDiff(angleStart, point.theta);
    if (total >= 0 ? (delta >= 0 && delta <= total) : (delta <= 0 && delta >= total)) {
      forward.push(point);
    }
  }

  if (forward.length >= 2) return forward;

  const backward = [];
  const wrappedTotal = total >= 0 ? total - 2 * Math.PI : total + 2 * Math.PI;
  for (const point of sorted) {
    const delta = angleDiff(angleStart, point.theta);
    if (wrappedTotal >= 0 ? (delta >= 0 && delta <= wrappedTotal) : (delta <= 0 && delta >= wrappedTotal)) {
      backward.push(point);
    }
  }

  return backward.length > forward.length ? backward : forward;
}

function buildNightRegionPath(boundary, terminator, transitions, view) {
  if (boundary.length < 3) return '';

  if (transitions.length === 0) {
    return boundary.every((point) => !point.day) ? buildGlobeDiskPath(view) : '';
  }

  if (transitions.length !== 2) {
    const nightPoints = boundary.filter((point) => !point.day);
    if (nightPoints.length < 3) return '';
    return buildSvgPolygonPath(nightPoints);
  }

  const [transitionA, transitionB] = transitions;
  const arcAB = collectCircularIndices(transitionA, transitionB, boundary.length);
  const arcBA = collectCircularIndices(transitionB, transitionA, boundary.length);
  const midAB = boundary[arcAB[Math.floor(arcAB.length / 2)]];
  const nightBoundaryIndices = midAB.day ? arcBA : arcAB;
  const nightBoundary = nightBoundaryIndices.map((idx) => boundary[idx]);

  const angleStart = Math.atan2(
    nightBoundary[nightBoundary.length - 1].y - view.cy,
    nightBoundary[nightBoundary.length - 1].x - view.cx,
  );
  const angleEnd = Math.atan2(
    nightBoundary[0].y - view.cy,
    nightBoundary[0].x - view.cx,
  );
  const terminatorArc = selectTerminatorArc(terminator, angleStart, angleEnd);
  const polygon = [...nightBoundary, ...terminatorArc.slice(1)];

  return buildSvgPolygonPath(polygon);
}

function buildCapRegionPath(view, centerLonDeg, centerLatDeg, axis, radiusDeg) {
  const capCenter = projectGeocentricVectorToSvg(axis, centerLonDeg, centerLatDeg, view);
  const boundary = sampleCapDiskBoundary(view, centerLonDeg, centerLatDeg, axis, radiusDeg);
  const circleSegments = sampleAngularCircleSegments(view, centerLonDeg, centerLatDeg, axis, radiusDeg);
  const transitions = [];

  for (let i = 0; i < boundary.length; i++) {
    const next = (i + 1) % boundary.length;
    if (boundary[i].inside !== boundary[next].inside) {
      transitions.push(next);
    }
  }

  if (transitions.length === 0) {
    if (boundary.every((point) => point.inside)) return buildGlobeDiskPath(view);
    if (capCenter.visible && circleSegments.length > 0) {
      const circle = circleSegments.reduce((longest, segment) => (
        segment.length > longest.length ? segment : longest
      ), []);
      return circle.length >= 3 ? buildSvgPolygonPath([capCenter, ...circle]) : '';
    }
    return '';
  }

  if (transitions.length !== 2) {
    const insideBoundary = boundary.filter((point) => point.inside);
    return insideBoundary.length >= 3 ? buildSvgPolygonPath(insideBoundary) : '';
  }

  const [transitionA, transitionB] = transitions;
  const arcAB = collectCircularIndices(transitionA, transitionB, boundary.length);
  const arcBA = collectCircularIndices(transitionB, transitionA, boundary.length);
  const midAB = boundary[arcAB[Math.floor(arcAB.length / 2)]];
  const capBoundaryIndices = midAB.inside ? arcAB : arcBA;
  const capBoundary = capBoundaryIndices.map((idx) => boundary[idx]);
  const boundaryEnd = capBoundary[capBoundary.length - 1];
  const boundaryStart = capBoundary[0];
  let bestArc = [];
  let bestScore = Infinity;

  for (const segment of circleSegments) {
    if (segment.length < 2) continue;
    const first = segment[0];
    const last = segment[segment.length - 1];
    const forwardScore = Math.hypot(boundaryEnd.x - first.x, boundaryEnd.y - first.y)
      + Math.hypot(boundaryStart.x - last.x, boundaryStart.y - last.y);
    const reverseScore = Math.hypot(boundaryEnd.x - last.x, boundaryEnd.y - last.y)
      + Math.hypot(boundaryStart.x - first.x, boundaryStart.y - first.y);

    if (forwardScore < bestScore) {
      bestScore = forwardScore;
      bestArc = segment;
    }
    if (reverseScore < bestScore) {
      bestScore = reverseScore;
      bestArc = [...segment].reverse();
    }
  }

  if (bestArc.length < 2) return '';

  return buildSvgPolygonPath([...capBoundary, ...bestArc]);
}

function buildNightCorePath(view, centerLonDeg, centerLatDeg, sunDir, nightCoreRadiusDeg = 72) {
  const antiSunDir = [-sunDir[0], -sunDir[1], -sunDir[2]];
  return buildCapRegionPath(view, centerLonDeg, centerLatDeg, antiSunDir, nightCoreRadiusDeg);
}

function buildTwilightPath(view, centerLonDeg, centerLatDeg, sunDir) {
  const antiSunDir = [-sunDir[0], -sunDir[1], -sunDir[2]];
  return buildCapRegionPath(view, centerLonDeg, centerLatDeg, antiSunDir, 90);
}

/**
 * Dia/noite no disco ortográfico: hemisférios pela inclinação solar (dot com normal geocêntrica).
 * @param {object} view shadow plane view (mesmo centro que orthoproj)
 * @param {number} centerLonDeg
 * @param {number} centerLatDeg
 * @param {number} tMs instante da ocultação
 * @param {object} [options]
 * @param {boolean} [options.computeNightFraction=true]
 * @returns {{ dayFill: { path: string }, twilightFill: { path: string }, nightFill: { path: string }, nightFraction: number }}
 */
export function buildGlobeDayNightPaths(view, centerLonDeg, centerLatDeg, tMs, options = {}) {
  const computeNightFraction = options.computeNightFraction ?? true;
  const sunDir = geocentricSunUnitVector(tMs);
  const globeDiskPath = buildGlobeDiskPath(view);
  const twilightPath = buildTwilightPath(view, centerLonDeg, centerLatDeg, sunDir);
  const nightPath = buildNightCorePath(view, centerLonDeg, centerLatDeg, sunDir);

  let nightFraction = null;
  if (computeNightFraction) {
    let nightCount = 0;
    let sampleCount = 0;
    const { cx, cy, radiusPx: r } = view;
    const step = NIGHT_FRACTION_SAMPLE_STEP;
    for (let px = cx - r; px <= cx + r && sampleCount < NIGHT_FRACTION_MAX_SAMPLES; px += step) {
      for (let py = cy - r; py <= cy + r && sampleCount < NIGHT_FRACTION_MAX_SAMPLES; py += step) {
        if ((px - cx) ** 2 + (py - cy) ** 2 > r * r) continue;
        sampleCount++;
        const xNorm = (px - cx) / r;
        const yNorm = -(py - cy) / r;
        const inverse = orthoprojinv(rad(centerLonDeg), rad(centerLatDeg), xNorm, yNorm);
        if (inverse && !isDayAtLonLat(inverse.lonDeg, inverse.latDeg, sunDir)) {
          nightCount++;
        }
      }
    }
    nightFraction = sampleCount > 0 ? nightCount / sampleCount : 0;
  }

  return {
    dayFill: { path: globeDiskPath },
    twilightFill: { path: twilightPath },
    nightFill: { path: nightPath },
    nightFraction,
  };
}
