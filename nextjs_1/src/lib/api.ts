import {
  ApiEvent,
  ApiRegistration,
  ApiUser,
  CreateUserPayload,
  EventPayload,
  LoginPayload,
  RegistrationPayload,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

type RequestConfig = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
};

async function apiFetch<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = "GET", token, body } = config;
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      payload?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function login(payload: LoginPayload) {
  return apiFetch<{ message: string; token: string }>("/login", {
    method: "POST",
    body: payload,
  });
}

export function fetchUsers(token: string) {
  return apiFetch<ApiUser[]>("/users", { token });
}

export function createUser(token: string, payload: CreateUserPayload) {
  return apiFetch<ApiUser>("/users", {
    method: "POST",
    token,
    body: payload,
  });
}

export function fetchEvents(token: string) {
  return apiFetch<ApiEvent[]>("/events", { token });
}

export function createEvent(token: string, payload: EventPayload) {
  return apiFetch<ApiEvent>("/events", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateEvent(
  token: string,
  eventId: string,
  payload: EventPayload,
) {
  return apiFetch<ApiEvent>(`/events/${eventId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export function deleteEvent(token: string, eventId: string) {
  return apiFetch<{ message: string }>(`/events/${eventId}`, {
    method: "DELETE",
    token,
  });
}

export function fetchRegistrations(token: string, userId?: string) {
  const path = userId
    ? `/registrations?userId=${encodeURIComponent(userId)}`
    : "/registrations";
  return apiFetch<ApiRegistration[]>(path, { token });
}

export function registerToEvent(token: string, payload: RegistrationPayload) {
  return apiFetch<ApiRegistration>("/registrations", {
    method: "POST",
    token,
    body: payload,
  });
}
