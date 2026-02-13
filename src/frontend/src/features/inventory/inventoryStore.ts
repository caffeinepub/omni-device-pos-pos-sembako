import { create } from 'zustand';

interface InventoryStore {
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  lowStockThreshold: 10,
  setLowStockThreshold: (threshold) => set({ lowStockThreshold: threshold }),
}));
