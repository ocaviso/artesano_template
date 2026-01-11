import { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  ChefHat, 
  Package, 
  Truck, 
  Car,
  Clock,
  MapPin
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OrderTrackingProps {
  order: Order;
  onArrived?: () => void;
}

const statusConfig: Record<OrderStatus, {
  label: string;
  icon: typeof CheckCircle2;
  progress: number;
  description: string;
}> = {
  pending_payment: {
    label: 'Aguardando Pagamento',
    icon: Clock,
    progress: 0,
    description: 'Complete o pagamento para confirmar',
  },
  confirmed: {
    label: 'Pedido Confirmado',
    icon: CheckCircle2,
    progress: 20,
    description: 'Seu pedido foi recebido!',
  },
  preparing: {
    label: 'Preparando',
    icon: ChefHat,
    progress: 40,
    description: 'Estamos preparando seu pedido',
  },
  ready: {
    label: 'Pronto',
    icon: Package,
    progress: 60,
    description: 'Seu pedido está pronto!',
  },
  out_for_delivery: {
    label: 'Saiu para Entrega',
    icon: Truck,
    progress: 80,
    description: 'Pedido a caminho',
  },
  waiting_pickup: {
    label: 'Aguardando Retirada',
    icon: Car,
    progress: 80,
    description: 'Venha buscar seu pedido',
  },
  delivered: {
    label: 'Entregue',
    icon: CheckCircle2,
    progress: 100,
    description: 'Aproveite sua refeição!',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle2,
    progress: 100,
    description: 'Obrigado pela preferência!',
  },
};

export function OrderTracking({ order, onArrived }: OrderTrackingProps) {
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  useEffect(() => {
    if (order.estimatedDelivery) {
      const updateTimer = () => {
        const now = Date.now();
        const delivery = new Date(order.estimatedDelivery!).getTime();
        const remaining = Math.max(0, Math.floor((delivery - now) / 60000));
        setEstimatedTime(remaining);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }
  }, [order.estimatedDelivery]);

  const steps = order.deliveryType === 'delivery'
    ? ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
    : ['confirmed', 'preparing', 'ready', 'waiting_pickup', 'completed'];

  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={cn(
          "inline-flex items-center justify-center w-20 h-20 rounded-full mb-4",
          order.status === 'delivered' || order.status === 'completed'
            ? "bg-success/10 text-success"
            : "gradient-primary text-primary-foreground"
        )}>
          <StatusIcon className="w-10 h-10" />
        </div>
        <h2 className="font-heading font-bold text-2xl mb-1">
          {config.label}
        </h2>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      {estimatedTime > 0 && order.status !== 'delivered' && order.status !== 'completed' && (
        <Card className="p-4 text-center bg-primary/5 border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Tempo estimado</span>
          </div>
          <span className="font-heading font-bold text-3xl text-primary">
            {estimatedTime} min
          </span>
        </Card>
      )}

      <div className="space-y-2">
        <Progress value={config.progress} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const stepConfig = statusConfig[step as OrderStatus];
            const StepIcon = stepConfig.icon;
            const isPast = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div
                key={step}
                className={cn(
                  "flex flex-col items-center gap-1",
                  isPast || isCurrent ? "text-primary" : "text-muted-foreground/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isPast ? "bg-primary text-primary-foreground" :
                  isCurrent ? "gradient-primary text-primary-foreground animate-pulse-slow" :
                  "bg-muted"
                )}>
                  <StepIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-center max-w-[60px] leading-tight">
                  {stepConfig.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {order.deliveryType === 'curbside' && order.status === 'ready' && (
        <Card className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Seu pedido está pronto!</h4>
              <p className="text-sm text-muted-foreground">
                Dirija até nossa loja e clique em "Cheguei" quando estiver no drive-thru.
              </p>
            </div>
          </div>
          
          {order.vehicleInfo && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Seu veículo: </span>
              <span className="font-medium">
                {order.vehicleInfo.model} {order.vehicleInfo.color} - {order.vehicleInfo.plate}
              </span>
            </div>
          )}

          <Button
            className="w-full gradient-accent border-0 shadow-food"
            onClick={onArrived}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Cheguei!
          </Button>
        </Card>
      )}

      <Card className="p-4">
        <h4 className="font-medium mb-3">Resumo do Pedido #{order.id.slice(-6)}</h4>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity}x {item.name}
              </span>
              <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 flex justify-between font-medium">
            <span>Total</span>
            <span className="text-primary">
              R$ {order.total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
