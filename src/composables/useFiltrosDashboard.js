import { ref, watch } from 'vue'
import api from '@/services/api'

export function useFiltrosDashboard() {
  const secciones = ref([])
  const temas = ref([])
  const estudiantes = ref([])

  const seccionId = ref(null)
  const temaId = ref(null)
  const estudianteId = ref(null)
  const busquedaAlumno = ref('')

  async function cargarSecciones() {
    const { data } = await api.get('/docente/secciones/')
    secciones.value = data
    if (data.length) seccionId.value = data[0].id
  }

  async function cargarTemas() {
    const { data } = await api.get('/docente/temas/')
    temas.value = data
  }

  async function buscarEstudiantes() {
    if (!seccionId.value) return
    const { data } = await api.get(`/docente/secciones/${seccionId.value}/estudiantes/`, {
      params: { q: busquedaAlumno.value },
    })
    estudiantes.value = data
  }

  watch(busquedaAlumno, buscarEstudiantes)
  watch(seccionId, () => { estudianteId.value = null; buscarEstudiantes() })

  return {
    secciones, temas, estudiantes,
    seccionId, temaId, estudianteId, busquedaAlumno,
    cargarSecciones, cargarTemas, buscarEstudiantes,
  }
}
