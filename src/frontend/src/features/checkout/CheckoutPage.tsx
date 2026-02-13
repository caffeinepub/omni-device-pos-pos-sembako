import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { useCartStore } from '../pos/cartStore';
import { formatCurrency } from '../../i18n/format';
import { createTransaction } from '../../offline/storage';
import { toast } from 'sonner';
import { validatePayment } from './paymentValidation';
import { t } from '../../i18n/t';

interface PaymentEntry {
  methodId: string;
  amount: number;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, cartTotal, cartDiscount, cartTax, clearCart } = useCartStore();
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock payment methods - in real app, fetch from backend
  const paymentMethods = [
    { id: '1', name: 'Tunai', type: 'cash' },
    { id: '2', name: 'QRIS', type: 'qrCode' },
    { id: '3', name: 'Transfer Bank', type: 'bankTransfer' },
  ];

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + (isNaN(p.amount) ? 0 : p.amount), 0);
  }, [payments]);

  const remaining = useMemo(() => {
    return Math.max(0, cartTotal - totalPaid);
  }, [cartTotal, totalPaid]);

  const change = useMemo(() => {
    return Math.max(0, totalPaid - cartTotal);
  }, [totalPaid, cartTotal]);

  const handleAddPayment = () => {
    if (!selectedMethod) {
      toast.error(t('checkout.selectPaymentError'));
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('checkout.insufficientPayment'));
      return;
    }

    if (editingIndex !== null) {
      setPayments(payments.map((p, i) => 
        i === editingIndex ? { methodId: selectedMethod, amount } : p
      ));
      setEditingIndex(null);
      toast.success(t('checkout.paymentUpdated'));
    } else {
      setPayments([...payments, { methodId: selectedMethod, amount }]);
      toast.success(t('checkout.paymentAdded'));
    }
    
    setSelectedMethod('');
    setPaymentAmount('');
  };

  const handleEditPayment = (index: number) => {
    const payment = payments[index];
    setSelectedMethod(payment.methodId);
    setPaymentAmount(payment.amount.toString());
    setEditingIndex(index);
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setSelectedMethod('');
      setPaymentAmount('');
    }
  };

  const handleCompleteTransaction = async () => {
    const paymentsForValidation = payments.map((p) => ({
      methodId: parseInt(p.methodId),
      amount: p.amount,
    }));

    const validation = validatePayment(totalPaid, cartTotal, paymentsForValidation);
    if (!validation.valid) {
      toast.error(validation.error || t('checkout.transactionFailed'));
      return;
    }

    setIsProcessing(true);
    try {
      const transactionData = {
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          sku: item.sku,
        })),
        payments: paymentsForValidation,
        total: cartTotal,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        tax: cartTax,
        timestamp: Date.now(),
      };

      const transactionId = await createTransaction(transactionData);
      
      clearCart();
      toast.success(t('checkout.transactionSuccess'));
      
      // Navigate to transaction details with print flag
      navigate({ 
        to: '/transaction/$id', 
        params: { id: String(transactionId) },
        search: { print: 'true' }
      });
    } catch (error: any) {
      console.error('Transaction error:', error);
      if (error.message?.includes('Insufficient stock')) {
        toast.error(t('checkout.stockUpdateFailed'));
      } else {
        toast.error(t('checkout.transactionFailed'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t('pos.cartEmpty')}</p>
          <Button onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('transaction.backToPOS')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{t('checkout.title')}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('checkout.orderSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity - item.discount)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('pos.subtotal')}</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('pos.discount')}</span>
                  <span>-{formatCurrency(cartDiscount)}</span>
                </div>
              )}
              {cartTax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t('pos.tax')}</span>
                  <span>{formatCurrency(cartTax)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{t('pos.total')}</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('checkout.paymentMethod')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('checkout.selectPaymentMethod')}</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder={t('checkout.selectPaymentMethod')} />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('checkout.amount')}</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
                className="glass-input"
              />
            </div>

            <Button onClick={handleAddPayment} className="w-full glass-button" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              {editingIndex !== null ? t('checkout.updatePayment') : t('checkout.addPayment')}
            </Button>

            {payments.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                {payments.map((payment, index) => {
                  const method = paymentMethods.find((m) => m.id === payment.methodId);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">
                        {method?.name}: {formatCurrency(payment.amount)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPayment(index)}
                          className="h-6 w-6"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePayment(index)}
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>{t('checkout.remaining')}</span>
                <span className={remaining > 0 ? 'text-orange-600 font-semibold' : 'text-green-600'}>
                  {formatCurrency(remaining)}
                </span>
              </div>
              {change > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t('checkout.change')}</span>
                  <span className="text-blue-600 font-semibold">{formatCurrency(change)}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleCompleteTransaction}
              disabled={isProcessing || remaining > 0}
              className="w-full glass-button"
              size="lg"
            >
              {isProcessing ? t('checkout.processing') : t('checkout.completeTransaction')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
