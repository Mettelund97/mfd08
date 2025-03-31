import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Views
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import NewJournalView from '../views/NewJournalView.vue'
import JournalEntryView from '../views/JournalEntryView.vue'

// Get Firebase auth instance
const auth = getAuth();

// Create a promise-based getCurrentUser function
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, 
      user => {
        unsubscribe();
        resolve(user);
      }, 
      error => {
        reject(error);
      }
    );
  });
};

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignUpView.vue')
  },
  {
    path: '/entry/:id',
    name: 'entry',
    component: () => import('@/views/JournalEntryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/new',
    name: 'new',
    component: () => import('@/views/NewJournalView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;