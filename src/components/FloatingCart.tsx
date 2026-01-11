import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function FloatingCart() {
  const { itemCount, total } = useCart();
  const navigate = useNavigate();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none z-50">
      <Button
        className="w-full h-14 text-base font-semibold gradient-primary border-0 shadow-food pointer-events-auto"
        onClick={() => navigate('/cart')}
      >
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">R$ {total.toFixed(2).replace('.', ',')}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Button>
    </div>
  );
}
