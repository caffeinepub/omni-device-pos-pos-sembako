export interface PromoEligibility {
  eligible: boolean;
  reason?: string;
}

export function checkPromoEligibility(
  promo: any,
  cartTotal: number,
  items: any[]
): PromoEligibility {
  if (!promo.active) {
    return { eligible: false, reason: 'Promotion is not active' };
  }

  if (promo.minPurchaseAmount && cartTotal < promo.minPurchaseAmount) {
    return { eligible: false, reason: 'Minimum purchase amount not met' };
  }

  const now = Date.now();
  if (promo.validFrom && now < promo.validFrom) {
    return { eligible: false, reason: 'Promotion has not started yet' };
  }

  if (promo.validTo && now > promo.validTo) {
    return { eligible: false, reason: 'Promotion has expired' };
  }

  return { eligible: true };
}

export function applyPromotion(promo: any, cartTotal: number): number {
  if (promo.type === 'percentage') {
    return cartTotal * (promo.value / 100);
  } else if (promo.type === 'fixed') {
    return Math.min(promo.value, cartTotal);
  }
  return 0;
}
