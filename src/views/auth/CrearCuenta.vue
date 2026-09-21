<template>
  <div class="crear-cuenta">
    <div class="wrap">

      <header class="top">
        <div>
          <h1>{{ t("crearCuenta.title") }}</h1>
          <p>{{ t("crearCuenta.subtitle") }}</p>
        </div>
        <div class="lang">
          <label for="lang">{{ t("crearCuenta.language") }}</label>
          <select id="lang" :value="locale" @change="cambiarIdioma($event.target.value)">
            <option v-for="l in LOCALES_DISPONIBLES" :key="l.codigo" :value="l.codigo">
              {{ l.nombre }}
            </option>
          </select>
        </div>
      </header>

      <div class="layout">

        <!-- ================= FORMULARIO ================= -->
        <div class="main">
          <form id="form" class="panel" novalidate @submit.prevent="crearCuenta">

            <div class="progress">
              <div class="progress-label" id="progressLabel">
                {{ t("crearCuenta.progress", { actual: validos, total: 7 }) }}
              </div>
              <div
                class="bar"
                role="progressbar"
                aria-labelledby="progressLabel"
                aria-valuemin="0"
                aria-valuemax="7"
                :aria-valuenow="validos"
              >
                <i id="barFill" :style="{ width: pctProgreso }"></i>
              </div>
            </div>

            <!-- 1. Nombre -->
            <div class="field" id="f-nombre" :data-state="estados.nombre">
              <label for="in-nombre">{{ t("crearCuenta.name_label") }}</label>
              <span class="hint" id="hint-nombre">{{ t("crearCuenta.name_hint") }}</span>
              <input
                id="in-nombre"
                v-model="form.nombre"
                type="text"
                autocomplete="name"
                maxlength="60"
                spellcheck="false"
                :placeholder="t('crearCuenta.name_ph')"
                aria-describedby="hint-nombre msg-nombre"
                @input="validar('nombre')"
                @blur="validar('nombre')"
              >
              <div class="msg" id="msg-nombre" aria-live="polite">{{ mensajes.nombre }}</div>
            </div>

            <!-- 2. Edad -->
            <div class="field" id="f-edad" :data-state="estados.edad">
              <label for="in-edad">{{ t("crearCuenta.age_label") }}</label>
              <span class="hint" id="hint-edad">{{ t("crearCuenta.age_hint") }}</span>
              <input
                id="in-edad"
                v-model="form.edad"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                maxlength="5"
                :placeholder="t('crearCuenta.age_ph')"
                aria-describedby="hint-edad msg-edad"
                @input="validar('edad')"
                @blur="validar('edad')"
              >
              <div class="msg" id="msg-edad" aria-live="polite">{{ mensajes.edad }}</div>
            </div>

            <!-- 3. Fecha de nacimiento -->
            <div class="field" id="f-fecha" :data-state="estados.fecha">
              <label for="in-fecha">{{ t("crearCuenta.dob_label") }}</label>
              <span class="hint" id="hint-fecha">{{ t("crearCuenta.dob_hint") }}</span>
              <input
                id="in-fecha"
                v-model="form.fecha"
                type="text"
                autocomplete="off"
                maxlength="10"
                :placeholder="t('crearCuenta.dob_ph')"
                aria-describedby="hint-fecha msg-fecha"
                @input="validar('fecha')"
                @blur="validar('fecha')"
              >
              <div class="msg" id="msg-fecha" aria-live="polite">{{ mensajes.fecha }}</div>
            </div>

            <!-- 4. Horas mínimas -->
            <div class="field" id="f-horas" :data-state="estados.horas">
              <label for="in-horas">{{ t("crearCuenta.hours_label") }}</label>
              <span class="hint" id="hint-horas">{{ t("crearCuenta.hours_hint") }}</span>
              <input
                id="in-horas"
                v-model="form.horas"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                maxlength="7"
                :placeholder="t('crearCuenta.hours_ph')"
                aria-describedby="hint-horas msg-horas"
                @input="validar('horas')"
                @blur="validar('horas')"
              >
              <div class="msg" id="msg-horas" aria-live="polite">{{ mensajes.horas }}</div>
            </div>

            <!-- 5. ID del programa -->
            <div class="field" id="f-id" :data-state="estados.id">
              <label for="in-id">{{ t("crearCuenta.id_label") }}</label>
              <span class="hint" id="hint-id">{{ t("crearCuenta.id_hint") }}</span>
              <input
                id="in-id"
                v-model="form.id"
                type="text"
                autocomplete="off"
                autocapitalize="characters"
                maxlength="9"
                spellcheck="false"
                :placeholder="t('crearCuenta.id_ph')"
                aria-describedby="hint-id msg-id"
                @input="validar('id')"
                @blur="validar('id')"
              >
              <div class="msg" id="msg-id" aria-live="polite">{{ mensajes.id }}</div>
            </div>

            <!-- 6. Contraseña -->
            <div class="field" id="f-password" :data-state="estados.password">
              <label for="in-password">{{ t("crearCuenta.password_label") }}</label>
              <span class="hint" id="hint-password">{{ t("crearCuenta.password_hint") }}</span>
              <input
                id="in-password"
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                maxlength="40"
                spellcheck="false"
                :placeholder="t('crearCuenta.password_ph')"
                aria-describedby="hint-password msg-password"
                @input="validar('password')"
                @blur="validar('password')"
              >
              <div class="msg" id="msg-password" aria-live="polite">{{ mensajes.password }}</div>
            </div>

            <!-- 7. Correo o teléfono -->
            <fieldset class="field" id="f-contacto" :data-state="estados.contacto">
              <legend>{{ t("crearCuenta.contact_label") }}</legend>
              <span class="hint" id="hint-contacto">{{ t("crearCuenta.contact_hint") }}</span>

              <div class="segmented">
                <input
                  type="radio"
                  name="via"
                  id="via-email"
                  value="email"
                  v-model="form.via"
                  @change="validar('contacto')"
                >
                <label for="via-email">{{ t("crearCuenta.via_email") }}</label>

                <input
                  type="radio"
                  name="via"
                  id="via-phone"
                  value="telefono"
                  v-model="form.via"
                  @change="validar('contacto')"
                >
                <label for="via-phone">{{ t("crearCuenta.via_phone") }}</label>

                <div class="panel-contact panel-email">
                  <label class="sr-only" for="in-correo">{{ t("crearCuenta.email_label") }}</label>
                  <input
                    id="in-correo"
                    v-model="form.correo"
                    type="email"
                    autocomplete="email"
                    spellcheck="false"
                    :placeholder="t('crearCuenta.email_ph')"
                    aria-describedby="hint-contacto msg-contacto"
                    @input="validar('contacto')"
                    @blur="validar('contacto')"
                  >
                </div>

                <div class="panel-contact panel-phone">
                  <label class="sr-only" for="in-telefono">{{ t("crearCuenta.phone_label") }}</label>
                  <input
                    id="in-telefono"
                    v-model="form.telefono"
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    :placeholder="t('crearCuenta.phone_ph')"
                    aria-describedby="hint-contacto msg-contacto"
                    @input="validar('contacto')"
                    @blur="validar('contacto')"
                  >
                </div>
              </div>

              <div class="msg" id="msg-contacto" aria-live="polite">{{ mensajes.contacto }}</div>
            </fieldset>

            <div class="actions">
              <button type="submit" class="btn btn-primary" :disabled="creando">
                {{ creando ? t("crearCuenta.registrando") : t("crearCuenta.submit") }}
              </button>
              <button type="button" class="btn btn-ghost" id="resetBtn" @click="reiniciar">
                {{ t("crearCuenta.reset") }}
              </button>
            </div>
            <p
              class="form-msg"
              id="formMsg"
              role="alert"
              :class="{ 'is-ok': formMsgTipo === 'ok' }"
              :hidden="!formMsg"
            >
              {{ formMsg }}
            </p>
            <p class="back-login">
              <router-link to="/login">{{ t("crearCuenta.back_login") }}</router-link>
            </p>
          </form>
        </div>

        <!-- ================= TARJETA DE VISTA PREVIA ================= -->
        <aside class="side">
          <div class="ticket" role="group" :aria-label="t('crearCuenta.title')">
            <div class="ticket-main">
              <div class="ticket-head">
                <div class="avatar" id="avatar" aria-hidden="true">{{ inicialAvatar }}</div>
                <div>
                  <div class="t-name" :class="{ 'is-empty': !form.nombre.trim() }" id="cName">
                    {{ nombreTarjeta }}
                  </div>
                  <div class="t-status" id="cStatus">{{ estadoTarjeta }}</div>
                </div>
              </div>

              <dl class="t-grid">
                <div><dt>{{ t("crearCuenta.card_age") }}</dt><dd :class="{ 'is-empty': !form.edad }" id="cAge">{{ form.edad || "—" }}</dd></div>
                <div><dt>{{ t("crearCuenta.card_hours") }}</dt><dd :class="{ 'is-empty': !form.horas }" id="cHours">{{ form.horas || "—" }}</dd></div>
                <div class="span2"><dt>{{ t("crearCuenta.card_dob") }}</dt><dd :class="{ 'is-empty': !form.fecha }" id="cDob">{{ form.fecha || "—" }}</dd></div>
                <div class="span2"><dt>{{ t("crearCuenta.card_contact") }}</dt><dd :class="{ 'is-empty': !contactoValor }" id="cContact">{{ contactoValor || "—" }}</dd></div>
              </dl>
            </div>

            <div class="ticket-stub">
              <div>
                <div class="t-idlabel">ID</div>
                <div class="t-id" :class="{ 'is-empty': !form.id }" id="cId">{{ idTarjeta }}</div>
              </div>
              <div
                class="stamp"
                id="stamp"
                :class="{ pop: selloPop }"
                :hidden="!creada"
              >
                {{ t("crearCuenta.stamp") }}
              </div>
            </div>
          </div>

          <section class="result" id="result" :hidden="!creada" aria-live="polite">
            <h2 id="resTitle">{{ t("crearCuenta.result_title") }}</h2>
            <p id="resBody">{{ t("crearCuenta.result_body") }}</p>
            <pre><code id="resJson">{{ resultadoJSON }}</code></pre>
          </section>
        </aside>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { LOCALES_DISPONIBLES, cambiarIdioma } from "@/i18n";

