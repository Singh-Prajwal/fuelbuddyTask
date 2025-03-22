import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWu0lfiKRkDz-jqYaz7Shaev_XHPmzohE",
  authDomain: "fuelbuddytask.firebaseapp.com",
  projectId: "fuelbuddytask",
  storageBucket: "fuelbuddytask.firebasestorage.app",
  messagingSenderId: "628115594674",
  appId: "1:628115594674:web:31eaadf0ebdc2f1c9d58ab",
  measurementId: "G-K1XWWVVRDQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function setUserData(user: User | null) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

function setUserTokenData(token: string | null) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

function getAccessToken(): string | null {
  return localStorage.getItem("token");
}

function getUserData(): User | null {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function loadState() {
  const accessToken = getAccessToken();
  return {
    isAuthenticated: !!accessToken,
    accessToken,
    user: getUserData(),
  };
}

async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    setUserData(user);

    const token = await user.getIdToken();
    setUserTokenData(token);

    return { user, token };
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
}

async function logout() {
  try {
    await signOut(auth);
    setUserData(null);
    setUserTokenData(null);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    setUserData(user);
    const token = await user.getIdToken();
    setUserTokenData(token);
  } else {
    setUserData(null);
    setUserTokenData(null);
  }
});

loadState();

export { auth, provider, loginWithGoogle, logout, getAccessToken, getUserData };
