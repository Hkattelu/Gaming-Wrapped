import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import 'dotenv/config';

const app = initializeApp();
export const db = getFirestore(app);