const { t, locale } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  nombre: "",
  edad: "",
  fecha: "",
  horas: "",
  id: "",
  password: "",
  correo: "",
  telefono: "",
  via: "email",
});

const estados = reactive({
  nombre: "idle",
  edad: "idle",
  fecha: "idle",
  horas: "idle",
  id: "idle",
  password: "idle",
  contacto: "idle",
});

const mensajes = reactive({
  nombre: "",
  edad: "",
  fecha: "",
  horas: "",
  id: "",
  password: "",
  contacto: "",
});

const creada = ref(false);
const creando = ref(false);
const selloPop = ref(false);
const formMsg = ref("");
const formMsgTipo = ref("");
const datosCuenta = ref(null);

const CAMPOS = ["nombre", "edad", "fecha", "horas", "id", "password", "contacto"];

const inicialAvatar = computed(() => {
  const nombre = form.nombre.trim();
  return nombre ? [...nombre][0].toUpperCase() : "?";
});

const nombreTarjeta = computed(() => form.nombre.trim() || t("crearCuenta.card_empty_name"));

const idTarjeta = computed(() => (form.id.trim() ? form.id.toUpperCase() : "···-·····"));

const contactoValor = computed(() =>
  form.via === "email" ? form.correo.trim() : form.telefono.trim()
);

