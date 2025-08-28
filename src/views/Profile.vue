<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
      <p class="text-gray-600">View and update your personal information</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading profile...</p>
    </div>

    <!-- Profile Information -->
    <div v-else class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center mb-6">
          <div class="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <span class="text-blue-600 text-2xl font-bold">{{ profile.name?.charAt(0).toUpperCase() }}</span>
          </div>
          <div>
            <h2 class="text-2xl font-semibold text-gray-800">{{ profile.name }}</h2>
            <p class="text-gray-600">{{ profile.email }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <p class="text-gray-900">{{ profile.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <p class="text-gray-900">{{ profile.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p class="text-gray-900">{{ formatDate(profile.date_of_birth) }}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">Academic Information</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Student ID</label>
                <p class="text-gray-900">{{ profile.id }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Assigned Classroom</label>
                <div v-if="profile.student?.classroom" class="mt-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ profile.student.classroom.name }}
                  </span>
                </div>
                <p v-else class="text-gray-500">No classroom assigned</p>
              </div>

              <div v-if="profile.student?.grade">
                <label class="block text-sm font-medium text-gray-700">Current Grade</label>
                <GradeDisplay :grade="profile.student.grade" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <button 
            @click="openEditModal"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Edit Profile</h3>
        
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              v-model="editForm.name" 
              type="text" 
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              v-model="editForm.email"
              type="email" 
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input 
              v-model="editForm.date_of_birth" 
              type="date" 
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div class="flex gap-3 pt-4">
            <button 
              type="submit"
              :disabled="saving"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {{ saving ? 'Saving...' : 'Update Profile' }}
            </button>
            <button 
              type="button"
              @click="closeEditModal"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import GradeDisplay from "../components/GradeDisplay.vue";

const profile = ref({});
const loading = ref(false);
const saving = ref(false);
const showEditModal = ref(false);

const editForm = ref({
  name: "",
  email: "",
  date_of_birth: ""
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const fetchProfile = async () => {
  loading.value = true;
  try {
    const res = await api.get("/profile");
    profile.value = res.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
  } finally {
    loading.value = false;
  }
};

const updateProfile = async () => {
  saving.value = true;
  try {
    await api.put("/profile", editForm.value);
    await fetchProfile();
    closeEditModal();
  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    saving.value = false;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = {
    name: profile.value.name || "",
    email: profile.value.email || "",
    date_of_birth: profile.value.date_of_birth || ""
  };
};

const openEditModal = () => {
  // Populate the form with current profile data
  editForm.value = {
    name: profile.value.name || "",
    email: profile.value.email || "",
    date_of_birth: profile.value.date_of_birth || ""
  };
  showEditModal.value = true;
};

onMounted(() => {
  fetchProfile();
});
</script>
