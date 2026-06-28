export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  description: string | null;
  created_at: string;
}

export interface Label {
  id: string;
  name: string;
  color_bg: string;
  color_text: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  floor: number | null;
  created_at: string;
  locations?: Location[];
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  room_id: string;
  room?: Room;
  created_at: string;
}

export interface ItemImage {
  id: string;
  url: string;
  filename: string;
  is_primary: boolean;
  display_order: number;
}

export interface Warranty {
  id: string;
  provider: string | null;
  warranty_type: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface PurchaseRecord {
  id: string;
  purchased_from: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  currency: string;
  order_number: string | null;
}

export interface Item {
  id: string;
  name: string;
  brand: string | null;
  model_number: string | null;
  serial_number: string | null;
  color: string | null;
  condition: string | null;
  quantity: number;
  notes: string | null;
  is_insured: boolean;
  location_id: string | null;
  category_id: string | null;
  updated_at: string;
  created_at: string;
  labels: Label[];
  primary_image_url: string | null;
}

export interface ItemDetail extends Item {
  location: Location | null;
  images: ItemImage[];
  warranty: Warranty | null;
  purchase_record: PurchaseRecord | null;
}

export interface DashboardStats {
  total_items: number;
  total_locations: number;
  active_warranties: number;
  expiring_warranties_30d: number;
  total_value: number;
  items_by_category: { name: string; count: number; color: string | null }[];
  items_by_location: { name: string; count: number }[];
  recent_activity: { type: string; title: string; message: string }[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  item_id: string | null;
  created_at: string;
}

export interface Settings {
  id: string;
  currency: string;
  timezone: string;
  date_format: string;
  language: string;
  notification_email: boolean;
  warranty_alert_days: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
