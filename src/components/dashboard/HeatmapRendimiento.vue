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
