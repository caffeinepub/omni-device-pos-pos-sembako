export interface ProductFormData {
  name: string;
  categoryId: number;
  sku: string;
  barcode?: string;
  retailPrice: number;
  wholesalePrice?: number;
  cost: number;
  active: boolean;
}

export function validateProductForm(data: Partial<ProductFormData>): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Product name is required');
  }

  if (!data.categoryId) {
    errors.push('Category is required');
  }

  if (!data.sku?.trim()) {
    errors.push('SKU is required');
  }

  if (data.retailPrice === undefined || data.retailPrice <= 0) {
    errors.push('Retail price must be greater than 0');
  }

  if (data.cost === undefined || data.cost < 0) {
    errors.push('Cost must be 0 or greater');
  }

  if (data.wholesalePrice !== undefined && data.wholesalePrice <= 0) {
    errors.push('Wholesale price must be greater than 0 if provided');
  }

  return errors;
}
