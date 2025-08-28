<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Classrooms</h1>
      <p class="text-gray-600">Manage classroom information and assignments</p>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="flex-1">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search classrooms..."
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div v-if="role === 'admin'" class="flex gap-2">
          <button 
            @click="showAddModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Classroom
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading classrooms...</p>
    </div>

    <!-- Classrooms List -->
    <div v-else-if="classrooms.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="classroom in classrooms" 
        :key="classroom.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        @click="viewClassroom(classroom)"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold text-gray-800">{{ classroom.name }}</h3>
          <div v-if="role === 'admin'" class="flex gap-2" @click.stop>
            <button 
              @click="editClassroom(classroom)"
              class="text-blue-600 hover:text-blue-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button 
              @click="deleteClassroom(classroom.id)"
              class="text-red-600 hover:text-red-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <p v-if="classroom.description" class="text-gray-600 mb-4">{{ classroom.description }}</p>
        
        <div class="space-y-2 text-sm text-gray-600">
          <div class="flex justify-between">
            <span>Teacher:</span>
            <span class="font-medium">{{ classroom.teacher?.name || 'Not assigned' }}</span>
          </div>
          <div class="flex justify-between">
            <span>Students:</span>
            <span class="font-medium">{{ classroom.students_count || 0 }}</span>
          </div>
        </div>
        
        <!-- Click hint for teachers -->
        <div v-if="role === 'teacher'" class="mt-4 text-xs text-blue-600">
          Click to view students and manage grades
        </div>
        
        <!-- Additional Info (Admin/Teacher) -->
        <div v-if="role === 'admin' || role === 'teacher'" class="mt-4 pt-4 border-t border-gray-200">
          <div class="text-xs text-gray-500 space-y-1">
            <div class="flex justify-between">
              <span>Classroom ID:</span>
              <span class="font-mono">{{ classroom.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No classrooms found</h3>
      <p class="text-gray-600">
        {{ searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first classroom.' }}
      </p>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingClassroom" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">
          {{ editingClassroom ? 'Edit Classroom' : 'Add New Classroom' }}
        </h3>
        
        <form @submit.prevent="saveClassroom" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              v-model="classroomForm.name" 
              type="text" 
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              v-model="classroomForm.description" 
              rows="3"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
          
          <div v-if="role === 'admin'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Assign Teacher</label>
            <select 
              v-model="classroomForm.teacher_id"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a teacher</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }}
              </option>
            </select>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button 
              type="submit"
              :disabled="saving"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {{ saving ? 'Saving...' : (editingClassroom ? 'Update' : 'Create') }}
            </button>
            <button 
              type="button"
              @click="closeModal"
              class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="bg-white rounded-lg shadow-md p-6 mt-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ startIndex + 1 }}</span> to <span class="font-medium">{{ endIndex }}</span> of <span class="font-medium">{{ totalClassrooms }}</span> results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button 
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="currentPage = page"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                currentPage === page 
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            <button 
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";

const router = useRouter();
const role = ref(localStorage.getItem("role"));
const classrooms = ref([]);
const teachers = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref("");
const showAddModal = ref(false);
const editingClassroom = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const totalClassrooms = ref(0);
const perPage = ref(10);

const classroomForm = ref({
  name: "",
  description: "",
  teacher_id: ""
});

const startIndex = computed(() => (currentPage.value - 1) * perPage.value);
const endIndex = computed(() => Math.min(startIndex.value + perPage.value, totalClassrooms.value));

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Server-side search is handled in fetchClassrooms

const fetchClassrooms = async () => {
  loading.value = true;
  try {
    const res = await api.get("/classrooms", {
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        search: searchQuery.value || null,
      },
    });
    
    // Handle Laravel pagination structure for classrooms
    if (res.data.data && Array.isArray(res.data.data)) {
      // Classrooms data is directly in data array (not nested like students)
      classrooms.value = res.data.data.map(classroom => ({
        id: classroom.id,
        name: classroom.name,
        description: classroom.description,
        teacher_id: classroom.teacher_id,
        students_count: classroom.students_count,
        teacher: classroom.teacher, // Keep teacher object as is
        created_at: classroom.created_at,
        updated_at: classroom.updated_at
      }));
      totalClassrooms.value = res.data.total;
      totalPages.value = res.data.last_page;
    } else {
      // Fallback for non-paginated response
      classrooms.value = res.data;
      totalClassrooms.value = res.data.length;
      totalPages.value = 1;
    }
    
    console.log('Classrooms data:', classrooms.value); // Debug log
  } catch (error) {
    console.error('Error fetching classrooms:', error);
  } finally {
    loading.value = false;
  }
};

const fetchTeachers = async () => {
  if (role.value === 'admin') {
    try {
      const res = await api.get("/teachers");
      teachers.value = res.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  }
};

const saveClassroom = async () => {
  saving.value = true;
  try {
    const payload = {
      name: classroomForm.value.name,
      description: classroomForm.value.description,
      teacher_id: classroomForm.value.teacher_id || null
    };
    
    console.log('Saving classroom with payload:', payload); // Debug log
    
    if (editingClassroom.value) {
      await api.put(`/classrooms/${editingClassroom.value.id}`, payload);
    } else {
      await api.post("/classrooms", payload);
    }
    closeModal();
    fetchClassrooms();
  } catch (error) {
    console.error('Error saving classroom:', error);
  } finally {
    saving.value = false;
  }
};

const editClassroom = (classroom) => {
  editingClassroom.value = classroom;
  classroomForm.value = {
    name: classroom.name,
    description: classroom.description || "",
    teacher_id: classroom.teacher_id || ""
  };
  console.log('Editing classroom:', classroom); // Debug log
};

const deleteClassroom = async (id) => {
  if (!confirm('Are you sure you want to delete this classroom?')) return;
  
  try {
    await api.delete(`/classrooms/${id}`);
    fetchClassrooms();
  } catch (error) {
    console.error('Error deleting classroom:', error);
  }
};

const viewClassroom = (classroom) => {
  router.push(`/classrooms/${classroom.id}`);
};

const closeModal = () => {
  showAddModal.value = false;
  editingClassroom.value = null;
  classroomForm.value = {
    name: "",
    description: "",
    teacher_id: ""
  };
};

// Watch for search changes
watch(searchQuery, () => {
  currentPage.value = 1; // Reset to first page
  fetchClassrooms();
});

// Watch for page changes
watch(currentPage, () => {
  fetchClassrooms();
});

onMounted(() => {
  fetchClassrooms();
  fetchTeachers();
});
</script>