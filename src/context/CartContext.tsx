import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, MenuItem, Order, VehicleInfo, DeliveryAddress } from '@/types';

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
  vehicleInfo: VehicleInfo | null;
  setVehicleInfo: (info: VehicleInfo | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'curbside'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);

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
        vehicleInfo,
        setVehicleInfo,
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
