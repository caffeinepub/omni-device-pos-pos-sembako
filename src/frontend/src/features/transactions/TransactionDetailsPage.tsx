import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer } from 'lucide-react';
import { getTransaction } from '../../offline/storage';
import { formatCurrency, formatDateTime } from '../../i18n/format';
import { PrintReceiptDialog } from '../receipts/PrintReceiptDialog';
import { useState, useEffect } from 'react';

export function TransactionDetailsPage() {
  const { id } = useParams({ from: '/transaction/$id' });
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<any>(null);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    const loadTransaction = async () => {
      const tx = await getTransaction(Number(id));
      setTransaction(tx);
    };
    loadTransaction();
  }, [id]);

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Transaction not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to POS
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Transaction #{transaction.id}</h1>
            <p className="text-muted-foreground">{formatDateTime(transaction.timestamp)}</p>
          </div>
        </div>
        <Button onClick={() => setShowPrint(true)}>
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge>{transaction.status || 'Completed'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="text-2xl font-bold">{formatCurrency(transaction.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transaction.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transaction.payments.map((payment: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="text-muted-foreground">Payment {index + 1}:</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PrintReceiptDialog
        open={showPrint}
        onOpenChange={setShowPrint}
        transaction={transaction}
      />
    </div>
  );
}
