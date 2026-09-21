<template>
  <div class="dashboard">
    <header class="topbar">
      <div>
        <div class="topbar-title">Panel del docente</div>
        <div class="topbar-sub">Nivel 1 · Fundamentos de la Vida</div>
      </div>
      <div class="topbar-acciones">
        <button class="pdf-btn" @click="generarPdfGeneral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          Informe general
        </button>
        <div class="teacher-chip">
          <div class="teacher-avatar">MP</div>
          <span>Prof. Machaca</span>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="view-tabs">
        <button class="tab-btn" :class="{ active: vista === 'alumnos' }" @click="cambiarVista('alumnos')">Alumnos</button>
        <button class="tab-btn" :class="{ active: vista === 'salon' }" @click="cambiarVista('salon')">Por salón</button>
      </div>

      <div v-show="vista === 'alumnos'" class="view-panel">
        <div class="filters">
          <div class="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <input v-model="busqueda" type="text" class="search-input" placeholder="Buscar alumno por nombre…">
          </div>
          <select v-model="salonFiltro" class="filter-select">
            <option value="todos">Todos los salones</option>
            <option v-for="sal in listaSalones" :key="sal" :value="sal">{{ sal }}</option>
          </select>
          <span class="filter-count">{{ kpis.total }} de {{ STUDENTS.length }} alumnos</span>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Alumnos filtrados</div>
            <div class="kpi-value">{{ kpis.total }}</div>
          </div>
          <div class="kpi-card good">
            <div class="kpi-label">Progreso promedio</div>
            <div class="kpi-value">{{ kpis.avgProgress }}<span class="kpi-unit">%</span></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Horas esta semana</div>
            <div class="kpi-value">{{ kpis.horasSemana }}<span class="kpi-unit">h</span></div>
          </div>
          <div class="kpi-card alert">
            <div class="kpi-label">En riesgo</div>
            <div class="kpi-value">{{ kpis.riesgo }}</div>
          </div>
        </div>

        <section class="panel">
          <div class="panel-head">
            <span class="panel-title">Horas de estudio promedio por salón (últimos 7 días)</span>
            <span class="panel-hint">horas / alumno</span>
          </div>
          <div class="salon-bars">
            <div v-for="barra in barrasSalon" :key="barra.salon" class="salon-bar-row">
              <span class="salon-bar-label">{{ barra.salon }}</span>
              <div class="salon-bar-track"><div class="salon-bar-fill" :style="{ width: barra.pct + '%' }"></div></div>
              <span class="salon-bar-value">{{ barra.avg.toFixed(1) }} h</span>
            </div>
          </div>
        </section>

        <section class="panel panel-plano">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th data-sort="name" @click="alternarOrden('name')">Alumno<span class="sort-arrow">{{ flechaOrden('name') }}</span></th>
                  <th data-sort="salon" @click="alternarOrden('salon')">Salón<span class="sort-arrow">{{ flechaOrden('salon') }}</span></th>
                  <th data-sort="progress" @click="alternarOrden('progress')">Avance<span class="sort-arrow">{{ flechaOrden('progress') }}</span></th>
                  <th data-sort="hoursWeek" @click="alternarOrden('hoursWeek')">Horas · sem.<span class="sort-arrow">{{ flechaOrden('hoursWeek') }}</span></th>
                  <th data-sort="hoursTotal" @click="alternarOrden('hoursTotal')">Horas totales<span class="sort-arrow">{{ flechaOrden('hoursTotal') }}</span></th>
                  <th>Copito</th>
                  <th>Examen</th>
                  <th data-sort="days" @click="alternarOrden('days')">Último acceso<span class="sort-arrow">{{ flechaOrden('days') }}</span></th>
                  <th data-sort="status" @click="alternarOrden('status')">Estado<span class="sort-arrow">{{ flechaOrden('status') }}</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="s in listaFiltrada"
                  :key="s.id"
                  tabindex="0"
                  @click="abrirDrawer(s.id)"
                  @keydown.enter="abrirDrawer(s.id)"
                >
                  <td>
                    <div class="student-cell">
                      <div class="avatar" :style="{ background: avatarColor(s.id) }">{{ initials(s.name) }}</div>
                      <div>
                        <div class="student-name">{{ s.name }}</div>
                        <div class="student-salon-mobile">{{ s.salon }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ s.salon }}</td>
                  <td>
                    <div class="progress-cell">
                      <div class="mini-track"><div class="mini-fill" :style="{ width: progressPct(s) + '%', background: colorProgreso(s.nodes) }"></div></div>
                      <span class="progress-frac">{{ s.nodes }}/5</span>
                    </div>
                  </td>
                  <td>{{ s.hoursWeek.toFixed(1) }} h</td>
                  <td>{{ s.hoursTotal.toFixed(1) }} h</td>
                  <td><span class="stars-inline">
                    <svg v-for="i in 5" :key="i" viewBox="0 0 24 24" :class="['star', i <= s.copito ? 'on' : 'off']" stroke-width="1.5" stroke-linejoin="round"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7-6.3-4-6.3 4 1.7-7L2 9.5l7.1-.6z"/></svg>
                  </span></td>
                  <td><span class="stars-inline">
                    <svg v-for="i in 5" :key="i" viewBox="0 0 24 24" :class="['star', i <= s.exam ? 'on' : 'off']" stroke-width="1.5" stroke-linejoin="round"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7-6.3-4-6.3 4 1.7-7L2 9.5l7.1-.6z"/></svg>
                  </span></td>
                  <td>{{ diasLabel(s.days) }}</td>
                  <td><span class="status-badge" :class="'status-' + statusOf(s).key">{{ statusOf(s).label }}</span></td>
                </tr>
              </tbody>
            </table>
            <div v-if="!listaFiltrada.length" class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <p>No hay alumnos que coincidan con la búsqueda o el salón seleccionado.</p>
            </div>
          </div>
        </section>
      </div>

      <div v-show="vista === 'salon'" class="view-panel">
        <div class="salon-select-row">
          <select v-model="salonSeleccion" class="filter-select">
            <option v-for="sal in listaSalones" :key="sal" :value="sal">{{ sal }}</option>
          </select>
          <button class="pdf-btn" @click="generarPdfSalon(salonSeleccion)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            Informe del salón
          </button>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Alumnos</div>
            <div class="kpi-value">{{ svKpis.total }}</div>
          </div>
          <div class="kpi-card good">
            <div class="kpi-label">Tasa de aprobación (≥70%)</div>
            <div class="kpi-value">{{ svKpis.pass }}<span class="kpi-unit">%</span></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Avance promedio</div>
            <div class="kpi-value">{{ svKpis.avg }}<span class="kpi-unit">%</span></div>
          </div>
          <div class="kpi-card alert">
            <div class="kpi-label">En riesgo</div>
            <div class="kpi-value">{{ svKpis.riesgo }}</div>
          </div>
        </div>

        <section class="panel">
          <div class="panel-head">
            <span class="panel-title">Conceptos críticos del salón</span>
            <span class="panel-hint">estaciones con más dificultad</span>
          </div>
          <table class="heat-table">
            <thead><tr><th>Concepto (estación)</th><th>Tasa de error</th><th>Alumnos con dificultad</th></tr></thead>
            <tbody>
              <tr v-for="c in conceptosCalor" :key="c.name" :style="{ background: c.color.bg }">
                <td>{{ c.name }}</td>
                <td>
                  <span class="heat-chip" :style="{ background: c.color.chip + '22', color: c.color.chip }">{{ c.rate }}%</span>
                  <div class="heat-bar-track"><div class="heat-bar-fill" :style="{ width: c.rate + '%', background: c.color.bar }"></div></div>
                </td>
                <td>{{ c.struggling }} de {{ listaSalon.length }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="panel">
          <div class="panel-head">
            <span class="panel-title">Top 5 · evolución reciente</span>
            <span class="panel-hint">últimas 6 semanas</span>
          </div>
          <div class="rank-grid">
            <div v-for="(r, i) in ranking" :key="r.id" class="rank-card">
              <div class="rank-pos">N.° {{ i + 1 }}</div>
              <div class="rank-avatar" :style="{ background: avatarColor(r.id) }">{{ initials(r.name) }}</div>
              <div class="rank-name">{{ r.name }}</div>
              <div class="rank-spark">
                <div v-for="(v, di) in r.trend" :key="di" :style="{ height: Math.max((v / r.max) * 100, 10) + '%', background: avatarColor(r.id) }"></div>
              </div>
              <div class="rank-score">{{ r.score }}%</div>
              <div class="rank-trend">+{{ r.delta }}% en 6 sem.</div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <span class="panel-title">Análisis de distractores</span>
            <span class="panel-hint">todas las secciones · Examen</span>
          </div>
          <table class="distractor-table">
            <thead><tr><th>Pregunta</th><th>Respuesta correcta</th><th>Distractor más elegido</th><th>Frecuencia</th></tr></thead>
            <tbody>
              <tr v-for="(d, i) in DISTRACTORES" :key="i">
                <td>{{ d.q }}</td>
                <td>{{ d.correct }}</td>
                <td>{{ d.distractor }}</td>
                <td>
                  <div class="distractor-freq">
                    <div class="distractor-freq-track"><div class="distractor-freq-fill" :style="{ width: d.freq + '%' }"></div></div>
                    <span>{{ d.freq }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="distractor-note">Las preguntas del Examen se seleccionan al azar por alumno para evitar copia; este análisis agrupa igual el concepto evaluado.</p>
        </section>
      </div>
    </main>

    <div class="drawer-scrim" :class="{ open: drawerAbierto }" @click.self="cerrarDrawer">
      <div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerNombre">
        <button class="drawer-close" aria-label="Cerrar" @click="cerrarDrawer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
        </button>

        <template v-if="estudiante">
          <div class="drawer-head">
            <div class="drawer-avatar" :style="{ background: avatarColor(estudiante.id) }">{{ initials(estudiante.name) }}</div>
            <div>
              <div class="drawer-name" id="drawerNombre">{{ estudiante.name }}</div>
              <div class="drawer-meta">{{ estudiante.salon }} · {{ statusOf(estudiante).label }}</div>
            </div>
          </div>

          <div class="drawer-section">
            <div class="drawer-section-title">Avance · Nivel 1</div>
            <div class="node-status-row">
              <div v-for="(label, i) in NODE_NAMES" :key="i" class="node-status">
                <div class="node-status-dot" :class="nodoClase(i)"></div>
                <span class="node-status-label">{{ label }}</span>
              </div>
            </div>
          </div>

          <div class="drawer-section">
            <div class="drawer-section-title">Horas de estudio · últimos 7 días</div>
            <div class="week-chart">
              <div v-for="(v, i) in semanaValores" :key="i" class="week-bar-wrap">
                <div class="week-bar" :style="{ height: Math.max((v / semanaMax) * 100, 4) + '%' }" :title="v + ' h'"></div>
                <span class="week-day-label">{{ WEEK_LABELS[i] }}</span>
              </div>
            </div>
          </div>

          <div class="drawer-section">
            <div class="stat-grid">
              <div class="stat-box">
                <div class="stat-box-label">Horas totales</div>
                <div class="stat-box-value">{{ estudiante.hoursTotal.toFixed(1) }} h</div>
              </div>
              <div class="stat-box">
                <div class="stat-box-label">Último acceso</div>
                <div class="stat-box-value">{{ diasLabel(estudiante.days) }}</div>
              </div>
            </div>
          </div>

          <div class="drawer-section drawer-section-final">
            <div class="drawer-section-title">Mini-juegos</div>
            <div class="game-row">
              <span class="game-row-label">Copito · mejor resultado</span>
              <span class="stars-inline">
                <svg v-for="i in 5" :key="i" viewBox="0 0 24 24" :class="['star', i <= estudiante.copito ? 'on' : 'off']" stroke-width="1.5" stroke-linejoin="round"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7-6.3-4-6.3 4 1.7-7L2 9.5l7.1-.6z"/></svg>
              </span>
            </div>
            <div class="game-row">
              <span class="game-row-label">Examen · mejor resultado</span>
              <span class="stars-inline">
                <svg v-for="i in 5" :key="i" viewBox="0 0 24 24" :class="['star', i <= estudiante.exam ? 'on' : 'off']" stroke-width="1.5" stroke-linejoin="round"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7-6.3-4-6.3 4 1.7-7L2 9.5l7.1-.6z"/></svg>
              </span>
            </div>
          </div>

          <button class="pdf-btn pdf-btn-ancho" @click="generarPdfAlumno(estudiante.id)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            Descargar informe PDF
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { jsPDF } from "jspdf";

const NODE_NAMES = [
  "¿Qué es la vida?", "El objeto de estudio", "¿De dónde venimos?", "Las grandes ramas", "El árbol de la vida",
];

const STUDENTS = [
  { id: 1, name: "Ana Quispe", salon: "1° A", nodes: 5, hoursTotal: 12.4, hoursWeek: 3.8, days: 0, copito: 5, exam: 4 },
  { id: 2, name: "Luis Mamani", salon: "1° A", nodes: 3, hoursTotal: 6.1, hoursWeek: 1.5, days: 1, copito: 3, exam: 2 },
  { id: 3, name: "Carla Huanca", salon: "1° A", nodes: 5, hoursTotal: 10.8, hoursWeek: 2.9, days: 0, copito: 4, exam: 5 },
  { id: 4, name: "Diego Apaza", salon: "1° A", nodes: 1, hoursTotal: 2.3, hoursWeek: 0.4, days: 6, copito: 1, exam: 0 },
  { id: 5, name: "Fiorella Choque", salon: "1° A", nodes: 4, hoursTotal: 8.6, hoursWeek: 2.1, days: 1, copito: 4, exam: 3 },
  { id: 6, name: "Renzo Ccama", salon: "1° A", nodes: 2, hoursTotal: 4.4, hoursWeek: 0.9, days: 3, copito: 2, exam: 2 },
  { id: 7, name: "Marisol Ticona", salon: "1° A", nodes: 0, hoursTotal: 0.8, hoursWeek: 0.2, days: 8, copito: 0, exam: 0 },
  { id: 8, name: "Brayan Condori", salon: "1° B", nodes: 5, hoursTotal: 14.2, hoursWeek: 4.3, days: 0, copito: 5, exam: 5 },
  { id: 9, name: "Yolanda Flores", salon: "1° B", nodes: 3, hoursTotal: 7.0, hoursWeek: 1.8, days: 2, copito: 3, exam: 3 },
  { id: 10, name: "Jhonny Ramos", salon: "1° B", nodes: 2, hoursTotal: 3.6, hoursWeek: 0.6, days: 4, copito: 2, exam: 1 },
  { id: 11, name: "Katherine Vilca", salon: "1° B", nodes: 4, hoursTotal: 9.4, hoursWeek: 2.6, days: 1, copito: 4, exam: 4 },
  { id: 12, name: "Elvis Pari", salon: "1° B", nodes: 1, hoursTotal: 1.9, hoursWeek: 0.3, days: 7, copito: 1, exam: 0 },
  { id: 13, name: "Rosa Chambi", salon: "1° B", nodes: 5, hoursTotal: 11.5, hoursWeek: 3.2, days: 0, copito: 5, exam: 4 },
  { id: 14, name: "Kevin Yucra", salon: "1° B", nodes: 3, hoursTotal: 5.8, hoursWeek: 1.4, days: 2, copito: 3, exam: 3 },
  { id: 15, name: "Milagros Cutipa", salon: "2° A", nodes: 5, hoursTotal: 13.1, hoursWeek: 3.6, days: 0, copito: 5, exam: 5 },
  { id: 16, name: "Sergio Calcina", salon: "2° A", nodes: 4, hoursTotal: 8.9, hoursWeek: 2.0, days: 1, copito: 4, exam: 3 },
  { id: 17, name: "Nayeli Machaca", salon: "2° A", nodes: 2, hoursTotal: 4.0, hoursWeek: 0.7, days: 5, copito: 2, exam: 2 },
  { id: 18, name: "Edwin Mollo", salon: "2° A", nodes: 0, hoursTotal: 0.5, hoursWeek: 0.1, days: 9, copito: 0, exam: 0 },
  { id: 19, name: "Paola Turpo", salon: "2° A", nodes: 5, hoursTotal: 12.0, hoursWeek: 3.3, days: 0, copito: 4, exam: 5 },
  { id: 20, name: "Anthony Quenta", salon: "2° A", nodes: 3, hoursTotal: 6.6, hoursWeek: 1.6, days: 2, copito: 3, exam: 2 },
];

const AVATAR_COLORS = ["#10B981", "#22D3EE", "#A78BFA", "#F59E0B", "#FB7185"];
const WEEK_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const WEEK_RATIOS = [
  [0.22, 0.10, 0.20, 0.08, 0.24, 0.09, 0.07],
  [0.08, 0.22, 0.10, 0.24, 0.09, 0.20, 0.07],
  [0.20, 0.08, 0.24, 0.09, 0.07, 0.10, 0.22],
  [0.09, 0.24, 0.07, 0.20, 0.08, 0.22, 0.10],
];

const DISTRACTORES = [
  { q: "¿Cuántos reinos biológicos se reconocen tradicionalmente?", correct: "5", distractor: "4", freq: 38 },
  { q: "¿Cuál es la unidad básica de todo ser vivo?", correct: "La célula", distractor: "El tejido", freq: 31 },
  { q: "¿A qué reino pertenecen las plantas?", correct: "Vegetal", distractor: "Protista", freq: 27 },
  { q: "¿Qué teoría explica el origen químico de la vida?", correct: "Evolución química", distractor: "Generación espontánea", freq: 44 },
  { q: "¿Qué rama estudia los seres vivos microscópicos?", correct: "Microbiología", distractor: "Botánica", freq: 22 },
];

const listaSalones = [...new Set(STUDENTS.map((s) => s.salon))].sort();

function avatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function progressPct(s) {
  return Math.round((s.nodes / 5) * 100);
}

function statusOf(s) {
  if (s.days > 5) return { key: "riesgo", label: "En riesgo" };
  if (s.nodes >= 3 && s.days <= 2) return { key: "al-dia", label: "Al día" };
  if (s.nodes < 3 && s.days > 2) return { key: "atrasado", label: "Atrasado" };
  return { key: "al-dia", label: "Al día" };
}

function diasLabel(d) {
  if (d === 0) return "Hoy";
  if (d === 1) return "Ayer";
  return `Hace ${d} días`;
}

function colorProgreso(nodes) {
  if (nodes >= 5) return "var(--emerald)";
  if (nodes >= 3) return "var(--cyan)";
  if (nodes >= 1) return "var(--amber)";
  return "var(--ink-faint)";
}

function weekSplit(total, id) {
  const ratios = WEEK_RATIOS[id % WEEK_RATIOS.length];
  return ratios.map((r) => Math.round(total * r * 10) / 10);
}

function scoreOf(s) {
  const gamesPct = ((s.copito + s.exam) / 10) * 100;
  return Math.round(progressPct(s) * 0.7 + gamesPct * 0.3);
}

function isApproved(s) {
  return scoreOf(s) >= 70;
}

function conceptHeatData(list) {
  return NODE_NAMES.map((name, i) => {
    const n = i + 1;
    const struggling = list.filter((s) => s.nodes < n).length;
    const rate = list.length ? Math.round((struggling / list.length) * 100) : 0;
    return { name, rate, struggling };
  });
}

function heatColor(rate) {
  if (rate >= 66) return { bg: "rgba(251,113,133,0.16)", chip: "#FB7185", bar: "#FB7185" };
  if (rate >= 33) return { bg: "rgba(245,158,11,0.14)", chip: "#F59E0B", bar: "#F59E0B" };
  return { bg: "rgba(16,185,129,0.14)", chip: "#10B981", bar: "#10B981" };
}

function trendFor(s) {
  const base = scoreOf(s);
  const seed = s.id % 4;
  const shapes = [
    [-14, -10, -6, -3, -1, 0],
    [-10, -8, -9, -4, -2, 0],
    [-16, -6, -10, -4, -1, 0],
    [-8, -12, -5, -6, -2, 0],
  ];
  return shapes[seed].map((delta) => Math.max(30, Math.min(100, base + delta)));
}

const busqueda = ref("");
const salonFiltro = ref("todos");
const orden = ref({ clave: "progress", dir: "desc" });
const vista = ref("alumnos");
const salonSeleccion = ref(listaSalones[0] ?? "");
const drawerAbierto = ref(false);
const estudianteId = ref(null);

const listaFiltrada = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  const list = STUDENTS.filter((s) => {
    const okBusqueda = q === "" || s.name.toLowerCase().includes(q);
    const okSalon = salonFiltro.value === "todos" || s.salon === salonFiltro.value;
    return okBusqueda && okSalon;
  });
  const dir = orden.value.dir === "asc" ? 1 : -1;
  const clave = orden.value.clave;
  return [...list].sort((a, b) => {
    if (clave === "name") return a.name.localeCompare(b.name) * dir;
    if (clave === "salon") return a.salon.localeCompare(b.salon) * dir;
    if (clave === "status") return statusOf(a).label.localeCompare(statusOf(b).label) * dir;
    const campo = clave === "progress" ? "nodes" : clave;
    return (a[campo] - b[campo]) * dir;
  });
});

