import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, XCircle } from 'lucide-react';
import { t } from '../../i18n/t';

interface CameraBarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function CameraBarcodeScanner({ onScan }: CameraBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsScanning(true);
        }
      } catch (err) {
        setError(t('camera.failedAccess'));
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleManualInput = () => {
    const barcode = prompt(t('pos.enterBarcode'));
    if (barcode) {
      onScan(barcode);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className="glass-card">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden glass-elevated">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-12 w-12 text-white animate-pulse" />
          </div>
        )}
      </div>
      <Button onClick={handleManualInput} variant="outline" className="w-full glass-button rounded-xl">
        {t('pos.enterBarcodeManually')}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        {t('pos.positionBarcode')}
      </p>
    </div>
  );
}
