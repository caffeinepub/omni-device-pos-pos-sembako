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
import { t } from '../../i18n/t';

export function InventoryPage() {
  const { data: products, refetch } = useMasterData('products');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustment, setAdjustment] = useState({ quantity: '', reason: '' });

  const lowStockProducts = (products || []).filter((p: any) => (p.stock || 0) < 10);

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const allProducts = products || [];
      const updatedProducts = allProducts.map((p: any) =>
        p.id === selectedProduct.id
          ? { ...p, stock: (p.stock || 0) + Number(adjustment.quantity) }
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

      toast.success(t('inventory.stockAdjusted'));
      setShowDialog(false);
      setSelectedProduct(null);
      setAdjustment({ quantity: '', reason: '' });
      refetch();
    } catch (error) {
      toast.error(`${t('inventory.stockAdjustFailed')}: ${error instanceof Error ? error.message : t('common.error')}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('inventory.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('inventory.description')}</p>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-destructive glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t('inventory.lowStockAlert')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{lowStockProducts.length} {t('inventory.lowStockMessage')}</p>
            <div className="space-y-2">
              {lowStockProducts.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-2 border border-border/30 rounded-xl glass-card">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="destructive" className="glass-button">{product.stock || 0} {t('inventory.units')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            {t('inventory.stockLevels')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('inventory.product')}</TableHead>
                <TableHead>{t('catalog.sku')}</TableHead>
                <TableHead>{t('inventory.currentStock')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products || []).map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.variants[0]?.sku}</TableCell>
                  <TableCell>{product.stock || 0}</TableCell>
                  <TableCell>
                    <Badge variant={(product.stock || 0) < 10 ? 'destructive' : 'default'} className="glass-button">
                      {(product.stock || 0) < 10 ? t('inventory.low') : t('inventory.ok')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={showDialog && selectedProduct?.id === product.id} onOpenChange={(open) => {
                      setShowDialog(open);
                      if (!open) setSelectedProduct(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)} className="glass-button rounded-xl">
                          <Plus className="h-4 w-4 mr-1" />
                          {t('inventory.adjust')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-elevated">
                        <DialogHeader>
                          <DialogTitle>{t('inventory.adjustStock')}: {product.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdjustment} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="quantity">{t('inventory.quantityChange')}</Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={adjustment.quantity}
                              onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
                              placeholder={t('inventory.enterQuantity')}
                              required
                              className="glass-input rounded-xl"
                            />
                            <p className="text-sm text-muted-foreground">
                              {t('inventory.current')}: {product.stock || 0} → {t('inventory.new')}: {(product.stock || 0) + Number(adjustment.quantity || 0)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reason">{t('inventory.reason')}</Label>
                            <Input
                              id="reason"
                              value={adjustment.reason}
                              onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                              placeholder={t('inventory.reasonPlaceholder')}
                              required
                              className="glass-input rounded-xl"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="glass-button rounded-xl">
                              {t('common.cancel')}
                            </Button>
                            <Button type="submit" className="glass-button rounded-xl">{t('inventory.applyAdjustment')}</Button>
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