const kpis = computed(() => {
  const list = listaFiltrada.value;
  const total = list.length;
  const avgProgress = total ? Math.round(list.reduce((sum, s) => sum + progressPct(s), 0) / total) : 0;
  const horasSemana = list.reduce((sum, s) => sum + s.hoursWeek, 0);
  const riesgo = list.filter((s) => statusOf(s).key === "riesgo").length;
  return { total, avgProgress, horasSemana: horasSemana.toFixed(1), riesgo };
});

const barrasSalon = computed(() => {
  const maxAvg = Math.max(...listaSalones.map((sal) => {
    const grp = STUDENTS.filter((s) => s.salon === sal);
    return grp.reduce((sum, s) => sum + s.hoursWeek, 0) / grp.length;
  }), 0);
  return listaSalones.map((sal) => {
    const grp = STUDENTS.filter((s) => s.salon === sal);
    const avg = grp.reduce((sum, s) => sum + s.hoursWeek, 0) / grp.length;
    return { salon: sal, avg, pct: maxAvg ? (avg / maxAvg) * 100 : 0 };
  });
});

const listaSalon = computed(() => STUDENTS.filter((s) => s.salon === salonSeleccion.value));

const svKpis = computed(() => {
  const list = listaSalon.value;
  const total = list.length;
  const aprobados = list.filter(isApproved).length;
  const pass = total ? Math.round((aprobados / total) * 100) : 0;
  const avg = total ? Math.round(list.reduce((sum, s) => sum + progressPct(s), 0) / total) : 0;
  const riesgo = list.filter((s) => statusOf(s).key === "riesgo").length;
  return { total, pass, avg, riesgo };
});

