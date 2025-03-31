<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '@/services/authServices';

const router = useRouter();
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');

const isPasswordMatch = computed(() => {
  return password.value && confirmPassword.value && password.value === confirmPassword.value;
});

const handleSignup = async () => {
  if (!isPasswordMatch.value) {
    errorMessage.value = 'Adgangskoderne er ikke ens';
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    await registerUser(email.value, password.value, username.value);
    router.push('/');
  } catch (error) {
    errorMessage.value = error.message || 'Kunne ikke oprettet en bruger. Prøv igen senere.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
    <div class="signup-container">
      <h1>Opret en bruger</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="username">Brugernavn</label>
          <input 
            id="username"
            v-model="username"
            type="text"
            required
            placeholder="Brugernavn"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Skriv din email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Adgangskode</label>
          <input 
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Opret adgangskode"
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Bekræft adgangskode</label>
          <input 
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Gentag adgangskode"
          />
        </div>
        
        <button type="submit" :disabled="loading || !isPasswordMatch">
          {{ loading ? 'Opretter bruger...' : 'Opret bruger' }}
        </button>
      </form>
      
      <div class="login-link">
        <p>Har du allerede en bruger? <router-link to="/login">Log ind</router-link></p>
      </div>
    </div>
  </template>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
}

.signup-form {
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

.login-link {
  margin-top: 16px;
  text-align: center;
}

.login-link a {
  color: #4285f4;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>