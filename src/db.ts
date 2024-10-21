import { openDB, DBSchema } from 'idb';

interface PowPegDB extends DBSchema {
  transactions: {
    key: string;
    value: {
      txId: string;
      status: string;
      lastUpdated: number;
    };
    indexes: { 'by-last-updated': number };
  };
}

const DB_NAME = 'powpeg';
const DB_VERSION = 1;
const DB_STORE_NAME = 'transactions';

const dbPromise = openDB<PowPegDB>(DB_NAME, DB_VERSION, {
  upgrade(upgradedDB) {
    const store = upgradedDB.createObjectStore(DB_STORE_NAME, { keyPath: 'txId' });
    store.createIndex('by-last-updated', 'lastUpdated');
  },
});

export async function get(key: string) {
  return (await dbPromise).get(DB_STORE_NAME, key);
}

export async function getMany(count = 10) {
  const db = await dbPromise;
  const indexed = await db.getAllFromIndex(DB_STORE_NAME, 'by-last-updated');
  const byDescOrder = indexed.splice(-count).reverse();
  return byDescOrder;
}

export async function set(val: { txId: string; status: string; }) {
  return (await dbPromise).put(
    DB_STORE_NAME,
    {
      txId: val.txId,
      status: val.status,
      lastUpdated: Date.now(),
    },
  );
}

export async function del(key: string) {
  return (await dbPromise).delete(DB_STORE_NAME, key);
}
