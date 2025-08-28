<template>
  <div class="container mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Students</h1>
      <p class="text-gray-600">View and manage existing student information and classroom assignments</p>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="flex-1">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search students by name or email..."
            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="flex gap-2">
          <select 
            v-model="classroomFilter"
            class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Classrooms</option>
            <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
              {{ classroom.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading students...</p>
    </div>

    <!-- Students Table -->
    <div v-else-if="filteredStudents.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classroom</th>
              <th v-if="role !== 'student'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <GradeDisplay
                  v-if="student.grade"
                  :grade="student.grade"
                  :show-letter="true"
                />
                <span v-else class="text-gray-500">No grade</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span v-if="student.classroom" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ student.classroom.name }}
                </span>
                <span v-else-if="student.assigned_class_id && getClassroomName(student.assigned_class_id)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ getClassroomName(student.assigned_class_id) }}
                </span>
                <span v-else class="text-gray-500">Not assigned</span>
              </td>
              <td v-if="role !== 'student'" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button 
                    @click="editStudent(student)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button 
                    v-if="role === 'admin' || role === 'teacher'"
                    @click="deleteStudent(student.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button 
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button 
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ startIndex + 1 }}</span> to <span class="font-medium">{{ endIndex }}</span> of <span class="font-medium">{{ totalStudents }}</span> results
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

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No students found</h3>
      <p class="text-gray-600">
        {{ searchQuery || classroomFilter ? 'Try adjusting your search terms or filters.' : 'Students will appear here once they register and are assigned to classrooms.' }}
      </p>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="editingStudent" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">
          Edit Student
        </h3>
        
        <form @submit.prevent="saveStudent" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              v-model="studentForm.name" 
              type="text" 
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              v-model="studentForm.email" 
              type="email" 
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input 
              v-model="studentForm.date_of_birth" 
              type="date" 
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <input 
              v-model="studentForm.grade" 
              type="number" 
              min="0" 
              max="100" 
              step="0.1"
              placeholder="Enter grade (0-100)"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="validateGrade"
            />
            <p class="mt-1 text-sm text-gray-500">Enter a grade between 0 and 100 (e.g., 85.5)</p>
            <p v-if="gradeError" class="mt-1 text-sm text-red-600">
              {{ gradeError }}
            </p>
          </div>
          

          
          <div class="flex gap-3 pt-4">
            <button 
              type="submit"
              :disabled="saving || !!gradeError"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {{ saving ? 'Saving...' : 'Update' }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "../api/axios";
import GradeDisplay from "../components/GradeDisplay.vue";

const role = ref(localStorage.getItem("role"));
const students = ref([]);
const classrooms = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref("");
const classroomFilter = ref("");
const editingStudent = ref(null);
const gradeError = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const totalStudents = ref(0);
const perPage = ref(10);

const studentForm = ref({
  name: "",
  email: "",
  date_of_birth: "",
  grade: ""
});

const filteredStudents = computed(() => {
  let filtered = students.value;
  
  if (searchQuery.value) {
    filtered = filtered.filter(student => 
      student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  if (classroomFilter.value) {
    filtered = filtered.filter(student => 
      student.assigned_class_id === parseInt(classroomFilter.value)
    );
  }
  
  return filtered;
});

const startIndex = computed(() => (currentPage.value - 1) * perPage.value);
const endIndex = computed(() => Math.min(startIndex.value + perPage.value, totalStudents.value));

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

const validateGrade = () => {
  const value = parseFloat(studentForm.value.grade);
  if (studentForm.value.grade && (isNaN(value) || value < 0 || value > 100)) {
    gradeError.value = 'Please enter a valid grade between 0 and 100.';
  } else {
    gradeError.value = '';
  }
};

const getClassroomName = (classroomId) => {
  if (!classroomId) return null;
  const classroom = classrooms.value.find(c => c.id === classroomId);
  return classroom ? classroom.name : null;
};

const fetchStudents = async () => {
  loading.value = true;
  try {
    const res = await api.get("/students", {
      params: {
        page: currentPage.value,
        per_page: perPage.value,
        search: searchQuery.value,
        classroom_id: classroomFilter.value || null,
      },
    });
    
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
        classroom: student.classroom || null, // Keep classroom info if it exists
        created_at: student.created_at,
        updated_at: student.updated_at
      }));
      totalStudents.value = res.data.total;
      totalPages.value = res.data.last_page;
    } else {
      // Fallback for non-paginated response
      students.value = res.data;
      totalStudents.value = res.data.length;
      totalPages.value = 1;
    }
    
    console.log('Students data:', students.value); // Debug log
  } catch (error) {
    console.error('Error fetching students:', error);
  } finally {
    loading.value = false;
  }
};

const fetchClassrooms = async () => {
  try {
    const res = await api.get("/classrooms");
    classrooms.value = res.data.data;
  } catch (error) {
    console.error('Error fetching classrooms:', error);
  }
};

const saveStudent = async () => {
  // Validate grade before saving
  if (studentForm.value.grade) {
    validateGrade();
    if (gradeError.value) {
      return; // Don't save if there's a grade error
    }
  }
  
  saving.value = true;
  try {
    const payload = {
      name: studentForm.value.name,
      email: studentForm.value.email,
      date_of_birth: studentForm.value.date_of_birth,
      grade: studentForm.value.grade || null
    };
    
    console.log('Updating student with payload:', payload); // Debug log
    
    // Only update existing students
    await api.put(`/students/${editingStudent.value.id}`, payload);
    closeModal();
    fetchStudents();
  } catch (error) {
    console.error('Error updating student:', error);
  } finally {
    saving.value = false;
  }
};

const editStudent = (student) => {
  editingStudent.value = student;
  gradeError.value = ""; // Clear previous grade errors
  studentForm.value = {
    name: student.name,
    email: student.email,
    date_of_birth: student.date_of_birth,
    grade: student.grade || ""
  };
  console.log('Editing student:', student); // Debug log
};

const deleteStudent = async (id) => {
  if (!confirm('Are you sure you want to delete this student?')) return;
  
  try {
    await api.delete(`/students/${id}`);
    fetchStudents();
  } catch (error) {
    console.error('Error deleting student:', error);
  }
};

const closeModal = () => {
  editingStudent.value = null;
  gradeError.value = ""; // Clear grade error
  studentForm.value = {
    name: "",
    email: "",
    date_of_birth: "",
    grade: ""
  };
};

// Watch for search and filter changes
watch([searchQuery, classroomFilter], () => {
  currentPage.value = 1; // Reset to first page
  fetchStudents();
});

// Watch for page changes
watch(currentPage, () => {
  fetchStudents();
});

onMounted(() => {
  fetchStudents();
  fetchClassrooms();
});
</script>