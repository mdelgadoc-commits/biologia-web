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
