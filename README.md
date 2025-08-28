# School Management System

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- Backend API running on `http://localhost:8000`

### Installation
```bash
# Clone and install
git clone <repository-url>
cd school-management-system
npm install

# Setup environment
cp env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 User Roles

### Admin
- Full system access
- Manage classrooms, students, and teachers
- View all statistics

### Teacher
- View assigned classrooms
- Manage student grades
- Add/remove students from classrooms

### Student
- View personal profile and grades
- Update personal information
- View classroom details

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3 (Composition API)
- **Router**: Vue Router 4
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Build Tool**: Vite


## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
```

## 📋 Key Features

- **Authentication**: JWT-based login system
- **Role-based Access**: Different permissions per user role
- **Grade Management**: Numeric grades (0-100) with letter equivalents
- **Responsive Design**: Mobile-friendly interface
- **Real-time Search**: Search across students and classrooms
- **Error Handling**: Comprehensive error management