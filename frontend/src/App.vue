<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="navbar">
      <div class="nav-inner">
        <span class="brand">Student Management System</span>
        <nav aria-label="Main navigation" class="nav-links">
          <RouterLink to="/students">Students</RouterLink>
          <RouterLink to="/courses">Courses</RouterLink>
          <RouterLink to="/enrollments">Enrollments</RouterLink>
        </nav>
      </div>
    </header>
    <main class="container">
      <RouterView />
    </main>
  </div>
</template>