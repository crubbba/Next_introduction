'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { eventsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const { userId, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !description || !date || !city) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      await eventsAPI.create({
        name,
        description,
        date: new Date(date).toISOString(),
        city,
        createdBy: userId!,
      });
      router.push('/events');
    } catch (err) {
      setError('Error al crear el evento');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <Link href="/events">← Volver a eventos</Link>
        </div>

        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ marginBottom: '20px' }}>Crear Evento</h1>

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
              <button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Evento'}
              </button>
              <button 
                type="button" 
                onClick={() => router.push('/events')}
                disabled={loading}
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

