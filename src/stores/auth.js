import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import api from "@/services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    access: localStorage.getItem("access") || null,
    refresh: localStorage.getItem("refresh") || null,
    rol: localStorage.getItem("rol") || null,
    username: localStorage.getItem("username") || null,
  }),

  getters: {
    estaAutenticado: (state) => !!state.access,
  },

  actions: {
    async login(username, password) {
      const { data } = await api.post("/auth/login/", { username, password });
      const payload = jwtDecode(data.access);

      this.access = data.access;
      this.refresh = data.refresh;
      this.rol = payload.rol;
      this.username = username;

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("rol", payload.rol);
      localStorage.setItem("username", username);
    },

    logout() {
      this.access = null;
      this.refresh = null;
      this.rol = null;
      this.username = null;
      localStorage.clear();
    },
  },
});
