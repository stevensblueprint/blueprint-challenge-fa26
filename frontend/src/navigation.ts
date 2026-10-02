import { useSyncExternalStore } from 'react'

function currentPath() {
  return window.location.hash.slice(1) || '/'
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function navigate(path: string) {
  if (currentPath() === path) return
  window.history.pushState(null, '', `#${path}`)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function usePath() {
  return useSyncExternalStore(subscribe, currentPath)
}
