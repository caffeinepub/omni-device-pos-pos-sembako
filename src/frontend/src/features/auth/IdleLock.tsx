import { ReactNode, useEffect, useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Loader2 } from 'lucide-react';
import { t } from '../../i18n/t';

interface IdleLockProps {
  children: ReactNode;
}

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export function IdleLock({ children }: IdleLockProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    if (!identity) {
      setIsLocked(false);
      return;
    }

    const handleActivity = () => {
      setLastActivity(Date.now());
      if (isLocked) setIsLocked(false);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_TIMEOUT) {
        setIsLocked(true);
      }
    }, 10000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearInterval(interval);
    };
  }, [identity, lastActivity, isLocked]);

  const handleUnlock = () => {
    login();
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
      <Dialog open={isLocked}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="mx-auto mb-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
            </div>
            <DialogTitle>{t('auth.sessionLocked')}</DialogTitle>
            <DialogDescription>
              {t('auth.sessionLockedDescription')}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleUnlock} disabled={loginStatus === 'logging-in'} className="w-full">
            {loginStatus === 'logging-in' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.authenticating')}
              </>
            ) : (
              t('auth.unlockSession')
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
