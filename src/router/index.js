import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/Login.vue"),
  },
  {
    path: "/crear-cuenta",
    name: "crear-cuenta",
    component: () => import("@/views/auth/CrearCuenta.vue"),
  },
  {
    path: "/estudiante",
    component: () => import("@/layouts/EstudianteLayout.vue"),
    meta: { requiresAuth: true, rol: "estudiante" },
    children: [
      { path: "", name: "mapa-etapas", component: () => import("@/views/estudiante/MapaEtapas.vue") },
      { path: "tema/:id", name: "tema", component: () => import("@/views/estudiante/Tema.vue") },
    ],
  },
  {
    path: "/docente",
    redirect: "/docente/dashboard",
    component: () => import("@/layouts/DocenteLayout.vue"),
    meta: { requiresAuth: true, rol: "docente" },
    children: [
      { path: "dashboard", name: "docente-dashboard", component: () => import("@/views/docente/Dashboard.vue") },
      { path: "reportes", name: "docente-reportes", component: () => import("@/views/docente/Reportes.vue") },
      { path: "preguntas", name: "docente-preguntas", component: () => import("@/views/docente/GestionPreguntas.vue") },
    ],
  },
  { path: "/", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.estaAutenticado) {
    return "/login";
  }
  if (to.meta.rol && to.meta.rol !== auth.rol) {
    return "/login";
  }
});

export default router;
