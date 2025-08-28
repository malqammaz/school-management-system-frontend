<template>
  <div class="flex items-center space-x-2">
    <!-- Numeric Grade -->
    <span class="font-medium" :class="gradeColorClass">
      {{ formatNumericGrade(grade) }}
    </span>
    
    <!-- Letter Grade (if showLetter is true) -->
    <span v-if="showLetter" class="text-sm text-gray-600">
      ({{ getLetterGrade(grade) }})
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  grade: {
    type: [Number, String],
    required: true
  },
  showLetter: {
    type: Boolean,
    default: true
  }
});

// Convert grade to numeric value for calculations
const numericGrade = computed(() => {
  const grade = parseFloat(props.grade);
  return isNaN(grade) ? 0 : grade;
});

// Get color class based on grade
const gradeColorClass = computed(() => {
  const grade = numericGrade.value;
  if (grade >= 90) return 'text-green-600';
  if (grade >= 80) return 'text-blue-600';
  if (grade >= 70) return 'text-yellow-600';
  if (grade >= 60) return 'text-orange-600';
  return 'text-red-600';
});

// Format numeric grade (handle decimals)
const formatNumericGrade = (grade) => {
  const num = parseFloat(grade);
  if (isNaN(num)) return 'N/A';
  
  // If it's a whole number, show without decimal
  if (Number.isInteger(num)) {
    return num.toString();
  }
  
  // Show with one decimal place
  return num.toFixed(1);
};

// Get letter grade equivalent
const getLetterGrade = (grade) => {
  const num = parseFloat(grade);
  if (isNaN(num)) return 'N/A';
  
  if (num >= 97) return 'A+';
  if (num >= 93) return 'A';
  if (num >= 90) return 'A-';
  if (num >= 87) return 'B+';
  if (num >= 83) return 'B';
  if (num >= 80) return 'B-';
  if (num >= 77) return 'C+';
  if (num >= 73) return 'C';
  if (num >= 70) return 'C-';
  if (num >= 67) return 'D+';
  if (num >= 63) return 'D';
  if (num >= 60) return 'D-';
  return 'F';
};
</script>
