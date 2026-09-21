<template>
  <div class="mapa-gamificado">
    <div class="campo-estrellas" aria-hidden="true">
      <span
        v-for="estrella in estrellas"
        :key="estrella.id"
        class="estrella"
        :style="estiloEstrella(estrella)"
      ></span>
    </div>

    <div v-if="cargando" class="cargando">Cargando el mapa...</div>

    <template v-else>
      <header class="topbar">
        <button class="back-btn" aria-label="Volver" @click="volver">&larr;</button>
        <div class="topbar-info">
          <p class="eyebrow">NIVEL {{ nivel }}</p>
          <h2 class="topbar-title">{{ etapa }}</h2>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progresoCss }"></div>
        </div>
        <span class="progress-label">{{ completados.size }} / {{ temas.length }}</span>
      </header>

      <section class="hero">
        <h1>La vida es un viaje</h1>
        <p>Recorre los distintos hitos del nivel y desbloquea cada estación.</p>
      </section>

      <div class="map-wrap">
        <div class="map-canvas">
          <svg class="path-svg" viewBox="0 0 400 840" preserveAspectRatio="none">
            <path ref="caminoBase" class="path-line" :d="CAMINO_D" />
            <path ref="caminoLit" class="path-line lit" :d="CAMINO_D" />
          </svg>

          <button
            v-for="(tema, i) in temas"
            :key="tema.id"
            class="node"
            :class="estadoDe(tema, i)"
            :style="estiloNodo(i)"
            :disabled="estadoDe(tema, i) === 'locked'"
            @click="abrirEstacion(tema, i)"
          >
            <div class="node-circle" v-html="iconoEstacion(i)"></div>
            <span v-if="estadoDe(tema, i) === 'locked'" class="candado-badge">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="10" width="14" height="10" rx="2.5" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span v-else-if="estadoDe(tema, i) === 'done'" class="check-badge">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 12.5l4 4 8-9" />
              </svg>
            </span>
            <span class="node-label">{{ tema.titulo }}</span>
            <span class="node-sub">{{ SUBTITULOS[i % SUBTITULOS.length] }}</span>
          </button>
        </div>

        <section class="extras">
          <h2 class="extras-titulo">Retos extra</h2>
          <div class="extras-grid">
            <button class="extras-card extra-copito" @click="abrirJuego('vf')">
            <div class="extras-icono">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                <path d="M5 13a7 7 0 0 1 7-7 7 7 0 0 1 7 7c0 4-3 7-7 7s-7-3-7-7z" opacity=".9" />
                <circle cx="9" cy="12" r="1.2" fill="#fff" />
                <circle cx="15" cy="12" r="1.2" fill="#fff" />
              </svg>
            </div>
            <div class="extras-info">
              <span class="extras-nombre">Copito</span>
              <span class="extras-sub">Verdadero o falso</span>
              <span class="extras-estrellas" v-html="renderEstrellas(mejoresEstrellas.vf)"></span>
            </div>
          </button>

          <button class="extras-card extra-examen" @click="abrirJuego('mcq')">
            <div class="extras-icono">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 3h6v4h4v14H5V7h4z" />
                <path d="M9 12h6M9 16h6" />
              </svg>
            </div>
            <div class="extras-info">
              <span class="extras-nombre">Examen</span>
              <span class="extras-sub">Repaso del nivel</span>
              <span class="extras-estrellas" v-html="renderEstrellas(mejoresEstrellas.mcq)"></span>
            </div>
          </button>
          </div>
        </section>
      </div>
    </template>

    <div v-if="estacionActiva" class="modal-scrim" @click.self="cerrarModal">
      <div class="modal-card">
        <button class="modal-close" aria-label="Cerrar" @click="cerrarModal">&times;</button>
        <div class="modal-icon" :style="{ color: colorEstacion(estacionActiva.index) }">
          <span v-html="iconoEstacion(estacionActiva.index)"></span>
        </div>
        <h3 class="modal-titulo">{{ estacionActiva.tema.titulo }}</h3>
        <p class="modal-sub">{{ SUBTITULOS[estacionActiva.index % SUBTITULOS.length] }}</p>
        <div class="modal-cuerpo" v-html="cuerpoLeccion(estacionActiva.index)"></div>
        <div class="modal-acciones">
          <button class="btn btn-secundario" @click="cerrarModal">Más tarde</button>
          <button
            class="btn btn-primary"
            @click="marcarCompletado"
            :disabled="estadoDe(estacionActiva.tema, estacionActiva.index) === 'done'"
          >
            Marcar como completado
          </button>
        </div>
      </div>
    </div>

    <div v-if="juegoAbierto" class="modal-scrim" @click.self="juegoAbierto.terminado && cerrarJuego()">
      <div class="modal-card juego-card">
        <button class="modal-close" aria-label="Cerrar" @click="cerrarJuego">&times;</button>
        <header class="juego-head">
          <span class="juego-titulo">{{ NOMBRES_JUEGO[juegoAbierto.tipo] }}</span>
          <span class="juego-progreso">
            {{ juegoAbierto.terminado ? "Finalizado" : `${juegoAbierto.indice + 1} / ${juegoAbierto.preguntas.length}` }}
          </span>
        </header>

        <template v-if="!juegoAbierto.terminado">
          <p class="juego-pregunta">{{ juegoAbierto.preguntas[juegoAbierto.indice].q }}</p>
          <div class="juego-opciones">
            <button
              v-for="(opcion, oi) in juegoAbierto.preguntas[juegoAbierto.indice].opciones"
              :key="oi"
              class="juego-opcion"
              :class="claseOpcion(oi)"
              :disabled="juegoAbierto.elegida !== null"
              @click="responder(oi)"
            >
              {{ opcion.texto }}
            </button>
          </div>
        </template>

        <div v-else class="juego-resultado">
          <div v-html="renderEstrellas(juegoAbierto.aciertos)"></div>
          <p class="juego-mensaje">{{ mensajeResultado(juegoAbierto.aciertos) }}</p>
        </div>

        <div v-if="!juegoAbierto.terminado" class="pista">
          {{ juegoAbierto.tipo === "vf" ? "Elige la opción correcta." : "Selecciona la respuesta correcta." }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

const POSICIONES = [
  { left: 50, top: 90.5 },
  { left: 23, top: 72.6 },
  { left: 68, top: 56 },
  { left: 31, top: 33.8 },
  { left: 47.5, top: 10.7 },
];
const CAMINO_D =
  "M200,760 C 90,720 60,660 90,610 C 120,555 250,540 270,470 C 285,415 150,400 125,335 C 105,285 220,255 235,195 C 245,150 190,130 190,90";
const PALETA = ["#10B981", "#22D3EE", "#A78BFA", "#F59E0B", "#FB7185"];
const SUBTITULOS = [
  "Conceptos clave",
  "¿Qué estudia la biología?",
  "Nuestra historia",
  "Las ramas del saber",
  "El examen final",
];

const ICONOS = [
  '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.2"/><circle cx="17" cy="7" r="1.1"/></svg>',
  '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><line x1="15.5" y1="15.5" x2="20" y2="20"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
  '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 4 6 7 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10z"/><circle cx="12" cy="12" r="1.3"/></svg>',
  '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><path d="M12 11C9 11 7 13 6 16"/><path d="M12 11c3 0 5 2 6 5"/><path d="M12 14v7"/></svg>',
  '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-6"/><path d="M12 16c-5 0-8-2-9-7 4 0 7 2 9 4 2-2 5-4 9-4-1 5-4 7-9 7z"/></svg>',
];

const CUERPOS_LECCION = {
  0: "<p>La vida es mucho más que la suma de sus partes. En esta estación descubrirás por qué se considera a la célula como la unidad fundamental de todos los seres vivos y qué los distingue de la materia inerte.</p><p>Avanza cuando te sientas lista o listo para continuar tu viaje.</p>",
  1: "<p>La biología estudia la enorme diversidad de la vida: desde las moléculas hasta los ecosistemas. Aquí conocerás los principales niveles de organización y las herramientas con las que los biólogos investigan.</p><p>Presta atención: los retos de la siguiente estación estarán basados en estos conceptos.</p>",
  2: "<p>¿De dónde venimos? La evolución explica el origen y la diversidad de las especies. Copito te acompañará en este tramo con un reto de verdadero o falso para afianzar lo aprendido.</p><p>Cuando termines el juego, tu estación quedará marcada como completada.</p>",
  3: "<p>La biología se divide en grandes ramas: desde la genética hasta la ecología. Cada rama estudia un aspecto distinto de la vida, pero todas se conectan entre sí.</p><p>Identifica las principales ramas para prepararte para el examen final del nivel.</p>",
  4: "<p>Llegaste hasta aquí: nuestra historia culmina en un gran árbol que conecta a todas las especies. Es hora de demostrar todo lo que aprendiste en el examen final.</p><p>Asciende en la escala de estrellas y completa el nivel.</p>",
};

const TF_POOL = [
  { q: "La célula es la unidad fundamental de los seres vivos.", a: true },
  { q: "Todos los seres vivos están formados por una sola célula.", a: false },
  { q: "La homeostasis mantiene el equilibrio interno del organismo.", a: true },
  { q: "Los virus son considerados células por la mayoría de los biólogos.", a: false },
  { q: "El ADN guarda la información genética de un ser vivo.", a: true },
  { q: "Las plantas realizan la fotosíntesis para obtener nutrientes.", a: true },
  { q: "Las bacterias pertenecen al reino Fungi.", a: false },
  { q: "El nivel de organización más simple es la biosfera.", a: false },
  { q: "La evolución explica la diversidad de las especies.", a: true },
  { q: "Los seres vivos no necesitan energía para vivir.", a: false },
];

const MCQ_POOL = [
  { q: "¿Cuál es la unidad fundamental de la vida?", opciones: ["La célula", "El átomo", "El tejido", "El órgano"], respuesta: 0 },
  { q: "¿Qué rama de la biología estudia la clasificación de los seres vivos?", opciones: ["Genética", "Taxonomía", "Evolución", "Ecología"], respuesta: 1 },
  { q: "¿Qué molécula contiene la información hereditaria?", opciones: ["Proteína", "Lípido", "ADN", "Glucosa"], respuesta: 2 },
  { q: "El proceso por el que las plantas fabrican su alimento recibe el nombre de:", opciones: ["Respiración", "Fotosíntesis", "Fermentación", "Excreción"], respuesta: 1 },
  { q: "¿Cuál es el nivel más sencillo de organización de la materia viva?", opciones: ["Tejido", "Órgano", "Célula", "Sistema"], respuesta: 2 },
  { q: "La teoría de la evolución por selección natural fue postulada por:", opciones: ["Mendel", "Darwin", "Pasteur", "Linneo"], respuesta: 1 },
  { q: "¿Qué reino agrupa organismos eucariotas unicelulares y sus descendientes?", opciones: ["Animalia", "Plantae", "Fungi", "Protista"], respuesta: 3 },
  { q: "Una idea clave de la biología es que toda la vida comparte:", opciones: ["El mismo tamaño", "El mismo hábitat", "Un origen y código genético común", "El mismo número de células"], respuesta: 2 },
];

const NOMBRES_JUEGO = { vf: "Juego de Copito", mcq: "Examen" };
const PREGUNTAS_POR_JUEGO = 5;
const SS_KEY = "biologia_mapa_etapa_1";
const SS_KEY_EXTRA = "biologia_mapa_extra";
const SIMULADOS = {
  etapa: "Etapa 1: Fundamentos de la vida",
  temas: [
    { id: 1, titulo: "¿Qué es la vida?", desbloqueado: true, completado: false, icono_estado: "disponible" },
    { id: 2, titulo: "El objeto de estudio", desbloqueado: false, completado: false, icono_estado: "candado" },
    { id: 3, titulo: "¿De dónde venimos?", desbloqueado: false, completado: false, icono_estado: "candado" },
    { id: 4, titulo: "Las grandes ramas", desbloqueado: false, completado: false, icono_estado: "candado" },
    { id: 5, titulo: "El árbol de la vida", desbloqueado: false, completado: false, icono_estado: "candado" },
  ],
};

const router = useRouter();
const nivel = 1;

const etapa = ref("");
const temas = ref([]);
const cargando = ref(true);
const completados = ref(new Set());
const caminoBase = ref(null);
const caminoLit = ref(null);
const estacionActiva = ref(null);
const juegoAbierto = ref(null);
const mejoresEstrellas = ref({ vf: 0, mcq: 0 });

const estrellas = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 2.6 + 1,
  delay: Math.random() * 4,
  dur: Math.random() * 3 + 2,
  opacity: Math.random() * 0.65 + 0.15,
}));

