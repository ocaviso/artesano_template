import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DeliveryTypeSelector } from '@/components/DeliveryTypeSelector';
import { AddressForm } from '@/components/AddressForm';
import { CustomerForm } from '@/components/CustomerForm';
import { StoreMap } from '@/components/StoreMap'; // Componente que você já criou
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react'; // Adicione useEffect
import { pixel } from '@/lib/pixel'; // Importe o utilitário

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, total, deliveryType, selectedStore } = useCart();
  
  // Taxa de entrega (Grátis para retirada)
  const deliveryFee = deliveryType === 'delivery' ? 5.90 : 0;
  const finalTotal = total + deliveryFee;

  // --- Dispara evento ao entrar na tela ---
  useEffect(() => {
    if (items.length > 0) {
      pixel.initiateCheckout({
        value: finalTotal,
        currency: 'BRL',
        num_items: items.length,
        content_ids: items.map(item => item.id)
      });
    }
  }, []);

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  const handleFormSubmit = () => {
    // Validação extra para retirada
    if (deliveryType === 'curbside' && !selectedStore) {
        toast({
            title: "Selecione uma loja",
            description: "Por favor, escolha no mapa onde deseja retirar seu pedido.",
            variant: "destructive"
        });
        return;
    }
    // Se passou na validação do formulário (que chama essa função) e da loja, vai para pagamento
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

        {/* Dynamic Forms */}
        <Card className="p-4">
          {deliveryType === 'delivery' ? (
            // Formulário de Entrega (Endereço + Dados Pessoais)
            <AddressForm onSubmit={handleFormSubmit} />
          ) : (
            // Fluxo de Retirada (Mapa + Dados Pessoais)
            <div className="space-y-6">
              <StoreMap /> 
              
              <Separator />
              
              <CustomerForm onSubmit={handleFormSubmit} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Checkout;