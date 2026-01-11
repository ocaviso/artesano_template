import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Loader2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PixPaymentData } from '@/types';

interface PixPaymentProps {
  paymentData: PixPaymentData;
  onPaymentConfirmed: () => void;
  onExpired: () => void;
}

export function PixPayment({ paymentData, onPaymentConfirmed, onExpired }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const expiresAt = new Date(paymentData.expiresAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        onExpired();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [paymentData.expiresAt, onExpired]);

  // Simulate payment confirmation (in production, use webhooks)
  useEffect(() => {
    const checkPayment = setInterval(() => {
      // Simulated: in real app, this would poll the API or wait for webhook
      const simulatePayment = Math.random() > 0.98;
      if (simulatePayment) {
        onPaymentConfirmed();
      }
    }, 3000);

    return () => clearInterval(checkPayment);
  }, [onPaymentConfirmed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentData.qrCode);
      setCopied(true);
      toast({
        title: 'Código copiado!',
        description: 'Cole no app do seu banco para pagar',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success mb-4">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium">Aguardando pagamento</span>
        </div>
        <h2 className="font-heading font-bold text-2xl mb-2">
          Pague com Pix
        </h2>
        <p className="text-muted-foreground">
          Escaneie o QR Code ou copie o código
        </p>
      </div>

      <Card className="p-6 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-card mb-4">
          <QRCodeSVG
            value={paymentData.qrCode}
            size={200}
            level="H"
            includeMargin
            className="rounded-lg"
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-lg font-heading font-bold mb-4">
          <span className="text-muted-foreground text-sm font-normal">Expira em:</span>
          <span className={timeLeft < 60 ? 'text-destructive' : 'text-foreground'}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="text-3xl font-heading font-bold text-primary mb-6">
          R$ {paymentData.price.toFixed(2).replace('.', ',')}
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar código Pix
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full gap-2 text-muted-foreground"
            onClick={() => window.open(paymentData.paymentUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Abrir página de pagamento
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-3 py-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          Confirmação automática após pagamento
        </span>
      </div>

      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          Como pagar com Pix?
        </h4>
        <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Escolha pagar com Pix</li>
          <li>Escaneie o QR Code ou cole o código</li>
          <li>Confirme o pagamento</li>
        </ol>
      </Card>
    </div>
  );
}
