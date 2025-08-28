<template>
  <div class="flex h-screen items-center justify-center bg-gray-100">
    <div class="w-96 bg-white p-8 rounded-lg shadow-lg">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">School Management System</h1>
        <h2 class="text-xl text-gray-600">Register</h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            sign in to your account
          </router-link>
        </p>
      </div>
      
      <form @submit.prevent="register" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="Enter your full name"
            required
            :disabled="loading"
            class="input-field disabled:bg-gray-100"
          />
          <div v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</div>
        </div>


        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input 
            v-model="form.dob" 
            type="date"
            required
            :disabled="loading"
            class="input-field disabled:bg-gray-100"
          />
          <div v-if="errors.dob" class="mt-1 text-sm text-red-600">{{ errors.dob[0] }}</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="Enter your email"
            required
            :disabled="loading"
            class="input-field disabled:bg-gray-100"
          />
          <div v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email[0] }}</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            v-model="form.role" 
            required
            :disabled="loading"
            class="input-field disabled:bg-gray-100"
          >
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <div v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role[0] }}</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Enter your password"
            required
            :disabled="loading"
            class="input-field disabled:bg-gray-100"
          />
          <div v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password[0] }}</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input 
            v-model="form.password_confirmation" 
            type="password" 
            placeholder="Confirm your password"
            required
            :disabled="loading"
            class="input-field disabled:bg-gray-100"
          />
          <div v-if="errors.password_confirmation" class="mt-1 text-sm text-red-600">{{ errors.password_confirmation[0] }}</div>
        </div>
        
        <button 
          type="submit"
          :disabled="loading || !isFormValid"
          class="btn-primary w-full"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </span>
          <span v-else>Create Account</span>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

// State
const loading = ref(false);
const error = ref('');
const errors = ref({});

const form = ref({
  name: '',
  dob: '',
  email: '',
  role: 'student',
  password: '',
  password_confirmation: ''
});

const isFormValid = computed(() => {
  return form.value.name && 
         form.value.dob &&
         form.value.email && 
         form.value.role &&
         form.value.password && 
         form.value.password_confirmation &&
         form.value.password === form.value.password_confirmation;
});

const register = async () => {
  loading.value = true;
  error.value = '';
  errors.value = {};

  const payload = { ...form.value, role: form.value.role || 'student' };

  try {
    const data = await authStore.register(payload);
    if (data) {
      router.push('/dashboard');
    }
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {};
      error.value = 'Please fix the validation errors above.';
    } else if (err.response?.status === 409) {
      error.value = 'A user with this email already exists.';
    } else if (err.response?.status === 500) {
      error.value = 'Server error. Please try again later.';
    } else if (err.code === 'ECONNREFUSED' || err.message === 'Network Error') {
      error.value = 'Cannot connect to server. Please check your connection.';
    } else {
      error.value = 'An error occurred. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
