import api from '../api/axios';

export const studentService = {
  // Get all students
  async getStudents(params = {}) {
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Get single student
  async getStudent(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Create student
  async createStudent(data) {
    const response = await api.post('/students', data);
    return response.data;
  },

  // Update student
  async updateStudent(id, data) {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  // Delete student
  async deleteStudent(id) {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  // Get student profile
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  // Update student profile
  async updateProfile(data) {
    const response = await api.put('/profile', data);
    return response.data;
  }
};
