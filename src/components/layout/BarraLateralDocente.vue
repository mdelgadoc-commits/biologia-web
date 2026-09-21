<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <aside class="barra-lateral">
    <RouterLink to="/docente/dashboard" class="item" title="Dashboard">
      <span class="icono">📈</span>
      <span class="etiqueta">Dashboard</span>
    </RouterLink>
    <RouterLink to="/docente/reportes" class="item" title="Reportes">
      <span class="icono">📊</span>
      <span class="etiqueta">Reportes</span>
    </RouterLink>
    <RouterLink to="/docente/preguntas" class="item" title="Preguntas">
      <span class="icono">❓</span>
      <span class="etiqueta">Preguntas</span>
    </RouterLink>
  </aside>
</template>

<style scoped>
.barra-lateral {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 72px;
  background: #1e4d2b;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  gap: 16px;
  z-index: 10;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 60px;
  padding: 10px 4px;
  border-radius: 10px;
  text-decoration: none;
  color: #cfe8d4;
  font-size: 0.6rem;
  font-weight: 700;
}

.item .icono { font-size: 1.6rem; }

.item.router-link-active {
  background: #2d6a4f;
  color: #fff;
}
</style>