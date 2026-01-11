import { Plus, Minus, Star } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  
  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(item);
  };

  const handleIncrease = () => {
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity === 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, quantity - 1);
    }
  };

return (
  <Card className={cn(
    "group overflow-hidden transition-all duration-300 hover:shadow-card flex flex-col h-full", // Adicionado flex-col e h-full
    quantity > 0 && "ring-2 ring-primary/50"
  )}>
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {/* CORREÇÃO: Substituído emojis pela tag img */}
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback visual caso a imagem não carregue
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
            e.currentTarget.parentElement!.innerHTML += `<span class="text-4xl">🍔</span>`;
          }}
        />
        
        {item.popular && (
          <Badge className="absolute top-2 left-2 gap-1 bg-secondary text-secondary-foreground border-0 z-10">
            <Star className="w-3 h-3 fill-current" />
            Popular
          </Badge>
        )}
        {quantity > 0 && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground z-10">
            {quantity}
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col h-full"> {/* Adicionado flex flex-col h-full */}
        <div className="flex-1"> {/* Conteúdo principal ocupa o espaço disponível */}
          <h3 className="font-heading font-semibold text-base mb-1 line-clamp-2 leading-tight min-h-[2.5rem]"> {/* line-clamp-2 para títulos longos */}
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[3.75rem]"> {/* Aumentado para 3 linhas e altura mínima */}
            {item.description}
          </p>
        </div>
        
        {/* Bloco de Preço e Ação movido para baixo e reestruturado */}
        <div className="mt-auto flex flex-col gap-3"> {/* mt-auto empurra para o fundo */}
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-lg text-primary">
              R$ {item.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {quantity === 0 ? (
            <Button
              size="sm"
              className="w-full gap-1 gradient-primary border-0 shadow-food hover:opacity-90" // w-full para botão cheio
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-muted/30 rounded-lg p-1 border border-border"> {/* Container mais bonito para o contador */}
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 hover:bg-background rounded-md text-muted-foreground"
                onClick={handleDecrease}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="flex-1 text-center font-bold text-sm">
                {quantity}
              </span>
              <Button
                size="icon"
                className="w-8 h-8 gradient-primary border-0 rounded-md text-primary-foreground shadow-sm"
                onClick={handleIncrease}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}