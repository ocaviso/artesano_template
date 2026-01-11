import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

export function CartSheet() {
  const { items, total, updateQuantity, removeItem, itemCount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="font-heading font-semibold text-xl mb-2">Carrinho vazio</h3>
        <p className="text-muted-foreground text-center mb-6">
          Adicione itens deliciosos do nosso cardápio!
        </p>
        <Button onClick={() => navigate('/')} className="gradient-primary border-0">
          Ver Cardápio
        </Button>
      </div>
    );
  }

  const deliveryFee = 5.90;
  const finalTotal = total + deliveryFee;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto py-4">
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="p-3">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                  {item.category === 'burgers' && '🍔'}
                  {item.category === 'sides' && '🍟'}
                  {item.category === 'drinks' && '🥤'}
                  {item.category === 'desserts' && '🍫'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-primary font-semibold text-sm mt-1">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-7 h-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-5 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-7 h-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 pb-6 space-y-4 bg-background">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({itemCount} itens)</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de entrega</span>
            <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-heading font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <Button
          className="w-full h-12 text-base font-semibold gradient-primary border-0 shadow-food gap-2"
          onClick={() => navigate('/checkout')}
        >
          Continuar
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
