<template>
  <button class="boton-sesion" :class="variante" @click="salir">
    {{ etiqueta }}
  </button>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

defineProps({
  etiqueta: { type: String, default: "Salir" },
  variante: { type: String, default: "pequeno" },
});

const router = useRouter();
const auth = useAuthStore();

function salir() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.boton-sesion {
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
  transition: opacity 0.2s ease;
}
.boton-sesion:hover {
  opacity: 0.9;
}
.pequeno {
  background: #e74c3c;
  width: 90px;
  height: 40px;
  font-size: 14px;
}
.grande {
  background: #c0392b;
  width: 200px;
  height: 60px;
  font-size: 18px;
}
</style>
