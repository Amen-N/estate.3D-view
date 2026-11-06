export type UserRole = 'buyer' | 'agent' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PropertyAgent {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
}

export interface Property {
  id: string;
  agent_id: string;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  property_type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number | null;
  address: string;
  city: string;
  state?: string | null;
  zip_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  has_virtual_showroom: boolean;
  featured_image_url?: string | null;
  created_at: string;
  updated_at: string;
  distance_km?: number | null;
  agent?: PropertyAgent | null;
}

export interface PropertyFilterParams {
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  property_type?: string;
  has_showroom?: boolean;
  lat?: number;
  lng?: number;
  radius_km?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PropertyListResponse {
  items: Property[];
  total: number;
  limit: number;
  offset: number;
}

export interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AvailabilityResponse {
  property_id: string;
  agent_id: string;
  date: string;
  slots: AvailabilitySlot[];
}

export interface Tour {
  id: string;
  property_id: string;
  buyer_id: string;
  agent_id: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  cancellation_reason?: string | null;
  buyer_notes?: string | null;
  agent_feedback?: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    title: string;
    slug: string;
    address: string;
    city: string;
    featured_image_url?: string | null;
  } | null;
  agent?: PropertyAgent | null;
  buyer?: {
    id: string;
    email: string;
    full_name: string;
    phone_number?: string | null;
  } | null;
}

export interface TourCreatePayload {
  scheduled_start: string;
  scheduled_end: string;
  buyer_notes?: string;
}

export interface TourCancelPayload {
  cancellation_reason: string;
}

export interface TourListResponse {
  total: number;
  items: Tour[];
}

export interface ShowroomHotspot {
  id: string;
  scene_id: string;
  hotspot_type: 'navigation' | 'info' | 'upgrade';
  title?: string | null;
  description?: string | null;
  pitch: number;
  yaw: number;
  target_scene_id?: string | null;
  target_room_name?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ShowroomScene {
  id: string;
  showroom_id: string;
  room_name: string;
  panorama_url: string;
  thumbnail_url?: string | null;
  default_pitch: number;
  default_yaw: number;
  sort_order: number;
  is_initial_scene: boolean;
  hotspots: ShowroomHotspot[];
}

export interface Showroom {
  id: string;
  property_id: string;
  showroom_mode: 'panorama_360' | 'model_3d' | 'both';
  model_3d_url?: string | null;
  model_config: Record<string, any>;
  scenes: ShowroomScene[];
  created_at: string;
  updated_at: string;
}

export interface AdminAnalyticsOverview {
  total_properties: number;
  active_tours: number;
  total_users: number;
  conversion_rate: number;
  total_showrooms: number;
  total_scenes: number;
  total_hotspots: number;
}

export interface AuditLogItem {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  details: Record<string, any>;
  created_at: string;
}

export interface AuditLogListResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateHotspotPayload {
  title?: string;
  hotspot_type: 'navigation' | 'info' | 'upgrade';
  pitch: number;
  yaw: number;
  target_scene_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CreateScenePayload {
  room_name: string;
  panorama_url: string;
  thumbnail_url?: string;
  default_pitch?: number;
  default_yaw?: number;
  sort_order?: number;
  is_initial_scene?: boolean;
}

