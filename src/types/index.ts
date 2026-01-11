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
  vehicleInfo?: VehicleInfo;
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

export interface VehicleInfo {
  model: string;
  color: string;
  plate: string;
}

export interface PixPaymentData {
  invoiceId: string;
  qrCode: string;
  qrCodeImageUrl: string;
  paymentUrl: string;
  expiresAt: string;
  price: number;
}

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
}
