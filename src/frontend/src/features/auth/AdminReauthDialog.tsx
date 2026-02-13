import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Loader2, ShieldCheck } from 'lucide-react';

interface AdminReauthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  action: string;
}

export function AdminReauthDialog({ open, onOpenChange, onSuccess, action }: AdminReauthDialogProps) {
  const { login, loginStatus } = useInternetIdentity();

  const handleReauth = async () => {
    try {
      await login();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Reauth failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle>Admin Authorization Required</DialogTitle>
          <DialogDescription>
            This action ({action}) requires admin authorization. Please authenticate to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleReauth} disabled={loginStatus === 'logging-in'} className="flex-1">
            {loginStatus === 'logging-in' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authorizing...
              </>
            ) : (
              'Authorize'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
