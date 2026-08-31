<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import MapaEtapaNodo from '@/components/mapa/MapaEtapaNodo.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const etapa = ref(null)
const perfil = ref({ vidas: 3, monedas: 120 })
const cargando = ref(true)

const paleta = ['#3b6ea5', '#c0562f', '#4a7c3a', '#8a5a2f', '#c0562f']
const offsets = ['0px', '120px', '-40px', '-140px', '20px']

const datosSimulados = {
  titulo: 'Etapa 1: Biología como Ciencia',
  temas: [
    { id: 1, titulo: 'Concepto', desbloqueado: true, icono: '📖' },
    { id: 2, titulo: 'Áreas', desbloqueado: false, icono: '🌱' },
    { id: 3, titulo: 'Objeto', desbloqueado: false, icono: '🧬' },
    { id: 4, titulo: 'Autores', desbloqueado: false, icono: '📜' },
    { id: 5, titulo: 'Síntesis', desbloqueado: false, icono: '👨‍🏫' },
  ]
}

async function cargarMapa() {
  cargando.value = true
  try {
    // Si la API tarda más de 1.5s, pasa al bloque catch para mostrar el prototipo
    const [{ data: etapaData }, { data: perfilData }] = await Promise.all([
      api.get('/estudiante/etapas/', { timeout: 1500 }),
      api.get('/estudiante/perfil/', { timeout: 1500 }),
    ])
    etapa.value = etapaData
    perfil.value = perfilData
  } catch (e) {
    console.log('Mostrando modo prototipo/demostración visual.')
    etapa.value = datosSimulados
  } finally {
    cargando.value = false
  }
}

function irATema(tema) {
  if (!tema.desbloqueado) return
  alert(`Iniciando tema: ${tema.titulo}`)
}

onMounted(cargarMapa)
</script>

<template>
  <div class="mapa-etapas" v-if="!cargando && etapa">
    <header class="barra-superior">
      <button class="btn-back">▶</button>
      <h1>{{ etapa.titulo }}</h1>
      <div class="stats">
        <span class="vidas">
          <span v-for="n in 3" :key="n" :class="{ vacio: n > perfil.vidas }">❤️</span>
        </span>
        <span class="monedas">🪙 {{ perfil.monedas }}</span>
      </div>
    </header>

    <div class="camino">
      <MapaEtapaNodo
        v-for="(tema, i) in [...etapa.temas].reverse()"
        :key="tema.id"
        :titulo="tema.titulo"
        :desbloqueado="tema.desbloqueado"
        :color="paleta[i % paleta.length]"
        :offset="offsets[i % offsets.length]"
        @click="irATema(tema)"
      >
        <template #icono>{{ tema.icono || '📘' }}</template>
      </MapaEtapaNodo>
    </div>

    <button
      class="btn-comenzar"
      :disabled="!etapa.temas.some(t => t.desbloqueado)"
      @click="irATema(etapa.temas.find(t => t.desbloqueado))"
    >
      ¡Comenzar!
    </button>
  </div>

  <div v-else class="cargando">Cargando mapa...</div>
</template>

<style scoped>
.mapa-etapas {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #1b4332 0%, #2d6a4f 40%, #a3b18a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.barra-superior {
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e4d2b;
  border: 3px solid #4895ef;
  color: white;
  padding: 10px 16px;
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.btn-back {
  background: #4cc9f0;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.barra-superior h1 {
  font-size: 1rem;
  margin: 0;
  font-weight: 800;
}

.stats {
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: bold;
}

.vidas .vacio {
  filter: grayscale(1) opacity(0.3);
}

.camino {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 35px;
  margin-bottom: 40px;
  padding: 20px 0;
}

.btn-comenzar {
  width: 100%;
  max-width: 380px;
  padding: 16px;
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  background: linear-gradient(180deg, #3a86ff 0%, #00296b 100%);
  border: 3px solid #90e0ef;
  border-radius: 35px;
  box-shadow: 0 6px 0 #001233, 0 10px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 0.1s ease;
}

.btn-comenzar:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #001233;
}

.btn-comenzar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cargando {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
