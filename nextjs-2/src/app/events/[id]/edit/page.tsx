'use client';

import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { eventsAPI } from '@/lib/api';
import { Event } from '@/types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { userId, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadEvent();
  }, [isAuthenticated, router]);

  const loadEvent = async () => {
    try {
      const eventId = params.id as string;
      const eventData = await eventsAPI.getById(eventId);
      
      if (eventData.createdBy !== userId) {
        setError('No tienes permisos para editar este evento');
        setTimeout(() => router.push('/events'), 2000);
        return;
      }
      
      setEvent(eventData);
      setName(eventData.name);
      setDescription(eventData.description);
      const dateObj = new Date(eventData.date);
      const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000);
      setDate(localDate.toISOString().slice(0, 16));
      setCity(eventData.city);
    } catch (err) {
      setError('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !description || !date || !city) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!event) return;

    try {
      setSaving(true);
      await eventsAPI.update(event.eventId, {
        name,
        description,
        date: new Date(date).toISOString(),
        city,
      });
      router.push(`/events/${event.eventId}`);
    } catch (err) {
      setError('Error al actualizar el evento');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">Cargando...</div>
      </div>
    );
  }

  if (!event || event.createdBy !== userId) {
    return (
      <div>
        <Navbar />
        <div className="container">
          {error || 'No autorizado'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <Link href={`/events/${event.eventId}`}>← Volver al evento</Link>
        </div>

        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ marginBottom: '20px' }}>Editar Evento</h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
                Nombre del evento:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>
                Descripción:
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="date" style={{ display: 'block', marginBottom: '5px' }}>
                Fecha y hora:
              </label>
              <input
                type="datetime-local"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="city" style={{ display: 'block', marginBottom: '5px' }}>
                Ciudad:
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{ color: '#cc0000', marginBottom: '15px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button 
                type="button" 
                onClick={() => router.push(`/events/${event.eventId}`)}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