const progresoCss = computed(() =>
  temas.value.length ? `${Math.round((completados.value.size / temas.value.length) * 100)}%` : "0%"
);

function estiloEstrella(estrella) {
  return {
    left: `${estrella.left}%`,
    top: `${estrella.top}%`,
    width: `${estrella.size}px`,
    height: `${estrella.size}px`,
    opacity: estrella.opacity,
    animationDuration: `${estrella.dur}s`,
    animationDelay: `${estrella.delay}s`,
  };
}

function estadoDe(tema, index) {
  if (tema.completado || completados.value.has(tema.id)) return "done";
  const previo = temas.value[index - 1];
  const previoCompleto = previo && (previo.completado || completados.value.has(previo.id));
  if (index === 0 || tema.desbloqueado || previoCompleto) return "current";
  return "locked";
}

function colorEstacion(index) {
  return PALETA[index % PALETA.length];
}

function estiloNodo(index) {
  const p = POSICIONES[index] || { left: 50, top: 50 };
  return {
    left: `${p.left}%`,
    top: `${p.top}%`,
    "--c-accent": colorEstacion(index),
  };
}

function iconoEstacion(index) {
  return ICONOS[index % ICONOS.length];
}

function cuerpoLeccion(index) {
  return CUERPOS_LECCION[index] ?? "<p>Explora esta estación y completa el reto para avanzar.</p>";
}

