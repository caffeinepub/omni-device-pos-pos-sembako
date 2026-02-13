import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Undo2 } from 'lucide-react';
import { toast } from 'sonner';

export function ReturnFlowPage() {
  const [transactionId, setTransactionId] = useState('');

  const handleSearch = () => {
    if (!transactionId) {
      toast.error('Please enter a transaction ID');
      return;
    }
    toast.info('Return functionality will be implemented with backend integration');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Returns & Refunds</h1>
        <p className="text-muted-foreground mt-2">Process customer returns and refunds</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Undo2 className="h-5 w-5" />
            Find Transaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID"
            />
          </div>
          <Button onClick={handleSearch} className="w-full">
            Search Transaction
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Returns must be initiated within 30 days of purchase</p>
          <p>• Original receipt or transaction ID required</p>
          <p>• Items must be in original condition</p>
          <p>• Admin authorization required for all refunds</p>
        </CardContent>
      </Card>
    </div>
  );
}
