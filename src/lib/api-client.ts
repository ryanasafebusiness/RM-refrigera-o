// API Client for backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper to get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper to set auth token
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Helper to remove auth token
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  signup: async (email: string, password: string, name?: string) => {
    const data = await apiRequest<{ user: any; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await apiRequest<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  me: async () => {
    return apiRequest<{ user: any }>('/api/auth/me');
  },

  logout: () => {
    removeToken();
  },
};

// Service Orders API
export const serviceOrdersAPI = {
  getAll: async () => {
    return apiRequest<{ orders: any[] }>('/api/service-orders');
  },

  getById: async (id: string) => {
    return apiRequest<{ order: any }>(`/api/service-orders/${id}`);
  },

  create: async (order: any) => {
    return apiRequest<{ order: any }>('/api/service-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  update: async (id: string, order: any) => {
    return apiRequest<{ order: any }>(`/api/service-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/service-orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Clients API
export const clientsAPI = {
  getAll: async () => {
    return apiRequest<{ clients: any[] }>('/api/clients');
  },

  getById: async (id: string) => {
    return apiRequest<{ client: any }>(`/api/clients/${id}`);
  },

  create: async (client: any) => {
    return apiRequest<{ client: any }>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  },

  update: async (id: string, client: any) => {
    return apiRequest<{ client: any }>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Order Photos API
export const orderPhotosAPI = {
  getByOrderId: async (orderId: string) => {
    return apiRequest<{ photos: any[] }>(`/api/service-orders/${orderId}/photos`);
  },

  upload: async (orderId: string, file: File, photoType: string, mediaType: string, durationSeconds?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('photoType', photoType);
    formData.append('mediaType', mediaType);
    if (durationSeconds) {
      formData.append('durationSeconds', durationSeconds.toString());
    }

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/service-orders/${orderId}/photos`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  delete: async (orderId: string, photoId: string) => {
    return apiRequest<{ message: string }>(`/api/service-orders/${orderId}/photos/${photoId}`, {
      method: 'DELETE',
    });
  },
};

// Order Parts API
export const orderPartsAPI = {
  getByOrderId: async (orderId: string) => {
    return apiRequest<{ parts: any[] }>(`/api/service-orders/${orderId}/parts`);
  },

  create: async (orderId: string, part: any) => {
    return apiRequest<{ part: any }>(`/api/service-orders/${orderId}/parts`, {
      method: 'POST',
      body: JSON.stringify(part),
    });
  },

  delete: async (orderId: string, partId: string) => {
    return apiRequest<{ message: string }>(`/api/service-orders/${orderId}/parts/${partId}`, {
      method: 'DELETE',
    });
  },
};

// Order Signatures API
export const orderSignaturesAPI = {
  getByOrderId: async (orderId: string) => {
    return apiRequest<{ signature: any | null }>(`/api/service-orders/${orderId}/signature`);
  },

  create: async (orderId: string, signatureData: string) => {
    return apiRequest<{ signature: any }>(`/api/service-orders/${orderId}/signature`, {
      method: 'POST',
      body: JSON.stringify({ signature_data: signatureData }),
    });
  },

  update: async (orderId: string, signatureData: string) => {
    return apiRequest<{ signature: any }>(`/api/service-orders/${orderId}/signature`, {
      method: 'PUT',
      body: JSON.stringify({ signature_data: signatureData }),
    });
  },
};

