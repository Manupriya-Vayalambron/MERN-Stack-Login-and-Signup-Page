// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeC9y68hRrLTL7T2H2g9DZIRj5-RGRr2s",
  authDomain: "yathrika-8b743.firebaseapp.com",
  projectId: "yathrika-8b743",
  storageBucket: "yathrika-8b743.firebasestorage.app",
  messagingSenderId: "845975972212",
  appId: "1:845975972212:web:89108989df572fb53ea421",
  measurementId: "G-ZRMJDM59F2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set auth language
auth.languageCode = 'en';

// Use device language (optional)
// auth.useDeviceLanguage();

export { auth };
export default app;