import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // Caso não tenha imagem, usa SVG
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PixPaymentData } from '@/types';

interface PixPaymentProps {
  paymentData: Pick<PixPaymentData, 'qrCode' | 'qrCodeImageUrl' | 'expiresAt' | 'price'>;
  onPaymentConfirmed: () => void;
  onExpired: () => void;
}

export function PixPayment({ paymentData, onExpired }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { toast } = useToast();

  // Timer de expiração real baseado na data da API
  useEffect(() => {
    if (!paymentData.expiresAt) return;
    
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
        description: 'Tente selecionar e copiar manualmente',
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning mb-4">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span className="text-sm font-medium">Aguardando pagamento...</span>
        </div>
        <h2 className="font-heading font-bold text-2xl mb-2">
          Pague com Pix
        </h2>
        <p className="text-muted-foreground">
          Valor: <span className="font-bold text-foreground">R$ {paymentData.price?.toFixed(2).replace('.', ',')}</span>
        </p>
      </div>

      <Card className="p-6 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-card mb-4 min-h-[200px] min-w-[200px]">
          {paymentData.qrCodeImageUrl ? (
             <img 
               src={paymentData.qrCodeImageUrl} 
               alt="QR Code Pix" 
               className="rounded-lg max-w-[220px] h-auto"
             />
          ) : (
            <QRCodeSVG
              value={paymentData.qrCode}
              size={200}
              level="H"
              includeMargin
              className="rounded-lg"
            />
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-lg font-heading font-bold mb-4">
          <span className="text-muted-foreground text-sm font-normal">Expira em:</span>
          <span className={timeLeft < 60 ? 'text-destructive' : 'text-foreground'}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-muted-foreground break-all px-4 py-2 bg-muted rounded border border-dashed mb-2 select-all">
            {paymentData.qrCode}
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 h-12"
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
        </div>
      </Card>

      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          Como pagar?
        </h4>
        <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Escolha pagar com Pix Copia e Cola</li>
          <li>Cole o código acima ou escaneie o QR Code</li>
          <li>Após pagar, aguarde a confirmação nesta tela</li>
        </ol>
      </Card>
    </div>
  );
}