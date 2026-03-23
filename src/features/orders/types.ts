export type OrderStatus =
  | 'PAID_HELD'
  | 'LABEL_CREATED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'WAITING_48H'
  | 'RELEASED'
  | 'DISPUTE_OPENED'
  | 'REFUNDED'
  | 'CANCELLED';

export type DeliveryType = 'shipping' | 'in_person' | null;

export type Order = {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  created_at: string | null;

  // 👉 opcionales (para evitar errores TS)
  paid_at?: string | null;
  label_ready_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  released_at?: string | null;

  tracking_number?: string | null;
  label_url?: string | null;

  listing?: {
    id: string;
    title: string | null;
    cover_photo_url: string | null;
    price_clp: number | null;
    brand: string | null;
    size: string | null;
    condition: string | null;
  } | null;
};