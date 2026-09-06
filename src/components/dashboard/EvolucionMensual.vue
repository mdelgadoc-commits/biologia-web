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
