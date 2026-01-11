import { ShoppingCart, MapPin, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const { itemCount, total } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isCartPage = location.pathname === '/cart';

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b shadow-sm">
      <div className="container flex items-center justify-between h-16">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-food">
            <span className="text-xl">🍔</span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg leading-tight">
              Smash<span className="text-primary">Fast</span>
            </h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>20-35 min</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Entrega para sua região</span>
        </div>

        {!isCartPage && (
          <Button
            variant="outline"
            className="relative gap-2 border-primary/20 hover:border-primary hover:bg-primary/5"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">
              {total > 0 ? `R$ ${total.toFixed(2).replace('.', ',')}` : 'Carrinho'}
            </span>
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs gradient-primary border-0">
                {itemCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
