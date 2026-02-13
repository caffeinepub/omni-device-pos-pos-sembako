import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Monitor, CheckCircle, Download, Info } from 'lucide-react';
import { SiApple, SiAndroid, SiGooglechrome } from 'react-icons/si';
import { useInstallPrompt } from '../../pwa/useInstallPrompt';
import { toast } from 'sonner';
import { t, tArray } from '../../i18n/t';

export function PwaInstallGuidePage() {
  const { canInstall, install, isInstalled } = useInstallPrompt();

  const handleInstall = async () => {
    try {
      const success = await install();
      if (success) {
        toast.success(t('pwa.installSuccess'));
      } else {
        toast.error(t('pwa.installFailed'));
      }
    } catch (error) {
      toast.error(`${t('pwa.installFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('pwa.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('pwa.description')}
        </p>
      </div>

      {isInstalled && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {t('pwa.alreadyInstalled')}
          </AlertDescription>
        </Alert>
      )}

      {canInstall && !isInstalled && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t('pwa.installNow')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browser Anda mendukung instalasi langsung. Klik tombol di bawah untuk menginstal aplikasi.
            </p>
            <Button onClick={handleInstall} size="lg" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {t('pwa.installNow')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('pwa.benefits')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tArray('pwa.benefitsList').map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SiAndroid className="h-5 w-5" />
              {t('pwa.androidTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {tArray('pwa.androidSteps').map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="font-semibold text-primary">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SiApple className="h-5 w-5" />
              {t('pwa.iosTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {tArray('pwa.iosSteps').map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="font-semibold text-primary">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {t('pwa.desktopTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {tArray('pwa.desktopSteps').map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="font-semibold text-primary">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pwa.troubleshooting')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {tArray('pwa.troubleshootingSteps').map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
