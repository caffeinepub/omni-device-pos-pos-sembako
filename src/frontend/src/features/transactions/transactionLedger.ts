export function calculateNetSales(transactions: any[]): number {
  return transactions.reduce((sum, tx) => {
    if (tx.status === 'voided') return sum;
    if (tx.status === 'fullyRefunded') return sum;
    if (tx.status === 'partiallyRefunded') {
      return sum + (tx.total - tx.refundedAmount);
    }
    return sum + tx.total;
  }, 0);
}

export function applyRefundToInventory(refund: any, products: any[]): any[] {
  return products.map((product) => {
    const refundItem = refund.items.find((item: any) => item.productId === product.id);
    if (refundItem) {
      return {
        ...product,
        stock: product.stock + refundItem.quantity,
      };
    }
    return product;
  });
}
