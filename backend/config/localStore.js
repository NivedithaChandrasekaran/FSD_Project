import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data');
const dataFile = path.join(dataDirectory, 'careerforge.json');
const emptyDatabase = {
  users: [],
  careerprofiles: [],
  resumes: [],
  atsreports: [],
  coverletters: [],
  portfolios: [],
};

let database;
let writeQueue = Promise.resolve();

const clone = (value) => structuredClone(value);

const ensureDatabase = async () => {
  if (database) return;

  await mkdir(dataDirectory, { recursive: true });
  try {
    database = { ...emptyDatabase, ...JSON.parse(await readFile(dataFile, 'utf8')) };
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Unable to read local database at ${dataFile}: ${error.message}`);
    }
    database = clone(emptyDatabase);
    await persist();
  }
};

const persist = async () => {
  const temporaryFile = `${dataFile}.${process.pid}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(database, null, 2), 'utf8');
  await rename(temporaryFile, dataFile);
};

export const initializeLocalStore = async () => {
  await ensureDatabase();
  await writeQueue;
  console.log(`Local JSON database ready at ${dataFile}`);
};

export const readCollection = async (collection) => {
  await ensureDatabase();
  await writeQueue;
  return clone(database[collection] || []);
};

export const updateCollection = async (collection, update) => {
  await ensureDatabase();
  const operation = writeQueue.then(async () => {
    const records = database[collection] || [];
    const result = await update(records);
    database[collection] = records;
    await persist();
    return clone(result);
  });
  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
};

export const createId = () => randomBytes(12).toString('hex');
