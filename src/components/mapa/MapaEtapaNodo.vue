<script setup>
defineProps({
  titulo: String,
  desbloqueado: Boolean,
  color: { type: String, default: '#4a7c3a' },
  offset: { type: String, default: '0' },
})
defineEmits(['click'])
</script>

<template>
  <button
    class="nodo"
    :class="{ bloqueado: !desbloqueado }"
    :style="{ '--color-nodo': color, '--offset': offset }"
    :disabled="!desbloqueado"
    @click="$emit('click')"
  >
    <span class="circulo">
      <slot name="icono" />
    </span>
    <span class="cinta">{{ titulo }}</span>
    <span v-if="!desbloqueado" class="candado">🔒</span>
  </button>
</template>

<style scoped>
.nodo {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: var(--offset);
  padding: 0;
  width: 150px;
}

.circulo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--color-nodo);
  border: 5px solid #ffd76b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: 0 6px 0 rgba(0,0,0,0.25);
  transition: transform 0.15s ease;
}

.nodo:not(.bloqueado):hover .circulo {
  transform: scale(1.05);
}

.cinta {
  margin-top: -14px;
  background: var(--color-nodo);
  filter: brightness(0.85);
  color: white;
  font-weight: 700;
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 0.95rem;
  box-shadow: 0 3px 0 rgba(0,0,0,0.2);
  white-space: nowrap;
}

.bloqueado {
  cursor: not-allowed;
}

.bloqueado .circulo,
.bloqueado .cinta {
  filter: grayscale(0.4) brightness(0.6);
}

.candado {
  position: absolute;
  bottom: 28px;
  right: 6px;
  background: #ffb703;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 2px 0 rgba(0,0,0,0.3);
}
</style>
