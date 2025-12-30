import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    (process.env.NODE_ENV === 'development' ? 'game-rewind-fpatu' : undefined);

if (!projectId) {
    throw new Error(
        'Firebase configuration error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is required when NODE_ENV is not development.'
    );
}

const firebaseConfig = { projectId };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
