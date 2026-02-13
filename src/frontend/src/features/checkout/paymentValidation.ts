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
    return { valid: false, error: 'No payments added' };
  }

  if (totalPaid < totalDue) {
    return { valid: false, error: 'Insufficient payment' };
  }

  // Allow overpayment (change) for cash payments
  return { valid: true };
}
