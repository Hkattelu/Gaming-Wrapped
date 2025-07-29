import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');

async function readDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export async function saveWrapped(wrapped: any) {
  const db = await readDb();
  const id = uuidv4();
  db[id] = wrapped;
  await writeDb(db);
  return id;
}

export async function getWrapped(id: string) {
  const db = await readDb();
  return db[id];
}
