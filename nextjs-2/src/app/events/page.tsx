'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { eventsAPI, registrationsAPI } from '@/lib/api';
import { Event, Registration } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, registrationsData] = await Promise.all([
        eventsAPI.getAll(),
        registrationsAPI.getAll(),
      ]);
      setEvents(eventsData);
      setRegistrations(registrationsData);
    } catch (err) {
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const getParticipantsCount = (eventId: string): number => {
    return registrations.filter(r => r.eventId === eventId).length;
  };

  const filteredEvents = events.filter(event => {
    let matches = true;
    
    if (filterCity) {
      matches = matches && event.city.toLowerCase().includes(filterCity.toLowerCase());
    }
    
    if (filterDate) {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      matches = matches && eventDate === filterDate;
    }
    
    return matches;
  });

  const cities = Array.from(new Set(events.map(e => e.city)));

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '20px' }}>Eventos</h1>

        <div style={{ 
          marginBottom: '30px', 
          padding: '15px', 
          border: '1px solid #ddd',
          background: '#fafafa'
        }}>
          <h2 style={{ marginBottom: '15px', fontSize: '16px' }}>Filtros</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label htmlFor="filterCity" style={{ display: 'block', marginBottom: '5px' }}>
                Ciudad:
              </label>
              <select
                id="filterCity"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="">Todas las ciudades</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filterDate" style={{ display: 'block', marginBottom: '5px' }}>
                Fecha:
              </label>
              <input
                type="date"
                id="filterDate"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          {(filterCity || filterDate) && (
            <button 
              onClick={() => { setFilterCity(''); setFilterDate(''); }}
              style={{ marginTop: '15px' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {error && <div style={{ color: '#cc0000', marginBottom: '15px' }}>{error}</div>}

        {filteredEvents.length === 0 ? (
          <p>No hay eventos disponibles.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredEvents.map(event => (
              <div 
                key={event.eventId}
                style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px',
                  background: '#fafafa'
                }}
              >
                <h3 style={{ marginBottom: '10px' }}>
                  <Link href={`/events/${event.eventId}`}>{event.name}</Link>
                </h3>
                <p style={{ marginBottom: '5px' }}>{event.description}</p>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  Ciudad: {event.city}
                </p>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  Fecha: {new Date(event.date).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  Participantes: {getParticipantsCount(event.eventId)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

