import api from '../api/axios';

export const gradeService = {
  // Get all grades
  async getGrades(params = {}) {
    const response = await api.get('/grades', { params });
    return response.data;
  },

  // Get single grade
  async getGrade(id) {
    const response = await api.get(`/grades/${id}`);
    return response.data;
  },

  // Create grade
  async createGrade(data) {
    const response = await api.put(`/students/${data.student_id}/grades`, {
      classroom_id: data.classroom_id,
      grade: data.grade
    });
    return response.data;
  },

  // Update grade
  async updateGrade(id, data) {
    const response = await api.put(`/students/${data.student_id}/grades`, {
      classroom_id: data.classroom_id,
      grade: data.grade
    });
    return response.data;
  },

  // Delete grade
  async deleteGrade(id) {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },

  // Get grades by classroom
  async getGradesByClassroom(classroomId) {
    const response = await api.get(`/grades/classroom/${classroomId}`);
    return response.data;
  },

  // Get grades by student
  async getGradesByStudent(studentId) {
    const response = await api.get(`/grades/student/${studentId}`);
    return response.data;
  }
};