const validos = computed(() => CAMPOS.filter((c) => estados[c] === "ok").length);

const pctProgreso = computed(() => `${(validos.value / CAMPOS.length) * 100}%`);

const estadoTarjeta = computed(() =>
  creada.value ? t("crearCuenta.status_ok") : t("crearCuenta.status_idle")
);

const resultadoJSON = computed(() =>
  datosCuenta.value ? JSON.stringify(datosCuenta.value, null, 2) : ""
);

function validarNombre(v) {
  if (!v.trim()) return { ok: false, mensaje: "" };
  if (!/^[\p{L}\p{M} \-']{2,50}$/u.test(v.trim())) {
    return { ok: false, mensaje: t("crearCuenta.name_bad") };
  }
  return { ok: true, mensaje: t("crearCuenta.name_ok") };
}

function validarEdad(v) {
  if (!v.trim()) return { ok: false, mensaje: "" };
  if (!/^\d{1,3}$/.test(v.trim())) {
    return { ok: false, mensaje: t("crearCuenta.age_bad") };
  }
  const n = Number(v.trim());
  if (!Number.isInteger(n) || n < 1 || n > 120) {
    return { ok: false, mensaje: t("crearCuenta.age_bad") };
  }
  return { ok: true, mensaje: t("crearCuenta.age_ok") };
}

function validarFecha(v) {
  const limite = 120;
  if (!v.trim()) return { ok: false, mensaje: "" };
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v.trim());
  if (!partes) return { ok: false, mensaje: t("crearCuenta.dob_bad") };
  const [, dd, mm, aaaa] = partes;
  const [dia, mes, anio] = [dd, mm, aaaa].map(Number);
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || anio < 1900) {
    return { ok: false, mensaje: t("crearCuenta.dob_bad") };
  }
  const fecha = new Date(anio, mes - 1, dia);
  const coincide =
    fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
  if (!coincide) return { ok: false, mensaje: t("crearCuenta.dob_bad") };
  const hoy = new Date();
  if (fecha > hoy) return { ok: false, mensaje: t("crearCuenta.dob_bad") };
  const anios = (hoy - fecha) / (365.25 * 24 * 60 * 60 * 1000);
  if (anios > limite) return { ok: false, mensaje: t("crearCuenta.dob_bad") };
  return { ok: true, mensaje: t("crearCuenta.dob_ok") };
}

