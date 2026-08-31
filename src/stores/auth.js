import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    rol: localStorage.getItem('rol') || null,
  }),
  actions: {
    async login(username, password) {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login/`,
        { username, password }
      )
      this.accessToken = data.access
      this.refreshToken = data.refresh
      this.rol = jwtDecode(data.access).rol

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('rol', this.rol)
    },
    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.rol = null
      localStorage.clear()
    },
  },
})
