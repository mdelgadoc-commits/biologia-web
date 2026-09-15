<template>
  <div class="mapa-container">
    <h2 v-if="etapa">{{ etapa }}</h2>
    <p v-if="progreso !== null" class="progreso-texto">Progreso: {{ progreso }}%</p>
    <div v-if="cargando">Cargando temas del servidor...</div>
    <div v-else class="lista-temas">
      <div
        v-for="tema in temas"
        :key="tema.id"
        class="tema-card"
        :class="tema.icono_estado"
        @click="irATema(tema)"
      >
        <span>{{ tema.titulo }}</span>
        <span class="icono">
          {{ tema.icono_estado === "check" ? "✔" : tema.icono_estado === "candado" ? "🔒" : "▶" }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

const etapa = ref("");
const progreso = ref(null);
const temas = ref([]);
const cargando = ref(true);
const router = useRouter();

async function cargarMapa() {
  try {
    const { data } = await api.get("/estudiante/etapas/1/temas/");
    etapa.value = data.etapa;
    progreso.value = data.progreso_porcentaje;
    temas.value = data.temas;
  } catch (e) {
    console.error("Error cargando el mapa:", e);
  } finally {
    cargando.value = false;
  }
}

function irATema(tema) {
  if (tema.icono_estado === "candado") return;
  router.push(`/estudiante/tema/${tema.id}`);
}

onMounted(cargarMapa);
</script>

<style scoped>
.mapa-container {
  padding: 20px 40px;
  text-align: center;
  font-family: sans-serif;
  color: white;
  min-height: calc(100vh - 64px);
  background: #0f172a;
}
.progreso-texto {
  color: #94a3b8;
  font-size: 1.1rem;
  margin-bottom: 20px;
}
.lista-temas {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  margin: 20px auto;
}
.tema-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  color: white;
}
.tema-card.check { background: #27ae60; }
.tema-card.disponible { background: #2980b9; }
.tema-card.candado { background: #95a5a6; cursor: not-allowed; }
</style>