const conceptosCalor = computed(() =>
  conceptHeatData(listaSalon.value).map((c) => ({ ...c, color: heatColor(c.rate) }))
);

const ranking = computed(() =>
  [...listaSalon.value]
    .sort((a, b) => scoreOf(b) - scoreOf(a))
    .slice(0, 5)
    .map((s) => {
      const trend = trendFor(s);
      return {
        id: s.id,
        name: s.name,
        score: scoreOf(s),
        trend,
        max: Math.max(...trend),
        delta: trend[trend.length - 1] - trend[0],
      };
    })
);

const estudiante = computed(() => STUDENTS.find((s) => s.id === estudianteId.value) ?? null);

const semanaValores = computed(() => {
  const s = estudiante.value;
  return s ? weekSplit(s.hoursWeek, s.id) : [];
});

const semanaMax = computed(() => Math.max(...semanaValores.value, 0.5));

function alternarOrden(clave) {
  if (orden.value.clave === clave) {
    orden.value.dir = orden.value.dir === "asc" ? "desc" : "asc";
  } else {
    orden.value.clave = clave;
    orden.value.dir = "desc";
  }
}

function flechaOrden(clave) {
  if (orden.value.clave !== clave) return "";
  return orden.value.dir === "asc" ? "↑" : "↓";
}

