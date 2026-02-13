import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Download, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import { getAllTransactions } from '../../offline/storage';
import { formatCurrency, formatDate } from '../../i18n/format';
import { calculateDailySummary, calculateProductSales } from './reportCalculations';
import { exportReportCsv } from '../../utils/csvExport';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { t } from '../../i18n/t';

export function ReportsPage() {
  const [startDate, setStartDate] = useState(formatDate(Date.now() - 7 * 24 * 60 * 60 * 1000).split(' ')[0]);
  const [endDate, setEndDate] = useState(formatDate(Date.now()).split(' ')[0]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const txs = await getAllTransactions();
      setTransactions(txs);
    };
    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
    return transactions.filter((tx) => tx.timestamp >= start && tx.timestamp < end);
  }, [transactions, startDate, endDate]);

  const dailySummary = useMemo(() => calculateDailySummary(filteredTransactions), [filteredTransactions]);
  const productSales = useMemo(() => calculateProductSales(filteredTransactions), [filteredTransactions]);

  const handleExport = () => {
    try {
      exportReportCsv(productSales, `sales-report-${startDate}-to-${endDate}`);
      toast.success(t('reports.exportSuccess'));
    } catch (error) {
      toast.error(`${t('reports.exportFailed')}: ${error instanceof Error ? error.message : t('common.error')}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('reports.description')}</p>
        </div>
        <Button onClick={handleExport} className="glass-button rounded-xl">
          <Download className="mr-2 h-4 w-4" />
          {t('reports.exportCsv')}
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('reports.dateRange')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('reports.startDate')}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t('reports.endDate')}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dailySummary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {dailySummary.transactionCount} {t('reports.transactions')}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.averageTransaction')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dailySummary.averageTransaction)}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.perTransaction')}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.itemsSold')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailySummary.itemsSold}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.totalUnits')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('reports.productSales')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('inventory.product')}</TableHead>
                <TableHead className="text-right">{t('reports.quantitySold')}</TableHead>
                <TableHead className="text-right">{t('reports.revenue')}</TableHead>
                <TableHead className="text-right">{t('reports.avgPrice')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productSales.map((product) => (
                <TableRow key={product.name}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.avgPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
