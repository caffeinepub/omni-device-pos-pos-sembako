const DB_NAME = 'pos-offline-db';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getSyncQueue(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function processSyncQueue(): Promise<void> {
  const queue = await getSyncQueue();
  const pending = queue.filter((item) => item.status === 'pending');

  for (const item of pending) {
    try {
      await syncItem(item);
      await updateSyncStatus(item.id, 'synced');
    } catch (error) {
      await updateSyncStatus(item.id, 'failed');
      await incrementAttempts(item.id);
    }
  }
}

async function syncItem(item: any): Promise<void> {
  // Placeholder for actual sync logic
  // In a real implementation, this would call the backend actor
  return new Promise((resolve) => setTimeout(resolve, 100));
}

async function updateSyncStatus(id: number, status: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.status = status;
        const putRequest = store.put(item);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

async function incrementAttempts(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.attempts = (item.attempts || 0) + 1;
        const putRequest = store.put(item);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}