function cambiarVista(v) {
  vista.value = v;
}

function abrirDrawer(id) {
  estudianteId.value = id;
  drawerAbierto.value = true;
}

function cerrarDrawer() {
  drawerAbierto.value = false;
}

function nodoClase(i) {
  const s = estudiante.value;
  if (!s) return "";
  const n = i + 1;
  if (n <= s.nodes) return "done";
  if (n === s.nodes + 1) return "current";
  return "";
}

// ---------- informes PDF (jsPDF) ----------
const PDF_INK = [15, 23, 42];
const PDF_DIM = [110, 118, 136];

function pdfHeader(doc, title, subtitle) {
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, 14, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(190, 200, 215);
  doc.text(subtitle, 14, 22);
  doc.setTextColor(...PDF_INK);
  return 38;
}

function pdfFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_DIM);
    doc.text(`Fundamentos de la Vida · Nivel 1 · Generado ${new Date().toLocaleDateString("es-PE")}`, 14, 289);
    doc.text(`Página ${i} de ${pageCount}`, 196, 289, { align: "right" });
  }
}

function pdfKpiRow(doc, y, items) {
  const w = 44;
  const gap = 4;
  let x = 14;
  items.forEach((it) => {
    doc.setDrawColor(225, 228, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, 20, 2, 2);
    doc.setFontSize(8);
    doc.setTextColor(...PDF_DIM);
    doc.text(it.label, x + 4, y + 7, { maxWidth: w - 8 });
    doc.setFontSize(14);
    doc.setTextColor(...PDF_INK);
    doc.setFont("helvetica", "bold");
    doc.text(String(it.value), x + 4, y + 16);
    doc.setFont("helvetica", "normal");
    x += w + gap;
  });
  return y + 28;
}

