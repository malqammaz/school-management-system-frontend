<template>
  <div class="flex h-screen items-center justify-center bg-gray-100">
    <div class="w-96 bg-white p-8 rounded-lg shadow-lg">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">School Management System</h1>
        <h2 class="text-xl text-gray-600">Login</h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </router-link>
        </p>
      </div>
      
      <!-- Session expired message -->
      <div v-if="route.query.message" class="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>{{ route.query.message }}</span>
        </div>
      </div>
      
      <form @submit.prevent="onLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="Enter your email"
            required
            :disabled="loading"
            class="input-field disabled:bg-gray-100"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Enter your password"
            required
            :disabled="loading"
            class="input-field disabled:bg-gray-100"
          />
        </div>
        
        <button 
          type="submit"
          :disabled="loading || !email || !password"
          class="btn-primary w-full"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </span>
          <span v-else>Login</span>
        </button>
      </form>
      
      <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../store/auth";

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Check for redirect query parameter and session expired message
onMounted(() => {
  if (route.query.message) {
    error.value = route.query.message;
  }
});

const onLogin = async () => {
  // Clear previous errors
  error.value = "";
  
  // Validate inputs
  if (!email.value || !password.value) {
    error.value = "Please fill in all fields";
    return;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    error.value = "Please enter a valid email address";
    return;
  }
  
  // Password length validation
  if (password.value.length < 6) {
    error.value = "Password must be at least 6 characters long";
    return;
  }

  loading.value = true;

  try {
    const data = await authStore.login({ 
      email: email.value.trim(), 
      password: password.value 
    });
    const role = data?.user?.role || authStore.userRole?.value || authStore.user?.value?.role;
    
    // Redirect to the original requested page if available, otherwise to dashboard
    const redirectPath = route.query.redirect || "/dashboard";
    router.push(redirectPath);
  } catch (err) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else if (err.response?.status === 422) {
      error.value = "Invalid credentials. Please check your email and password.";
    } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
      error.value = "Cannot connect to the server. Please check if the backend is running.";
    } else if (err.response?.status === 404) {
      error.value = "Login endpoint not found. Please check the API configuration.";
    } else if (err.response?.status === 500) {
      error.value = "Server error. Please try again later.";
    } else if (err.message && err.message !== 'Login failed') {
      error.value = err.message;
    } else {
      error.value = "An error occurred. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};
</script>