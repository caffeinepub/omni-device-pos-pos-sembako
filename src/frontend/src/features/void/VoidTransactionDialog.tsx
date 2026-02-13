import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminReauthDialog } from '../auth/AdminReauthDialog';
import { toast } from 'sonner';

interface VoidTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: number;
}

export function VoidTransactionDialog({ open, onOpenChange, transactionId }: VoidTransactionDialogProps) {
  const [reason, setReason] = useState('');
  const [showReauth, setShowReauth] = useState(false);

  const handleVoid = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for voiding');
      return;
    }
    setShowReauth(true);
  };

  const handleReauthSuccess = () => {
    toast.success('Transaction voided successfully');
    onOpenChange(false);
    setReason('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Transaction #{transactionId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Void</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleVoid}>
                Void Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AdminReauthDialog
        open={showReauth}
        onOpenChange={setShowReauth}
        onSuccess={handleReauthSuccess}
        action="void transaction"
      />
    </>
  );
}
