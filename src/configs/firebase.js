// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDg1Tae1QjduPSDjByKf0t4mRRbVJsH-n8",
    authDomain: "vaultexercise.firebaseapp.com",
    projectId: "vaultexercise",
    storageBucket: "vaultexercise.firebasestorage.app",
    messagingSenderId: "673775930590",
    appId: "1:673775930590:web:9a75697944332353c9c64f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }