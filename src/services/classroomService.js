import api from '../api/axios';

export const classroomService = {
  // Get all classrooms
  async getClassrooms(params = {}) {
    const response = await api.get('/classrooms', { params });
    return response.data;
  },

  // Get single classroom
  async getClassroom(id) {
    const response = await api.get(`/classrooms/${id}`);
    return response.data;
  },

  // Create classroom
  async createClassroom(data) {
    const response = await api.post('/classrooms', data);
    return response.data;
  },

  // Update classroom
  async updateClassroom(id, data) {
    const response = await api.put(`/classrooms/${id}`, data);
    return response.data;
  },

  // Delete classroom
  async deleteClassroom(id) {
    const response = await api.delete(`/classrooms/${id}`);
    return response.data;
  },

  // Get teachers for assignment
  async getTeachers() {
    const response = await api.get('/teachers');
    return response.data;
  },

  // Get classrooms for student assignment
  async getClassroomsForAssignment() {
    const response = await api.get('/classrooms-for-assignment');
    return response.data;
  }
};