function validarHoras(v) {
  if (!v.trim()) return { ok: false, mensaje: "" };
  const normalizado = v.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalizado)) {
    return { ok: false, mensaje: t("crearCuenta.hours_bad") };
  }
  const n = Number(normalizado);
  if (!(n > 0)) return { ok: false, mensaje: t("crearCuenta.hours_bad") };
  return { ok: true, mensaje: t("crearCuenta.hours_ok") };
}

function validarId(v) {
  if (!v.trim()) return { ok: false, mensaje: "" };
  if (!/^[A-Z]{3}-\d{5}$/.test(v.trim().toUpperCase())) {
    return { ok: false, mensaje: t("crearCuenta.id_bad") };
  }
  return { ok: true, mensaje: t("crearCuenta.id_ok") };
}

function validarPassword(v) {
  if (!v) return { ok: false, mensaje: "" };
  if (!/^(?=(?:[^A-Z]*[A-Z]){2})\S{7,}$/.test(v)) {
    return { ok: false, mensaje: t("crearCuenta.password_bad") };
  }
  return { ok: true, mensaje: t("crearCuenta.password_ok") };
}

function validarCorreo(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
    ? { ok: true, mensaje: t("crearCuenta.email_ok") }
    : { ok: false, mensaje: t("crearCuenta.email_bad") };
}

function validarTelefono(v) {
  const digitos = v.replace(/\D/g, "");
  const formatoOk = /^\+?[0-9][()0-9\s.-]*$/.test(v.trim());
  const longitudOk = digitos.length >= 9 && digitos.length <= 15;
  return formatoOk && longitudOk
    ? { ok: true, mensaje: t("crearCuenta.phone_ok") }
    : { ok: false, mensaje: t("crearCuenta.phone_bad") };
}

