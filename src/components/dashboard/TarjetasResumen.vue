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