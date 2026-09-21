<template>
  <div class="selector-idioma">
    <label class="selector-idioma__etiqueta" :for="idSelect">
      {{ t('idioma.selector_label') }}:
    </label>
    <div class="selector-idioma__caja">
      <select
        :id="idSelect"
        v-model="idioma"
        class="selector-idioma__select"
      >
        <option
          v-for="l in LOCALES_DISPONIBLES"
          :key="l.codigo"
          :value="l.codigo"
        >
          {{ l.nombre }}
        </option>
      </select>
      <svg
        class="selector-idioma__flecha"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from "vue";
import { useI18n } from "vue-i18n";
import { LOCALES_DISPONIBLES, cambiarIdioma } from "@/i18n";

const { t, locale } = useI18n();

const idSelect = `idioma-${useId()}`;

const idioma = computed({
  get: () => locale.value,
  set: (codigo) => cambiarIdioma(codigo),
});
</script>

<style scoped>
.selector-idioma {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 24px;
}

.selector-idioma__etiqueta {
  font-size: 15px;
  color: #1f2937;
  white-space: nowrap;
}

.selector-idioma__caja {
  position: relative;
  flex: 1;
  max-width: 210px;
  display: flex;
  align-items: center;
}

.selector-idioma__select {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  padding: 12px 36px 12px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 15px;
  color: #1f2937;
  cursor: pointer;
  box-sizing: border-box;
}

.selector-idioma__select:focus {
  outline: none;
  border-color: #f5a623;
}

.selector-idioma__flecha {
  position: absolute;
  right: 12px;
  color: #6b7280;
  pointer-events: none;
}
</style>