import { saveMasterData, queueForSync } from '../offline/storage';

// CSV export/import utilities with semicolon delimiter for Indonesian standard
export function exportProductsCsv(products: any[]): void {
  const headers = ['nama', 'idKategori', 'sku', 'barcode', 'hargaEceran', 'hargaGrosir', 'hargaPokok', 'aktif'];
  
  const escapeValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = products.map((product) => {
    const variant = product.variants[0];
    return [
      escapeValue(product.name),
      escapeValue(product.categoryId),
      escapeValue(variant.sku),
      escapeValue(variant.barcode || ''),
      escapeValue(variant.retailPrice),
      escapeValue(variant.wholesalePrice || ''),
      escapeValue(variant.cost),
      escapeValue(product.active),
    ];
  });

  const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'products.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importProductsCsv(file: File): Promise<{ imported: number; errors: string[] }> {
  const text = await file.text();
  const lines = text.split('\n').filter((line) => line.trim());
  
  if (lines.length === 0) {
    throw new Error('File CSV kosong');
  }

  const errors: string[] = [];
  let imported = 0;
  const products: any[] = [];

  // Parse CSV with semicolon delimiter
  const parseCsvLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ';' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  };

  const headers = parseCsvLine(lines[0]);
  const expectedHeaders = ['nama', 'idKategori', 'sku', 'barcode', 'hargaEceran', 'hargaGrosir', 'hargaPokok', 'aktif'];

  // Validate headers
  if (headers.length !== expectedHeaders.length) {
    errors.push(`Baris 1: Format header tidak valid. Diharapkan: ${expectedHeaders.join(';')}`);
    return { imported: 0, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    
    if (values.length !== headers.length) {
      errors.push(`Baris ${i + 1}: Jumlah kolom tidak valid (diharapkan ${headers.length}, ditemukan ${values.length})`);
      continue;
    }

    try {
      const product = {
        id: Date.now() + i,
        name: values[0].trim(),
        categoryId: Number(values[1]),
        active: values[7].toLowerCase() === 'true' || values[7] === '1',
        variants: [
          {
            id: Date.now() + i,
            name: 'Default',
            sku: values[2].trim(),
            barcode: values[3].trim() || undefined,
            baseUnitId: 1,
            retailPrice: Number(values[4]),
            wholesalePrice: values[5] ? Number(values[5]) : undefined,
            cost: Number(values[6]),
            active: values[7].toLowerCase() === 'true' || values[7] === '1',
          },
        ],
        units: [{ id: 1, name: 'pcs', conversionToBase: 1 }],
        stock: 0,
      };

      // Validate required fields
      if (!product.name) {
        errors.push(`Baris ${i + 1}: Nama produk tidak boleh kosong`);
        continue;
      }
      if (isNaN(product.categoryId)) {
        errors.push(`Baris ${i + 1}: ID kategori tidak valid`);
        continue;
      }
      if (!product.variants[0].sku) {
        errors.push(`Baris ${i + 1}: SKU tidak boleh kosong`);
        continue;
      }
      if (isNaN(product.variants[0].retailPrice)) {
        errors.push(`Baris ${i + 1}: Harga eceran tidak valid`);
        continue;
      }
      if (isNaN(product.variants[0].cost)) {
        errors.push(`Baris ${i + 1}: Harga pokok tidak valid`);
        continue;
      }

      products.push(product);
      imported++;
    } catch (error) {
      errors.push(`Baris ${i + 1}: ${error instanceof Error ? error.message : 'Kesalahan parsing'}`);
    }
  }

  if (products.length > 0) {
    const existingProducts = (await import('../offline/storage').then((m) => m.getMasterData('products'))) || [];
    await saveMasterData('products', [...existingProducts, ...products]);

    for (const product of products) {
      await queueForSync('product', 'create', product);
    }
  }

  return { imported, errors };
}
