import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Camera, Minus, Plus, Trash2, Tag } from 'lucide-react';
import { useCartStore } from './cartStore';
import { useProducts } from './productSelectors';
import { formatCurrency } from '../../i18n/format';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CameraBarcodeScanner } from '../barcode/CameraBarcodeScanner';
import { useHidBarcodeListener } from '../barcode/HidBarcodeListener';
import { toast } from 'sonner';

export function PosPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const { products, searchProducts } = useProducts();
  const { cart, addItem, updateQuantity, removeItem, clearCart, cartTotal, cartSubtotal, cartDiscount, setCartDiscount, cartTax, setTaxEnabled, taxEnabled } = useCartStore();

  const filteredProducts = searchQuery ? searchProducts(searchQuery) : products.slice(0, 20);

  useHidBarcodeListener((barcode) => {
    const product = products.find(p => 
      p.variants.some(v => v.barcode === barcode)
    );
    if (product) {
      const variant = product.variants.find(v => v.barcode === barcode);
      if (variant) {
        addItem(product, variant);
        toast.success(`Added ${product.name} to cart`);
      }
    } else {
      toast.error(`Product not found for barcode: ${barcode}`);
    }
  });

  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(p => 
      p.variants.some(v => v.barcode === barcode)
    );
    if (product) {
      const variant = product.variants.find(v => v.barcode === barcode);
      if (variant) {
        addItem(product, variant);
        toast.success(`Added ${product.name} to cart`);
        setShowScanner(false);
      }
    } else {
      toast.error(`Product not found for barcode: ${barcode}`);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    navigate({ to: '/checkout' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Sheet open={showScanner} onOpenChange={setShowScanner}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Camera className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Scan Barcode</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <CameraBarcodeScanner onScan={handleBarcodeScanned} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
              if (product.variants.length > 0) {
                addItem(product, product.variants[0]);
                toast.success(`Added ${product.name} to cart`);
              }
            }}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{product.variants[0]?.sku}</span>
                  <Badge variant={product.active ? 'default' : 'secondary'}>
                    {product.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold">{formatCurrency(product.variants[0]?.retailPrice || 0)}</span>
                  {product.variants[0]?.wholesalePrice && (
                    <span className="text-sm text-muted-foreground ml-2">
                      Wholesale: {formatCurrency(product.variants[0].wholesalePrice)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <Input
                      type="number"
                      placeholder="Discount (IDR)"
                      value={cartDiscount || ''}
                      onChange={(e) => setCartDiscount(Number(e.target.value) || 0)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(cartSubtotal)}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm text-destructive">
                      <span>Discount:</span>
                      <span>-{formatCurrency(cartDiscount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taxEnabled}
                        onChange={(e) => setTaxEnabled(e.target.checked)}
                        className="rounded"
                      />
                      <span>Tax (10%):</span>
                    </label>
                    <span>{formatCurrency(cartTax)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearCart} className="flex-1">
                    Clear
                  </Button>
                  <Button onClick={handleCheckout} className="flex-1">
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
