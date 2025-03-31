<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/services/journalServices';
import { getRelativeTime } from '@/utils/dateUtils';

const route = useRoute();
const router = useRouter();
const entryId = route.params.id;

const entry = ref(null);
const loading = ref(true);
const error = ref(null);
const isEditing = ref(false);
const editedEntry = ref({ title: '', content: '' });
const saving = ref(false);
const showDeleteDialog = ref(false);

// Get content paragraphs for better display
const contentParagraphs = computed(() => {
  if (!entry.value || !entry.value.content) return [];
  return entry.value.content.split('\n').filter(p => p.trim() !== '');
});

// Format date for display
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fetch the entry data
onMounted(async () => {
  try {
    const data = await getJournalEntry(entryId);
    if (data) {
      entry.value = data;
      
      // Check if edit mode is requested from URL
      if (route.query.edit === 'true') {
        startEditing();
      }
    }
  } catch (err) {
    console.error('Error fetching entry:', err);
    error.value = 'Kunne ikke finde inputtet. Prøv igen senere.';
  } finally {
    loading.value = false;
  }
});

// Start editing mode
const startEditing = () => {
  editedEntry.value = { ...entry.value };
  isEditing.value = true;
};

// Cancel editing
const cancelEditing = () => {
  isEditing.value = false;
  editedEntry.value = { title: '', content: '' };
};

// Save edited entry
const saveEntry = async () => {
  saving.value = true;
  try {
    await updateJournalEntry(entryId, {
      title: editedEntry.value.title,
      content: editedEntry.value.content
    });
    
    // Update local entry data
    entry.value = {
      ...entry.value,
      title: editedEntry.value.title,
      content: editedEntry.value.content,
      updatedAt: new Date()
    };
    
    isEditing.value = false;
  } catch (err) {
    console.error('Error updating entry:', err);
    error.value = 'Kunne ikke opdatere inputtet. Prøv igen senere.';
  } finally {
    saving.value = false;
  }
};

// Delete confirmation
const confirmDelete = () => {
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  showDeleteDialog.value = false;
};

// Delete entry
const deleteEntry = async () => {
  try {
    await deleteJournalEntry(entryId);
    router.push('/');
  } catch (err) {
    console.error('Error deleting entry:', err);
    error.value = 'Failed to delete journal entry. Please try again.';
    showDeleteDialog.value = false;
  }
};
</script>

<template>
  <div class="entry-detail-container">
    <div v-if="loading" class="loading">
      Loader input...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else-if="!entry" class="not-found">
      <h2>Ingen input fundet</h2>
      <p>Det input du leder efter eksisterer ikke længere.</p>
      <router-link to="/" class="back-link">Go back to journal</router-link>
    </div>
    
    <div v-else>
      <!-- View Mode -->
      <div v-if="!isEditing" class="entry-view">
        <div class="entry-header">
          <h1 class="entry-title">{{ entry.title }}</h1>
          <div class="entry-time">{{ getRelativeTime(entry.createdAt) }}</div>
        </div>
        
        <div class="entry-content">
          <p v-for="(paragraph, index) in contentParagraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>
        
        <div class="entry-metadata">
          <div class="metadata-item">
            <span>Oprettet:</span> {{ formatDate(entry.createdAt) }}
          </div>
          <div class="metadata-item" v-if="entry.updatedAt && entry.updatedAt !== entry.createdAt">
            <span>Opdateret:</span> {{ formatDate(entry.updatedAt) }}
          </div>
        </div>
        
        <div class="entry-actions">
          <button @click="startEditing" class="action-btn edit-btn" v-if="entry.isOwner">Rediger</button>
          <button @click="confirmDelete" class="action-btn delete-btn" v-if="entry.isOwner">Slet</button>
          <router-link to="/" class="action-btn back-btn">Tilbage til DagensInput</router-link>
        </div>
      </div>
      
      <!-- Edit Mode -->
      <div v-else class="entry-edit-form">
        <h1>Nyt input</h1>
        
        <form @submit.prevent="saveEntry">
          <div class="form-group">
            <label for="title">Titel</label>
            <input 
              id="title"
              v-model="editedEntry.title"
              type="text"
              required
              placeholder="Skriv en titel til dit input her"
            />
          </div>
          
          <div class="form-group">
            <label for="content">Dagens input</label>
            <textarea 
              id="content"
              v-model="editedEntry.content"
              required
              placeholder="Skriv dagens input her"
              rows="12"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="action-btn save-btn" :disabled="saving">
              {{ saving ? 'Gemmer...' : 'Gem ændringer' }}
            </button>
            <button type="button" @click="cancelEditing" class="action-btn cancel-btn">
              Afbryd
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="delete-dialog">
      <div class="dialog-content">
        <h3>Slet input?</h3>
        <p>Er du sikker på at du vil slette denne input? Det kan ikke gendannes.</p>
        <div class="dialog-actions">
          <button @click="cancelDelete" class="cancel-btn">Afbryd</button>
          <button @click="deleteEntry" class="confirm-btn">Slet</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.entry-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.loading, .not-found {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 4px;
  margin: 20px 0;
}

.entry-header {
  position: relative;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.entry-title {
  font-size: 2rem;
  margin: 0 0 8px 0;
  padding-right: 150px; /* Make room for the timestamp */
  text-transform: capitalize;
}

.entry-time {
  position: absolute;
  top: 0;
  right: 0;
  color: #666;
  font-size: 0.9rem;
  background-color: #f5f5f5;
  padding: 4px 10px;
  border-radius: 4px;
}

.entry-content {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 24px;
  text-transform: capitalize;
}

.entry-content p {
  margin-bottom: 30px;
}

.entry-metadata {
  margin: 24px 0;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #666;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.metadata-item {
  margin-bottom: 6px;
}

.metadata-item span {
  font-weight: 500;
  margin-right: 8px;
}

.entry-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-btn {
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #4285f4;
  color: white;
  border: none;
}

.edit-btn:hover {
  background-color: #3367d6;
}

.delete-btn {
  background-color: #ea4335;
  color: white;
  border: none;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.back-btn {
  background-color: #f1f3f4;
  color: #333;
  border: none;
}

.back-btn:hover {
  background-color: #e4e6e8;
}
</style>