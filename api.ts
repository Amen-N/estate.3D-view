import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  Property,
  PropertyFilterParams,
  PropertyListResponse,
  Showroom,
} from '../types';

const API_BASE = ((import.meta as any).env?.VITE_API_URL) || 'http://localhost:8000';

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(errorData.detail || 'Invalid email or password');
  }

  return res.json();
}

export async function registerApi(payload: RegisterPayload): Promise<User> {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(errorData.detail || 'Registration failed');
  }

  return res.json();
}

export async function fetchMeApi(token: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Unauthorized');
  }

  return res.json();
}

export async function fetchPropertiesApi(
  params?: PropertyFilterParams
): Promise<PropertyListResponse> {
  const query = new URLSearchParams();

  if (params) {
    if (params.min_price !== undefined && params.min_price !== null) {
      query.set('min_price', params.min_price.toString());
    }
    if (params.max_price !== undefined && params.max_price !== null) {
      query.set('max_price', params.max_price.toString());
    }
    if (params.bedrooms !== undefined && params.bedrooms !== null) {
      query.set('bedrooms', params.bedrooms.toString());
    }
    if (params.bathrooms !== undefined && params.bathrooms !== null) {
      query.set('bathrooms', params.bathrooms.toString());
    }
    if (params.city) {
      query.set('city', params.city);
    }
    if (params.property_type) {
      query.set('property_type', params.property_type);
    }
    if (params.has_showroom !== undefined && params.has_showroom !== null) {
      query.set('has_showroom', params.has_showroom.toString());
    }
    if (params.lat !== undefined && params.lat !== null) {
      query.set('lat', params.lat.toString());
    }
    if (params.lng !== undefined && params.lng !== null) {
      query.set('lng', params.lng.toString());
    }
    if (params.radius_km !== undefined && params.radius_km !== null) {
      query.set('radius_km', params.radius_km.toString());
    }
    if (params.search) {
      query.set('search', params.search);
    }
    if (params.limit !== undefined) {
      query.set('limit', params.limit.toString());
    }
    if (params.offset !== undefined) {
      query.set('offset', params.offset.toString());
    }
  }

  const url = `${API_BASE}/api/v1/properties${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch properties');
  }

  return res.json();
}

export async function fetchPropertyByIdApi(id: string): Promise<Property> {
  const res = await fetch(`${API_BASE}/api/v1/properties/${id}`);

  if (!res.ok) {
    throw new Error('Property not found');
  }

  return res.json();
}

export async function fetchAvailabilityApi(
  propertyId: string,
  date: string
): Promise<import('../types').AvailabilityResponse> {
  const res = await fetch(`${API_BASE}/api/v1/properties/${propertyId}/availability?date=${date}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch availability' }));
    throw new Error(err.detail || 'Failed to fetch availability');
  }
  return res.json();
}

export async function bookTourApi(
  propertyId: string,
  payload: import('../types').TourCreatePayload,
  token: string
): Promise<import('../types').Tour> {
  const res = await fetch(`${API_BASE}/api/v1/properties/${propertyId}/tours`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to book tour' }));
    throw new Error(err.detail || 'Failed to book tour');
  }
  return res.json();
}

export async function fetchMyToursApi(
  token: string
): Promise<import('../types').TourListResponse> {
  const res = await fetch(`${API_BASE}/api/v1/buyer/my-tours`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch scheduled tours');
  }
  return res.json();
}

export async function cancelTourApi(
  tourId: string,
  reason: string,
  token: string
): Promise<import('../types').Tour> {
  const res = await fetch(`${API_BASE}/api/v1/tours/${tourId}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cancellation_reason: reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to cancel tour' }));
    throw new Error(err.detail || 'Failed to cancel tour');
  }
  return res.json();
}

export function getCalendarIcsUrl(tourId: string): string {
  return `${API_BASE}/api/v1/tours/${tourId}/calendar.ics`;
}

export async function fetchShowroomApi(propertyId: string): Promise<Showroom> {
  const res = await fetch(`${API_BASE}/api/v1/properties/${propertyId}/showroom`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch showroom' }));
    throw new Error(err.detail || 'Failed to fetch showroom');
  }
  return res.json();
}

export async function fetchAdminOverviewApi(
  token: string
): Promise<import('../types').AdminAnalyticsOverview> {
  const res = await fetch(`${API_BASE}/api/v1/admin/analytics/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch admin overview' }));
    throw new Error(err.detail || 'Failed to fetch admin overview');
  }
  return res.json();
}

export async function fetchAdminAuditLogsApi(
  token: string,
  page: number = 1,
  pageSize: number = 20
): Promise<import('../types').AuditLogListResponse> {
  const res = await fetch(
    `${API_BASE}/api/v1/admin/analytics/audit-logs?page=${page}&page_size=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch audit logs' }));
    throw new Error(err.detail || 'Failed to fetch audit logs');
  }
  return res.json();
}

export async function fetchAdminToursApi(
  token: string
): Promise<import('../types').TourListResponse> {
  const res = await fetch(`${API_BASE}/api/v1/admin/tours`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch admin tours' }));
    throw new Error(err.detail || 'Failed to fetch admin tours');
  }
  return res.json();
}

export async function createAdminHotspotApi(
  sceneId: string,
  payload: import('../types').CreateHotspotPayload,
  token: string
): Promise<import('../types').ShowroomHotspot> {
  const res = await fetch(`${API_BASE}/api/v1/admin/showroom/scenes/${sceneId}/hotspots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create hotspot' }));
    throw new Error(err.detail || 'Failed to create hotspot');
  }
  return res.json();
}

export async function deleteAdminHotspotApi(
  hotspotId: string,
  token: string
): Promise<{ message: string; id: string }> {
  const res = await fetch(`${API_BASE}/api/v1/admin/showroom/hotspots/${hotspotId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete hotspot' }));
    throw new Error(err.detail || 'Failed to delete hotspot');
  }
  return res.json();
}

export async function createAdminSceneApi(
  showroomId: string,
  payload: import('../types').CreateScenePayload,
  token: string
): Promise<import('../types').ShowroomScene> {
  const res = await fetch(`${API_BASE}/api/v1/admin/showroom/${showroomId}/scenes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create room scene' }));
    throw new Error(err.detail || 'Failed to create room scene');
  }
  return res.json();
}

