import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CreditCard, Plus } from 'lucide-react';
import { useCartStore } from '../pos/cartStore';
import { useMasterData } from '../../offline/masterDataCache';
import { formatCurrency } from '../../i18n/format';
import { createTransaction, saveMasterData, getMasterData } from '../../offline/storage';
import { toast } from 'sonner';
import { t } from '../../i18n/t';
import { useQueryClient } from '@tanstack/react-query';

interface Payment {
  methodId: number;
  methodName: string;
  amount: number;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, cartTotal, cartSubtotal, cartDiscount, cartTax, clearCart } = useCartStore();
  const { data: paymentMethods } = useMasterData('paymentMethods');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = Number(currentAmount) || 0;
  const totalWithPending = totalPaid + pendingAmount;
  const remaining = Math.max(0, cartTotal - totalWithPending);
  const change = Math.max(0, totalWithPending - cartTotal);

  const canComplete = totalWithPending >= cartTotal;

  const handleAddPayment = () => {
    if (!selectedMethodId) {
      toast.error(t('checkout.selectPaymentError'));
      return;
    }

    const amount = Number(currentAmount);
    if (!amount || amount <= 0) {
      toast.error(t('checkout.insufficientPayment'));
      return;
    }

    const method = (paymentMethods || []).find((m: any) => m.id.toString() === selectedMethodId);
    if (!method) return;

    setPayments([...payments, { methodId: method.id, methodName: method.name, amount }]);
    setCurrentAmount('');
    setSelectedMethodId('');
    toast.success(t('checkout.paymentAdded'));
  };

  const handleCompleteTransaction = async () => {
    if (!canComplete) {
      toast.error(t('checkout.insufficientPayment'));
      return;
    }

    // Add pending payment if exists
    let finalPayments = [...payments];
    if (pendingAmount > 0 && selectedMethodId) {
      const method = (paymentMethods || []).find((m: any) => m.id.toString() === selectedMethodId);
      if (method) {
        finalPayments.push({ methodId: method.id, methodName: method.name, amount: pendingAmount });
      }
    }

    if (finalPayments.length === 0) {
      toast.error(t('checkout.selectPaymentError'));
      return;
    }

    setIsProcessing(true);

    try {
      // Decrement stock for each item
      const products = await getMasterData('products');
      if (!products) {
        throw new Error(t('checkout.productNotFoundInStock'));
      }

      const updatedProducts = products.map((product: any) => {
        const cartItem = cart.find(item => item.productId === product.id);
        if (cartItem) {
          const newStock = (product.stock || 0) - cartItem.quantity;
          if (newStock < 0) {
            throw new Error(`${t('checkout.stockUpdateFailed')}: ${product.name}`);
          }
          return { ...product, stock: newStock };
        }
        return product;
      });

      // Save updated stock
      await saveMasterData('products', updatedProducts);

      // Create transaction
      const transactionData = {
        items: cart.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unit: { id: 1, name: item.unit, conversionToBase: 1 },
          price: item.price,
        })),
        payments: finalPayments.map(p => ({ methodId: p.methodId, amount: p.amount })),
        total: cartTotal,
      };

      await createTransaction(transactionData);

      // Invalidate queries to refresh inventory
      queryClient.invalidateQueries({ queryKey: ['masterData', 'products'] });

      toast.success(t('checkout.transactionSuccess'));
      clearCart();
      navigate({ to: '/' });
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error(`${t('checkout.transactionFailed')}: ${error instanceof Error ? error.message : t('common.error')}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-card rounded-2xl p-8">
        <p className="text-muted-foreground mb-4">{t('pos.cartEmpty')}</p>
        <Button onClick={() => navigate({ to: '/' })} className="glass-button rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('nav.pos')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="glass-button rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{t('checkout.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('checkout.orderSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center glass-card p-3 rounded-xl">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-border/30">
              <div className="flex justify-between text-sm">
                <span>{t('pos.subtotal')}</span>
                <span className="font-medium">{formatCurrency(cartSubtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
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
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/30">
                <span>{t('pos.total')}</span>
                <span className="text-primary">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('checkout.paymentMethod')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payments.length > 0 && (
              <div className="space-y-2 mb-4">
                {payments.map((payment, index) => (
                  <div key={index} className="flex justify-between items-center glass-card p-3 rounded-xl">
                    <span className="text-sm">{payment.methodName}</span>
                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">{t('checkout.paymentMethod')}</Label>
                <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                  <SelectTrigger id="paymentMethod" className="glass-input rounded-xl">
                    <SelectValue placeholder={t('checkout.selectPaymentMethod')} />
                  </SelectTrigger>
                  <SelectContent className="glass-elevated">
                    {(paymentMethods || []).map((method: any) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t('checkout.amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="glass-input rounded-xl"
                />
              </div>

              <Button
                onClick={handleAddPayment}
                variant="outline"
                className="w-full glass-button rounded-xl"
                disabled={!selectedMethodId || !currentAmount}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('checkout.addPayment')}
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t border-border/30">
              <div className="flex justify-between text-sm">
                <span>{t('pos.total')}</span>
                <span className="font-semibold">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('checkout.amountReceived')}</span>
                <span className="font-semibold">{formatCurrency(totalWithPending)}</span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>{t('checkout.remaining')}</span>
                  <span className="font-semibold">{formatCurrency(remaining)}</span>
                </div>
              )}
              {change > 0 && (
                <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-border/30">
                  <span>{t('checkout.change')}</span>
                  <span>{formatCurrency(change)}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleCompleteTransaction}
              disabled={!canComplete || isProcessing}
              className="w-full glass-button rounded-xl"
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
