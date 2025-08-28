<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p class="text-gray-600">Welcome back, {{ userRole }}!</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading dashboard...</p>
    </div>

    <!-- Role-specific welcome message -->
    <div v-else class="card mb-6">
      <div v-if="role === 'admin'" class="text-center">
        <h2 class="text-2xl font-semibold text-blue-600 mb-4">Administrator Dashboard</h2>
        <p class="text-gray-700 mb-6">You have full access to manage teachers, classrooms, and students.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-blue-800">Total Teachers</h3>
            <p class="text-2xl font-bold text-blue-600">{{ stats.teachers || 0 }}</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-green-800">Total Classrooms</h3>
            <p class="text-2xl font-bold text-green-600">{{ stats.classrooms || 0 }}</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="font-semibold text-purple-800">Total Students</h3>
            <p class="text-2xl font-bold text-purple-600">{{ stats.students || 0 }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="role === 'teacher'" class="text-center">
        <h2 class="text-2xl font-semibold text-green-600 mb-4">Teacher Dashboard</h2>
        <p class="text-gray-700 mb-6">Manage your classrooms and students.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        </div>
      </div>

      <div v-else class="text-center">
        <h2 class="text-2xl font-semibold text-purple-600 mb-4">Student Dashboard</h2>
        <p class="text-gray-700 mb-6">View your classroom information and manage your profile.</p>
        <div class="bg-purple-50 p-4 rounded-lg mt-6 max-w-md mx-auto">
          <h3 class="font-semibold text-purple-800 mb-2">My Classroom</h3>
          <p v-if="studentInfo.student?.classroom" class="text-lg font-medium text-purple-600">
            {{ studentInfo.student.classroom.name }}
          </p>
          <p v-else class="text-gray-500">No classroom assigned yet. Please contact your administrator.</p>
        </div>
        
        <!-- Additional Student Information -->
        <div class="mt-4 space-y-2 text-sm text-gray-600">
          <p><strong>Student ID:</strong> {{ studentInfo.id }}</p>
          <p><strong>Name:</strong> {{ studentInfo.name }}</p>
          <p><strong>Email:</strong> {{ studentInfo.email }}</p>
          <p v-if="studentInfo.date_of_birth"><strong>Date of Birth:</strong> {{ formatDate(studentInfo.date_of_birth) }}</p>
          <p v-if="studentInfo.student?.grade"><strong>Current Grade:</strong> 
            <span class="font-medium text-purple-600">{{ studentInfo.student.grade }}</span>
          </p>
          <p v-if="studentInfo.created_at"><strong>Member Since:</strong> {{ formatDate(studentInfo.created_at) }}</p>
        </div>
        
        <!-- Profile Link -->
        <div class="mt-6">
          <router-link 
            to="/profile" 
            class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            View Full Profile
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../api/axios";

const role = ref(localStorage.getItem("role"));
const stats = ref({});
const studentInfo = ref({});
const loading = ref(true);

const userRole = computed(() => {
  switch(role.value) {
    case 'admin': return 'Administrator';
    case 'teacher': return 'Teacher';
    case 'student': return 'Student';
    default: return 'User';
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const fetchStats = async () => {
  try {
    loading.value = true;
    if (role.value === 'admin') {
      const res = await api.get('/dashboard/stats');
      stats.value = res.data;
    } else if (role.value === 'teacher') {
      const res = await api.get('/dashboard/teacher-stats');
      stats.value = res.data;
    } else if (role.value === 'student') {
      const res = await api.get('/profile');
      studentInfo.value = res.data;
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>