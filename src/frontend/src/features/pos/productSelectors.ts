import { useMemo } from 'react';
import { useMasterData } from '../../offline/masterDataCache';

export function useProducts() {
  const { data: products } = useMasterData('products');

  const activeProducts = useMemo(() => {
    return (products || []).filter((p: any) => p.active);
  }, [products]);

  const searchProducts = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return activeProducts.filter((p: any) => {
      return (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.variants.some((v: any) => 
          v.sku.toLowerCase().includes(lowerQuery) ||
          v.barcode?.toLowerCase().includes(lowerQuery)
        )
      );
    });
  };

  return {
    products: activeProducts,
    searchProducts,
  };
}
