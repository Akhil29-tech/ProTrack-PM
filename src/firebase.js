import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrGtVB4UjoElPBEuo05KKk1mWiBmXl79U",
  authDomain: "protrack-pm.firebaseapp.com",
  projectId: "protrack-pm",
  storageBucket: "protrack-pm.firebasestorage.app",
  messagingSenderId: "967280470017",
  appId: "1:967280470017:web:159b161fb57c5646a1b800"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
