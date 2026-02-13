import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Package, FolderPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMasterData } from '../../offline/masterDataCache';
import { saveMasterData, queueForSync } from '../../offline/storage';
import { toast } from 'sonner';
import { formatCurrency } from '../../i18n/format';
import { t } from '../../i18n/t';

export function CatalogPage() {
  const { data: products, refetch: refetchProducts } = useMasterData('products');
  const { data: categories, refetch: refetchCategories } = useMasterData('categories');
  const [showDialog, setShowDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sku: '',
    barcode: '',
    retailPrice: '',
    wholesalePrice: '',
    cost: '',
    active: true,
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    active: true,
  });

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const allCategories = categories || [];
      const newCategory = {
        id: Date.now(),
        name: categoryFormData.name,
        active: categoryFormData.active,
      };

      const updatedCategories = [...allCategories, newCategory];
      await saveMasterData('categories', updatedCategories);
      await queueForSync('category', 'create', newCategory);

      toast.success(t('catalog.categoryCreated'));
      setShowCategoryDialog(false);
      setCategoryFormData({ name: '', active: true });
      refetchCategories();
    } catch (error) {
      toast.error(`${t('catalog.categorySaveFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      toast.error(t('catalog.selectCategory'));
      return;
    }

    try {
      const allProducts = products || [];
      const newProduct = {
        id: editingProduct?.id || Date.now(),
        name: formData.name,
        categoryId: Number(formData.categoryId),
        active: formData.active,
        variants: [
          {
            id: editingProduct?.variants[0]?.id || Date.now(),
            name: 'Default',
            sku: formData.sku,
            barcode: formData.barcode,
            baseUnitId: 1,
            retailPrice: Number(formData.retailPrice),
            wholesalePrice: formData.wholesalePrice ? Number(formData.wholesalePrice) : undefined,
            cost: Number(formData.cost),
            active: formData.active,
          },
        ],
        units: [{ id: 1, name: 'pcs', conversionToBase: 1 }],
        stock: editingProduct?.stock || 0,
      };

      const updatedProducts = editingProduct
        ? allProducts.map((p: any) => (p.id === editingProduct.id ? newProduct : p))
        : [...allProducts, newProduct];

      await saveMasterData('products', updatedProducts);
      await queueForSync('product', editingProduct ? 'update' : 'create', newProduct);

      toast.success(editingProduct ? t('catalog.productUpdated') : t('catalog.productCreated'));
      setShowDialog(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        categoryId: '',
        sku: '',
        barcode: '',
        retailPrice: '',
        wholesalePrice: '',
        cost: '',
        active: true,
      });
      refetchProducts();
    } catch (error) {
      toast.error(`${t('catalog.productSaveFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    const variant = product.variants[0];
    setFormData({
      name: product.name,
      categoryId: String(product.categoryId),
      sku: variant.sku,
      barcode: variant.barcode || '',
      retailPrice: String(variant.retailPrice),
      wholesalePrice: variant.wholesalePrice ? String(variant.wholesalePrice) : '',
      cost: String(variant.cost),
      active: product.active,
    });
    setShowDialog(true);
  };

  const hasCategories = categories && categories.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('catalog.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('catalog.description')}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                {t('catalog.manageCategories')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('catalog.categoryManagement')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">{t('catalog.categoryName')}</Label>
                  <Input
                    id="categoryName"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryActive">{t('common.status')}</Label>
                  <select
                    id="categoryActive"
                    value={categoryFormData.active ? 'true' : 'false'}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, active: e.target.value === 'true' })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="true">{t('common.active')}</option>
                    <option value="false">{t('common.inactive')}</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit">
                    {t('catalog.addCategory')}
                  </Button>
                </div>
              </form>

              {hasCategories && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">{t('catalog.categoryList')}</h3>
                  <div className="space-y-2">
                    {categories.map((cat: any) => (
                      <div key={cat.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{cat.name}</span>
                        <Badge variant={cat.active ? 'default' : 'secondary'}>
                          {cat.active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '',
                  categoryId: '',
                  sku: '',
                  barcode: '',
                  retailPrice: '',
                  wholesalePrice: '',
                  cost: '',
                  active: true,
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                {t('catalog.addProduct')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? t('catalog.editProduct') : t('catalog.addProduct')}</DialogTitle>
              </DialogHeader>

              {!hasCategories && (
                <Alert>
                  <AlertDescription>
                    {t('catalog.noCategoriesAvailable')}. {t('catalog.createCategoryFirst')}.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('catalog.productName')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">{t('catalog.category')}</Label>
                    <select
                      id="category"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      required
                      disabled={!hasCategories}
                    >
                      <option value="">{t('catalog.selectCategory')}</option>
                      {(categories || []).filter((cat: any) => cat.active).map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">{t('catalog.sku')}</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">{t('catalog.barcode')}</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retailPrice">{t('catalog.retailPrice')}</Label>
                    <Input
                      id="retailPrice"
                      type="number"
                      value={formData.retailPrice}
                      onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesalePrice">{t('catalog.wholesalePrice')}</Label>
                    <Input
                      id="wholesalePrice"
                      type="number"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">{t('catalog.cost')}</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="active">{t('common.status')}</Label>
                    <select
                      id="active"
                      value={formData.active ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="true">{t('common.active')}</option>
                      <option value="false">{t('common.inactive')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={!hasCategories}>
                    {editingProduct ? t('common.update') : t('common.create')} {t('catalog.products')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('catalog.products')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('catalog.productName')}</TableHead>
                <TableHead>{t('catalog.sku')}</TableHead>
                <TableHead>{t('catalog.barcode')}</TableHead>
                <TableHead>{t('catalog.retailPrice')}</TableHead>
                <TableHead>{t('catalog.wholesalePrice')}</TableHead>
                <TableHead>{t('catalog.stock')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products || []).map((product: any) => {
                const variant = product.variants[0];
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{variant?.sku}</TableCell>
                    <TableCell>{variant?.barcode || '-'}</TableCell>
                    <TableCell>{formatCurrency(variant?.retailPrice || 0)}</TableCell>
                    <TableCell>
                      {variant?.wholesalePrice ? formatCurrency(variant.wholesalePrice) : '-'}
                    </TableCell>
                    <TableCell>{product.stock || 0}</TableCell>
                    <TableCell>
                      <Badge variant={product.active ? 'default' : 'secondary'}>
                        {product.active ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
