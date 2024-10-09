import { precacheAndRoute } from 'workbox-precaching';
import { openDB, DBSchema } from 'idb';

// workaround to access service worker global scope via self
declare const self: ServiceWorkerGlobalScope;

// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST);

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

async function getMany(count = 10) {
  const db = await dbPromise;
  const indexed = await db.getAllFromIndex(DB_STORE_NAME, 'by-last-updated');
  const byDescOrder = indexed.splice(-count).reverse();
  return byDescOrder;
}

async function set(val: { txId: string; status: string; }) {
  return (await dbPromise).put(
    DB_STORE_NAME,
    {
      txId: val.txId,
      status: val.status,
      lastUpdated: Date.now(),
    },
  );
}

async function getUpdatedStatuses() {
  // get txs from db
  const txs = await getMany();
  // fetch updated statuses
  const updatedTxs = await Promise.all(txs.map((tx) => fetch(`${process.env.VUE_APP_API_BASE_URL}/tx-status/${tx.txId}`)));
  // create updated txs to store in db
  const updatedTxsToStore = await Promise.all(updatedTxs.map(async (tx) => {
    const { type, txDetails } = await tx.json();
    if (type === 'PEGIN') {
      return {
        txId: txDetails.btc.txId,
        status: txDetails.status,
      };
    }
    if (type === 'PEGOUT') {
      return {
        txId: txDetails.originatingRskTxHash,
        status: txDetails.status,
      };
    }
    return {
      txId: '',
      status: '',
    };
  }));
  // store updated txs in db
  await Promise.all(updatedTxsToStore.map((tx) => set(tx)));
}

self.addEventListener('periodicsync', (event) => {
  // @ts-expect-error not periodicsync ts support
  if (event.tag === 'update-txs') {
    // @ts-expect-error not periodicsync ts support
    event.waitUntil(getUpdatedStatuses());
  }
});
