import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '../../i18n/t';

export function ProfileSetupDialog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Cashier'>('Cashier');

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile({ name, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success(t('auth.profileCreated'));
    },
    onError: (error: Error) => {
      toast.error(`${t('auth.profileCreateFailed')}: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('auth.enterNameError'));
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('auth.completeProfile')}</DialogTitle>
          <DialogDescription>
            {t('auth.profileDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('auth.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.enterName')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t('auth.role')}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'Admin' | 'Cashier')}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">{t('auth.admin')}</SelectItem>
                <SelectItem value="Cashier">{t('auth.cashier')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.creatingProfile')}
              </>
            ) : (
              t('auth.continue')
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
