import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import 'dotenv/config';

const app = process.env.NODE_ENV === 'development' ?
    initializeApp({projectId: 'game-rewind-fpatu'}) :
    initializeApp();
export const db = getFirestore(app);
