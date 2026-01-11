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
      <div className="container flex items-center justify-between h-16 px-4"> {/* Adicionado px-4 para margem segura no mobile */}
        <div 
          className="flex items-center gap-2 md:gap-3 cursor-pointer flex-shrink-0" // flex-shrink-0 impede o logo de amassar
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-food">
            <span className="text-lg md:text-xl">🍔</span>
          </div>
          <div className="hidden xs:block"> {/* Esconde texto em telas MUITO pequenas se necessário, ou mantem */}
            <h1 className="font-heading font-bold text-base md:text-lg leading-tight">
              Artesano<span className="text-primary">Burger</span>
            </h1>
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>20-35 min</span>
            </div>
          </div>
        </div>

        {/* ÁREA DE LOCALIZAÇÃO - VISÍVEL NO MOBILE AGORA */}
        <div 
          className={cn(
            "flex items-center gap-1 md:gap-2 text-xs md:text-sm transition-colors cursor-pointer px-2 md:px-3 py-1.5 rounded-full hover:bg-muted group select-none",
            "max-w-[140px] md:max-w-[250px]", // Limita largura no mobile
            userLocation ? "text-foreground font-medium" : "text-muted-foreground"
          )}
          onClick={detectUserLocation}
          title={userLocation || "Detectar localização"}
        >
          {isLocating ? (
            <Loader2 className="w-3 h-3 md:w-4 md:h-4 text-primary animate-spin flex-shrink-0" />
          ) : userLocation ? (
            <MapPin className="w-3 h-3 md:w-4 md:h-4 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
          ) : (
            <Navigation className="w-3 h-3 md:w-4 md:h-4 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
          )}
          
          <span className="truncate">
            {isLocating 
              ? "Localizando..." 
              : userLocation || "Onde você está?"}
          </span>
        </div>

        {!isCartPage && (
          <Button
            variant="outline"
            size="sm" // Botão menor no mobile
            className="relative gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 px-2 md:px-4 flex-shrink-0"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            {/* Esconde o valor total em telas muito pequenas para economizar espaço */}
            <span className="hidden sm:inline font-medium">
              {total > 0 ? `R$ ${total.toFixed(2).replace('.', ',')}` : 'Carrinho'}
            </span>
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-4 h-4 md:w-5 md:h-5 p-0 flex items-center justify-center text-[10px] md:text-xs gradient-primary border-0">
                {itemCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}