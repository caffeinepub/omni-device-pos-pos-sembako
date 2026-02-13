import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer } from 'lucide-react';
import { getTransaction } from '../../offline/storage';
import { formatCurrency, formatDateTime } from '../../i18n/format';
import { PrintReceiptDialog } from '../receipts/PrintReceiptDialog';
import { useState, useEffect } from 'react';
import { t } from '../../i18n/t';

export function TransactionDetailsPage() {
  const { id } = useParams({ from: '/transaction/$id' });
  const navigate = useNavigate();
  const search = useSearch({ from: '/transaction/$id' }) as { print?: string };
  const [transaction, setTransaction] = useState<any>(null);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    const loadTransaction = async () => {
      const tx = await getTransaction(Number(id));
      setTransaction(tx);
      
      // Auto-open print dialog if coming from checkout
      if (tx && search?.print === 'true') {
        setShowPrint(true);
      }
    };
    loadTransaction();
  }, [id, search]);

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('transaction.notFound')}</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('transaction.backToPOS')}
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
            <h1 className="text-3xl font-bold">{t('transaction.details')} #{transaction.id}</h1>
            <p className="text-muted-foreground">{formatDateTime(transaction.timestamp)}</p>
          </div>
        </div>
        <Button onClick={() => setShowPrint(true)}>
          <Printer className="mr-2 h-4 w-4" />
          {t('checkout.printReceipt')}
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('transaction.details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('transaction.status')}:</span>
            <Badge>{transaction.status || t('transaction.completed')}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('transaction.totalAmount')}:</span>
            <span className="text-2xl font-bold">{formatCurrency(transaction.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('transaction.items')}</CardTitle>
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

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('transaction.paymentBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transaction.payments.map((payment: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="text-muted-foreground">{t('receipt.payment')} {index + 1}:</span>
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