function pdfSectionTitle(doc, y, text) {
  doc.setFontSize(11.5);
  doc.setTextColor(...PDF_INK);
  doc.setFont("helvetica", "bold");
  doc.text(text, 14, y);
  doc.setFont("helvetica", "normal");
  return y + 7;
}

function pdfTable(doc, y, headers, rows, colWidths) {
  const startX = 14;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_DIM);
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x, y);
    x += colWidths[i];
  });
  y += 2;
  doc.setDrawColor(225, 228, 235);
  doc.line(startX, y, startX + colWidths.reduce((a, b) => a + b, 0), y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_INK);
  rows.forEach((row) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    x = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell), x, y, { maxWidth: colWidths[i] - 2 });
      x += colWidths[i];
    });
    y += 7;
  });
  return y + 4;
}

function generarPdfAlumno(id) {
  const s = STUDENTS.find((x) => x.id === id);
  if (!s) return;
  const doc = new jsPDF();
  let y = pdfHeader(doc, "Informe de avance individual", `${s.name} · ${s.salon}`);
  y = pdfKpiRow(doc, y, [
    { label: "Avance", value: `${s.nodes}/5 (${progressPct(s)}%)` },
    { label: "Horas totales", value: `${s.hoursTotal.toFixed(1)} h` },
    { label: "Horas · semana", value: `${s.hoursWeek.toFixed(1)} h` },
    { label: "Último acceso", value: diasLabel(s.days) },
  ]);
  y = pdfSectionTitle(doc, y, "Estado de estaciones");
  y = pdfTable(doc, y, ["Estación", "Estado"],
    NODE_NAMES.map((n, i) => [n, (i + 1) <= s.nodes ? "Completada" : (i + 1) === s.nodes + 1 ? "En curso" : "Pendiente"]),
    [140, 40]);
  y = pdfSectionTitle(doc, y, "Mini-juegos");
  y = pdfTable(doc, y, ["Juego", "Mejor resultado"], [
    ["Copito (V/F)", `${s.copito} / 5 estrellas`],
    ["Examen (opción múltiple)", `${s.exam} / 5 estrellas`],
  ], [100, 80]);
  y = pdfSectionTitle(doc, y, "Estado general");
  doc.setFontSize(10);
  doc.text(`Estado: ${statusOf(s).label}   ·   Puntaje combinado: ${scoreOf(s)}%`, 14, y);
  pdfFooter(doc);
  doc.save(`informe_${s.name.replace(/\s+/g, "_")}.pdf`);
}