function abrirEstacion(tema, index) {
  if (estadoDe(tema, index) === "locked") return;
  estacionActiva.value = { tema, index };
}

function cerrarModal() {
  estacionActiva.value = null;
}

function marcarCompletado() {
  if (!estacionActiva.value) return;
  completados.value.add(estacionActiva.value.tema.id);
  guardarCompletados();
  iluminarCamino();
  cerrarModal();
}

function completarEstacion(index) {
  const tema = temas.value[index];
  if (!tema) return;
  completados.value.add(tema.id);
  guardarCompletados();
  iluminarCamino();
}

function abrirJuego(tipo) {
  const pool = tipo === "vf" ? TF_POOL : MCQ_POOL;
  const seleccion = mezclar(pool).slice(0, PREGUNTAS_POR_JUEGO).map((pregunta) => {
    if (tipo === "vf") {
      return {
        q: pregunta.q,
        opciones: [
          { texto: "Verdadero", esCorrecta: pregunta.a === true },
          { texto: "Falso", esCorrecta: pregunta.a === false },
        ],
      };
    }
    return {
      q: pregunta.q,
      opciones: pregunta.opciones.map((texto, i) => ({
        texto,
        esCorrecta: i === pregunta.respuesta,
      })),
    };
  });
  juegoAbierto.value = {
    tipo,
    preguntas: seleccion,
    indice: 0,
    aciertos: 0,
    elegida: null,
    terminado: false,
    estacionIndex: tipo === "vf" ? 2 : temas.value.length - 1,
    temporizador: null,
  };
}

