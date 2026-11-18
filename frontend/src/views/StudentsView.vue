<script setup>
import { ref, onMounted } from 'vue'
import { useStudentStore } from '../stores/studentStore'
import AlertMessage from '../components/AlertMessage.vue'

const studentStore = useStudentStore()

const name = ref('')
const studentId = ref('')
const phone = ref('')
const zip = ref('')
const searchQuery = ref('')

const feedback = ref({ type: '', message: '' })
const submitting = ref(false)

onMounted(() => {
  studentStore.fetchStudents()
})

async function handleAddStudent() {
  feedback.value = { type: '', message: '' }
  if (!name.value.trim() || !studentId.value.trim() || !phone.value.trim() || !zip.value.trim()) {
    feedback.value = { type: 'error', message: 'Please fill out all student fields.' }
    return
  }

  submitting.value = true
  try {
    await studentStore.addStudent({
      name: name.value.trim(),
      studentId: studentId.value.trim(),
      phone: phone.value.trim(),
      zip: zip.value.trim()
    })
    feedback.value = { type: 'success', message: `Student "${name.value.trim()}" added successfully.` }
    name.value = ''
    studentId.value = ''
    phone.value = ''
    zip.value = ''
    searchQuery.value = ''
  } catch (err) {
    feedback.value = { type: 'error', message: err.message }
  } finally {
    submitting.value = false
  }
}

async function handleSearch() {
  feedback.value = { type: '', message: '' }
  await studentStore.fetchStudents(searchQuery.value)
}

async function handleClearSearch() {
  searchQuery.value = ''
  await studentStore.fetchStudents()
}

async function handleDelete(student) {
  if (!confirm(`Delete student "${student.name}" (${student.studentId}) and all their enrollments?`)) {
    return
  }
  feedback.value = { type: '', message: '' }
  try {
    await studentStore.deleteStudent(student._id)
    feedback.value = { type: 'success', message: `Student "${student.name}" deleted.` }
  } catch (err) {
    feedback.value = { type: 'error', message: err.message }
  }
}
</script>

<template>
  <section class="page">
    <h1>Student Management</h1>

    <AlertMessage :type="feedback.type" :message="feedback.message" />
    <AlertMessage v-if="studentStore.error" type="error" :message="studentStore.error" />

    <div class="card">
      <h2>Add Student</h2>
      <form @submit.prevent="handleAddStudent" class="form-grid" novalidate>
        <div class="field">
          <label for="student-name">Name</label>
          <input id="student-name" v-model="name" type="text" placeholder="e.g. John" required />
        </div>
        <div class="field">
          <label for="student-id">Student ID</label>
          <input id="student-id" v-model="studentId" type="text" placeholder="e.g. 1001" required />
        </div>
        <div class="field">
          <label for="student-phone">Phone</label>
          <input id="student-phone" v-model="phone" type="text" placeholder="e.g. 555-1234" required />
        </div>
        <div class="field">
          <label for="student-zip">ZIP Code</label>
          <input id="student-zip" v-model="zip" type="text" placeholder="e.g. 77001" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Adding...' : 'Add Student' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <h2>Search &amp; Directory</h2>
      <form @submit.prevent="handleSearch" class="search-bar">
        <label for="student-search" class="sr-only">Search by name or student ID</label>
        <input
          id="student-search"
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or Student ID..."
        />
        <button type="submit" class="btn btn-primary">Search</button>
        <button v-if="searchQuery" type="button" class="btn btn-secondary" @click="handleClearSearch">
          Clear
        </button>
      </form>

      <p v-if="studentStore.loading" class="status-text">Loading students...</p>
      <p v-else-if="studentStore.students.length === 0" class="status-text">No students found.</p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Phone</th>
              <th>ZIP Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in studentStore.students" :key="student._id">
              <td>{{ student.name }}</td>
              <td>{{ student.studentId }}</td>
              <td>{{ student.phone }}</td>
              <td>{{ student.zip }}</td>
              <td>
                <button type="button" class="btn btn-danger" @click="handleDelete(student)">
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
