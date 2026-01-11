import { Truck, Car } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export function DeliveryTypeSelector() {
  const { deliveryType, setDeliveryType } = useCart();

  const options = [
    {
      id: 'delivery' as const,
      icon: Truck,
      title: 'Entrega',
      description: 'Receba em casa',
      time: '25-40 min',
    },
    {
      id: 'curbside' as const,
      icon: Car,
      title: 'Retire na Loja',
      description: 'Drive-thru',
      time: '15-20 min',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = deliveryType === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => setDeliveryType(option.id)}
            className={cn(
              "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
              isActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
              isActive ? "gradient-primary text-primary-foreground" : "bg-muted"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-semibold mb-0.5">{option.title}</h4>
            <p className="text-xs text-muted-foreground">{option.description}</p>
            <span className={cn(
              "absolute top-3 right-3 text-xs font-medium",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {option.time}
            </span>
          </button>
        );
      })}
    </div>
  );
}
