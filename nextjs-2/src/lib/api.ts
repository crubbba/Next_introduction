import { User, Event, Registration, LoginResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

function getUserId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId');
  }
  return null;
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token && !endpoint.includes('/login')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error en la petición');
  }

  return response.json();
}

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

export const usersAPI = {
  create: async (userData: Omit<User, 'userId'>): Promise<User> => {
    return apiRequest('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  getAll: async (): Promise<User[]> => {
    return apiRequest('/users/');
  },
  
  getById: async (id: string): Promise<User> => {
    return apiRequest(`/users/${id}`);
  },
};

export const eventsAPI = {
  getAll: async (): Promise<Event[]> => {
    return apiRequest('/events');
  },
  
  getById: async (id: string): Promise<Event> => {
    return apiRequest(`/events/${id}`);
  },
  
  create: async (eventData: Omit<Event, 'eventId'>): Promise<Event> => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },
  
  update: async (id: string, eventData: Partial<Event>): Promise<Event> => {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },
  
  delete: async (id: string): Promise<void> => {
    return apiRequest(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

export const registrationsAPI = {
  create: async (eventId: string, userId: string): Promise<Registration> => {
    return apiRequest('/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId, userId }),
    });
  },
  
  getByUser: async (userId: string): Promise<Registration[]> => {
    return apiRequest(`/registrations?userId=${userId}`);
  },
  
  getAll: async (): Promise<Registration[]> => {
    return apiRequest('/registrations');
  },
};

export { getToken, getUserId };

