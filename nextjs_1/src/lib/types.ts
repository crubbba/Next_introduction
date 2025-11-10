export type ApiUser = {
  userId?: string;
  id?: number | string;
  name: string;
  email: string;
  city?: string;
  password?: string;
};

export type ApiEvent = {
  eventId?: string;
  id?: string;
  name: string;
  description: string;
  date: string;
  city: string;
  createdBy: string;
};

export type ApiRegistration = {
  regId?: string;
  id?: string;
  eventId: string;
  userId: string;
  registeredAt?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  city: string;
  password: string;
};

export type EventPayload = {
  id?: string;
  eventId?: string;
  name: string;
  description: string;
  date: string;
  city: string;
  createdBy: string;
};

export type RegistrationPayload = {
  eventId: string;
  userId: string;
  id?: string;
  regId?: string;
};
