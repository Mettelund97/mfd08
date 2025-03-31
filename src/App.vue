<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { onAuthChange, logoutUser } from '@/services/authServices';

const router = useRouter();
const user = ref(null);
const currentYear = computed(() => new Date().getFullYear());

// Handle user auth state changes
onMounted(() => {
  const unsubscribe = onAuthChange((currentUser) => {
    user.value = currentUser;
  });
  
  // Clean up subscription on component unmount
  return () => unsubscribe();
});

// Logout function
const logout = async () => {
  try {
    await logoutUser();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<template>
  <div class="app">
    <header>
      <nav class="navbar">
        <router-link to="/" class="logo">DagensInput</router-link>
        
        <div class="nav-links">
          <template v-if="user">
            <router-link to="/" class="nav-link">DagensInput</router-link>
            <router-link to="/new" class="nav-link">Opret nyt input</router-link>
            <button @click="logout" class="nav-link logout-btn">Log ud</button>
            <span class="user-info">{{ user.displayName || user.email }}</span>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link">Log ind</router-link>
            <router-link to="/signup" class="nav-link">Opret Bruger</router-link>
          </template>
        </div>
      </nav>
    </header>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #4285f4;
  color: white;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-family: inherit;
}

.user-info {
  margin-left: 0.5rem;
  padding: 0.8rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.main-content {
  flex: 1;
  padding: 2rem 1rem;
}
</style>