"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createEvent,
  createUser,
  deleteEvent,
  fetchEvents,
  fetchRegistrations,
  fetchUsers,
  login,
  registerToEvent,
  updateEvent,
} from "@/lib/api";
import { ApiEvent, ApiRegistration, ApiUser } from "@/lib/types";

const STORAGE_KEYS = {
  token: "taller_token",
  email: "taller_email",
} as const;

const baseUserForm = {
  name: "",
  email: "",
  city: "",
  password: "",
};

const baseEventForm = {
  name: "",
  description: "",
  city: "",
  date: "",
};

type FeedbackState =
  | {
      type: "success" | "error";
      text: string;
    }
  | null;

type UserFormState = typeof baseUserForm;
type EventFormState = typeof baseEventForm;

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [userForm, setUserForm] = useState<UserFormState>({ ...baseUserForm });
  const [eventForm, setEventForm] = useState<EventFormState>({
    ...baseEventForm,
  });
  const [filters, setFilters] = useState({ city: "", date: "" });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [registrations, setRegistrations] = useState<ApiRegistration[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const savedToken = window.localStorage.getItem(STORAGE_KEYS.token);
    const savedEmail = window.localStorage.getItem(STORAGE_KEYS.email);
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setAuthEmail(savedEmail);
      setLoginForm((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const loadCollections = useCallback(async () => {
    if (!token) {
      setUsers([]);
      setEvents([]);
      setRegistrations([]);
      return;
    }

    setDataLoading(true);
    try {
      const [usersData, eventsData, registrationsData] = await Promise.all([
        fetchUsers(token),
        fetchEvents(token),
        fetchRegistrations(token),
      ]);
      setUsers(usersData);
      setEvents(eventsData);
      setRegistrations(registrationsData);
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No fue posible cargar la información.",
      });
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timeoutId = window.setTimeout(() => setFeedback(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const currentUser = useMemo(
    () => users.find((user) => user.email === authEmail) ?? null,
    [users, authEmail],
  );
  const currentUserId = useMemo(
    () => resolveUserId(currentUser),
    [currentUser],
  );

  const joinedEventIds = useMemo(() => {
    if (!currentUserId) {
      return new Set<string>();
    }
    const ids = registrations
      .filter((registration) => registration.userId === currentUserId)
      .map((registration) => registration.eventId);
    return new Set(ids);
  }, [registrations, currentUserId]);

  const filteredEvents = useMemo(() => {
    const normalizedCity = filters.city.trim().toLowerCase();
    return events
      .slice()
      .sort((a, b) => {
        const dateA = Date.parse(a.date);
        const dateB = Date.parse(b.date);
        return dateA - dateB;
      })
      .filter((eventItem) => {
        const matchesCity = normalizedCity
          ? eventItem.city.toLowerCase().includes(normalizedCity)
          : true;
        const matchesDate = filters.date
          ? eventItem.date.startsWith(filters.date)
          : true;
        return matchesCity && matchesDate;
      });
  }, [events, filters]);

  const joinedEvents = useMemo(() => {
    if (!currentUserId) {
      return [];
    }
    return events.filter((eventItem) =>
      joinedEventIds.has(resolveEventId(eventItem)),
    );
  }, [events, joinedEventIds, currentUserId]);

  const participantsCounter = useCallback(
    (eventId: string) =>
      registrations.filter(
        (registration) => registration.eventId === eventId,
      ).length,
    [registrations],
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = loginForm.email.trim();
    const password = loginForm.password.trim();

    if (!email || !password) {
      setFeedback({
        type: "error",
        text: "Por favor ingresa correo y contraseña.",
      });
      return;
    }

    setLoginLoading(true);
    try {
      const response = await login({ email, password });
      setToken(response.token);
      setAuthEmail(email);
      setLoginForm({ email, password: "" });
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEYS.token, response.token);
        window.localStorage.setItem(STORAGE_KEYS.email, email);
      }
      setFeedback({
        type: "success",
        text: "Sesión iniciada correctamente.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo iniciar sesión.",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setAuthEmail("");
    setUsers([]);
    setEvents([]);
    setRegistrations([]);
    setEditingEventId(null);
    setLoginForm({ email: "", password: "" });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.token);
      window.localStorage.removeItem(STORAGE_KEYS.email);
    }
  };

  const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setFeedback({
        type: "error",
        text: "Primero inicia sesión.",
      });
      return;
    }

    const name = userForm.name.trim();
    const email = userForm.email.trim();
    const city = userForm.city.trim();
    const password = userForm.password.trim();

    if (!name || !email || !city || !password) {
      setFeedback({
        type: "error",
        text: "Todos los campos del usuario son obligatorios.",
      });
      return;
    }

    setUserSaving(true);
    try {
      await createUser(token, { name, email, city, password });
      setFeedback({
        type: "success",
        text: "Usuario registrado.",
      });
      setUserForm({ ...baseUserForm });
      await loadCollections();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo crear el usuario.",
      });
    } finally {
      setUserSaving(false);
    }
  };

  const handleEventSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !currentUserId) {
      setFeedback({
        type: "error",
        text: "Debes iniciar sesión para administrar eventos.",
      });
      return;
    }

    const name = eventForm.name.trim();
    const description = eventForm.description.trim();
    const city = eventForm.city.trim();
    const dateValue = eventForm.date.trim();

    if (!name || !description || !city || !dateValue) {
      setFeedback({
        type: "error",
        text: "Completa todos los campos del evento.",
      });
      return;
    }

    const isoDate = `${dateValue}T00:00:00.000Z`;
    const payload = {
      name,
      description,
      city,
      date: isoDate,
      createdBy: currentUserId,
    };

    setEventSaving(true);
    try {
      if (editingEventId) {
        await updateEvent(token, editingEventId, {
          ...payload,
          id: editingEventId,
          eventId: editingEventId,
        });
        setFeedback({
          type: "success",
          text: "Evento actualizado (si la API lo permite).",
        });
      } else {
        const nextId = buildNextId(
          events.map((eventItem) => resolveEventId(eventItem)),
          "E",
        );
        await createEvent(token, {
          ...payload,
          id: nextId,
          eventId: nextId,
        });
        setFeedback({
          type: "success",
          text: "Evento creado.",
        });
      }
      setEventForm({ ...baseEventForm });
      setEditingEventId(null);
      await loadCollections();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el evento.",
      });
    } finally {
      setEventSaving(false);
    }
  };

  const handleEditClick = (eventItem: ApiEvent) => {
    const eventId = resolveEventId(eventItem);
    setEditingEventId(eventId);
    setEventForm({
      name: eventItem.name,
      description: eventItem.description,
      city: eventItem.city,
      date: extractDateForInput(eventItem.date),
    });
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEventForm({ ...baseEventForm });
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!token || !currentUserId) {
      setFeedback({
        type: "error",
        text: "Inicia sesión para inscribirte.",
      });
      return;
    }
    if (joinedEventIds.has(eventId)) {
      setFeedback({
        type: "error",
        text: "Ya estás inscrito en este evento.",
      });
      return;
    }

    const nextRegId = buildNextId(
      registrations.map((registration) => resolveRegistrationId(registration)),
      "R",
    );

    setJoiningEventId(eventId);
    try {
      await registerToEvent(token, {
        id: nextRegId,
        regId: nextRegId,
        eventId,
        userId: currentUserId,
      });
      setFeedback({
        type: "success",
        text: "Inscripción registrada.",
      });
      await loadCollections();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo registrar la inscripción.",
      });
    } finally {
      setJoiningEventId(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!token) {
      setFeedback({
        type: "error",
        text: "Inicia sesión para eliminar eventos.",
      });
      return;
    }
    setDeletingEventId(eventId);
    try {
      await deleteEvent(token, eventId);
      setFeedback({
        type: "success",
        text: "Evento eliminado.",
      });
      if (editingEventId === eventId) {
        handleCancelEdit();
      }
      await loadCollections();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "La API no permite eliminar el evento.",
      });
    } finally {
      setDeletingEventId(null);
    }
  };

  const clearFilters = () => setFilters({ city: "", date: "" });

  return (
    <main className="page">
      <div className="page__wrap">
        <header className="page__header">
          <div>
            <h1>Gestión de eventos</h1>
            <p className="muted">
              Taller individual usando la API pública indicada en las
              instrucciones.
            </p>
          </div>
          {token ? (
            <button type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          ) : null}
        </header>

        {feedback ? (
          <div
            className={`feedback ${
              feedback.type === "error" ? "feedback--error" : "feedback--ok"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        <section className="panel">
          <div className="panel__header">
            <h2>Autenticación</h2>
            {token ? (
              <button
                type="button"
                onClick={loadCollections}
                disabled={dataLoading}
              >
                {dataLoading ? "Actualizando..." : "Recargar datos"}
              </button>
            ) : null}
          </div>
          <form onSubmit={handleLogin} className="form-grid">
            <label>
              Correo
              <input
                name="email"
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="juan.perez@example.com"
                autoComplete="email"
              />
            </label>
            <label>
              Contraseña
              <input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Hola1234**"
                autoComplete="current-password"
              />
            </label>
            <button type="submit" disabled={loginLoading}>
              {loginLoading ? "Ingresando..." : "Entrar"}
            </button>
            <p className="muted">
              Ejemplo: juan.perez@example.com / Hola1234**
            </p>
          </form>
        </section>

        {token ? (
          <>
            <section className="panel">
              <h2>Crear usuario</h2>
              <form onSubmit={handleUserSubmit} className="form-grid">
                <label>
                  Nombre
                  <input
                    name="name"
                    value={userForm.name}
                    onChange={(event) =>
                      setUserForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Nombre completo"
                  />
                </label>
                <label>
                  Correo
                  <input
                    name="email"
                    type="email"
                    value={userForm.email}
                    onChange={(event) =>
                      setUserForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="nuevo.usuario@example.com"
                  />
                </label>
                <label>
                  Ciudad
                  <input
                    name="city"
                    list="city-hints"
                    value={userForm.city}
                    onChange={(event) =>
                      setUserForm((prev) => ({
                        ...prev,
                        city: event.target.value,
                      }))
                    }
                    placeholder="Ciudad"
                  />
                  <datalist id="city-hints">
                    <option value="Bogotá" />
                    <option value="Medellín" />
                    <option value="Cali" />
                    <option value="Barranquilla" />
                    <option value="Cartagena" />
                  </datalist>
                </label>
                <label>
                  Contraseña
                  <input
                    name="password"
                    type="text"
                    value={userForm.password}
                    onChange={(event) =>
                      setUserForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Hola1234**"
                  />
                </label>
                <button type="submit" disabled={userSaving}>
                  {userSaving ? "Guardando..." : "Registrar usuario"}
                </button>
              </form>
            </section>

            <section className="panel">
              <h2>Perfil</h2>
              {currentUser ? (
                <div className="profile">
                  <p>
                    <strong>Nombre:</strong> {currentUser.name}
                  </p>
                  <p>
                    <strong>Correo:</strong> {currentUser.email}
                  </p>
                  <p>
                    <strong>Ciudad:</strong> {currentUser.city ?? "Sin dato"}
                  </p>
                  <p>
                    <strong>Eventos inscritos:</strong> {joinedEvents.length}
                  </p>
                  {joinedEvents.length > 0 ? (
                    <ul className="plain-list">
                      {joinedEvents.map((eventItem) => (
                        <li key={resolveEventId(eventItem)}>
                          {eventItem.name} —{" "}
                          {formatDate(eventItem.date, {
                            dateStyle: "medium",
                          })}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">Aún no te has inscrito en eventos.</p>
                  )}
                </div>
              ) : (
                <p className="muted">
                  No encontramos tu información en la API.
                </p>
              )}
            </section>

            <section className="panel">
              <div className="panel__header">
                <h2>{editingEventId ? "Editar evento" : "Nuevo evento"}</h2>
                {editingEventId ? (
                  <button type="button" onClick={handleCancelEdit}>
                    Cancelar edición
                  </button>
                ) : null}
              </div>
              <form onSubmit={handleEventSubmit} className="form-grid">
                <label>
                  Nombre
                  <input
                    name="name"
                    value={eventForm.name}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Nombre del evento"
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    name="description"
                    value={eventForm.description}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Describe brevemente tu evento"
                    rows={3}
                  />
                </label>
                <label>
                  Ciudad
                  <input
                    name="city"
                    list="city-hints"
                    value={eventForm.city}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        city: event.target.value,
                      }))
                    }
                    placeholder="Ciudad"
                  />
                </label>
                <label>
                  Fecha
                  <input
                    name="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        date: event.target.value,
                      }))
                    }
                  />
                </label>
                <button type="submit" disabled={eventSaving}>
                  {eventSaving
                    ? "Guardando..."
                    : editingEventId
                      ? "Actualizar evento"
                      : "Crear evento"}
                </button>
              </form>
            </section>

            <section className="panel">
              <div className="panel__header">
                <h2>Filtros</h2>
                <button type="button" onClick={clearFilters}>
                  Limpiar
                </button>
              </div>
              <div className="filters">
                <label>
                  Ciudad
                  <input
                    name="filterCity"
                    value={filters.city}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        city: event.target.value,
                      }))
                    }
                    placeholder="Buscar por ciudad"
                  />
                </label>
                <label>
                  Fecha (AAAA-MM-DD)
                  <input
                    name="filterDate"
                    type="date"
                    value={filters.date}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        date: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </section>

            <section className="panel">
              <div className="panel__header">
                <h2>Eventos</h2>
                <p className="muted">
                  Total: {filteredEvents.length} | Participaciones:{" "}
                  {registrations.length}
                </p>
              </div>
              {dataLoading ? (
                <p className="muted">Cargando datos...</p>
              ) : null}
              {filteredEvents.length === 0 ? (
                <p className="muted">No hay eventos con los filtros actuales.</p>
              ) : (
                <div className="event-list">
                  {filteredEvents.map((eventItem) => {
                    const eventId = resolveEventId(eventItem);
                    const itsMine = eventItem.createdBy === currentUserId;
                    const alreadyJoined = joinedEventIds.has(eventId);
                    return (
                      <article className="event-card" key={eventId}>
                        <header className="event-card__header">
                          <div>
                            <h3>{eventItem.name}</h3>
                            <p className="muted">
                              {eventItem.city} ·{" "}
                              {formatDate(eventItem.date, {
                                dateStyle: "long",
                              })}
                            </p>
                          </div>
                          <span className="badge">
                            {participantsCounter(eventId)}{" "}
                            participantes
                          </span>
                        </header>
                        <p>{eventItem.description}</p>
                        <div className="event-card__footer">
                          <span className="tag">
                            Creado por {eventItem.createdBy}
                          </span>
                          <div className="actions">
                            {itsMine ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(eventItem)}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(eventId)}
                                  disabled={deletingEventId === eventId}
                                >
                                  {deletingEventId === eventId
                                    ? "Eliminando..."
                                    : "Eliminar"}
                                </button>
                              </>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleJoinEvent(eventId)}
                              disabled={
                                alreadyJoined || joiningEventId === eventId
                              }
                            >
                              {alreadyJoined
                                ? "Ya inscrito"
                                : joiningEventId === eventId
                                  ? "Inscribiendo..."
                                  : "Unirme"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="panel">
            <p className="muted">
              Inicia sesión para crear usuarios, gestionar eventos e inscribirte.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function resolveUserId(user: ApiUser | null): string {
  if (!user) {
    return "";
  }
  if (user.userId) {
    return user.userId;
  }
  if (user.id !== undefined && user.id !== null) {
    const raw = typeof user.id === "string" ? user.id : String(user.id);
    return raw.startsWith("U") ? raw : `U${raw.padStart(3, "0")}`;
  }
  return "";
}

function resolveEventId(event: ApiEvent): string {
  return event.eventId ?? event.id ?? "";
}

function resolveRegistrationId(registration: ApiRegistration): string {
  return registration.regId ?? registration.id ?? "";
}

function buildNextId(values: string[], prefix: string): string {
  const numericValues = values
    .map((value) => parseInt(value.replace(/\D/g, ""), 10))
    .filter((value) => !Number.isNaN(value));

  const nextNumber =
    numericValues.length > 0 ? Math.max(...numericValues) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

function extractDateForInput(value: string) {
  if (!value) {
    return "";
  }
  const directMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (directMatch) {
    return directMatch[0];
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
}

function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
) {
  if (!value) {
    return "Sin fecha";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("es-CO", options);
}
