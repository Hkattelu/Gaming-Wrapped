import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function saveWrapped(wrapped: Record<string, unknown>) {
  const id = uuidv4();
  const docRef = doc(db, 'wrapped', id);
  await setDoc(docRef, wrapped);
  return id;
}

export async function getWrapped(id: string) {
  const docRef = doc(db, 'wrapped', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
}
