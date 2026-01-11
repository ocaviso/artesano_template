import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CartSheet } from '@/components/CartSheet';

const Cart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b">
        <div className="container flex items-center h-16 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading font-semibold text-lg">Seu Carrinho</h1>
        </div>
      </header>

      <div className="container flex-1 flex flex-col">
        <CartSheet />
      </div>
    </div>
  );
};

export default Cart;