function mezclar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function responder(oi) {
  const juego = juegoAbierto.value;
  if (!juego || juego.elegida !== null) return;
  const opcion = juego.preguntas[juego.indice].opciones[oi];
  juego.elegida = oi;
  if (opcion.esCorrecta) juego.aciertos += 1;

  if (juego.temporizador) window.clearTimeout(juego.temporizador);
  juego.temporizador = window.setTimeout(() => {
    if (juego.indice + 1 < juego.preguntas.length) {
      juego.indice += 1;
      juego.elegida = null;
    } else {
      juego.terminado = true;
      guardarEstrellas(mejoresEstrellas.value, juego.tipo, juego.aciertos);
      if (juego.aciertos > 0) completarEstacion(juego.estacionIndex);
    }
  }, 550);
}

function claseOpcion(oi) {
  const juego = juegoAbierto.value;
  if (!juego || juego.elegida === null) return "";
  const opcion = juego.preguntas[juego.indice].opciones[oi];
  if (opcion.esCorrecta) return "correct";
  if (juego.elegida === oi) return "incorrect";
  return "";
}

function renderEstrellas(aciertos) {
  let html = '<span class="star-row">';
  for (let i = 1; i <= 5; i += 1) {
    html += `<span class="star ${i <= aciertos ? "on" : "off"}">★</span>`;
  }
  return `${html}</span>`;
}

