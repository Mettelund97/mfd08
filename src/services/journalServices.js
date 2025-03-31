// src/services/journalServices.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '@/configs/firebase'; // Adjust this path if needed

const COLLECTION_NAME = 'journal_entries';

/**
 * Get all journal entries
 * @returns {Promise<Array>} Array of all journal entries
 */
export const getJournalEntries = async () => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to fetch entries');
  }

  try {
    // Query to get all entries ordered by creation date
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      // Add a flag to indicate if the current user owns this entry
      isOwner: doc.data().userId === auth.currentUser.uid
    }));
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

/**
 * Get a specific journal entry by ID
 * @param {string} id - The entry ID
 * @returns {Promise<Object|null>} The journal entry or null if not found
 */
export const getJournalEntry = async (id) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to fetch entry');
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        isOwner: data.userId === auth.currentUser.uid
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    throw error;
  }
};

/**
 * Create a new journal entry
 * @param {Object} entryData - The entry data
 * @returns {Promise<string>} The ID of the created entry
 */
export const createJournalEntry = async (entryData) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to create entry');
  }

  // Get the current user
  const user = auth.currentUser;
  
  // Get the display name or email
  let userName = user.displayName;
  if (!userName || userName.trim() === '') {
    userName = user.email || 'Unknown User';
  }

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...entryData,
      userId: user.uid,
      userName: userName, // Set the user's name or email
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

/**
 * Update an existing journal entry
 * @param {string} id - The entry ID
 * @param {Object} entryData - The updated entry data
 * @returns {Promise<void>}
 */
export const updateJournalEntry = async (id, entryData) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to update entry');
  }

  try {
    // First verify that the entry belongs to the current user
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Entry not found');
    }
    
    const data = docSnap.data();
    if (data.userId !== auth.currentUser.uid) {
      throw new Error('You do not have permission to update this entry');
    }
    
    // Update the entry
    await updateDoc(docRef, {
      ...entryData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

/**
 * Delete a journal entry
 * @param {string} id - The entry ID
 * @returns {Promise<void>}
 */
export const deleteJournalEntry = async (id) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to delete entry');
  }

  try {
    // First verify that the entry belongs to the current user
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Entry not found');
    }
    
    const data = docSnap.data();
    if (data.userId !== auth.currentUser.uid) {
      throw new Error('You do not have permission to delete this entry');
    }
    
    // Delete the entry
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};