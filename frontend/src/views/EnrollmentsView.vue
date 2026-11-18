<script setup>
import { ref, onMounted } from 'vue'
import { useStudentStore } from '../stores/studentStore'
import { useCourseStore } from '../stores/courseStore'
import { useEnrollmentStore } from '../stores/enrollmentStore'
import AlertMessage from '../components/AlertMessage.vue'

const studentStore = useStudentStore()
const courseStore = useCourseStore()
const enrollmentStore = useEnrollmentStore()

const selectedStudentId = ref('')
const selectedCourseId = ref('')
const rosterCourseId = ref('')

const feedback = ref({ type: '', message: '' })
const submitting = ref(false)

onMounted(async () => {
  await Promise.all([studentStore.fetchStudents(), courseStore.fetchCourses()])
})

async function handleEnroll() {
  feedback.value = { type: '', message: '' }
  if (!selectedStudentId.value || !selectedCourseId.value) {
    feedback.value = { type: 'error', message: 'Please select both a student and a course.' }
    return
  }

  submitting.value = true
  try {
    await enrollmentStore.enrollStudent(selectedStudentId.value, selectedCourseId.value)
    feedback.value = { type: 'success', message: 'Student enrolled successfully.' }
    if (rosterCourseId.value === selectedCourseId.value) {
      await enrollmentStore.fetchCourseRoster(rosterCourseId.value)
    }
  } catch (err) {
    feedback.value = { type: 'error', message: err.message }
  } finally {
    submitting.value = false
  }
}

async function handleRosterChange() {
  await enrollmentStore.fetchCourseRoster(rosterCourseId.value)
}
</script>

<template>
  <section class="page">
    <h1>Enrollment Management</h1>

    <AlertMessage :type="feedback.type" :message="feedback.message" />
    <AlertMessage v-if="enrollmentStore.error" type="error" :message="enrollmentStore.error" />

    <div class="card">
      <h2>Enroll a Student</h2>
      <form @submit.prevent="handleEnroll" class="form-grid" novalidate>
        <div class="field">
          <label for="enroll-student">Student</label>
          <select id="enroll-student" v-model="selectedStudentId" required>
            <option value="">-- Select a Student --</option>
            <option v-for="s in studentStore.students" :key="s._id" :value="s._id">
              {{ s.name }} ({{ s.studentId }})
            </option>
          </select>
        </div>
        <div class="field">
          <label for="enroll-course">Course</label>
          <select id="enroll-course" v-model="selectedCourseId" required>
            <option value="">-- Select a Course --</option>
            <option v-for="c in courseStore.courses" :key="c._id" :value="c._id">
              {{ c.courseId }} - {{ c.courseName }}
            </option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Enrolling...' : 'Enroll Student' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <h2>Course Roster</h2>
      <div class="field" style="max-width: 420px; margin-bottom: 1rem;">
        <label for="roster-course">Select a Course to View Enrolled Students</label>
        <select id="roster-course" v-model="rosterCourseId" @change="handleRosterChange">
          <option value="">-- Select a Course --</option>
          <option v-for="c in courseStore.courses" :key="c._id" :value="c._id">
            {{ c.courseId }} - {{ c.courseName }}
          </option>
        </select>
      </div>

      <p v-if="!rosterCourseId" class="status-text">Choose a course above to see its enrolled students.</p>
      <p v-else-if="enrollmentStore.loading" class="status-text">Loading roster...</p>
      <p v-else-if="enrollmentStore.roster.length === 0" class="status-text">
        No students are currently enrolled in this course.
      </p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Phone</th>
              <th>ZIP Code</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in enrollmentStore.roster" :key="student._id">
              <td>{{ student.name }}</td>
              <td>{{ student.studentId }}</td>
              <td>{{ student.phone }}</td>
              <td>{{ student.zip }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
