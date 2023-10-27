import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "revolving-images.firebaseapp.com",
  projectId: "revolving-images",
  storageBucket: "revolving-images.appspot.com",
  messagingSenderId: "263164900504",
  appId: "1:263164900504:web:b733293b0a988ca0888ced",
  measurementId: "G-X6GQYEY4JK"
};

export const app = initializeApp(firebaseConfig);
export const imageStorage = getStorage();
