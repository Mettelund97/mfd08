// src/services/authServices.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
  } from 'firebase/auth';
  import { auth } from '@/configs/firebase';
  
  /**
   * Get the current logged-in user
   * @returns {Promise<Object|null>} The current user or null if not logged in
   */
  export const getCurrentUser = () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  };
  
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - User display name
   * @returns {Promise<Object>} Firebase user object
   */
  export const registerUser = async (email, password, username) => {
    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      if (username) {
        await updateProfile(userCredential.user, {
          displayName: username
        });
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };
  
  /**
   * Log in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Firebase user object
   */
  export const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };
  
  export const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };
  
  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Function to call when auth state changes
   * @returns {Function} Unsubscribe function
   */
  export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };