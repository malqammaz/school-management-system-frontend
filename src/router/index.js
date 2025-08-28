import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import Classrooms from "../views/Classrooms.vue";
import ClassroomDetail from "../views/ClassroomDetail.vue";
import Students from "../views/Students.vue";
import Profile from "../views/Profile.vue";
import { isTokenValid } from "../utils/helpers.js";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { 
    path: "/dashboard", 
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: "/classrooms", 
    component: Classrooms,
    meta: { requiresAuth: true, roles: ['admin', 'teacher'] }
  },
  { 
    path: "/classrooms/:id", 
    component: ClassroomDetail,
    meta: { requiresAuth: true, roles: ['admin', 'teacher'] }
  },
  { 
    path: "/students", 
    component: Students,
    meta: { requiresAuth: true, roles: ['admin', 'teacher'] }
  },
  { 
    path: "/profile", 
    component: Profile,
    meta: { requiresAuth: true, roles: ['student'] }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Check if token exists and is valid
    if (!token || !isTokenValid(token)) {
      // Clear any invalid auth data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      
      // Redirect to login with a message
      next({ 
        path: "/login", 
        query: { 
          redirect: to.fullPath,
          message: "Your session has expired. Please login again."
        }
      });
      return;
    }
  }
  
  // Check if user is already logged in and trying to access login/register page
  if ((to.path === "/login" || to.path === "/register") && token && isTokenValid(token)) {
    next("/dashboard");
    return;
  }
  
  // Check role-based access with better validation
  if (to.meta.roles && role && !to.meta.roles.includes(role)) {
    // User doesn't have required role, redirect to dashboard
    next("/dashboard");
    return;
  }
  
  // If role is required but user has no role, redirect to login
  if (to.meta.roles && !role) {
    next("/login");
    return;
  }
  
  next();
});

export default router;