function validar(campo) {
  let r;
  switch (campo) {
    case "nombre":
      r = validarNombre(form.nombre);
      break;
    case "edad":
      r = validarEdad(form.edad);
      break;
    case "fecha":
      r = validarFecha(form.fecha);
      break;
    case "horas":
      r = validarHoras(form.horas);
      break;
    case "id":
      r = validarId(form.id);
      break;
    case "password":
      r = validarPassword(form.password);
      break;
    case "contacto": {
      const valor = form.via === "email" ? form.correo : form.telefono;
      r = form.via === "email" ? validarCorreo(valor) : validarTelefono(valor);
      break;
    }
    default:
      return;
  }
  estados[campo] = r.ok ? "ok" : r.mensaje ? "bad" : "idle";
  mensajes[campo] = r.mensaje;
}

async function crearCuenta() {
  formMsg.value = "";
  formMsgTipo.value = "";
  CAMPOS.forEach(validar);
  if (validos.value !== CAMPOS.length) {
    formMsgTipo.value = "error";
    formMsg.value = t("crearCuenta.form_msg_error");
    return;
  }
  creando.value = true;
  try {
    const username = form.id.trim().toUpperCase();
    const { data } = await api.post("/auth/registro/", {
      username,
      password: form.password,
      nombre: form.nombre.trim(),
      edad: Number(form.edad.trim()),
      fecha_nacimiento: form.fecha.trim(),
      horas_minimas: Number(form.horas.trim().replace(",", ".")),
      via_contacto: form.via,
      correo: form.via === "email" ? form.correo.trim() : "",
      telefono: form.via === "telefono" ? form.telefono.trim() : "",
    });
    datosCuenta.value = data;
    creada.value = true;
    selloPop.value = false;
    await nextTick();
    selloPop.value = true;
    formMsgTipo.value = "ok";
    formMsg.value = t("crearCuenta.form_msg_ok");
    setTimeout(() => {
      void entrarAlMapa(username, form.password);
    }, 1400);
  } catch (error) {
    const mensajeApi = error.response?.data;
    const idRegistrado = Array.isArray(mensajeApi?.username) &&
      mensajeApi.username.some((m) => /registrado/i.test(m));
    formMsg.value = idRegistrado
      ? t("crearCuenta.registro_id_existe")
      : t("crearCuenta.registro_error");
    formMsgTipo.value = "error";
  } finally {
    creando.value = false;
  }
}

async function entrarAlMapa(username, password) {
  try {
    await auth.login(username, password);
  } catch {
    await router.push("/login");
    return;
  }
  await router.push("/estudiante");
}

function reiniciar() {
  form.nombre = "";
  form.edad = "";
  form.fecha = "";
  form.horas = "";
  form.id = "";
  form.password = "";
  form.correo = "";
  form.telefono = "";
  form.via = "email";
  CAMPOS.forEach((c) => {
    estados[c] = "idle";
    mensajes[c] = "";
  });
  creada.value = false;
  creando.value = false;
  selloPop.value = false;
  formMsg.value = "";
  formMsgTipo.value = "";
  datosCuenta.value = null;
}
</script>

<style scoped>
.crear-cuenta {
  color-scheme: light;
  --bg: #ECEFF6;
  --surface: #FFFFFF;
  --ink: #16193A;
  --muted: #575D7E;
  --line: #CDD3E6;
  --accent: #4B3BD6;
  --accent-ink: #FFFFFF;
  --accent-soft: #E8E5FB;
  --coin: #FFC53D;
  --ok: #0F7A57;
  --bad: #B0215A;
  --card: #25226B;
  --card-ink: #F5F3FF;
  --card-muted: #B4B1E6;
  --card-line: #4A46A8;
  --code-bg: #16193A;
  --code-ink: #E9E8FF;
  --font-display: "Bricolage Grotesque", "Segoe UI", system-ui, -apple-system, sans-serif;
  --font-body: "Instrument Sans", "Segoe UI", system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
}

