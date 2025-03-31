<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createJournalEntry } from '@/services/journalServices';

const router = useRouter();
const entry = ref({
  title: '',
  content: ''
});
const saving = ref(false);
const error = ref(null);

const createEntry = async () => {
  saving.value = true;
  error.value = null;
  
  try {
    const entryId = await createJournalEntry({
      title: entry.value.title,
      content: entry.value.content
    });
    
    // Redirect to the newly created entry
    router.push(`/entry/${entryId}`);
  } catch (err) {
    console.error('Error creating entry:', err);
    error.value = 'Kunne ikke oprettet dit input. Prøv igen senere.';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
    <div class="new-entry-container">
      <h1>Opret nyt input</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="createEntry" class="entry-form">
        <div class="form-group">
          <label for="title">Titel</label>
          <input 
            id="title"
            v-model="entry.title"
            type="text"
            required
            placeholder="Skriv en titel til dit input her"
          />
        </div>
        
        <div class="form-group">
          <label for="content">Dagens input</label>
          <textarea 
            id="content"
            v-model="entry.content"
            required
            placeholder="Skriv dit input her"
            rows="12"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="action-btn save-btn" :disabled="saving">
            {{ saving ? 'Opretter...' : 'Opret input' }}
          </button>
          <router-link to="/" class="action-btn cancel-btn">Afbryd</router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
.new-entry-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 24px;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 500;
}

input, textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

textarea {
  resize: vertical;
  min-height: 200px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.save-btn {
  background-color: #34a853;
  color: white;
  border: none;
}

.save-btn:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f1f3f4;
  color: #333;
  border: none;
}
</style>