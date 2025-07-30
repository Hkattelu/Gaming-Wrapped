import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import 'dotenv/config';

const firebaseConfig = process.env.FIREBASE_WEBAPP_CONFIG;
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
