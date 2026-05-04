import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDNQzskLN3TvuBxUmU1B1lMh_rPN0yw0rA",
  authDomain: "galaxy-finance-6367e.firebaseapp.com",
  projectId: "galaxy-finance-6367e",
  storageBucket: "galaxy-finance-6367e.firebasestorage.app",
  messagingSenderId: "348666783029",
  appId: "1:348666783029:web:6321be099e97810985187c",
  measurementId: "G-Q4ZF0Q03JL"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;