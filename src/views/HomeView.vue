<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getJournalEntries, deleteJournalEntry } from '@/services/journalServices';
import { getRelativeTime } from '@/utils/dateUtils';

const router = useRouter();
const entries = ref([]);
const loading = ref(true);
const error = ref(null);
const showDeleteDialog = ref(false);
const entryToDelete = ref(null);

const searchQuery = ref('');
const searchFilter = ref('all');

// Fetch entries when component is mounted
onMounted(async () => {
  try {
    const fetchedEntries = await getJournalEntries();
    entries.value = fetchedEntries;
  } catch (err) {
    console.error('Error fetching entries:', err);
    error.value = 'Failed to load journal entries. Please try again.';
  } finally {
    loading.value = false;
  }
});

const filteredEntries = computed(() => {
  if (!searchQuery.value) {
    return entries.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  
  return entries.value.filter(entry => {
    if (searchFilter.value === 'title' || searchFilter.value === 'all') {
      if (entry.title.toLowerCase().includes(query)) {
        return true;
      }
    }
    
    if (searchFilter.value === 'content' || searchFilter.value === 'all') {
      if (entry.content.toLowerCase().includes(query)) {
        return true;
      }
    }
    
    if (searchFilter.value === 'userName' || searchFilter.value === 'all') {
      const userName = entry.userName || '';
      if (userName.toLowerCase().includes(query)) {
        return true;
      }
    }
    
    return false;
  });
});

// Handle search input with debounce
let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // This will trigger the computed property to re-evaluate
  }, 300); // 300ms debounce
};

// Get a preview of the entry content
const getPreview = (content) => {
  if (!content) return '';
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
};

// Format date for display
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Add this to make it available in the template
const getRelativeTimeForEntry = (date) => {
  return getRelativeTime(date);
};


// Navigate to entry detail
const goToEntryDetail = (id) => {
  router.push(`/entry/${id}`);
};

// Navigate to edit entry
const editEntry = (id) => {
  router.push(`/entry/${id}?edit=true`);
};

// Show delete confirmation dialog
const confirmDelete = (id) => {
  entryToDelete.value = id;
  showDeleteDialog.value = true;
};

// Cancel delete
const cancelDelete = () => {
  showDeleteDialog.value = false;
  entryToDelete.value = null;
};

// Delete entry
const deleteEntry = async () => {
  if (entryToDelete.value) {
    try {
      await deleteJournalEntry(entryToDelete.value);
      // Remove entry from list
      entries.value = entries.value.filter(entry => entry.id !== entryToDelete.value);
      showDeleteDialog.value = false;
      entryToDelete.value = null;
    } catch (err) {
      console.error('Error deleting entry:', err);
      error.value = 'Failed to delete journal entry. Please try again.';
    }
  }
};
</script>

<template>
  <div class="home-container">
    <div class="header">
      <h1>DagensInput</h1>
      <router-link to="/new" class="new-entry-btn">
        <span>+</span> Nyt input
      </router-link>
    </div>

    <!-- Add search bar -->
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Søg efter inputs" 
        class="search-input"
        @input="handleSearch"
      />
      <select v-model="searchFilter" class="search-filter" @change="handleSearch">
        <option value="all">Alt</option>
        <option value="title">Titel</option>
        <option value="content">Input</option>
        <option value="userName">Bruger</option>
      </select>
    </div>
    
    <div v-if="loading" class="loading">
      Loader inputs...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else-if="filteredEntries.length === 0" class="empty-state">
      <p v-if="searchQuery">Ingen input matcher din søgning</p>
      <p v-else>Der er ikke oprettet nogle inputs endnu</p>
      <router-link to="/new" class="empty-state-btn">Opret dit første input</router-link>
    </div>
    
    <div v-else class="entries-list">
      <div 
        v-for="entry in filteredEntries" 
        :key="entry.id" 
        class="entry-card"
        @click="goToEntryDetail(entry.id)"
      >
        <div class="entry-content">
          <div class="entry-header">
            <h2 class="entry-title">{{ entry.title }}</h2>
            <span class="entry-time">{{ getRelativeTime(entry.createdAt) }}</span>
          </div>
          <p class="entry-preview">{{ getPreview(entry.content) }}</p>
        </div>
        
        <div class="entry-meta">
          <div class="entry-info">
            <div class="entry-date">{{ formatDate(entry.createdAt) }}</div>
            <div class="entry-author">Bruger: {{ entry.userName || 'Unknown User' }}</div>
          </div>
          <div class="entry-actions" v-if="entry.isOwner">
            <button @click.stop="editEntry(entry.id)" class="action-btn edit-btn">
              Rediger
            </button>
            <button @click.stop="confirmDelete(entry.id)" class="action-btn delete-btn">
              Slet input
            </button>
          </div>
        </div>
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
.home-container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.new-entry-btn {
  background-color: #4285f4;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.new-entry-btn span {
  font-size: 1.2rem;
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.empty-state p {
  margin-bottom: 1rem;
  color: #666;
}

.empty-state-btn {
  display: inline-block;
  background-color: #4285f4;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.entry-card {
  padding: 1rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.entry-card:hover {
  transform: translateY(-2px);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  width: 100%;
}

.entry-title {
  margin: 0;
  flex: 1;
  font-size: 1.5rem;
  text-transform: capitalize;
}

.entry-author {
  text-transform: capitalize;
}

.entry-time {
  color: #666;
  font-size: 0.85rem;
  margin-left: 15px;
  white-space: nowrap;
  align-self: flex-start;
}

.entry-preview {
  margin: 10px 0;
  text-transform: capitalize;
}

.entry-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
}

.entry-date {
  color: #888;
  font-size: 0.875rem;
}

.entry-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.edit-btn {
  color: #4285f4;
}

.edit-btn:hover {
  background-color: rgba(66, 133, 244, 0.1);
}

.delete-btn {
  color: #ea4335;
}

.delete-btn:hover {
  background-color: rgba(234, 67, 53, 0.1);
}

.delete-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
}

.dialog-content h3 {
  margin-top: 0;
  color: #ea4335;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background-color: #f1f3f4;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  padding: 0.5rem 1rem;
  background-color: #ea4335;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-filter {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 120px;
}

.search-input:focus, 
.search-filter:focus {
  outline: none;
  border-color: #4285f4;
}
</style>