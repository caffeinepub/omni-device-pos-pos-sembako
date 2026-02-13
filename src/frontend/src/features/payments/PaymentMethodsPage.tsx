import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus } from 'lucide-react';
import { useMasterData } from '../../offline/masterDataCache';
import { saveMasterData, queueForSync } from '../../offline/storage';
import { toast } from 'sonner';

export function PaymentMethodsPage() {
  const { data: paymentMethods, refetch } = useMasterData('paymentMethods');
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', enabled: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const allMethods = paymentMethods || [];
      const newMethod = {
        id: Date.now(),
        name: formData.name,
        methodType: { __kind__: 'custom' as const, custom: formData.name },
        enabled: formData.enabled,
      };

      const updatedMethods = [...allMethods, newMethod];
      await saveMasterData('paymentMethods', updatedMethods);
      await queueForSync('paymentMethod', 'create', newMethod);

      toast.success('Payment method created successfully');
      setShowDialog(false);
      setFormData({ name: '', enabled: true });
      refetch();
    } catch (error) {
      toast.error(`Failed to create payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleEnabled = async (method: any) => {
    try {
      const allMethods = paymentMethods || [];
      const updatedMethods = allMethods.map((m: any) =>
        m.id === method.id ? { ...m, enabled: !m.enabled } : m
      );

      await saveMasterData('paymentMethods', updatedMethods);
      await queueForSync('paymentMethod', 'update', { ...method, enabled: !method.enabled });

      toast.success('Payment method updated');
      refetch();
    } catch (error) {
      toast.error(`Failed to update payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground mt-2">Configure available payment options</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Method Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., E-Wallet, Debit Card"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enabled</Label>
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Method</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(paymentMethods || []).map((method: any) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell className="capitalize">
                    {method.methodType.__kind__ === 'custom'
                      ? method.methodType.custom
                      : method.methodType.__kind__}
                  </TableCell>
                  <TableCell>
                    <Badge variant={method.enabled ? 'default' : 'secondary'}>
                      {method.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleEnabled(method)}
                    >
                      {method.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
