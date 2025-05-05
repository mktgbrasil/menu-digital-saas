// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // Descomente se for usar Analytics

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuJhBGzSga0d-Nv2bM2WbnzquUQ7qClnQ",
  authDomain: "brasilmenurestaurantes.firebaseapp.com",
  projectId: "brasilmenurestaurantes",
  storageBucket: "brasilmenurestaurantes.firebasestorage.app",
  messagingSenderId: "166753661588",
  appId: "1:166753661588:web:973fef44309240cff97a81",
  measurementId: "G-WQGG3M0TGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// const analytics = getAnalytics(app); // Descomente se for usar Analytics

// Export Firebase services
export { app, auth, db, storage };
// export { app, auth, db, storage, analytics }; // Use esta linha se descomentar Analytics