function generarPdfSalon(salon) {
  const list = STUDENTS.filter((s) => s.salon === salon);
  const doc = new jsPDF();
  let y = pdfHeader(doc, "Informe de salón", `${salon} · Nivel 1: Fundamentos de la Vida`);
  const aprobados = list.filter(isApproved).length;
  const avgProgress = list.length ? Math.round(list.reduce((sum, s) => sum + progressPct(s), 0) / list.length) : 0;
  const avgHours = list.length ? list.reduce((sum, s) => sum + s.hoursWeek, 0) / list.length : 0;
  y = pdfKpiRow(doc, y, [
    { label: "Alumnos", value: list.length },
    { label: "Aprobación (≥70%)", value: `${Math.round(list.length ? aprobados / list.length * 100 : 0)}%` },
    { label: "Avance promedio", value: `${avgProgress}%` },
    { label: "Horas prom. / sem.", value: `${avgHours.toFixed(1)} h` },
  ]);
  y = pdfSectionTitle(doc, y, "Conceptos críticos");
  y = pdfTable(doc, y, ["Concepto", "Tasa de error", "Alumnos con dificultad"],
    conceptHeatData(list).map((c) => [c.name, `${c.rate}%`, `${c.struggling} de ${list.length}`]),
    [95, 40, 65]);
  y = pdfSectionTitle(doc, y, "Detalle de alumnos");
  pdfTable(doc, y, ["Alumno", "Avance", "Horas sem.", "Horas total", "Estado"],
    list.map((s) => [s.name, `${s.nodes}/5`, `${s.hoursWeek.toFixed(1)}h`, `${s.hoursTotal.toFixed(1)}h`, statusOf(s).label]),
    [60, 25, 30, 30, 35]);
  pdfFooter(doc);
  doc.save(`informe_salon_${salon.replace(/\s+/g, "_")}.pdf`);
}

function generarPdfGeneral() {
  const doc = new jsPDF();
  let y = pdfHeader(doc, "Informe general", "Nivel 1: Fundamentos de la Vida · Todos los salones");
  const totalHorasSemana = STUDENTS.reduce((sum, s) => sum + s.hoursWeek, 0);
  const avgProgress = Math.round(STUDENTS.reduce((sum, s) => sum + progressPct(s), 0) / STUDENTS.length);
  const riesgo = STUDENTS.filter((s) => statusOf(s).key === "riesgo").length;
  y = pdfKpiRow(doc, y, [
    { label: "Total alumnos", value: STUDENTS.length },
    { label: "Avance promedio", value: `${avgProgress}%` },
    { label: "Horas totales · sem.", value: `${totalHorasSemana.toFixed(1)} h` },
    { label: "En riesgo", value: riesgo },
  ]);
  y = pdfSectionTitle(doc, y, "Comparativa por salón");
  y = pdfTable(doc, y, ["Salón", "Alumnos", "Avance prom.", "Horas prom./sem.", "En riesgo"],
    listaSalones.map((sal) => {
      const grp = STUDENTS.filter((s) => s.salon === sal);
      const avg = Math.round(grp.reduce((sum, s) => sum + progressPct(s), 0) / grp.length);
      const hrs = grp.reduce((sum, s) => sum + s.hoursWeek, 0) / grp.length;
      const r = grp.filter((s) => statusOf(s).key === "riesgo").length;
      return [sal, grp.length, `${avg}%`, `${hrs.toFixed(1)}h`, r];
    }), [45, 30, 35, 45, 25]);
  y = pdfSectionTitle(doc, y, "Conceptos críticos generales");
  pdfTable(doc, y, ["Concepto", "Tasa de error", "Alumnos con dificultad"],
    conceptHeatData(STUDENTS).map((c) => [c.name, `${c.rate}%`, `${c.struggling} de ${STUDENTS.length}`]),
    [95, 40, 65]);
  pdfFooter(doc);
  doc.save("informe_general_nivel1.pdf");
}
</script>

