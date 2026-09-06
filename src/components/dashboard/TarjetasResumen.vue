# 1. Tarjetas Resumen
<script setup>
defineProps({ resumen: Object })
</script>

<template>
  <div class="tarjetas" v-if="resumen">
    <div class="tarjeta">
      <span class="label">Total Students</span>
      <span class="valor">{{ resumen.total_students }}</span>
    </div>
    <div class="tarjeta amarilla">
      <span class="label">Pass Rate (>85%)</span>
      <span class="valor">{{ resumen.pass_rate }}%</span>
    </div>
    <div class="tarjeta verde">
      <span class="label">Avg Score</span>
      <span class="valor">{{ resumen.avg_score }}%</span>
    </div>
  </div>
</template>

<style scoped>
.tarjetas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.tarjeta { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 6px; }
.tarjeta.amarilla { background: linear-gradient(135deg, #fff3cd, #ffe08a); }
.tarjeta.verde { background: linear-gradient(135deg, #d4f7dc, #7fe3a3); }
.label { font-size: 0.85rem; color: #555; font-weight: 600; }
.valor { font-size: 1.8rem; font-weight: 800; }
</style>
EOF

# 2. Heatmap de Rendimiento
cat > src/components/dashboard/HeatmapRendimiento.vue << 'EOF'
<script setup>
import { computed } from 'vue'

const props = defineProps({ filas: Array })

const columnas = computed(() => {
  const set = new Set()
  props.filas?.forEach(f => Object.keys(f.temas).forEach(t => set.add(t)))
  return [...set]
})

function color(valor) {
  if (valor === undefined) return '#eee'
  if (valor < 40) return '#e74c3c'
  if (valor < 70) return '#f1c40f'
  return '#2ecc71'
}
</script>

<template>
  <div class="heatmap">
    <h3>Heatmap de Rendimiento</h3>
    <table>
      <thead>
        <tr><th>Alumno</th><th v-for="c in columnas" :key="c">{{ c }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="fila in filas" :key="fila.estudiante">
          <td class="nombre">{{ fila.estudiante }}</td>
          <td v-for="c in columnas" :key="c" :style="{ background: color(fila.temas[c]) }">
            {{ fila.temas[c] !== undefined ? fila.temas[c] + '%' : '—' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.heatmap { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow-x: auto; }
table { border-collapse: collapse; width: 100%; }
th, td { padding: 10px 14px; text-align: center; font-size: 0.85rem; }
.nombre { text-align: left; font-weight: 600; }
td:not(.nombre) { color: white; font-weight: 700; border-radius: 4px; }
</style>
EOF

# 3. Conceptos Críticos / Puntos Débiles
cat > src/components/dashboard/ConceptosCriticos.vue << 'EOF'
<script setup>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { computed } from 'vue'

ChartJS.register(Title, Tooltip, BarElement, CategoryScale, LinearScale)

const props = defineProps({ conceptos: Array, titulo: { type: String, default: 'Conceptos Críticos' } })

const chartData = computed(() => ({
  labels: props.conceptos?.map(c => c.concepto) || [],
  datasets: [{
    label: 'Tasa de error (%)',
    data: props.conceptos?.map(c => c.tasa_error) || [],
    backgroundColor: props.conceptos?.map(c =>
      c.tasa_error >= 70 ? '#e74c3c' : c.tasa_error >= 40 ? '#f1c40f' : '#2ecc71'
    ),
  }],
}))

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { x: { max: 100 } },
}
</script>

<template>
  <div class="conceptos">
    <h3>{{ titulo }}</h3>
    <Bar :data="chartData" :options="chartOptions" />
    <table class="detalle">
      <thead><tr><th>Concepto</th><th>Tema</th><th>Error</th><th>Alumnos afectados</th></tr></thead>
      <tbody>
        <tr v-for="c in conceptos" :key="c.concepto">
          <td>{{ c.concepto }}</td>
          <td>{{ c.tema }}</td>
          <td>{{ c.tasa_error }}%</td>
          <td>{{ c.alumnos_afectados ?? c.alumnos_fallaron }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.conceptos { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
table.detalle { width: 100%; margin-top: 16px; border-collapse: collapse; font-size: 0.85rem; }
table.detalle th, table.detalle td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
</style>
EOF

# 4. Evolución Mensual
cat > src/components/dashboard/EvolucionMensual.vue << 'EOF'
<script setup>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js'
import { computed } from 'vue'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps({ series: Array })

const colores = ['#2980b9', '#e67e22', '#27ae60', '#8e44ad', '#c0392b']

const chartData = computed(() => {
  const meses = new Set()
  props.series?.forEach(s => s.puntos.forEach(p => meses.add(p.mes)))
  const mesesOrdenados = [...meses].sort()

  return {
    labels: mesesOrdenados,
    datasets: props.series?.map((s, i) => ({
      label: s.estudiante,
      data: mesesOrdenados.map(m => s.puntos.find(p => p.mes === m)?.porcentaje ?? null),
      borderColor: colores[i % colores.length],
      backgroundColor: colores[i % colores.length],
      tension: 0.3,
    })) || [],
  }
})

const chartOptions = { responsive: true, scales: { y: { min: 0, max: 100 } } }
</script>

<template>
  <div class="evolucion">
    <h3>Panel de Evolución Mensual</h3>
    <Line :data="chartData" :options="chartOptions" />
    <div class="ranking">
      <div v-for="(s, i) in series" :key="s.estudiante" class="fila-ranking">
        <span class="puesto">{{ i + 1 }}°</span>
        <span class="nombre">{{ s.estudiante }}</span>
        <span class="promedio">Promedio: {{ s.promedio }}%</span>
        <span :class="['mejora', s.mejora_este_mes >= 0 ? 'positiva' : 'negativa']">
          {{ s.mejora_este_mes >= 0 ? '▲' : '▼' }} {{ Math.abs(s.mejora_este_mes) }}% este mes
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.evolucion { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.ranking { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.fila-ranking { display: flex; gap: 14px; align-items: center; font-size: 0.9rem; padding: 8px; border-radius: 8px; background: #f8f8f8; }
.puesto { font-weight: 800; width: 24px; }
.nombre { font-weight: 600; flex: 1; }
.mejora.positiva { color: #27ae60; font-weight: 700; }
.mejora.negativa { color: #e74c3c; font-weight: 700; }
</style>
