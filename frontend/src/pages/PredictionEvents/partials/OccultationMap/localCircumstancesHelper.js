/**
 * ===========================================================================
 * LOCAL CIRCUMSTANCES — pipeline de cálculo
 * ===========================================================================
 *
 * Fluxo de dados:
 *
 *   clique [lat, lon]
 *        │
 *        ├─(a)─ perpendicularDistanceKm() ──► ρ geodésico (km, com sinal)
 *        │         usa projeção local (plano tangente) na linha central do backend
 *        │
 *        └─(b)─ localCircumstances() (orthoproj) ──► elevações, azimute,
 *                  twilight, dtimeDays, distanceKm (descarte)
 *
 *   ρ geodésico (a)
 *        │
 *        ├─ duração = 2·√(r² − ρ²) / v      (se ρ < r)
 *        ├─ prob    = fctrep(x₁) − fctrep(x₂) (com σ posicional)
 *        ├─ Δd      = ρ / σ
 *        └─ offset  = shiftPathPerpendicular(lineCenter, ρ)
 *
 * Campos oriundos EXCLUSIVAMENTE de localCircumstances (não sobrescritos):
 *   - midTimeMs     (t₀ + dtimeDays·86400·1000)
 *   - starElevationDeg, azimuthDeg  (posição do objeto no céu no ponto clicado)
 *   - sunElevationDeg, moonElevationDeg, twilight
 *
 * Campos calculados com ρ geodésico (sobrescrevem localCircumstances):
 *   - distanceKm         (ρ geodésico)
 *   - durationSec        (acorde geodésico ÷ velocidade)
 *   - probabilityPercent (fctrep com ρ, raio e σ posicional)
 *   - deltaSigma         (ρ / σ posicional)
 *
 * Incerteza posicional (σ):
 *   σ = objectRadiusErrorKm + closestApproachErrorKm
 *   (NÃO inclui o raio do corpo — é a incerteza da posição do centro da sombra)
 *
 * Raio do corpo (r):
 *   r = shadowDiameterKm / 2  (se disponível)
 *   r = objectRadiusKm        (fallback)
 *   shadowDiameterKm = diameter (físico, km) — apparent_diameter NÃO é usado
 *                        pois o banco armazena em mas, não km
 * ===========================================================================
 */

import {
  R_EARTH_KM,
  rad,
  normalizeOccultationEvent,
  validateOccultationEvent,
  getStarSubEarthPoint,
  generateShadowPlaneCentralPoint,
  shadowPlaneVelocityMetersPerSec,
  getSunDirectionInStarFrame,
  getMoonDirectionInStarFrame,
  localCircumstances,
} from '../../../../lib/occultation-tracks/index'
import { mapOccultationToRawEvent } from './endpointGeometry'

const SECONDS_PER_DAY = 86400

export function buildNormalizedEvent(event, pathsData) {
  const raw = mapOccultationToRawEvent(event, pathsData)
  if (!raw) return { ok: false, reasons: ['evento ausente'] }
  const normalized = normalizeOccultationEvent(raw)
  const validation = validateOccultationEvent(normalized)
  return {
    ok: validation.ok,
    event: {
      ...normalized,
      gStar: raw.g_star ?? null,
    },
    reasons: validation.reasons,
  }
}

export function computeLocalCircumstances(interactive, clickLat, clickLon) {
  if (!interactive || !interactive.ok || !interactive.event) {
    return { ok: false, reasons: interactive?.reasons || ['Evento nao normalizado'], circumstances: null }
  }

  try {
    const occEvent = interactive.event
    const [centerLon, centerLat] = getStarSubEarthPoint(
      occEvent.raDeg,
      occEvent.decDeg,
      occEvent.t0Ms,
      occEvent.t0Ms,
      occEvent.pmraMasYr,
      occEvent.pmdecMasYr,
    )

    const earthRadiusM = R_EARTH_KM * 1000
    const [originXM, originYM] = generateShadowPlaneCentralPoint(occEvent)
    const [velXM, velYM] = shadowPlaneVelocityMetersPerSec(occEvent)
    const [sunDirX, sunDirY, sunDirZ] = getSunDirectionInStarFrame(
      occEvent.raDeg,
      occEvent.decDeg,
      occEvent.t0Ms,
    )
    const [moonDirX, moonDirY, moonDirZ] = getMoonDirectionInStarFrame(
      occEvent.raDeg,
      occEvent.decDeg,
      occEvent.t0Ms,
    )

    const bodyRadiusKm = occEvent.shadowDiameterKm > 0
      ? occEvent.shadowDiameterKm / 2
      : occEvent.objectRadiusKm

    const shadowVelX = (velXM / earthRadiusM) * SECONDS_PER_DAY
    const shadowVelY = (velYM / earthRadiusM) * SECONDS_PER_DAY

    const positionalSigmaKm = occEvent.objectRadiusErrorKm + occEvent.closestApproachErrorKm

    const circumstances = localCircumstances({
      clickLonDeg: clickLon,
      clickLatDeg: clickLat,
      mapCenterLonRad: rad(centerLon),
      mapCenterLatRad: rad(centerLat),
      shadowOriginX: originXM / earthRadiusM,
      shadowOriginY: originYM / earthRadiusM,
      shadowVelX,
      shadowVelY,
      bodyRadiusEarthRadii: bodyRadiusKm / R_EARTH_KM,
      uncertaintyEarthRadii: positionalSigmaKm / R_EARTH_KM,
      cosDecStar: Math.cos(rad(occEvent.decDeg)),
      sinDecStar: Math.sin(rad(occEvent.decDeg)),
      sunDirX,
      sunDirY,
      sunDirZ,
      moonDirX,
      moonDirY,
      moonDirZ,
    })

    const midTimeMs = occEvent.t0Ms + circumstances.dtimeDays * SECONDS_PER_DAY * 1000
    const sigmaKm = positionalSigmaKm
    const deltaSigma = sigmaKm > 0 ? Math.abs(circumstances.distanceKm) / sigmaKm : null

    const speedKmPerSec = Math.sqrt(velXM * velXM + velYM * velYM) / 1000

    return {
      ok: true,
      reasons: [],
      circumstances: {
        ...circumstances,
        midTimeMs,
        sigmaKm,
        deltaSigma,
        _bodyRadiusKm: bodyRadiusKm,
        _speedKmPerSec: speedKmPerSec,
      },
    }
  } catch (error) {
    return {
      ok: false,
      reasons: [error?.message || 'Falha ao calcular circunstâncias locais'],
      circumstances: null,
    }
  }
}
