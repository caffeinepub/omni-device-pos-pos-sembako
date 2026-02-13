import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Warehouse, AlertTriangle, Plus } from 'lucide-react';
import { useMasterData } from '../../offline/masterDataCache';
import { saveMasterData, queueForSync } from '../../offline/storage';
import { toast } from 'sonner';

export function InventoryPage() {
  const { data: products, refetch } = useMasterData('products');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustment, setAdjustment] = useState({ quantity: '', reason: '' });

  const lowStockProducts = (products || []).filter((p: any) => p.stock < 10);

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const allProducts = products || [];
      const updatedProducts = allProducts.map((p: any) =>
        p.id === selectedProduct.id
          ? { ...p, stock: p.stock + Number(adjustment.quantity) }
          : p
      );

      await saveMasterData('products', updatedProducts);
      await queueForSync('stockAdjustment', 'create', {
        productId: selectedProduct.id,
        variantId: selectedProduct.variants[0].id,
        change: Number(adjustment.quantity),
        reason: adjustment.reason,
        timestamp: Date.now(),
      });

      toast.success('Stock adjusted successfully');
      setShowDialog(false);
      setSelectedProduct(null);
      setAdjustment({ quantity: '', reason: '' });
      refetch();
    } catch (error) {
      toast.error(`Failed to adjust stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">Monitor stock levels and make adjustments</p>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{lowStockProducts.length} products are running low on stock</p>
            <div className="space-y-2">
              {lowStockProducts.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="destructive">{product.stock} units</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products || []).map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.variants[0]?.sku}</TableCell>
                  <TableCell>{product.stock || 0}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock < 10 ? 'destructive' : 'default'}>
                      {product.stock < 10 ? 'Low' : 'OK'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={showDialog && selectedProduct?.id === product.id} onOpenChange={(open) => {
                      setShowDialog(open);
                      if (!open) setSelectedProduct(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Adjust
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adjust Stock: {product.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdjustment} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity Change</Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={adjustment.quantity}
                              onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
                              placeholder="Enter positive or negative number"
                              required
                            />
                            <p className="text-sm text-muted-foreground">
                              Current: {product.stock} → New: {product.stock + Number(adjustment.quantity || 0)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Input
                              id="reason"
                              value={adjustment.reason}
                              onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                              placeholder="e.g., Damaged, Recount, etc."
                              required
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Apply Adjustment</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
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