function mensajeResultado(aciertos) {
  if (aciertos === PREGUNTAS_POR_JUEGO) return "¡Perfecto! Dominas esta estación.";
  if (aciertos >= 4) return "¡Muy bien! Solo te faltó un poco.";
  if (aciertos >= 3) return "Buen trabajo, puedes mejorar.";
  return "Sigue practicando, lo lograrás.";
}

function cerrarJuego() {
  if (juegoAbierto.value?.temporizador) window.clearTimeout(juegoAbierto.value.temporizador);
  juegoAbierto.value = null;
}

function guardarCompletados() {
  localStorage.setItem(SS_KEY, JSON.stringify([...completados.value]));
}

function guardarEstrellas(estado, tipo, aciertos) {
  const previo = estado[tipo] || 0;
  const nuevo = Math.min(aciertos, 5);
  if (nuevo <= previo) return;
  estado[tipo] = nuevo;
  localStorage.setItem(SS_KEY_EXTRA, JSON.stringify(estado));
}

function cargarEstrellas() {
  try {
    const guardado = JSON.parse(localStorage.getItem(SS_KEY_EXTRA) || "{}");
    if (typeof guardado.vf === "number") mejoresEstrellas.value.vf = guardado.vf;
    if (typeof guardado.mcq === "number") mejoresEstrellas.value.mcq = guardado.mcq;
  } catch {
    // ignora datos corruptos del almacenamiento local
  }
}

function cargarCompletados() {
  try {
    const guardado = JSON.parse(localStorage.getItem(SS_KEY) || "[]");
    guardado.forEach((id) => completados.value.add(id));
  } catch {
    // ignora datos corruptos del almacenamiento local
  }
}

function iluminarCamino() {
  const base = caminoBase.value;
  const lit = caminoLit.value;
  if (!base || !lit || typeof base.getTotalLength !== "function") return;
  const largo = base.getTotalLength();
  const n = temas.value.length;
  const fraccion = n ? completados.value.size / n : 0;
  lit.style.strokeDasharray = `${largo * fraccion} ${largo}`;
}

function volver() {
  router.push("/login");
}

async function cargarMapa() {
  try {
    const { data } = await api.get("/estudiante/etapas/1/temas/", { timeout: 1500 });
    etapa.value = data.etapa;
    temas.value = data.temas;
  } catch {
    etapa.value = SIMULADOS.etapa;
    temas.value = SIMULADOS.temas;
  } finally {
    cargarCompletados();
    cargarEstrellas();
    temas.value.forEach((tema) => {
      if (tema.completado) completados.value.add(tema.id);
    });
    cargando.value = false;
    await nextTick();
    iluminarCamino();
  }
}

onMounted(cargarMapa);
</script>

<style scoped>
.mapa-gamificado {
  --c-accent: #22d3ee;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  padding: 24px 20px 60px;
  color: #e0f2fe;
  font-family: "Space Grotesk", "Inter", system-ui, sans-serif;
  background:
    radial-gradient(1100px 500px at 85% -10%, rgba(59, 130, 246, 0.18), transparent 60%),
    radial-gradient(900px 420px at -10% 30%, rgba(168, 85, 247, 0.14), transparent 55%),
    radial-gradient(800px 600px at 90% 90%, rgba(16, 185, 129, 0.14), transparent 60%),
    #0b1020;
}

.campo-estrellas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.estrella {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.35);
  animation: centelleo ease-in-out infinite alternate;
}

@keyframes centelleo {
  from { transform: translate3d(0, 0, 0); opacity: 0.1; }
  to { transform: translate3d(0, -2px, 0); opacity: 1; }
}

