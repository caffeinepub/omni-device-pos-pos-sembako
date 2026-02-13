import { id } from './strings.id';

// Simple translation helper
export function t(key: string): string {
  const keys = key.split('.');
  let value: any = id;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Helper for array access
export function tArray(key: string): string[] {
  const keys = key.split('.');
  let value: any = id;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return [];
    }
  }
  
  return Array.isArray(value) ? value : [];
}
