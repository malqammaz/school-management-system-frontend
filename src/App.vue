<template>
  <div id="app">
    <nav v-if="authStore.isAuthenticated.value && !isAuthRoute" class="bg-blue-600 text-white p-4 shadow-lg">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-6">
          <h1 class="text-xl font-bold"><router-link to="/dashboard">Dashboard</router-link></h1>
          <div class="flex items-center space-x-4">
            <router-link v-if="isAdmin(derivedRole) || isTeacher(derivedRole)" to="/classrooms" class="hover:text-blue-200 transition-colors">
              {{ isAdmin(derivedRole) ? 'Manage Classrooms' : 'My Classrooms' }}
            </router-link>
            <router-link v-if="isAdmin(derivedRole) || isTeacher(derivedRole)" to="/students" class="hover:text-blue-200 transition-colors">
              {{ isAdmin(derivedRole) ? 'Manage Students' : 'My Students' }}
            </router-link>
          </div>
        </div>
        <div class="relative" ref="menuRoot">
          <button 
            @click="toggleMenu" 
            class="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
          >
            <span>{{ accountName }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div 
            v-if="menuOpen" 
            class="absolute right-0 mt-2 w-44 bg-white text-gray-700 rounded shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            <button 
              v-if="isStudent(derivedRole)" 
              @click="goToProfile" 
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Update Profile
            </button>
            <button 
              @click="logoutAndClose" 
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="min-h-screen bg-gray-50">
      <!-- Global error display -->
      <div v-if="appError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mt-4">
        <div class="flex items-center justify-between">
          <span>{{ appError }}</span>
          <button @click="appError = null" class="text-red-500 hover:text-red-700">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onBeforeMount, onBeforeUnmount, onMounted, computed, ref, onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './store/auth';
import { isAdmin, isTeacher, isStudent } from './utils/helpers';

const router = useRouter();
const authStore = useAuthStore();

// Error handling
const appError = ref(null);

onErrorCaptured((error, instance, info) => {
  console.error('App error captured:', error, instance, info);
  
  // Check if it's an unauthorized error
  if (error.response?.status === 401) {
    // Clear auth data and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    
    // Redirect to login with message
    router.push({ 
      path: '/login', 
      query: { 
        message: 'Your session has expired. Please login again.' 
      }
    });
    return false;
  }
  
  // Handle other errors
  appError.value = 'An unexpected error occurred. Please refresh the page.';
  return false; // Prevent error from propagating
});

const isAuthRoute = computed(() => {
  const path = router.currentRoute.value.path;
  return path === '/login' || path === '/register';
});

const derivedRole = computed(() => authStore.userRole?.value || authStore.user?.value?.role || null);
const accountName = computed(() => {
  const fromStore = (authStore.displayName?.value || '').trim();
  if (fromStore) return fromStore;
  const u = authStore.user?.value;
  return (u && (u.name || u.full_name || u.username || u.email)) ? (u.name || u.full_name || u.username || u.email) : 'Account';
});

const menuOpen = ref(false);
const menuRoot = ref(null);

const toggleMenu = () => { menuOpen.value = !menuOpen.value; };

const closeMenu = (event) => {
  if (!menuRoot.value) return;
  if (menuRoot.value.contains(event.target)) return;
  menuOpen.value = false;
};

const goToProfile = () => { menuOpen.value = false; router.push('/profile'); };

const logoutAndClose = async () => { 
  try {
    menuOpen.value = false; 
    await authStore.logout(); 
    router.push('/login'); 
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even if logout fails
    router.push('/login');
  }
};

const initAuth = async () => { 
  try {
    await authStore.checkAuth(); 
  } catch (error) {
    console.error('Auth initialization error:', error);
    // Don't show error to user, just log it
  }
};

onMounted(() => { 
  window.addEventListener('click', closeMenu); 
});

onBeforeUnmount(() => { 
  window.removeEventListener('click', closeMenu); 
});

onBeforeMount(async () => { 
  await initAuth(); 
});
</script>