.cargando {
  display: grid;
  place-items: center;
  min-height: 60vh;
  color: #94a3b8;
  font-size: 1.1rem;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  background: rgba(11, 16, 32, 0.72);
  backdrop-filter: blur(12px);
}

.back-btn {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  color: #cbd5e1;
  background: transparent;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.2s ease, transform 0.15s ease;
}

.back-btn:hover {
  background: rgba(148, 163, 184, 0.12);
  transform: translateX(-2px);
}

.eyebrow {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #38bdf8;
}

.topbar-title {
  margin: 2px 0 0;
  font-size: 1rem;
  font-weight: 600;
  color: #e0f2fe;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-track {
  width: 100%;
  height: 9px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #22d3ee, #818cf8, #e879f9);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
  transition: width 0.4s ease;
}

.progress-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f8fafc;
  justify-self: end;
}

.hero {
  text-align: center;
  padding: 28px 12px 8px;
  position: relative;
  z-index: 1;
}

.hero h1 {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 700;
  background: linear-gradient(90deg, #7dd3fc, #a5b4fc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero p {
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 0.95rem;
}

.map-wrap {
  position: relative;
  z-index: 1;
  padding: 18px 0 0;
}

.map-canvas {
  position: relative;
  width: min(400px, 100%);
  aspect-ratio: 400 / 840;
  margin: 0 auto;
}

.path-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.path-line {
  fill: none;
  stroke: rgba(30, 41, 59, 0.85);
  stroke-width: 3;
  stroke-linecap: round;
}

.path-line.lit {
  stroke: #38bdf8;
  stroke-width: 4;
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.55));
  transition: stroke-dasharray 0.6s ease;
}

.node {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 128px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--c-accent);
  padding: 0;
}

.node:disabled {
  cursor: not-allowed;
}

.node-circle {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid currentColor;
  background: color-mix(in srgb, var(--c-accent) 16%, transparent);
  box-shadow: 0 0 24px -6px color-mix(in srgb, var(--c-accent) 60%, transparent);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.node:not(:disabled):hover .node-circle {
  transform: scale(1.08);
  box-shadow: 0 0 30px -4px color-mix(in srgb, var(--c-accent) 80%, transparent);
}

.node.done {
  opacity: 0.75;
}

.node.done .node-circle {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.14);
  box-shadow: 0 0 24px -6px rgba(74, 222, 128, 0.5);
}

.node.locked .node-circle {
  border-color: #475569;
  background: rgba(71, 85, 105, 0.18);
  box-shadow: none;
  color: #64748b;
}

.node-label {
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  color: #e2e8f0;
  line-height: 1.15;
}

.node.locked .node-label {
  color: #94a3b8;
}

