import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { useMasterData } from '../../offline/masterDataCache';
import { saveMasterData, queueForSync } from '../../offline/storage';
import { toast } from 'sonner';
import { formatCurrency } from '../../i18n/format';

interface ReceivingItem {
  productId: number;
  variantId: number;
  quantity: number;
  cost: number;
}

export function ReceivingPage() {
  const { data: products, refetch } = useMasterData('products');
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<ReceivingItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');

  const addItem = () => {
    if (!selectedProductId || !quantity || !cost) {
      toast.error('Please fill all fields');
      return;
    }

    const product = (products || []).find((p: any) => p.id === Number(selectedProductId));
    if (!product) return;

    setItems([
      ...items,
      {
        productId: product.id,
        variantId: product.variants[0].id,
        quantity: Number(quantity),
        cost: Number(cost),
      },
    ]);

    setSelectedProductId('');
    setQuantity('');
    setCost('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplier || items.length === 0) {
      toast.error('Please add supplier and at least one item');
      return;
    }

    try {
      const allProducts = products || [];
      const updatedProducts = allProducts.map((p: any) => {
        const receivingItem = items.find((item) => item.productId === p.id);
        if (receivingItem) {
          return {
            ...p,
            stock: p.stock + receivingItem.quantity,
            variants: p.variants.map((v: any) =>
              v.id === receivingItem.variantId
                ? { ...v, cost: receivingItem.cost }
                : v
            ),
          };
        }
        return p;
      });

      await saveMasterData('products', updatedProducts);
      await queueForSync('receiving', 'create', {
        supplier,
        items,
        timestamp: Date.now(),
      });

      toast.success('Receiving completed successfully');
      setSupplier('');
      setItems([]);
      refetch();
    } catch (error) {
      toast.error(`Failed to complete receiving: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.cost, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Receiving</h1>
        <p className="text-muted-foreground mt-2">Record incoming stock from suppliers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Receiving Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Enter supplier name"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <select
                  id="product"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select product</option>
                  {(products || []).map((product: any) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Unit Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                {items.map((item, index) => {
                  const product = (products || []).find((p: any) => p.id === item.productId);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} units × {formatCurrency(item.cost)} = {formatCurrency(item.quantity * item.cost)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total Cost:</span>
                  <span>{formatCurrency(totalCost)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={items.length === 0}>
          Complete Receiving
        </Button>
      </form>
    </div>
  );
}
