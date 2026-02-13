import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, AlertCircle, FileText } from 'lucide-react';
import { useMasterData } from '../../offline/masterDataCache';
import { exportProductsCsv, importProductsCsv } from '../../utils/csvParse';
import { toast } from 'sonner';
import { t } from '../../i18n/t';

export function ProductCsvPage() {
  const { data: products } = useMasterData('products');
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleExport = () => {
    try {
      exportProductsCsv(products || []);
      toast.success(t('csv.exportSuccess'));
    } catch (error) {
      toast.error(`${t('csv.exportFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setErrors([]);

    try {
      const result = await importProductsCsv(file);
      if (result.errors.length > 0) {
        setErrors(result.errors);
        toast.error(`${t('csv.importCompletedWithErrors')} ${result.errors.length}`);
      } else {
        toast.success(`${result.imported} ${t('csv.importSuccess')}`);
      }
    } catch (error) {
      toast.error(`${t('csv.importFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('csv.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('csv.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t('csv.exportProducts')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('csv.exportDescription')}
            </p>
            <Button onClick={handleExport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {t('csv.exportToCsv')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('csv.importProducts')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('csv.importDescription')}
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={importing}
            />
            {importing && <p className="text-sm text-muted-foreground">{t('csv.importing')}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('csv.csvFormat')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('csv.csvFormatDescription')}
          </p>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div className="font-semibold mb-2">{t('csv.csvExample')}</div>
            <div className="text-xs">
              nama;idKategori;sku;barcode;hargaEceran;hargaGrosir;hargaPokok;aktif<br />
              Beras Premium;1;BRS001;1234567890123;15000;14000;12000;true<br />
              Minyak Goreng;1;MYK001;9876543210987;25000;23000;20000;true
            </div>
          </div>
          <div className="text-sm space-y-1">
            <p><strong>nama</strong>: {t('catalog.productName')}</p>
            <p><strong>idKategori</strong>: {t('catalog.category')} ID</p>
            <p><strong>sku</strong>: {t('catalog.sku')}</p>
            <p><strong>barcode</strong>: {t('catalog.barcode')}</p>
            <p><strong>hargaEceran</strong>: {t('catalog.retailPrice')}</p>
            <p><strong>hargaGrosir</strong>: {t('catalog.wholesalePrice')}</p>
            <p><strong>hargaPokok</strong>: {t('catalog.cost')}</p>
            <p><strong>aktif</strong>: {t('common.status')} (true/false)</p>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">{t('csv.importErrors')}</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {errors.slice(0, 10).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
              {errors.length > 10 && (
                <li className="text-muted-foreground">
                  ... dan {errors.length - 10} kesalahan lainnya
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
