<script setup>
import { ref, onMounted } from 'vue'
import { useCourseStore } from '../stores/courseStore'
import AlertMessage from '../components/AlertMessage.vue'

const courseStore = useCourseStore()

const courseId = ref('')
const courseName = ref('')
const feedback = ref({ type: '', message: '' })
const submitting = ref(false)

onMounted(() => {
  courseStore.fetchCourses()
})

async function handleAddCourse() {
  feedback.value = { type: '', message: '' }
  if (!courseId.value.trim() || !courseName.value.trim()) {
    feedback.value = { type: 'error', message: 'Course ID and Course Name are required.' }
    return
  }

  submitting.value = true
  try {
    await courseStore.addCourse({
      courseId: courseId.value.trim(),
      courseName: courseName.value.trim()
    })
    feedback.value = { type: 'success', message: `Course "${courseId.value.trim()}" added successfully.` }
    courseId.value = ''
    courseName.value = ''
  } catch (err) {
    feedback.value = { type: 'error', message: err.message }
  } finally {
    submitting.value = false
  }
}

async function handleDelete(course) {
  if (!confirm(`Delete course "${course.courseId} - ${course.courseName}" and all its enrollments?`)) {
    return
  }
  feedback.value = { type: '', message: '' }
  try {
    await courseStore.deleteCourse(course._id)
    feedback.value = { type: 'success', message: `Course "${course.courseId}" deleted.` }
  } catch (err) {
    feedback.value = { type: 'error', message: err.message }
  }
}
</script>

<template>
  <section class="page">
    <h1>Course Management</h1>

    <AlertMessage :type="feedback.type" :message="feedback.message" />
    <AlertMessage v-if="courseStore.error" type="error" :message="courseStore.error" />

    <div class="card">
      <h2>Add Course</h2>
      <form @submit.prevent="handleAddCourse" class="form-grid" novalidate>
        <div class="field">
          <label for="course-id">Course ID</label>
          <input id="course-id" v-model="courseId" type="text" placeholder="e.g. CIS 3339" required />
        </div>
        <div class="field">
          <label for="course-name">Course Name</label>
          <input
            id="course-name"
            v-model="courseName"
            type="text"
            placeholder="e.g. Enterprise Applications Development"
            required
          />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Adding...' : 'Add Course' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <h2>All Courses</h2>
      <p v-if="courseStore.loading" class="status-text">Loading courses...</p>
      <p v-else-if="courseStore.courses.length === 0" class="status-text">No courses added yet.</p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courseStore.courses" :key="course._id">
              <td>{{ course.courseId }}</td>
              <td>{{ course.courseName }}</td>
              <td>
                <button type="button" class="btn btn-danger" @click="handleDelete(course)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>