<style scoped>
.dashboard {
  --bg-1: #0B1120;
  --bg-2: #151F32;
  --ink: #E8EDF5;
  --ink-dim: #8B96A8;
  --ink-faint: #5C6478;
  --surface: rgba(255, 255, 255, 0.045);
  --surface-2: rgba(255, 255, 255, 0.07);
  --border: rgba(255, 255, 255, 0.09);
  --emerald: #10B981;
  --cyan: #22D3EE;
  --violet: #A78BFA;
  --amber: #F59E0B;
  --coral: #FB7185;
  box-sizing: border-box;
  min-height: 100vh;
  margin-left: 72px;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background:
    radial-gradient(ellipse 900px 500px at 15% 0%, rgba(34, 211, 238, 0.06), transparent 60%),
    radial-gradient(ellipse 700px 600px at 90% 10%, rgba(167, 139, 250, 0.05), transparent 55%),
    linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 100%);
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.dashboard *,
.dashboard *::before,
.dashboard *::after {
  box-sizing: inherit;
}

.dashboard button,
.dashboard input,
.dashboard select {
  font-family: inherit;
}

.dashboard button:focus-visible,
.dashboard input:focus-visible,
.dashboard select:focus-visible,
.dashboard tr:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 2px;
}

.dashboard h1,
.dashboard h2,
.dashboard h3 {
  font-family: 'Space Grotesk', sans-serif;
  margin: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px 24px;
  background: rgba(11, 17, 32, 0.75);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.topbar-acciones {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-title {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
}

.topbar-sub {
  font-size: 12.5px;
  color: var(--ink-dim);
  margin-top: 2px;
}

.teacher-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 12px 6px 6px;
  border: 1px solid var(--border);
  border-radius: 99px;
  background: var(--surface);
}

.teacher-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cyan), var(--violet));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #08111F;
}

.teacher-chip span {
  font-size: 13px;
  font-weight: 600;
}

.main {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 24px 80px;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 22px;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-wrap svg {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--ink-faint);
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border-radius: 11px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  font-size: 14px;
}

.search-input::placeholder {
  color: var(--ink-faint);
}

select.filter-select {
  padding: 10px 14px;
  border-radius: 11px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
}

.filter-count {
  font-size: 12.5px;
  color: var(--ink-dim);
  white-space: nowrap;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.kpi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px 18px;
}

.kpi-label {
  font-size: 12px;
  color: var(--ink-dim);
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.kpi-unit {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-dim);
}

.kpi-card.alert .kpi-value {
  color: var(--coral);
}

.kpi-card.good .kpi-value {
  color: var(--emerald);
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 20px;
}

.panel-plano {
  padding: 0;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-title {
  font-size: 14.5px;
  font-weight: 600;
}

.panel-hint {
  font-size: 12px;
  color: var(--ink-faint);
}

.salon-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.salon-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.salon-bar-label {
  width: 64px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-dim);
}

.salon-bar-track {
  flex: 1;
  height: 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.salon-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--emerald), var(--cyan));
}

.salon-bar-value {
  width: 52px;
  text-align: right;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--ink-dim);
  flex-shrink: 0;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid var(--border);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
  background: var(--surface);
}

thead th {
  text-align: left;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink-faint);
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}

thead th:hover {
  color: var(--ink-dim);
}

thead th .sort-arrow {
  margin-left: 4px;
  opacity: 0.5;
  font-size: 10px;
}

tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 13.5px;
  vertical-align: middle;
}

tbody tr {
  cursor: pointer;
  transition: background .15s ease;
}

tbody tr:hover {
  background: rgba(255, 255, 255, 0.035);
}

tbody tr:last-child td {
  border-bottom: none;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #08111F;
}

.student-name {
  font-weight: 600;
}

.student-salon-mobile {
  display: none;
  font-size: 11.5px;
  color: var(--ink-faint);
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 130px;
}

