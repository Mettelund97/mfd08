<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '@/services/authServices';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    await loginUser(email.value, password.value);
    router.push('/');
  } catch (error) {
    errorMessage.value = error.message || 'Failed to login. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
    <div class="login-container">
      <h1>DagensInput</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Din Email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Adgangskode</label>
          <input 
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Din adgangskode"
          />
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logger ind...' : 'Log ind' }}
        </button>
      </form>
      
      <div class="signup-link">
        <p>Har du ikke en bruger? <router-link to="/signup">Opret bruger</router-link></p>
      </div>
    </div>
  </template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 500;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  padding: 12px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #3367d6;
}

button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.signup-link {
  margin-top: 16px;
  text-align: center;
}

.signup-link a {
  color: #4285f4;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>