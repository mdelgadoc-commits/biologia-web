<template>
  <div class="login-container">
    <SelectorIdioma />
    <h1>{{ $t('hello') }}</h1>
    <form @submit.prevent="entrar">
      <div class="input-group">
        <input 
          v-model="username" 
          type="text" 
          placeholder="Usuario" 
          required 
        />
      </div>

      <div class="input-group password-group">
        <input
          :type="mostrarPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="Contraseña"
          required
        />
        <button
          type="button"
          class="btn-ojo"
          @click="mostrarPassword = !mostrarPassword"
          :title="mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
        >
          <!-- Icono Ojo Abierto -->
          <svg v-if="!mostrarPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <!-- Icono Ojo Tachado -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>
      </div>

      <button type="submit" class="btn-submit" :disabled="cargando">
        {{ cargando ? "Ingresando..." : "COMENZAR" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import SelectorIdioma from "@/components/SelectorIdioma.vue";

const username = ref("");
const password = ref("");
const mostrarPassword = ref(false);
const cargando = ref(false);
const error = ref("");

const router = useRouter();
const auth = useAuthStore();

async function entrar() {
  error.value = "";
  cargando.value = true;
  try {
    await auth.login(username.value, password.value);
    router.push(auth.rol === "docente" ? "/docente" : "/estudiante");
  } catch {
    error.value = "Usuario o contraseña incorrectos";
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.login-container {
  max-width: 340px;
  margin: 80px auto;
  text-align: center;
  font-family: sans-serif;
}

.input-group {
  margin-bottom: 14px;
}

.password-group {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 15px;
}

.password-group input {
  padding-right: 42px;
}

.btn-ojo {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.btn-ojo:hover {
  color: #1f2937;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: #f5a623;
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.error {
  color: #ef4444;
  margin-top: 14px;
  font-weight: bold;
}
</style>
