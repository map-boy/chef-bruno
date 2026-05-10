import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAiaxrp5nhi9FuCF_6c2mO8hDfSwTYfINY",
  authDomain: "chef-bruno-a51bb.firebaseapp.com",
  projectId: "chef-bruno-a51bb",
  storageBucket: "chef-bruno-a51bb.firebasestorage.app",
  messagingSenderId: "64152890922",
  appId: "1:64152890922:web:55e915b52ef72a86f95d53",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAILS = [
  'shimirwabruno1@gmail.com',
  'umwemubi@gmail.com',
];

export default app;
