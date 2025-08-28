# API Documentation

This document outlines all the API endpoints used in the School Management System and specifies which user roles have access to each endpoint.

## 🔐 Authentication Endpoints

### All Users (Public)
- `POST /api/login` - User authentication
- `POST /api/register` - User registration

## 👤 Profile Management

### All Authenticated Users
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## 📊 Dashboard Endpoints

### Admin Only
- `GET /api/dashboard/stats` - Admin dashboard statistics
  - Returns: Total teachers, classrooms, students count
  - Access: Admin only

### Teacher Only
- `GET /api/dashboard/teacher-stats` - Teacher dashboard statistics
  - Returns: Teacher's classroom and student statistics
  - Access: Teacher only

### Student Only
- `GET /api/profile` - Student dashboard information (same as profile)
  - Returns: Student profile with classroom information
  - Access: Student only

## 🏫 Classroom Management

### Admin Only
- `GET /api/classrooms` - Get all classrooms list
  - Returns: Paginated list of all classrooms
  - Access: Admin only

- `GET /api/classrooms/{id}` - Get specific classroom details
  - Returns: Classroom information with teacher and students
  - Access: Admin only

- `POST /api/classrooms` - Create new classroom
  - Body: `{ name, description, teacher_id }`
  - Access: Admin only

- `PUT /api/classrooms/{id}` - Update classroom
  - Body: `{ name, description, teacher_id }`
  - Access: Admin only

- `DELETE /api/classrooms/{id}` - Delete classroom
  - Access: Admin only

### Teacher Only
- `GET /api/classrooms` - Get assigned classrooms
  - Returns: Only classrooms assigned to the teacher
  - Access: Teacher only

- `GET /api/classrooms/{id}` - Get assigned classroom details
  - Returns: Classroom information (only if teacher is assigned)
  - Access: Teacher only (for assigned classrooms)

### Admin & Teacher
- `GET /api/classrooms/{id}/students` - Get students in classroom
  - Returns: List of students in the specific classroom
  - Access: Admin, Teacher (for assigned classrooms)

## 👥 Student Management

### Admin Only
- `GET /api/students` - Get all students list
  - Returns: Paginated list of all students
  - Access: Admin only

- `PUT /api/students/{id}` - Update student information
  - Body: `{ name, email, date_of_birth, grade }`
  - Access: Admin only

- `DELETE /api/students/{id}` - Delete student
  - Access: Admin only

### Teacher Only
- `GET /api/students` - Search students (for adding to classroom)
  - Query: `search`, `not_in_classroom`, `page`, `per_page`
  - Returns: Students not in specific classroom
  - Access: Teacher only

- `PUT /api/students/{id}` - Update student grade only
  - Body: `{ grade }`
  - Access: Teacher only (for students in assigned classrooms)

### Admin & Teacher
- `PUT /api/students/{id}` - Assign/remove student from classroom
  - Body: `{ assigned_class_id }` (null to remove)
  - Access: Admin (all students), Teacher (students in assigned classrooms)

## 📝 Grade Management

### Teacher Only
- `POST /api/grades` - Create new grade
  - Body: `{ student_id, classroom_id, grade }`
  - Access: Teacher only (for students in assigned classrooms)

- `PUT /api/grades/{id}` - Update grade
  - Body: `{ grade }`
  - Access: Teacher only (for grades in assigned classrooms)

### Student Only
- Grades are included in profile/dashboard response
- No direct grade API access

## 🔍 Search & Filter Endpoints

### Admin Only
- `GET /api/students?search={term}` - Search all students
- `GET /api/classrooms?search={term}` - Search all classrooms

### Teacher Only
- `GET /api/students?search={term}&not_in_classroom={id}` - Search students for classroom assignment

## 📋 API Response Formats

### Authentication Response
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin|teacher|student"
  }
}
```

### Profile Response
```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "role": "student",
  "date_of_birth": "2000-01-01",
  "student": {
    "user_id": 1,
    "assigned_class_id": 1,
    "grade": "85.5",
    "classroom": {
      "id": 1,
      "name": "Mathematics 101",
      "teacher": {
        "id": 2,
        "name": "Teacher Name"
      }
    }
  }
}
```

### Classroom Response
```json
{
  "id": 1,
  "name": "Mathematics 101",
  "description": "Advanced mathematics course",
  "teacher_id": 2,
  "students_count": 25,
  "teacher": {
    "id": 2,
    "name": "Teacher Name",
    "email": "teacher@example.com"
  },
  "students": [
    {
      "user_id": 1,
      "name": "Student Name",
      "email": "student@example.com",
      "grade": "85.5"
    }
  ]
}
```

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 422 Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "grade": ["The grade must be between 0 and 100."]
  }
}
```

## 🔒 Role-Based Access Summary

### Admin Permissions
- ✅ **Full System Access**
- ✅ **Create/Edit/Delete Classrooms**
- ✅ **Manage All Students**
- ✅ **Assign Teachers to Classrooms**
- ✅ **View All Statistics**
- ✅ **Access All API Endpoints**

### Teacher Permissions
- ✅ **View Assigned Classrooms**
- ✅ **Manage Student Grades from Assigned Classrooms**
- ✅ **Add/Remove Students from Assigned Classrooms**
- ✅ **View Student Information from Assigned Classrooms**
- ❌ **Cannot Create/Delete Classrooms**
- ❌ **Cannot Access Admin-Only Endpoints**

### Student Permissions
- ✅ **View Personal Profile**
- ✅ **Update Personal Information**
- ✅ **View Grades and Classroom Information**
- ❌ **Cannot Access Teacher/Admin Endpoints**
- ❌ **Cannot Manage Other Users**

## 📱 API Usage Examples

### Admin - Create Classroom
```javascript
// Admin only
const response = await api.post('/classrooms', {
  name: 'Advanced Mathematics',
  description: 'Advanced level mathematics course',
  teacher_id: 2
});
```

### Teacher - Assign Grade
```javascript
// Teacher only (for assigned classrooms)
const response = await api.post('/grades', {
  student_id: 1,
  classroom_id: 1,
  grade: 85.5
});
```

### Student - Update Profile
```javascript
// Student only
const response = await api.put('/profile', {
  name: 'Updated Name',
  date_of_birth: '2000-01-01'
});
```

## 🔧 Development Notes

### Authentication Headers
All authenticated requests must include:
```
Authorization: Bearer {jwt_token}
```

### Pagination
List endpoints support pagination:
```
GET /api/students?page=1&per_page=10
```

### Search Parameters
Search endpoints support:
```
GET /api/students?search=john&classroom_id=1
```

### Error Handling
The frontend automatically handles:
- 401 responses (redirect to login)
- 403 responses (show access denied)
- 422 responses (show validation errors)
- Network errors (show connection issues)