.crear-cuenta *,
.crear-cuenta *::before,
.crear-cuenta *::after {
  box-sizing: border-box;
}

@media (prefers-color-scheme: dark) {
  .crear-cuenta {
    color-scheme: dark;
    --bg: #0E0F26;
    --surface: #171939;
    --ink: #ECEDFB;
    --muted: #A3A8CD;
    --line: #2E3163;
    --accent: #9A8CFF;
    --accent-ink: #0E0F26;
    --accent-soft: #25275A;
    --ok: #4FD8A4;
    --bad: #FF85AE;
    --card: #2B2880;
    --code-bg: #0A0B1C;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding: clamp(20px, 4vw, 48px) clamp(16px, 4vw, 32px);
}

.top {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
}
.top h1 {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(2rem, 5vw, 3.1rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
}
.top p {
  margin: 0;
  max-width: 56ch;
  color: var(--muted);
}

.lang {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.875rem;
}
.lang label {
  color: var(--muted);
  font-weight: 500;
}
.lang select {
  min-width: 168px;
  height: 44px;
  padding: 0 12px;
  font: inherit;
  color: var(--ink);
  background: var(--surface);
  border: 1.5px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
}
.lang select:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.layout {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr);
}
@media (min-width: 920px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 32px;
    align-items: start;
  }
  .side {
    position: sticky;
    top: 24px;
  }
}

.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: clamp(18px, 3vw, 28px);
}

.progress {
  margin-bottom: 24px;
}
.progress-label {
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted);
}
.bar {
  height: 8px;
  overflow: hidden;
  background: var(--accent-soft);
  border-radius: 99px;
}
.bar > i {
  display: block;
  width: 0;
  height: 100%;
  background: var(--accent);
  border-radius: inherit;
  transition: width 0.25s ease;
}

.field {
  margin: 0 0 22px;
}
fieldset.field {
  min-width: 0;
  padding: 0;
  border: 0;
}
.field > label,
.field > legend {
  display: block;
  padding: 0;
  margin-bottom: 2px;
  font-weight: 600;
}
.hint {
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: var(--muted);
}

.field input:not([type="radio"]) {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  font: inherit;
  color: var(--ink);
  background: var(--surface);
  border: 1.5px solid var(--line);
  border-radius: 10px;
  transition: border-color 0.15s ease;
}
.field input::placeholder {
  color: var(--muted);
  opacity: 0.6;
}
.field input:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 1px;
}

#in-id {
  text-transform: uppercase;
}
#in-id::placeholder {
  text-transform: uppercase;
}

.field[data-state="ok"] input:not([type="radio"]) {
  border-color: var(--ok);
}
.field[data-state="bad"] input:not([type="radio"]) {
  border-color: var(--bad);
}

.msg {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  min-height: 1.5em;
  margin-top: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}
.field[data-state="ok"] .msg {
  color: var(--ok);
}
.field[data-state="bad"] .msg {
  color: var(--bad);
}
.field[data-state="ok"] .msg::before,
.field[data-state="bad"] .msg::before {
  flex: none;
  width: 1em;
  text-align: center;
}
.field[data-state="ok"] .msg::before {
  content: "✓";
  content: "✓" / "";
}
.field[data-state="bad"] .msg::before {
  content: "✕";
  content: "✕" / "";
}

