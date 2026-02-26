import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCo3Y33Qml1T39022mnn2GxFqzB2ed3VSc",
  authDomain: "fitpro-platform.firebaseapp.com",
  projectId: "fitpro-platform",
  storageBucket: "fitpro-platform.firebasestorage.app",
  messagingSenderId: "118537430452",
  appId: "1:118537430452:web:04a6883ce2ec846ab83ee1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

export { auth, googleProvider };
