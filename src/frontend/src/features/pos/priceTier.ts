export type PriceTier = 'retail' | 'wholesale';

export function selectPriceTier(quantity: number, wholesaleThreshold: number = 12): PriceTier {
  return quantity >= wholesaleThreshold ? 'wholesale' : 'retail';
}

export function getPrice(variant: any, tier: PriceTier): number {
  if (tier === 'wholesale' && variant.wholesalePrice) {
    return variant.wholesalePrice;
  }
  return variant.retailPrice;
}
