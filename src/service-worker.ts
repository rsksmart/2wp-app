import { precacheAndRoute } from 'workbox-precaching';
import { getMany, set } from './db';

// workaround to access service worker global scope via self
declare const self: ServiceWorkerGlobalScope;

// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST);

async function updateView() {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage('update-view');
    });
  });
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

  if (updatedTxsToStore.length > 0) {
    await updateView();
  }
}

self.addEventListener('periodicsync', (event) => {
  // @ts-expect-error not periodicsync ts support
  if (event.tag === 'update-txs') {
    // @ts-expect-error not periodicsync ts support
    event.waitUntil(getUpdatedStatuses());
  }
});
