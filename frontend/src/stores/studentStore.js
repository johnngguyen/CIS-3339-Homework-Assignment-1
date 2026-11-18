import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useStudentStore = defineStore('students', () => {
  const students = ref([])
  const loading = ref(false)
  const error = ref('')

  async function fetchStudents(search = '') {
    loading.value = true
    error.value = ''
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
      const res = await fetch(`/api/students${query}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load students.')
      students.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addStudent(studentData) {
    error.value = ''
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to add student.')
    await fetchStudents()
    return data
  }

  async function deleteStudent(id) {
    error.value = ''
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete student.')
    students.value = students.value.filter((s) => s._id !== id)
  }

  return { students, loading, error, fetchStudents, addStudent, deleteStudent }
})