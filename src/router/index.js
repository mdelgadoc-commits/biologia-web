import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/Login.vue"),
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
    component: () => import("@/layouts/DocenteLayout.vue"),
    meta: { requiresAuth: true, rol: "docente" },
    children: [
      { path: "", name: "docente-dashboard", component: () => import("@/views/docente/Dashboard.vue") },
    ],
  },
  { path: "/", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.estaAutenticado) {
    return "/login";
  }
  if (to.meta.rol && to.meta.rol !== auth.rol) {
    return "/login";
  }
});

export default router;
