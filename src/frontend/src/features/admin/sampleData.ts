import { saveMasterData, queueForSync } from '../../offline/storage';

export async function loadSampleData() {
  const categories = [
    { id: 1, name: 'Sembako', active: true },
    { id: 2, name: 'Minuman', active: true },
    { id: 3, name: 'Snack', active: true },
    { id: 4, name: 'Perawatan', active: true },
  ];

  const products = [
    {
      id: 1,
      name: 'Beras Premium',
      categoryId: 1,
      active: true,
      variants: [
        {
          id: 1,
          name: 'Default',
          sku: 'BRS-001',
          barcode: '8991234567890',
          baseUnitId: 1,
          retailPrice: 15000,
          wholesalePrice: 13500,
          cost: 12000,
          active: true,
        },
      ],
      units: [
        { id: 1, name: 'kg', conversionToBase: 1 },
        { id: 2, name: 'karung', conversionToBase: 25 },
      ],
      stock: 100,
    },
    {
      id: 2,
      name: 'Minyak Goreng',
      categoryId: 1,
      active: true,
      variants: [
        {
          id: 2,
          name: 'Default',
          sku: 'MYK-001',
          barcode: '8991234567891',
          baseUnitId: 1,
          retailPrice: 18000,
          wholesalePrice: 16500,
          cost: 15000,
          active: true,
        },
      ],
      units: [{ id: 1, name: 'liter', conversionToBase: 1 }],
      stock: 50,
    },
    {
      id: 3,
      name: 'Gula Pasir',
      categoryId: 1,
      active: true,
      variants: [
        {
          id: 3,
          name: 'Default',
          sku: 'GUL-001',
          barcode: '8991234567892',
          baseUnitId: 1,
          retailPrice: 14000,
          wholesalePrice: 12500,
          cost: 11000,
          active: true,
        },
      ],
      units: [{ id: 1, name: 'kg', conversionToBase: 1 }],
      stock: 75,
    },
    {
      id: 4,
      name: 'Aqua Botol',
      categoryId: 2,
      active: true,
      variants: [
        {
          id: 4,
          name: '600ml',
          sku: 'AQU-600',
          barcode: '8991234567893',
          baseUnitId: 1,
          retailPrice: 3500,
          wholesalePrice: 3000,
          cost: 2500,
          active: true,
        },
        {
          id: 5,
          name: '1500ml',
          sku: 'AQU-1500',
          barcode: '8991234567894',
          baseUnitId: 1,
          retailPrice: 6000,
          wholesalePrice: 5500,
          cost: 4500,
          active: true,
        },
      ],
      units: [
        { id: 1, name: 'botol', conversionToBase: 1 },
        { id: 2, name: 'dus', conversionToBase: 24 },
      ],
      stock: 200,
    },
    {
      id: 5,
      name: 'Indomie Goreng',
      categoryId: 3,
      active: true,
      variants: [
        {
          id: 6,
          name: 'Default',
          sku: 'IND-001',
          barcode: '8991234567895',
          baseUnitId: 1,
          retailPrice: 3000,
          wholesalePrice: 2700,
          cost: 2400,
          active: true,
        },
      ],
      units: [
        { id: 1, name: 'pcs', conversionToBase: 1 },
        { id: 2, name: 'dus', conversionToBase: 40 },
      ],
      stock: 500,
    },
  ];

  const paymentMethods = [
    { id: 1, name: 'Cash', methodType: { __kind__: 'cash' as const, cash: null }, enabled: true },
    { id: 2, name: 'QRIS', methodType: { __kind__: 'qrCode' as const, qrCode: null }, enabled: true },
    { id: 3, name: 'Bank Transfer', methodType: { __kind__: 'bankTransfer' as const, bankTransfer: null }, enabled: true },
  ];

  await saveMasterData('categories', categories);
  await saveMasterData('products', products);
  await saveMasterData('paymentMethods', paymentMethods);

  // Queue sync operations
  for (const category of categories) {
    await queueForSync('category', 'create', category);
  }
  for (const product of products) {
    await queueForSync('product', 'create', product);
  }
  for (const method of paymentMethods) {
    await queueForSync('paymentMethod', 'create', method);
  }
}
