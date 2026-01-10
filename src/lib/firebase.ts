import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBAb1axGMRKyJUZKUsJZyjjczkcrlELZxw",
  authDomain: "ihunt-fate.firebaseapp.com",
  projectId: "ihunt-fate",
  storageBucket: "ihunt-fate.firebasestorage.app",
  messagingSenderId: "125946118774",
  appId: "1:125946118774:web:1c5f70668228fd0e305557",
  measurementId: "G-EVVEXN92LV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
