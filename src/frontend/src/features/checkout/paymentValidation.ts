import { t } from '../../i18n/t';

export interface PaymentValidation {
  valid: boolean;
  error?: string;
}

export function validatePayment(
  totalPaid: number,
  totalDue: number,
  payments: Array<{ methodId: number; amount: number }>
): PaymentValidation {
  if (payments.length === 0) {
    return { valid: false, error: t('checkout.selectPaymentError') };
  }

  // Check for invalid payment amounts
  const hasInvalidAmount = payments.some(p => isNaN(p.amount) || p.amount < 0);
  if (hasInvalidAmount) {
    return { valid: false, error: t('checkout.insufficientPayment') };
  }

  if (totalPaid < totalDue) {
    return { valid: false, error: t('checkout.insufficientPayment') };
  }

  // Allow overpayment (change) for cash payments
  return { valid: true };
}
