<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingGrade ? 'Edit Grade' : 'Assign Grade' }}
            <span v-if="student" class="text-sm text-gray-500">for {{ student.name }}</span>
            <span v-if="classroom" class="text-sm text-gray-500">in {{ classroom.name }}</span>
          </h3>
          <button 
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveGrade" class="space-y-4">
          <!-- Grade -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <input 
              v-model="gradeForm.grade"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="Enter grade (0-100)"
              required
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="validateGrade"
            />
            <p class="mt-1 text-sm text-gray-500">
              Enter a grade between 0 and 100 (e.g., 85.5)
            </p>
            <p v-if="gradeError" class="mt-1 text-sm text-red-600">
              {{ gradeError }}
            </p>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end gap-3">
            <button 
              type="button"
              @click="closeModal"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="saving || !!gradeError"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <span v-if="saving" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
              <span v-else>{{ editingGrade ? 'Update Grade' : 'Assign Grade' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { gradeService } from '../services/gradeService';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  student: {
    type: Object,
    default: null
  },
  classroom: {
    type: Object,
    default: null
  },
  editingGrade: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);

const saving = ref(false);
const gradeError = ref('');
const gradeForm = ref({
  student_id: '',
  classroom_id: '',
  grade: ''
});

// Watch for changes in props and reset form
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.editingGrade) {
      // Edit mode
      gradeForm.value = {
        student_id: props.editingGrade.student_id,
        classroom_id: props.editingGrade.classroom_id || props.classroom?.id,
        grade: props.editingGrade.grade
      };
      gradeError.value = ''; // Clear previous errors
    } else if (props.student && props.classroom) {
      // New grade mode
      gradeForm.value = {
        student_id: props.student.id,
        classroom_id: props.classroom.id,
        grade: ''
      };
      gradeError.value = ''; // Clear previous errors
    }
  }
});

const closeModal = () => {
  emit('close');
};

const validateGrade = () => {
  const value = parseFloat(gradeForm.value.grade);
  if (isNaN(value) || value < 0 || value > 100) {
    gradeError.value = 'Please enter a valid grade between 0 and 100.';
  } else {
    gradeError.value = '';
  }
};

const saveGrade = async () => {
  saving.value = true;
  
  try {
    if (props.editingGrade) {
      await gradeService.updateGrade(props.editingGrade.id, gradeForm.value);
    } else {
      await gradeService.createGrade(gradeForm.value);
    }
    
    emit('saved');
    closeModal();
  } catch (error) {
    console.error('Error saving grade:', error);
  } finally {
    saving.value = false;
  }
};
</script>
