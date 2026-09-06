import { describe, it, expect } from 'vitest'
import { formatearTiempo, calcularPorcentaje } from '../formatters'

describe('formatters (stateless)', () => {
  it('formatea ms a tiempo legible', () => {
    expect(formatearTiempo(65000)).toBe('1m 5s')
  })
  it('calcula porcentaje correctamente', () => {
    expect(calcularPorcentaje(8, 10)).toBe(80)
  })
})