.mini-track {
  width: 76px;
  height: 6px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.mini-fill {
  height: 100%;
  border-radius: 99px;
}

.progress-frac {
  font-size: 12px;
  color: var(--ink-dim);
  white-space: nowrap;
}

.stars-inline {
  display: flex;
  gap: 1px;
}

.stars-inline svg {
  width: 11px;
  height: 11px;
}

.star.on {
  fill: #FCD34D;
  stroke: #FCD34D;
}

.star.off {
  fill: none;
  stroke: rgba(255, 255, 255, 0.22);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-al-dia {
  background: rgba(16, 185, 129, 0.12);
  color: var(--emerald);
  border-color: rgba(16, 185, 129, 0.3);
}

.status-atrasado {
  background: rgba(245, 158, 11, 0.12);
  color: var(--amber);
  border-color: rgba(245, 158, 11, 0.3);
}

.status-riesgo {
  background: rgba(251, 113, 133, 0.12);
  color: var(--coral);
  border-color: rgba(251, 113, 133, 0.3);
}

.empty-state {
  padding: 56px 20px;
  text-align: center;
  color: var(--ink-dim);
}

.empty-state svg {
  width: 34px;
  height: 34px;
  color: var(--ink-faint);
  margin-bottom: 10px;
}

.empty-state p {
  margin: 0;
  font-size: 13.5px;
}

.drawer-scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(6, 10, 20, 0.6);
  backdrop-filter: blur(3px);
  opacity: 0;
  pointer-events: none;
  transition: opacity .25s ease;
}

.drawer-scrim.open {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  z-index: 51;
  background: var(--bg-2);
  border-left: 1px solid var(--border);
  padding: 22px 22px calc(24px + env(safe-area-inset-bottom, 0px));
  padding-top: calc(22px + env(safe-area-inset-top, 0px));
  transform: translateX(100%);
  transition: transform .3s cubic-bezier(.2, .9, .3, 1);
  overflow-y: auto;
}

.drawer-scrim.open .drawer {
  transform: translateX(0);
}

.drawer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.drawer-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  padding-right: 40px;
}

.drawer-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 700;
  color: #08111F;
}

.drawer-name {
  font-size: 17px;
  font-weight: 700;
}

.drawer-meta {
  font-size: 12.5px;
  color: var(--ink-dim);
  margin-top: 2px;
}

.drawer-section {
  margin-bottom: 22px;
}

.drawer-section-final {
  margin-bottom: 4px;
}

.drawer-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-faint);
  margin-bottom: 10px;
}

.node-status-row {
  display: flex;
  gap: 8px;
}

.node-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.node-status-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--surface);
}

.node-status-dot.done {
  background: var(--emerald);
  border-color: var(--emerald);
}

.node-status-dot.current {
  border-color: var(--cyan);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

.node-status-label {
  font-size: 9.5px;
  color: var(--ink-faint);
  text-align: center;
  line-height: 1.2;
}

.week-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 72px;
  margin-top: 4px;
}

.week-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
  justify-content: flex-end;
}

.week-bar {
  width: 100%;
  border-radius: 5px 5px 2px 2px;
  background: linear-gradient(180deg, var(--cyan), rgba(34, 211, 238, 0.25));
}

.week-day-label {
  font-size: 9.5px;
  color: var(--ink-faint);
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
}

.stat-box-label {
  font-size: 11px;
  color: var(--ink-faint);
  margin-bottom: 4px;
}

.stat-box-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
}

.game-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.game-row:last-child {
  border-bottom: none;
}

.game-row-label {
  font-size: 13.5px;
  font-weight: 600;
}

.view-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 18px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 12px;
  padding: 4px;
  width: fit-content;
}

.tab-btn {
  border: none;
  background: none;
  color: var(--ink-dim);
  font-size: 13.5px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 9px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.tab-btn.active {
  background: var(--surface-2);
  color: var(--ink);
}

.pdf-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.pdf-btn:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.pdf-btn svg {
  width: 14px;
  height: 14px;
}

.pdf-btn-ancho {
  width: 100%;
  justify-content: center;
  margin-top: 4px;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.salon-select-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.salon-select-row select {
  padding: 10px 14px;
  border-radius: 11px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
}

.heat-table {
  width: 100%;
  border-collapse: collapse;
}

.heat-table th {
  text-align: left;
  font-size: 11.5px;
  color: var(--ink-faint);
  font-weight: 600;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}

.heat-table td {
  padding: 11px 14px;
  font-size: 13.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.heat-table tr:last-child td {
  border-bottom: none;
}

.heat-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 12.5px;
}

.heat-bar-track {
  width: 100%;
  height: 7px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
  margin-top: 6px;
}

.heat-bar-fill {
  height: 100%;
  border-radius: 99px;
}

.rank-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.rank-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
}

.rank-pos {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-faint);
  margin-bottom: 8px;
}

.rank-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #08111F;
  margin-bottom: 8px;
}

.rank-name {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.rank-spark {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 26px;
  margin-bottom: 8px;
}

.rank-spark div {
  flex: 1;
  border-radius: 2px 2px 0 0;
}

.rank-score {
  font-size: 16px;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
}

.rank-trend {
  font-size: 11px;
  color: var(--emerald);
  margin-top: 2px;
}

.distractor-table {
  width: 100%;
  border-collapse: collapse;
}

.distractor-table th {
  text-align: left;
  font-size: 11.5px;
  color: var(--ink-faint);
  font-weight: 600;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}

.distractor-table td {
  padding: 11px 14px;
  font-size: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.distractor-table tr:last-child td {
  border-bottom: none;
}

.distractor-freq {
  display: flex;
  align-items: center;
  gap: 8px;
}

.distractor-freq-track {
  width: 70px;
  height: 6px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}

.distractor-freq-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--coral), var(--amber));
}

.distractor-note {
  font-size: 12px;
  color: var(--ink-faint);
  margin-top: 12px;
}

@media (max-width: 860px) {
  .rank-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .main {
    padding: 18px 16px 70px;
  }
  thead th:nth-child(2),
  tbody td:nth-child(2) {
    display: none;
  }
  .student-salon-mobile {
    display: block;
  }
  .distractor-table th:nth-child(1),
  .distractor-table td:nth-child(1) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drawer,
  .drawer-scrim,
  .mini-fill,
  .salon-bar-fill {
    transition: none;
  }
}
</style>