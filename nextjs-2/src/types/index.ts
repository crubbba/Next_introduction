export interface User {
  userId: string;
  name: string;
  email: string;
  city: string;
  password?: string;
}

export interface Event {
  eventId: string;
  name: string;
  description: string;
  date: string;
  city: string;
  createdBy: string;
}

export interface Registration {
  regId: string;
  eventId: string;
  userId: string;
  registeredAt: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
}