.segmented {
  position: relative;
  display: flex;
  flex-wrap: wrap;
}
.segmented input[type="radio"] {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  opacity: 0;
  pointer-events: none;
}
.segmented > label {
  display: block;
  flex: 1 1 0;
  margin: 0;
  padding: 10px 14px;
  text-align: center;
  font-weight: 600;
  color: var(--ink);
  background: var(--surface);
  border: 1.5px solid var(--line);
  cursor: pointer;
}
.segmented > label[for="via-email"] {
  border-radius: 10px 0 0 10px;
}
.segmented > label[for="via-phone"] {
  margin-left: -1.5px;
  border-radius: 0 10px 10px 0;
}
.segmented input[type="radio"]:checked + label {
  position: relative;
  z-index: 1;
  color: var(--accent-ink);
  background: var(--accent);
  border-color: var(--accent);
}
.segmented input[type="radio"]:focus-visible + label {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.segmented .panel-contact {
  flex: 0 0 100%;
  margin-top: 10px;
}
.panel-phone {
  display: none;
}
#via-phone:checked ~ .panel-phone {
  display: block;
}
#via-phone:checked ~ .panel-email {
  display: none;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}
.btn {
  height: 48px;
  padding: 0 22px;
  font: inherit;
  font-weight: 600;
  border: 1.5px solid transparent;
  border-radius: 10px;
  cursor: pointer;
}
.btn:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.btn-primary {
  color: var(--accent-ink);
  background: var(--accent);
}
.btn-primary:hover {
  filter: brightness(1.1);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-ghost {
  color: var(--ink);
  background: transparent;
  border-color: var(--line);
}
.btn-ghost:hover {
  border-color: var(--muted);
}

.form-msg {
  min-height: 1.4em;
  margin: 12px 0 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--bad);
}
.form-msg.is-ok {
  color: var(--ok);
}
.back-login {
  margin: 16px 0 0;
  font-size: 0.9rem;
}
.back-login a {
  color: var(--accent);
}

.ticket {
  position: relative;
  color: var(--card-ink);
  background: var(--card);
  border-radius: 22px;
}
.ticket-main {
  padding: 24px 24px 22px;
}
.ticket-head {
  display: flex;
  gap: 14px;
  align-items: center;
}
.avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.3rem;
  color: #25226B;
  background: var(--coin);
  border-radius: 50%;
}
.t-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.35rem;
  line-height: 1.15;
  overflow-wrap: anywhere;
}
.t-status {
  margin-top: 2px;
  font-size: 0.85rem;
  color: var(--card-muted);
}
.is-empty {
  color: var(--card-muted);
}
.t-name.is-empty {
  font-weight: 500;
}

.t-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
  margin: 22px 0 0;
}
.t-grid dt {
  font-size: 0.8rem;
  color: var(--card-muted);
}
.t-grid dd {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.t-grid .span2 {
  grid-column: 1 / -1;
}

.ticket-stub {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 2px dashed var(--card-line);
}
.ticket-stub::before,
.ticket-stub::after {
  content: "";
  position: absolute;
  top: -13px;
  width: 24px;
  height: 24px;
  background: var(--bg);
  border-radius: 50%;
}
.ticket-stub::before {
  left: -12px;
}
.ticket-stub::after {
  right: -12px;
}

.t-idlabel {
  font-size: 0.8rem;
  color: var(--card-muted);
}
.t-id {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: 0.06em;
  color: var(--coin);
  font-variant-numeric: tabular-nums;
}
.t-id.is-empty {
  font-weight: 500;
  color: var(--card-muted);
}

.stamp {
  display: inline-block;
  padding: 4px 12px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--coin);
  border: 2px solid var(--coin);
  border-radius: 8px;
  transform: rotate(-6deg);
}
.stamp[hidden] {
  display: none;
}
@media (prefers-reduced-motion: no-preference) {
  .stamp.pop {
    animation: pop 0.35s cubic-bezier(0.2, 1.4, 0.4, 1);
  }
}
@keyframes pop {
  from {
    transform: scale(1.7) rotate(-16deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(-6deg);
    opacity: 1;
  }
}

.result {
  margin-top: 22px;
}
.result h2 {
  margin: 0 0 6px;
  font-family: var(--font-display);
  font-size: 1.4rem;
  line-height: 1.2;
}
.result p {
  margin: 0 0 10px;
  font-size: 0.95rem;
  color: var(--muted);
}
.result pre {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--code-ink);
  background: var(--code-bg);
  border-radius: 12px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>