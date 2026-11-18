import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCourseStore = defineStore('courses', () => {
  const courses = ref([])
  const loading = ref(false)
  const error = ref('')

  async function fetchCourses() {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load courses.')
      courses.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addCourse(courseData) {
    error.value = ''
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to add course.')
    await fetchCourses()
    return data
  }

  async function deleteCourse(id) {
    error.value = ''
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete course.')
    courses.value = courses.value.filter((c) => c._id !== id)
  }

  return { courses, loading, error, fetchCourses, addCourse, deleteCourse }
})