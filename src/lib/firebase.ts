import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    (process.env.NODE_ENV === 'development' ? 'game-rewind-fpatu' : undefined);

if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID');
}

const firebaseConfig = { projectId };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
