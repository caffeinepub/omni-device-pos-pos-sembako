import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, ShoppingCart, Trash2, Camera, Minus, Plus } from 'lucide-react';
import { useMasterData } from '../../offline/masterDataCache';
import { useCartStore } from './cartStore';
import { formatCurrency } from '../../i18n/format';
import { CameraBarcodeScanner } from '../barcode/CameraBarcodeScanner';
import { resolveBarcode } from '../barcode/barcodeResolver';
import { toast } from 'sonner';
import { t } from '../../i18n/t';

export function PosPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products } = useMasterData('products');
  const { cart, addItem, updateQuantity, removeItem, cartTotal, cartSubtotal, cartDiscount, cartTax, setCartDiscount, taxEnabled, setTaxEnabled } = useCartStore();

  const filteredProducts = (products || []).filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.variants.some((v: any) => v.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddToCart = (product: any, variant: any) => {
    addItem(product, variant);
    toast.success(`${product.name} ${t('pos.addedToCart')}`);
  };

  const handleBarcodeScanned = (barcode: string) => {
    const result = resolveBarcode(barcode, products || []);
    if (result) {
      handleAddToCart(result.product, result.variant);
    } else {
      toast.error(`${t('pos.productNotFound')}: ${barcode}`);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(t('pos.cartEmptyError'));
      return;
    }
    navigate({ to: '/checkout' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('pos.productSearch')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('pos.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input rounded-xl"
              />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="glass-button rounded-xl">
                    <Camera className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="glass-elevated">
                  <SheetHeader>
                    <SheetTitle>{t('pos.scanBarcode')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <CameraBarcodeScanner onScan={handleBarcodeScanned} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((product: any) =>
                product.variants.map((variant: any) => (
                  <div
                    key={`${product.id}-${variant.id}`}
                    className="glass-card p-4 cursor-pointer hover:shadow-glass-lg transition-all duration-200"
                    onClick={() => handleAddToCart(product, variant)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{variant.sku}</p>
                      </div>
                      <Badge variant={product.active ? 'default' : 'secondary'} className="glass-button">
                        {product.active ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">{formatCurrency(variant.retailPrice)}</span>
                      {variant.wholesalePrice && (
                        <span className="text-sm text-muted-foreground">
                          {t('pos.wholesale')}: {formatCurrency(variant.wholesalePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="glass-elevated sticky top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t('pos.cart')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t('pos.cartEmpty')}</p>
            ) : (
              <>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="glass-card p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-6 w-6 glass-button rounded-lg"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 glass-button rounded-lg"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 glass-button rounded-lg"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-border/30">
                  <div className="flex justify-between text-sm">
                    <span>{t('pos.subtotal')}</span>
                    <span className="font-medium">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={t('pos.discountPlaceholder')}
                      value={cartDiscount || ''}
                      onChange={(e) => setCartDiscount(Number(e.target.value) || 0)}
                      className="glass-input rounded-xl"
                    />
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{t('pos.discount')}</span>
                      <span>-{formatCurrency(cartDiscount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <label className="text-sm cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={taxEnabled}
                        onChange={(e) => setTaxEnabled(e.target.checked)}
                        className="rounded"
                      />
                      {t('pos.tax')}
                    </label>
                    {taxEnabled && <span className="text-sm font-medium">{formatCurrency(cartTax)}</span>}
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/30">
                    <span>{t('pos.total')}</span>
                    <span className="text-primary">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <Button onClick={handleCheckout} className="w-full glass-button rounded-xl" size="lg">
                  {t('pos.checkout')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
