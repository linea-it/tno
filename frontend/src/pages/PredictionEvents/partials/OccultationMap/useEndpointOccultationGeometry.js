import { useMemo } from 'react'
import { buildEndpointGeometry } from './endpointGeometry'
import { buildNormalizedEvent } from './localCircumstancesHelper'

export function useEndpointOccultationGeometry(pathsData, event) {
  const geometry = useMemo(() => {
    if (!pathsData) return { status: 'loading', error: null }

    try {
      const result = buildEndpointGeometry(pathsData)
      return result
    } catch (error) {
      return {
        status: 'geometry-error',
        error: error?.message || 'Erro ao adaptar geometria do endpoint',
      }
    }
  }, [pathsData])

  const interactive = useMemo(() => {
    if (!event || !pathsData) {
      return { ok: false, event: null, reasons: ['Dados do evento indisponíveis para clique interativo'] }
    }
    const normalized = buildNormalizedEvent(event, pathsData)
    return {
      ok: normalized.ok,
      event: normalized.ok ? normalized.event : null,
      reasons: normalized.reasons,
    }
  }, [event, pathsData])

  return { geometry, interactive }
}
