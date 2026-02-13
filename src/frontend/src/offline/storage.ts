const DB_NAME = 'pos-offline-db';
const DB_VERSION = 1;

interface StorageData {
  [key: string]: any;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('masterData')) {
        db.createObjectStore('masterData');
      }
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function saveMasterData(key: string, data: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['masterData'], 'readwrite');
    const store = transaction.objectStore('masterData');
    const request = store.put(data, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getMasterData(key: string): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['masterData'], 'readonly');
    const store = transaction.objectStore('masterData');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function createTransaction(data: {
  items: any[];
  payments: any[];
  total: number;
}): Promise<number> {
  const db = await openDB();
  const transaction: any = {
    items: data.items,
    payments: data.payments,
    total: data.total,
    subtotal: data.total,
    discount: 0,
    tax: 0,
    timestamp: Date.now(),
    status: 'completed',
  };

  return new Promise((resolve, reject) => {
    const txn = db.transaction(['transactions'], 'readwrite');
    const store = txn.objectStore('transactions');
    const request = store.add(transaction);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      queueForSync('transaction', 'create', { ...transaction, id: request.result });
      resolve(request.result as number);
    };
  });
}

export async function getTransaction(id: number): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['transactions'], 'readonly');
    const store = transaction.objectStore('transactions');
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getAllTransactions(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['transactions'], 'readonly');
    const store = transaction.objectStore('transactions');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function queueForSync(
  type: string,
  operation: string,
  data: any
): Promise<void> {
  const db = await openDB();
  const item = {
    type,
    operation,
    data,
    status: 'pending',
    attempts: 0,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.add(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
