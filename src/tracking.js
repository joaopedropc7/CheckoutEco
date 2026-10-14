// Captura os parâmetros de rastreamento da URL (UTMs, src, sck).
// Ficam salvos na sessão para não se perderem se o cliente recarregar a página.
const KEYS = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term', 'src', 'sck']
const STORAGE_KEY = 'checkout_tracking'

function readStored() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function captureTracking() {
  const params = new URLSearchParams(window.location.search)
  const stored = readStored()
  const fromUrl = Object.fromEntries(KEYS.filter((k) => params.get(k)).map((k) => [k, params.get(k)]))
  const merged = { ...stored, ...fromUrl }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // sessionStorage indisponível (aba anônima etc.): segue só com a URL
  }
  return merged
}

export function getTrackingParameters() {
  const data = captureTracking()
  return Object.fromEntries(KEYS.map((k) => [k, data[k] ?? null]))
}
