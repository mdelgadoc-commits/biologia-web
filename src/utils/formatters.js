export function formatearTiempo(ms) {
  if (ms == null) return '—'
  const seg = Math.round(ms / 1000)
  const min = Math.floor(seg / 60)
  const restoSeg = seg % 60
  return min > 0 ? `${min}m ${restoSeg}s` : `${seg}s`
}

export function calcularPorcentaje(correctas, total) {
  if (!total) return 0
  return Math.round((correctas / total) * 100)
}
