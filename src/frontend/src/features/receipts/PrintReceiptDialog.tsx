import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ReceiptTemplate } from './ReceiptTemplate';
import { Printer } from 'lucide-react';

interface PrintReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
}

export function PrintReceiptDialog({ open, onOpenChange, transaction }: PrintReceiptDialogProps) {
  const [width, setWidth] = useState<'58mm' | '80mm'>('58mm');

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Receipt Width</Label>
            <RadioGroup value={width} onValueChange={(v) => setWidth(v as '58mm' | '80mm')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="58mm" id="58mm" />
                <Label htmlFor="58mm">58mm (Thermal)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="80mm" id="80mm" />
                <Label htmlFor="80mm">80mm (Standard)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="border rounded-lg p-4 bg-muted">
            <ReceiptTemplate transaction={transaction} width={width} />
          </div>

          <Button onClick={handlePrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
