export function exportCatalogKeys(products: any[]): string[] {
  return products.map((p) => p.sku || String(p.id));
}

export function applyValidatedUpserts(products: any[], updates: any[]): any[] {
  const productMap = new Map(products.map((p) => [p.id, p]));

  updates.forEach((update) => {
    productMap.set(update.id, update);
  });

  return Array.from(productMap.values());
}
