import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDDPGR2sp9iThMLH-ziE-02OFh0mEjL7Z8",
    authDomain: "oregonchem-pe.firebaseapp.com",
    projectId: "oregonchem-pe",
    storageBucket: "oregonchem-pe.appspot.com",
    messagingSenderId: "155514741393",
    appId: "1:155514741393:web:8b5b5df892bbab8e9f1530"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
