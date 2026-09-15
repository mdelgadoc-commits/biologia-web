<template>
  <div class="layout">
    <div class="topbar">
      <BotonSesion etiqueta="Salir" variante="pequeno" />
    </div>
    <router-view />
  </div>
</template>

<script setup>
import BotonSesion from "@/components/BotonSesion.vue";
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  background-color: #0f172a;
}
</style>
