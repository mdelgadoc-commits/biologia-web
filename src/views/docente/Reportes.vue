<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/services/api'
import BarraLateralDocente from '@/components/layout/BarraLateralDocente.vue'
import { useFiltrosDashboard } from '@/composables/useFiltrosDashboard'
import TarjetasResumen from '@/components/dashboard/TarjetasResumen.vue'
import HeatmapRendimiento from '@/components/dashboard/HeatmapRendimiento.vue'
import ConceptosCriticos from '@/components/dashboard/ConceptosCriticos.vue'
import EvolucionMensual from '@/components/dashboard/EvolucionMensual.vue'

const {
  secciones, temas, estudiantes,
  seccionId, temaId, estudianteId, busquedaAlumno,
  cargarSecciones, cargarTemas,
} = useFiltrosDashboard()

const resumen = ref(null)
const heatmap = ref([])
const evolucion = ref([])
const puntosDebiles = ref([])
const cargando = ref(true)

async function cargarTodo() {
  if (!seccionId.value) return
  cargando.value = true
  const params = { seccion: seccionId.value }
  if (temaId.value) params.tema = temaId.value
  if (estudianteId.value) params.estudiante = estudianteId.value

  try {
    const [
      { data: resumenData },
      { data: heatmapData },
      { data: evolucionData },
      { data: debilesData },
    ] = await Promise.all([
      api.get('/docente/dashboard/resumen/', { params }),
      api.get('/docente/dashboard/heatmap/', { params }),
      api.get('/docente/dashboard/evolucion/', { params }),
      api.get('/docente/dashboard/puntos-debiles/', { params }),
    ])

    resumen.value = resumenData
    heatmap.value = heatmapData
    evolucion.value = evolucionData
    puntosDebiles.value = debilesData
  } catch (err) {
    console.error('Error al cargar reportes:', err)
  } finally {
    cargando.value = false
  }
}

watch([seccionId, temaId, estudianteId], cargarTodo)

onMounted(async () => {
  await Promise.all([cargarSecciones(), cargarTemas()])
  await cargarTodo()
})
</script>

<template>
  <div class="layout-docente">
    <BarraLateralDocente />
    <main class="reportes">
      <h1>Reportes</h1>

      <div class="filtros">
        <label>
          Sección
          <select v-model="seccionId">
            <option v-for="s in secciones" :key="s.id" :value="s.id">{{ s.nombre }}</option>
          </select>
        </label>

        <label>
          Tema
          <select v-model="temaId">
            <option :value="null">Todos</option>
            <option v-for="t in temas" :key="t.id" :value="t.id">{{ t.titulo }}</option>
          </select>
        </label>

        <label>
          Buscar alumno
          <input v-model="busquedaAlumno" placeholder="Nombre..." />
        </label>

        <label>
          Alumno (puntos débiles individuales)
          <select v-model="estudianteId">
            <option :value="null">Vista de todo el salón</option>
            <option v-for="e in estudiantes" :key="e.id" :value="e.id">{{ e.nombre }}</option>
          </select>
        </label>
      </div>

      <div v-if="!cargando" class="contenido">
        <TarjetasResumen :resumen="resumen" />
        <ConceptosCriticos
          :conceptos="puntosDebiles"
          :titulo="estudianteId ? 'Puntos débiles del alumno' : 'Puntos débiles del salón'"
        />
        <HeatmapRendimiento v-if="!estudianteId" :filas="heatmap" />
        <EvolucionMensual v-if="!estudianteId" :series="evolucion" />
      </div>
      <div v-else class="cargando">Cargando reportes...</div>
    </main>
  </div>
</template>

<style scoped>
.layout-docente {
  display: flex;
  min-height: 100vh;
}

.reportes {
  flex: 1;
  margin-left: 72px;
  padding: 24px;
  background: #f4f6f9;
  min-height: 100vh;
}

.filtros { display: flex; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
.filtros label { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; font-weight: 600; }
.filtros select, .filtros input { padding: 8px; border-radius: 6px; border: 1px solid #ccc; min-width: 180px; }
.contenido { display: flex; flex-direction: column; gap: 20px; }
.cargando { text-align: center; padding: 60px; }
</style>

