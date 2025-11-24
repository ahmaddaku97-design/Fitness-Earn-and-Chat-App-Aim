import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAb_vsgv29WadnNfZqTtRkLt-Bw3JgpFN0",
  authDomain: "aimmworkoutandearn.firebaseapp.com",
  projectId: "aimmworkoutandearn",
  storageBucket: "aimmworkoutandearn.firebasestorage.app",
  messagingSenderId: "615507248848",
  appId: "1:615507248848:web:cbc4ce19b9168e8a0980d5",
  measurementId: "G-C8PYN2JWN6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
