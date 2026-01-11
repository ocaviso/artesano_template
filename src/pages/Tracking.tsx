import { useEffect, useState } from 'react';
import { Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OrderTracking } from '@/components/OrderTracking';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { OrderStatus } from '@/types';

const Tracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrder, setCurrentOrder, updateOrderStatus } = useCart();
  const [simulatedStatus, setSimulatedStatus] = useState<OrderStatus>('confirmed');

  // Simulate order status progression
  useEffect(() => {
    if (!currentOrder) return;

    const statusFlow: OrderStatus[] = currentOrder.deliveryType === 'delivery'
      ? ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
      : ['confirmed', 'preparing', 'ready'];

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < statusFlow.length - 1) {
        currentIndex++;
        const newStatus = statusFlow[currentIndex];
        setSimulatedStatus(newStatus);
        updateOrderStatus(currentOrder.id, newStatus);
        setCurrentOrder({ ...currentOrder, status: newStatus });
      } else {
        clearInterval(interval);
      }
    }, 8000); // Progress every 8 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const handleArrived = () => {
    if (currentOrder) {
      const newStatus: OrderStatus = 'waiting_pickup';
      setSimulatedStatus(newStatus);
      updateOrderStatus(currentOrder.id, newStatus);
      setCurrentOrder({ ...currentOrder, status: newStatus });
      
      toast({
        title: 'Notificamos a equipe! 🚗',
        description: 'Seu pedido será entregue em instantes',
      });

      // Simulate completion
      setTimeout(() => {
        const completedStatus: OrderStatus = 'completed';
        setSimulatedStatus(completedStatus);
        updateOrderStatus(currentOrder.id, completedStatus);
        setCurrentOrder({ ...currentOrder, status: completedStatus });
        
        toast({
          title: 'Pedido entregue! 🎉',
          description: 'Obrigado pela preferência',
        });
      }, 5000);
    }
  };

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">🍔</div>
        <h2 className="font-heading font-bold text-xl mb-2">Nenhum pedido ativo</h2>
        <p className="text-muted-foreground mb-6 text-center">
          Faça um pedido para acompanhar aqui
        </p>
        <Button onClick={() => navigate('/')} className="gradient-primary border-0">
          <Home className="w-4 h-4 mr-2" />
          Ver Cardápio
        </Button>
      </div>
    );
  }

  const displayOrder = { ...currentOrder, status: simulatedStatus };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="font-heading font-semibold text-lg">Acompanhar Pedido</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Início
          </Button>
        </div>
      </header>

      <div className="container py-6 max-w-md mx-auto">
        <OrderTracking 
          order={displayOrder}
          onArrived={handleArrived}
        />

        {(displayOrder.status === 'delivered' || displayOrder.status === 'completed') && (
          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setCurrentOrder(null);
                navigate('/');
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Fazer Novo Pedido
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;
