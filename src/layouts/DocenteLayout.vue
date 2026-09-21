<template>
  <div class="layout">
    <BarraLateralDocente />
    <div class="topbar">
      <BotonSesion etiqueta="Cerrar cuenta" variante="grande" />
    </div>
    <router-view />
  </div>
</template>

<script setup>
import BotonSesion from "@/components/BotonSesion.vue";
import BarraLateralDocente from "@/components/layout/BarraLateralDocente.vue";
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  background-color: #1e293b;
}
</style>
