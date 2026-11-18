import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useEnrollmentStore = defineStore('enrollments', () => {
  const roster = ref([])
  const selectedCourse = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function enrollStudent(studentId, courseId) {
    error.value = ''
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, courseId })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to enroll student.')
    return data
  }

  async function fetchCourseRoster(courseId) {
    if (!courseId) {
      roster.value = []
      selectedCourse.value = null
      return
    }
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`/api/enrollments/course/${courseId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load roster.')
      selectedCourse.value = data.course
      roster.value = data.students
    } catch (err) {
      error.value = err.message
      roster.value = []
    } finally {
      loading.value = false
    }
  }

  return { roster, selectedCourse, loading, error, enrollStudent, fetchCourseRoster }
})