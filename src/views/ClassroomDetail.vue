<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <button 
          @click="$router.go(-1)"
          class="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back
        </button>
      </div>
      
      <div v-if="classroom" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ classroom.name }}</h1>
        <p v-if="classroom.description" class="text-gray-600 mb-4">{{ classroom.description }}</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Teacher:</span>
            <span class="font-medium">{{ classroom.teacher?.name || 'Not assigned' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total Students:</span>
            <span class="font-medium">{{ students.length }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Class ID:</span>
            <span class="font-medium">{{ classroom.id }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Students Section -->
    <div class="bg-white rounded-lg shadow-md p-6">
             <div class="flex justify-between items-center mb-6">
         <h2 class="text-2xl font-semibold text-gray-800">Students in this Class</h2>
         <button 
           v-if="role === 'admin'"
           @click="showAddStudentModal = true"
           class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
         >
           Add Student
         </button>
       </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading students...</p>
      </div>

      <!-- Students List -->
      <div v-else-if="students.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-blue-600 font-medium">{{ student.name.charAt(0).toUpperCase() }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ student.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(student.date_of_birth) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ student.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <GradeDisplay 
                  v-if="student.grade" 
                  :grade="student.grade" 
                  :show-letter="true"
                />
                <span v-else class="text-gray-500">No grade</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button 
                    @click="assignGrade(student)"
                    class="text-green-600 hover:text-green-900"
                  >
                    {{ student.grade ? 'Edit Grade' : 'Assign Grade' }}
                  </button>
                  <button 
                    @click="removeStudent(student.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No students in this class</h3>
        <p class="text-gray-600">Add students to get started.</p>
      </div>
    </div>

    <!-- Add Student Modal -->
    <div v-if="showAddStudentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Add Student to {{ classroom?.name }}</h3>
          <button 
            @click="closeAddStudentModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="mb-4">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search students by name, email, or ID..."
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
          <div 
            v-for="student in searchResults" 
            :key="student.id"
            class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
            @click="addStudentToClass(student)"
          >
            <div>
              <div class="font-medium text-gray-900">{{ student.name }}</div>
              <div class="text-sm text-gray-600">{{ student.email }}</div>
            </div>
            <div class="text-sm text-gray-500">ID: {{ student.id }}</div>
          </div>
          
          <!-- Search Pagination -->
          <div v-if="searchTotalPages > 1" class="p-3 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">
                Showing {{ searchStartIndex + 1 }}-{{ searchEndIndex }} of {{ searchTotalResults }} results
              </span>
              <div class="flex gap-1">
                <button 
                  @click="searchPage--"
                  :disabled="searchPage === 1"
                  class="px-2 py-1 text-xs border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span class="px-2 py-1 text-xs text-gray-600">
                  Page {{ searchPage }} of {{ searchTotalPages }}
                </span>
                <button 
                  @click="searchPage++"
                  :disabled="searchPage === searchTotalPages"
                  class="px-2 py-1 text-xs border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="searchQuery && !searching" class="text-center py-8 text-gray-500">
          No students found matching your search.
        </div>

        <!-- Loading -->
        <div v-if="searching" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Searching...</p>
        </div>

        <div class="mt-4 flex justify-end">
          <button 
            @click="closeAddStudentModal"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Grade Assignment Modal -->
    <GradeAssignmentModal
      :show="showGradeModal"
      :student="selectedStudent"
      :classroom="classroom"
      :editing-grade="editingGrade"
      @close="closeGradeModal"
      @saved="onGradeSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios';
import GradeAssignmentModal from '../components/GradeAssignmentModal.vue';
import GradeDisplay from '../components/GradeDisplay.vue';
import { debounce } from '../utils/helpers';

const route = useRoute();
const router = useRouter();

const role = ref(localStorage.getItem("role"));
const classroom = ref(null);
const students = ref([]);
const loading = ref(false);
const showAddStudentModal = ref(false);
const showGradeModal = ref(false);
const selectedStudent = ref(null);
const editingGrade = ref(null);
const searchQuery = ref('');
const searchResults = ref([]);
const searching = ref(false);
const searchPage = ref(1);
const searchTotalPages = ref(1);
const searchTotalResults = ref(0);
const searchPerPage = 10;

// Debounced search to avoid too many API calls
const debouncedSearch = debounce(() => {
  searchPage.value = 1; // Reset to first page on new search
  searchStudents();
}, 300);

const searchStartIndex = computed(() => (searchPage.value - 1) * searchPerPage);
const searchEndIndex = computed(() => Math.min(searchStartIndex.value + searchPerPage, searchTotalResults.value));

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const fetchClassroom = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/classrooms/${route.params.id}`);
    classroom.value = res.data;
  } catch (error) {
    console.error('Error fetching classroom:', error);
    router.push('/classrooms');
  } finally {
    loading.value = false;
  }
};

const fetchStudents = async () => {
  try {
    const res = await api.get(`/classrooms/${route.params.id}/students`);
    
    // Handle Laravel pagination structure
    if (res.data.data && Array.isArray(res.data.data)) {
      // Transform the data to flatten user information
      students.value = res.data.data.map(student => ({
        id: student.user_id,
        name: student.user.name,
        email: student.user.email,
        date_of_birth: student.user.date_of_birth,
        assigned_class_id: student.assigned_class_id,
        grade: student.grade,
        grade_id: student.grade_id,
        classroom: student.classroom, // Keep classroom info if it exists
        created_at: student.created_at,
        updated_at: student.updated_at
      }));
    } else {
      // Fallback for non-paginated response
      students.value = res.data;
    }
  } catch (error) {
    console.error('Error fetching students:', error);
  }
};

const searchStudents = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    searchTotalResults.value = 0;
    searchTotalPages.value = 1;
    return;
  }

  searching.value = true;
  try {
    // API expects: GET /students?search=term&not_in_classroom=123&page=1&per_page=10
    // API should return Laravel pagination structure
    const res = await api.get('/students', {
      params: {
        search: searchQuery.value,
        not_in_classroom: route.params.id,
        page: searchPage.value,
        per_page: searchPerPage
      }
    });
    
    // Handle Laravel pagination structure
    if (res.data.data && Array.isArray(res.data.data)) {
      // Transform the data to flatten user information
      searchResults.value = res.data.data.map(student => ({
        id: student.user_id,
        name: student.user.name,
        email: student.user.email,
        date_of_birth: student.user.date_of_birth,
        assigned_class_id: student.assigned_class_id
      }));
      searchTotalResults.value = res.data.total;
      searchTotalPages.value = res.data.last_page;
    } else {
      // Non-paginated response (fallback)
      searchResults.value = res.data;
      searchTotalResults.value = res.data.length;
      searchTotalPages.value = 1;
    }
  } catch (error) {
    console.error('Error searching students:', error);
    searchResults.value = [];
    searchTotalResults.value = 0;
    searchTotalPages.value = 1;
  } finally {
    searching.value = false;
  }
};

// Watch for page changes to reload search results
watch(searchPage, () => {
  if (searchQuery.value.trim()) {
    searchStudents();
  }
});

const addStudentToClass = async (student) => {
  try {
    // Use user_id for the API call since that's what the backend expects
    await api.put(`/students/${student.id}`, {
      assigned_class_id: route.params.id
    });
    
    // Refresh the students list
    await fetchStudents();
    
    // Close modal and reset search
    closeAddStudentModal();
    
    // Show success message (you can add a toast notification here)
    console.log(`Added ${student.name} to the class`);
  } catch (error) {
    console.error('Error adding student to class:', error);
  }
};

const removeStudent = async (studentId) => {
  if (!confirm('Are you sure you want to remove this student from the class?')) return;
  
  try {
    // Use DELETE request to remove student from class
    await api.delete(`/students/${studentId}`);
    await fetchStudents();
  } catch (error) {
    console.error('Error removing student from class:', error);
  }
};

const assignGrade = (student) => {
  selectedStudent.value = student;
  // If student already has a grade, set it for editing
  if (student.grade) {
    editingGrade.value = {
      id: student.grade_id, // Assuming there's a grade_id field
      student_id: student.id,
      classroom_id: classroom.value.id,
      grade: student.grade
    };
  } else {
    editingGrade.value = null;
  }
  showGradeModal.value = true;
};

const closeGradeModal = () => {
  showGradeModal.value = false;
  selectedStudent.value = null;
  editingGrade.value = null;
};

const onGradeSaved = async () => {
  // Refresh the students list to show updated grades
  await fetchStudents();
  console.log('Grade saved successfully');
};

const closeAddStudentModal = () => {
  showAddStudentModal.value = false;
  searchQuery.value = '';
  searchResults.value = [];
  searchPage.value = 1;
  searchTotalResults.value = 0;
  searchTotalPages.value = 1;
};

onMounted(() => {
  fetchClassroom();
  fetchStudents();
});
</script>
