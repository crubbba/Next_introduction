'use client';

import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { eventsAPI, registrationsAPI, usersAPI } from '@/lib/api';
import { Event, Registration, User } from '@/types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadUserData();
  }, [isAuthenticated, router]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userId = params.id as string;
      const userData = await usersAPI.getById(userId);
      const userRegistrations = await registrationsAPI.getByUser(userId);
      
      setUser(userData);
      setRegistrations(userRegistrations);

      const eventsData = await Promise.all(
        userRegistrations.map(r => eventsAPI.getById(r.eventId))
      );
      setEvents(eventsData);
    } catch (err) {
      setError('Error al cargar el perfil del usuario');
    } finally {
      setLoading(false);
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

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container">Usuario no encontrado</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <Link href="/events">← Volver a eventos</Link>
        </div>

        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px',
          marginBottom: '30px',
          background: '#fafafa'
        }}>
          <h1 style={{ marginBottom: '15px' }}>Perfil de Usuario</h1>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Nombre:</strong> {user.name}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Email:</strong> {user.email}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Ciudad:</strong> {user.city}
          </div>
          <div>
            <strong>ID:</strong> {user.userId}
          </div>
        </div>

        {error && <div style={{ color: '#cc0000', marginBottom: '15px' }}>{error}</div>}

        <div>
          <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>
            Eventos Inscritos ({events.length})
          </h2>

          {events.length === 0 ? (
            <p>No estás inscrito en ningún evento aún.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {events.map((event, index) => (
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
                    Fecha: {new Date(event.date).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Inscrito el: {new Date(registrations[index].registeredAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

