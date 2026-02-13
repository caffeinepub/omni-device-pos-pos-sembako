import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore } from '../pos/cartStore';
import { useMasterData } from '../../offline/masterDataCache';
import { formatCurrency } from '../../i18n/format';
import { createTransaction } from '../../offline/storage';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { validatePayment } from './paymentValidation';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCartStore();
  const { data: paymentMethods } = useMasterData('paymentMethods');
  const [payments, setPayments] = useState<Array<{ methodId: number; amount: number }>>([]);
  const [currentMethodId, setCurrentMethodId] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('');

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = cartTotal - totalPaid;

  const addPayment = () => {
    if (!currentMethodId || !currentAmount) {
      toast.error('Please select payment method and enter amount');
      return;
    }

    const amount = Number(currentAmount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setPayments([...payments, { methodId: Number(currentMethodId), amount }]);
    setCurrentMethodId('');
    setCurrentAmount('');
  };

  const handleComplete = async () => {
    const validation = validatePayment(totalPaid, cartTotal, payments);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      const transactionId = await createTransaction({
        items: cart,
        payments,
        total: cartTotal,
      });

      toast.success('Transaction completed successfully');
      clearCart();
      navigate({ to: `/transaction/${transactionId}` });
    } catch (error) {
      toast.error(`Failed to complete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No items in cart</p>
        <Button onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to POS
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={currentMethodId} onValueChange={setCurrentMethodId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {(paymentMethods || []).filter((m: any) => m.enabled).map((method: any) => (
                    <SelectItem key={method.id} value={String(method.id)}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <Button onClick={addPayment} className="w-full" variant="outline">
              Add Payment
            </Button>

            {payments.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold">Payments:</h3>
                {payments.map((payment, index) => {
                  const method = (paymentMethods || []).find((m: any) => m.id === payment.methodId);
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{method?.name}</span>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Remaining:</span>
                  <span className={remaining > 0 ? 'text-destructive' : 'text-green-600'}>
                    {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
                {remaining < 0 && (
                  <div className="text-sm text-muted-foreground">
                    Change: {formatCurrency(Math.abs(remaining))}
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleComplete} className="w-full" disabled={remaining > 0}>
              Complete Transaction
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
