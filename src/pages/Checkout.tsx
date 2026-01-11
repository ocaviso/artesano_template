import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DeliveryTypeSelector } from '@/components/DeliveryTypeSelector';
import { AddressForm } from '@/components/AddressForm';
import { CustomerForm } from '@/components/CustomerForm';
import { useCart } from '@/context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, deliveryType } = useCart();
  const [showPayment, setShowPayment] = useState(false);

  const deliveryFee = deliveryType === 'delivery' ? 5.90 : 0;
  const finalTotal = total + deliveryFee;

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  const handleFormSubmit = () => {
    navigate('/payment');
  };

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
          <h1 className="font-heading font-semibold text-lg">Finalizar Pedido</h1>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        {/* Order Summary */}
        <Card className="p-4">
          <h3 className="font-heading font-semibold mb-3">Resumo do Pedido</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.name}
                </span>
                <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de entrega</span>
              <span>{deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'Grátis'}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-heading font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </Card>

        {/* Delivery Type */}
        <div>
          <h3 className="font-heading font-semibold mb-3">Como deseja receber?</h3>
          <DeliveryTypeSelector />
        </div>

        {/* Address or Vehicle Form */}
        <Card className="p-4">
          {deliveryType === 'delivery' ? (
            <AddressForm onSubmit={handleFormSubmit} />
          ) : (
            <CustomerForm onSubmit={handleFormSubmit} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
