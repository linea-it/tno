import { useState, useEffect } from 'react'

/**
 * Retorna true quando a aba está visível, false quando está em background.
 * Permite pausar polling e economizar recursos quando o usuário não está vendo a página.
 */
function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(() =>
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  )

  useEffect(() => {
    const handleChange = () => setIsVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handleChange)
    return () => document.removeEventListener('visibilitychange', handleChange)
  }, [])

  return isVisible
}

export default usePageVisibility
