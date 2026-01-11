import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PixPayment } from '@/components/PixPayment';
import { useCart } from '@/context/CartContext';
import { Order, PixPaymentData } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    items, 
    total, 
    deliveryType, 
    deliveryAddress, 
    customerInfo,
    clearCart,
    setCurrentOrder,
    addOrder
  } = useCart();

  const deliveryFee = deliveryType === 'delivery' ? 5.90 : 0;
  const finalTotal = total + deliveryFee;

  // Generate mock Pix payment data
  const [pixData] = useState<PixPaymentData>(() => ({
    invoiceId: `inv_${Date.now()}`,
    qrCode: `00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}5204000053039865802BR5913SmashFast6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    qrCodeImageUrl: '',
    paymentUrl: 'https://pixwave.cash/pay/demo',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    price: finalTotal,
  }));

  const handlePaymentConfirmed = useCallback(() => {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const estimatedMinutes = deliveryType === 'delivery' ? 35 : 20;
    
    const newOrder: Order = {
      id: orderId,
      items: [...items],
      total: finalTotal,
      status: 'confirmed',
      createdAt: new Date(),
      deliveryType,
      address: deliveryAddress ? 
        `${deliveryAddress.street}, ${deliveryAddress.number} - ${deliveryAddress.neighborhood}` : 
        undefined,
      customerInfo: customerInfo || undefined,
      paymentStatus: 'paid',
      estimatedDelivery: new Date(Date.now() + estimatedMinutes * 60 * 1000),
      pixData,
    };

    addOrder(newOrder);
    setCurrentOrder(newOrder);
    clearCart();

    toast({
      title: 'Pagamento confirmado! 🎉',
      description: 'Seu pedido está sendo preparado',
    });

    navigate('/tracking');
  }, [items, finalTotal, deliveryType, deliveryAddress, customerInfo, pixData, addOrder, setCurrentOrder, clearCart, toast, navigate]);

  const handleExpired = useCallback(() => {
    toast({
      title: 'Código Pix expirado',
      description: 'Gere um novo código para continuar',
      variant: 'destructive',
    });
    navigate('/checkout');
  }, [toast, navigate]);

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b">
        <div className="container flex items-center h-16 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading font-semibold text-lg">Pagamento</h1>
        </div>
      </header>

      <div className="container py-6 max-w-md mx-auto">
        <PixPayment
          paymentData={pixData}
          onPaymentConfirmed={handlePaymentConfirmed}
          onExpired={handleExpired}
        />
      </div>
    </div>
  );
};

export default Payment;
