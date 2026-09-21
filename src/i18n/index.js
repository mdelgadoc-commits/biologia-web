import { createI18n } from 'vue-i18n'
import esES from './locales/es-ES.json'
import esPE from './locales/es-PE.json'
import en from './locales/en.json'
import pt from './locales/pt.json'

export const LOCALES_DISPONIBLES = [
  { codigo: 'es-ES', nombre: 'Español (España)' },
  { codigo: 'es-PE', nombre: 'Español (castellano)' },
  { codigo: 'en', nombre: 'Inglés (EEUU)' },
  { codigo: 'pt', nombre: 'Portugués' },
]

function detectarLocaleInicial() {
  const guardado = localStorage.getItem('idioma')
  if (guardado) return guardado
  const navegador = navigator.language
  if (navegador.startsWith('es-PE')) return 'es-PE'
  if (navegador.startsWith('es')) return 'es-ES'
  if (navegador.startsWith('en')) return 'en'
  if (navegador.startsWith('pt')) return 'pt'
  return 'es-ES'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectarLocaleInicial(),
  fallbackLocale: 'es-ES',
  messages: { 'es-ES': esES, 'es-PE': esPE, en, pt },
})

export function cambiarIdioma(codigo) {
  i18n.global.locale.value = codigo
  localStorage.setItem('idioma', codigo)
  document.documentElement.setAttribute('lang', codigo)
}
