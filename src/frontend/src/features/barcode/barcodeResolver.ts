export function resolveBarcode(barcode: string, products: any[]): any | null {
  for (const product of products) {
    for (const variant of product.variants) {
      if (variant.barcode === barcode) {
        return { product, variant };
      }
    }
  }
  return null;
}
