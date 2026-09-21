<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'

const preguntas = ref([])
const temas = ref([])
const editando = ref(null)

const TIPOS = [
  { value: 'contextual', label: 'Contextual (5 alternativas)' },
  { value: 'vf_premisas', label: 'V/F con 4 premisas' },
  { value: 'cuantas_correctas', label: 'Cuántas son correctas' },
  { value: 'inferencial', label: 'Inferencial' },
  { value: 'completar', label: 'Completar (arrastrar palabras)' },
  { value: 'abierta', label: 'Pregunta abierta' },
]

const form = reactive({
  tema: null,
  tipo: 'contextual',
  enunciado: '',
  dificultad: 1,
  activa: true,
  elementos: [],
  respuesta_modelo: '',
})

const requiereElementos = computed(() => form.tipo !== 'abierta')
const esCompletar = computed(() => form.tipo === 'completar')

function resetForm() {
  editando.value = null
  form.tema = temas.value[0]?.id ?? null
  form.tipo = 'contextual'
  form.enunciado = ''
  form.dificultad = 1
  form.activa = true
  form.elementos = []
  form.respuesta_modelo = ''
}

function agregarElemento(rol = 'alternativa') {
  form.elementos.push({
    rol, contenido: '', es_correcto: false, orden: form.elementos.length, posicion_hueco: null,
  })
}

function quitarElemento(i) {
  form.elementos.splice(i, 1)
}

async function cargarDatos() {
  try {
    const [{ data: preguntasData }, { data: temasData }] = await Promise.all([
      api.get('/docente/preguntas/'),
      api.get('/docente/temas/'),
    ])
    preguntas.value = preguntasData
    temas.value = temasData
    if (!form.tema) form.tema = temas.value[0]?.id ?? null
  } catch (error) {
    console.error('Error al cargar datos:', error)
  }
}

function editar(pregunta) {
  editando.value = pregunta.id
  form.tema = pregunta.tema
  form.tipo = pregunta.tipo
  form.enunciado = pregunta.enunciado
  form.dificultad = pregunta.dificultad
  form.activa = pregunta.activa
  form.elementos = pregunta.elementos.map(e => ({ ...e }))
}

async function guardar() {
  const payload = { ...form }
  if (!requiereElementos.value) delete payload.elementos

  if (editando.value) {
    await api.patch(`/docente/preguntas/${editando.value}/`, payload)
  } else {
    await api.post('/docente/preguntas/', payload)
  }
  await cargarDatos()
  resetForm()
}

async function eliminar(id) {
  if (!confirm('¿Eliminar esta pregunta? Esta acción no se puede deshacer.')) return
  await api.delete(`/docente/preguntas/${id}/`)
  await cargarDatos()
}

onMounted(cargarDatos)
</script>

<template>
  <div class="gestion-preguntas">
    <h1>Gestión de Preguntas (Docente)</h1>

    <div class="layout">
      <!-- Formulario -->
      <form class="form-pregunta" @submit.prevent="guardar">
        <h2>{{ editando ? 'Editar pregunta' : 'Nueva pregunta' }}</h2>

        <label>
          Tema
          <select v-model="form.tema" required>
            <option v-for="t in temas" :key="t.id" :value="t.id">{{ t.titulo }}</option>
          </select>
        </label>

        <label>
          Tipo
          <select v-model="form.tipo">
            <option v-for="t in TIPOS" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </label>

        <label>
          Enunciado
          <textarea v-model="form.enunciado" rows="3" required
            :placeholder="esCompletar ? 'Usa {0}, {1}, {2}... para marcar los huecos' : ''" />
        </label>

        <label class="inline">
          Dificultad
          <input type="number" v-model.number="form.dificultad" min="1" max="5" />
        </label>

        <label class="inline">
          <input type="checkbox" v-model="form.activa" /> Activa
        </label>

        <!-- Abierta: solo respuesta modelo, sin tripletas -->
        <label v-if="form.tipo === 'abierta'">
          Respuesta modelo (referencia para calificar)
          <textarea v-model="form.respuesta_modelo" rows="2" />
        </label>

        <!-- Tripletas: para todo lo demás -->
        <div v-if="requiereElementos" class="elementos">
          <div class="elementos-header">
            <h3>Elementos (tripletas)</h3>
            <div class="botones-agregar">
              <button type="button" @click="agregarElemento('alternativa')">+ Alternativa</button>
              <button type="button" @click="agregarElemento('premisa')">+ Premisa</button>
              <button v-if="esCompletar" type="button" @click="agregarElemento('hueco')">+ Hueco</button>
              <button v-if="esCompletar" type="button" @click="agregarElemento('distractor')">+ Distractor</button>
            </div>
          </div>

          <div v-for="(el, i) in form.elementos" :key="i" class="elemento-row">
            <span class="rol-badge">{{ el.rol }}</span>
            <input v-model="el.contenido" placeholder="Contenido" required />

            <label v-if="el.rol === 'alternativa' || el.rol === 'premisa'" class="inline">
              <input type="checkbox" v-model="el.es_correcto" /> Correcta
            </label>

            <input v-if="el.rol === 'hueco'" type="number" v-model.number="el.posicion_hueco"
              placeholder="Posición ({0}, {1}...)" min="0" style="width: 80px" />

            <button type="button" class="quitar" @click="quitarElemento(i)">✕</button>
          </div>

          <p v-if="form.elementos.length === 0" class="hint">
            Agrega al menos una alternativa (y márcala como correcta) o los huecos/distractores según el tipo.
          </p>
        </div>

        <div class="acciones">
          <button type="submit" class="btn-guardar">
            {{ editando ? 'Guardar cambios' : 'Crear pregunta' }}
          </button>
          <button v-if="editando" type="button" @click="resetForm">Cancelar</button>
        </div>
      </form>

      <!-- Listado -->
      <div class="listado">
        <h2>Preguntas existentes ({{ preguntas.length }})</h2>
        <table>
          <thead>
            <tr><th>Tema</th><th>Tipo</th><th>Enunciado</th><th>Activa</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="p in preguntas" :key="p.id">
              <td>{{ p.tema_titulo }}</td>
              <td>{{ p.tipo }}</td>
              <td class="enunciado-corto">{{ p.enunciado }}</td>
              <td>{{ p.activa ? '✓' : '—' }}</td>
              <td class="fila-acciones">
                <button @click="editar(p)">Editar</button>
                <button class="quitar" @click="eliminar(p.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gestion-preguntas { padding: 24px; margin-left: 72px; color: #333; }
.layout { display: grid; grid-template-columns: 420px 1fr; gap: 24px; align-items: start; }
.form-pregunta, .listado { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
label { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; font-size: 0.9rem; font-weight: 600; }
label.inline { flex-direction: row; align-items: center; gap: 8px; }
input, select, textarea { padding: 8px; border: 1px solid #ccc; border-radius: 6px; font: inherit; }
.elementos-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.botones-agregar button { font-size: 0.75rem; margin-left: 6px; }
.elemento-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.rol-badge { font-size: 0.7rem; background: #eee; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.quitar { color: #c0392b; cursor: pointer; }
.acciones { display: flex; gap: 10px; margin-top: 16px; }
.btn-guardar { background: #2274c9; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
.enunciado-corto { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fila-acciones { display: flex; gap: 6px; }
.hint { font-size: 0.8rem; color: #888; }
</style>
