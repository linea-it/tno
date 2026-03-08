import { useMemo } from 'react'
import usePageVisibility from './usePageVisibility'
import useInterval from './useInterval'

/**
 * Polling adaptativo: intervalo varia conforme estado do job e visibilidade da aba.
 *
 * @param {Object} options
 * @param {boolean} options.enabled - Se o polling está habilitado (ex.: !!id)
 * @param {boolean} options.isActive - Job em execução (polling mais rápido)
 * @param {() => void} options.onTick - Callback executado a cada tick
 * @param {number} [options.activeIntervalMs=6000] - Intervalo quando isActive (melhor UX)
 * @param {number|null} [options.idleIntervalMs=null] - Intervalo quando job finalizado (null = para)
 * @param {boolean} [options.pauseWhenHidden=true] - Pausar quando aba em background
 */
function useAdaptivePolling({
  enabled,
  isActive,
  onTick,
  activeIntervalMs = 6000,
  idleIntervalMs = null,
  pauseWhenHidden = true,
}) {
  const isVisible = usePageVisibility()

  const delay = useMemo(() => {
    if (!enabled) return null
    if (pauseWhenHidden && !isVisible) return null
    if (isActive) return activeIntervalMs
    return idleIntervalMs
  }, [enabled, isActive, isVisible, pauseWhenHidden, activeIntervalMs, idleIntervalMs])

  useInterval(onTick, delay)
}

export default useAdaptivePolling
