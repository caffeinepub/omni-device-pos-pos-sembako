import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, XCircle, Clock, Info } from 'lucide-react';
import { getSyncQueue, processSyncQueue } from '../../offline/syncQueue';
import { formatDateTime } from '../../i18n/format';
import { toast } from 'sonner';

export function SyncStatusPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  const loadQueue = async () => {
    const items = await getSyncQueue();
    setQueue(items);
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await processSyncQueue();
      setLastSync(Date.now());
      toast.success('Sync completed successfully');
      await loadQueue();
    } catch (error) {
      toast.error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const pendingCount = queue.filter((item) => item.status === 'pending').length;
  const failedCount = queue.filter((item) => item.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sync Status</h1>
          <p className="text-muted-foreground mt-2">Monitor offline data synchronization</p>
        </div>
        <Button onClick={handleSync} disabled={syncing || pendingCount === 0}>
          {syncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </>
          )}
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Conflict Policy: Last-Write-Wins</AlertTitle>
        <AlertDescription>
          When conflicts occur during synchronization, the most recent update will be applied. This is suitable for single-outlet operations where concurrent updates are rare.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Items waiting to sync</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCount}</div>
            <p className="text-xs text-muted-foreground">Items with errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {lastSync ? formatDateTime(lastSync) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">Most recent sync</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No items in sync queue</p>
          ) : (
            <div className="space-y-2">
              {queue.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{item.type} - {item.operation}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      item.status === 'pending' ? 'default' :
                      item.status === 'synced' ? 'secondary' :
                      'destructive'
                    }>
                      {item.status}
                    </Badge>
                    {item.attempts > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {item.attempts} attempts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
