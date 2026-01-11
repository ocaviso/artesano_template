export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'burgers' | 'sides' | 'drinks' | 'desserts';
  popular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  deliveryType: 'delivery' | 'curbside';
  address?: string;
  customerInfo?: CustomerInfo;
  paymentStatus: 'pending' | 'paid' | 'expired' | 'cancelled';
  estimatedDelivery?: Date;
  pixData?: PixPaymentData;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'waiting_pickup'
  | 'delivered'
  | 'completed';

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string; // Opcional
  cpf?: string;   // Opcional
}

export interface PixPaymentData {
  transactionId: number; // ID numérico da Orion
  uuid: string;          // ID alfanumérico (campo "id")
  pixCode: string;       // Código Copia e Cola
  qrCodeImageUrl: string;// URL da imagem
  expiresAt: string;
  price: number;
  status: string;
}

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
}