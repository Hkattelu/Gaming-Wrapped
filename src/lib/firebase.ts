import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

function getProjectId(): string | undefined {
  // 1. Explicit environment variable
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  }

  // 2. Parse FIREBASE_CONFIG
  if (process.env.FIREBASE_CONFIG) {
    try {
      const config = JSON.parse(process.env.FIREBASE_CONFIG);
      if (config.projectId) {
        return config.projectId;
      }
    } catch (e) {
      console.warn('Failed to parse FIREBASE_CONFIG:', e);
    }
  }

  // 3. Parse FIREBASE_WEBAPP_CONFIG
  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
      const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      if (config.projectId) {
        return config.projectId;
      }
    } catch (e) {
      console.warn('Failed to parse FIREBASE_WEBAPP_CONFIG:', e);
    }
  }

  // 4. Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'game-rewind-fpatu';
  }

  return undefined;
}

const projectId = getProjectId();

if (!projectId) {
  throw new Error(
    'Firebase configuration error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is required when NODE_ENV is not development.'
  );
}

const firebaseConfig = { projectId };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
