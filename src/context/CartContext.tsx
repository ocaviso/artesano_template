import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CartItem, MenuItem, Order, CustomerInfo, DeliveryAddress } from '@/types';
import { useToast } from '@/hooks/use-toast'; // Importação adicionada

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deliveryType: 'delivery' | 'curbside';
  setDeliveryType: (type: 'delivery' | 'curbside') => void;
  deliveryAddress: DeliveryAddress | null;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;
  customerInfo: CustomerInfo | null;
  setCustomerInfo: (info: CustomerInfo | null) => void;
  
  // --- NOVOS CAMPOS DE GEOLOCALIZAÇÃO ---
  userLocation: string | null;
  detectUserLocation: () => Promise<void>;
  isLocating: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = '@SmashFast:cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast(); // Hook para notificações

  // Inicialização Lazy
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [];
  });

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'curbside'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // --- NOVOS STATES ---
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (currentOrder?.id === orderId) {
      setCurrentOrder((prev) => prev ? { ...prev, status } : null);
    }
  }, [currentOrder]);

  // --- NOVA FUNÇÃO: DETECTAR LOCALIZAÇÃO ---
  const detectUserLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      toast({
        title: "Erro",
        description: "Geolocalização não suportada pelo seu navegador",
        variant: "destructive"
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // API Gratuita do OpenStreetMap (Nominatim)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'SmashFastApp/1.0' 
                }
            }
          );

          if (!response.ok) throw new Error('Erro ao buscar endereço');

          const data = await response.json();
          const address = data.address;
          
          // Formata o endereço de forma inteligente
          const locationName = address.suburb || address.neighbourhood || address.city_district || address.city || address.town || "Minha Localização";
          const state = address.state_code || address.city || address.town || ""; 

          setUserLocation(`${locationName}${state ? ` - ${state}` : ''}`);
          
        } catch (error) {
          console.error(error);
          toast({
            title: "Erro",
            description: "Não foi possível identificar o endereço.",
            variant: "destructive"
          });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = "Erro ao obter localização.";
        if (error.code === 1) msg = "Permissão de localização negada. Ative no navegador.";
        
        toast({
          title: "Atenção",
          description: msg,
          variant: "destructive"
        });
      }
    );
  }, [toast]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        currentOrder,
        setCurrentOrder,
        orders,
        addOrder,
        updateOrderStatus,
        deliveryType,
        setDeliveryType,
        deliveryAddress,
        setDeliveryAddress,
        customerInfo,
        setCustomerInfo,
        // Novos valores expostos
        userLocation,
        detectUserLocation,
        isLocating
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}