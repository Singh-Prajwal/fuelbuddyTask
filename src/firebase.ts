import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBWu0lfiKRkDz-jqYaz7Shaev_XHPmzohE",
  authDomain: "fuelbuddytask.firebaseapp.com",
  projectId: "fuelbuddytask",
  storageBucket: "fuelbuddytask.firebasestorage.app",
  messagingSenderId: "628115594674",
  appId: "1:628115594674:web:31eaadf0ebdc2f1c9d58ab",
  measurementId: "G-K1XWWVVRDQ",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
