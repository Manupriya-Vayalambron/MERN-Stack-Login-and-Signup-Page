// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration (using environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if all required environment variables are loaded
const requiredEnvVars = {
  'VITE_FIREBASE_API_KEY': firebaseConfig.apiKey,
  'VITE_FIREBASE_AUTH_DOMAIN': firebaseConfig.authDomain,
  'VITE_FIREBASE_PROJECT_ID': firebaseConfig.projectId,
  'VITE_FIREBASE_APP_ID': firebaseConfig.appId
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars);
} else {
  console.log('Firebase configuration loaded successfully');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure auth for better phone authentication
auth.languageCode = 'en'; // Set language for SMS

// Important: For development, you might need to add localhost to your Firebase project's authorized domains:
// Go to Firebase Console > Authentication > Settings > Authorized domains
// Add: localhost

console.log('Firebase Auth initialized:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

export { auth };
export default app;