.node-sub {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.candado-badge,
.check-badge {
  position: absolute;
  top: -8px;
  right: 4px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
}

.candado-badge {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.check-badge {
  background: #4ade80;
  color: #052e16;
  box-shadow: 0 0 14px rgba(74, 222, 128, 0.55);
}

.extras {
  position: relative;
  z-index: 1;
  margin: 34px auto 0;
  width: min(560px, 100%);
}

.extras-titulo {
  margin: 0 0 14px;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #94a3b8;
  text-align: center;
}

.extras-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.extras-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(8px);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.extras-card:hover {
  transform: translateY(-2px);
  border-color: rgba(148, 163, 184, 0.5);
}

.extras-icono {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  color: #fff;
}

.extra-copito .extras-icono {
  background: radial-gradient(circle at 30% 25%, #ef4444, #b91c1c);
  box-shadow: 0 0 18px -4px rgba(239, 68, 68, 0.6);
}

.extra-examen .extras-icono {
  background: radial-gradient(circle at 30% 25%, #f59e0b, #b45309);
  box-shadow: 0 0 18px -4px rgba(245, 158, 11, 0.6);
}

.extras-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.extras-nombre {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
}

.extras-sub {
  font-size: 0.74rem;
  color: #94a3b8;
}

.extras-estrellas .star {
  font-size: 1.05rem;
}

.modal-scrim {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(6px);
  animation: aparicion 0.2s ease;
}

@keyframes aparicion {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  position: relative;
  width: min(460px, 100%);
  max-height: 88vh;
  overflow-y: auto;
  padding: 26px 26px 22px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 22px;
  background: #101a33;
  box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.7);
  animation: subir 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes subir {
  from { transform: translateY(26px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.modal-close:hover {
  color: #f1f5f9;
}

.modal-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  border-radius: 18px;
  background: color-mix(in srgb, currentColor 14%, transparent);
}

.modal-titulo {
  margin: 0 0 2px;
  text-align: center;
  font-size: 1.3rem;
  color: #f8fafc;
}

.modal-sub {
  margin: 0 0 14px;
  text-align: center;
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #94a3b8;
}

.modal-cuerpo p {
  color: #cbd5e1;
  line-height: 1.6;
  font-size: 0.94rem;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.btn {
  padding: 11px 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.2s ease;
}

.btn:active {
  transform: scale(0.97);
}

.btn-secundario {
  color: #cbd5e1;
  background: transparent;
  border-color: rgba(148, 163, 184, 0.3);
}

.btn-secundario:hover {
  background: rgba(148, 163, 184, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  color: #fff;
  box-shadow: 0 10px 24px -10px rgba(34, 211, 238, 0.6);
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.juego-card {
  width: min(520px, 100%);
}

.juego-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.juego-titulo {
  font-weight: 700;
  color: #f8fafc;
}

.juego-progreso {
  font-size: 0.78rem;
  font-weight: 700;
  color: #38bdf8;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.12);
}

.juego-pregunta {
  font-size: 1.05rem;
  font-weight: 600;
  color: #f1f5f9;
  line-height: 1.5;
  margin: 0 0 18px;
}

.juego-opciones {
  display: grid;
  gap: 10px;
}

.juego-opcion {
  padding: 13px 16px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.85);
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.12s ease;
}

.juego-opcion:hover:not(:disabled) {
  border-color: rgba(148, 163, 184, 0.6);
  transform: translateX(2px);
}

.juego-opcion.correct {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.16);
  color: #bbf7d0;
}

.juego-opcion.incorrect {
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.14);
  color: #fecaca;
}

.juego-opcion:disabled {
  cursor: default;
}

.juego-resultado {
  text-align: center;
  padding: 18px 0 6px;
}

.juego-mensaje {
  margin-top: 14px;
  color: #cbd5e1;
  font-size: 1.02rem;
  font-weight: 600;
}

.pista {
  margin-top: 18px;
  text-align: center;
  font-size: 0.78rem;
  color: #64748b;
}

.star-row {
  display: inline-flex;
  gap: 5px;
}

.star {
  font-size: 1.7rem;
  line-height: 1;
}

.star.on {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
}

.star.off {
  color: #334155;
}

@media (min-width: 1000px) {
  .map-wrap {
    padding-top: 30px;
  }

  .extras {
    position: absolute;
    inset: 30px 0 0;
    margin: 0;
    width: 100%;
    pointer-events: none;
    z-index: 3;
  }

  .extras-titulo {
    display: none;
  }

  .extras-grid {
    position: absolute;
    inset: 0;
    display: block;
  }

  .extras-card {
    position: absolute;
    width: 250px;
    pointer-events: auto;
  }

  .extra-copito {
    right: calc(50% + 220px);
    top: 24%;
    transform: translateY(-50%);
  }

  .extra-examen {
    left: calc(50% + 220px);
    top: 70%;
    transform: translateY(-50%);
  }
}

@media (max-width: 480px) {
  .mapa-gamificado {
    padding: 16px 12px 50px;
  }
  .node {
    width: 108px;
  }
  .node-circle {
    width: 60px;
    height: 60px;
  }
  .node-circle :deep(svg) {
    width: 28px;
    height: 28px;
  }
  .modal-card {
    padding: 20px 18px 18px;
  }
  .extras-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .estrella {
    animation: none;
  }
  .topbar {
    backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .path-line.lit,
  .progress-fill,
  .node-circle,
  .modal-scrim,
  .modal-card,
  .btn {
    transition: none;
  }
}
</style>