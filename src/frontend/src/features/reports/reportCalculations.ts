export interface DailySummary {
  totalRevenue: number;
  transactionCount: number;
  averageTransaction: number;
  itemsSold: number;
}

export interface ProductSale {
  name: string;
  quantity: number;
  revenue: number;
  avgPrice: number;
}

export function calculateDailySummary(transactions: any[]): DailySummary {
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const transactionCount = transactions.length;
  const itemsSold = transactions.reduce(
    (sum, tx) => sum + tx.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0),
    0
  );

  return {
    totalRevenue,
    transactionCount,
    averageTransaction: transactionCount > 0 ? totalRevenue / transactionCount : 0,
    itemsSold,
  };
}

export function calculateProductSales(transactions: any[]): ProductSale[] {
  const productMap = new Map<string, { quantity: number; revenue: number }>();

  transactions.forEach((tx) => {
    tx.items.forEach((item: any) => {
      const existing = productMap.get(item.name) || { quantity: 0, revenue: 0 };
      productMap.set(item.name, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
      });
    });
  });

  return Array.from(productMap.entries())
    .map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
      avgPrice: data.revenue / data.quantity,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}
