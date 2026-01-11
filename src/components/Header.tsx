import { ShoppingCart, MapPin, Clock, Loader2, Navigation } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Header() {
  const { itemCount, total, userLocation, detectUserLocation, isLocating } = useCart();
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
              Artesano<span className="text-primary">Burger</span>
            </h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>20-35 min</span>
            </div>
          </div>
        </div>

        {/* --- INÍCIO DA MUDANÇA: COMPONENTE DE LOCALIZAÇÃO --- */}
        <div 
          className={cn(
            "hidden md:flex items-center gap-2 text-sm transition-all cursor-pointer px-3 py-1.5 rounded-full hover:bg-muted group select-none",
            userLocation ? "text-foreground font-medium" : "text-muted-foreground"
          )}
          onClick={detectUserLocation}
          title={userLocation ? "Localização atual" : "Clique para detectar sua localização"}
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : userLocation ? (
            <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          ) : (
            <Navigation className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          )}
          
          <span className="max-w-[200px] truncate">
            {isLocating 
              ? "Localizando..." 
              : userLocation || "Onde você está?"}
          </span>
        </div>
        {/* --- FIM DA MUDANÇA --- */}

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