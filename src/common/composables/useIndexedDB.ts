export function useIndexedDB() {
  const dbName = 'local-files-db';
  const storeName = 'files';

  function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'name' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveFile(name: string, blob: Blob) {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put({ name, content: blob });
    return tx.commit();
  }

  async function saveStringValue(name: string, value: string) {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put({ name, content: value, type: 'string' });
    return tx.commit();
  }

  async function loadFile(name: string): Promise<Blob | null> {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(name);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result?.content || null);
      };
      request.onerror = () => {
        resolve(null);
      };
    });
  }

  async function loadStringValue(name: string): Promise<string | null> {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(name);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const { result } = request;
        if (result?.type === 'string') {
          resolve(result.content);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  return {
    saveFile,
    loadFile,
    saveStringValue,
    loadStringValue,
  };
}
