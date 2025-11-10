'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { eventsAPI, registrationsAPI, usersAPI } from '@/lib/api';
import { Event, Registration, User } from '@/types';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userId, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadEvent();
  }, [isAuthenticated, router]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const eventId = params.id as string;
      const eventData = await eventsAPI.getById(eventId);
      const allRegistrations = await registrationsAPI.getAll();
      const eventRegistrations = allRegistrations.filter(r => r.eventId === eventId);
      
      setEvent(eventData);
      setRegistrations(eventRegistrations);
      setIsRegistered(eventRegistrations.some(r => r.userId === userId));

      const participantIds = eventRegistrations.map(r => r.userId);
      const participantsData = await Promise.all(
        participantIds.map(id => usersAPI.getById(id))
      );
      setParticipants(participantsData);
    } catch (err) {
      setError('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event || !userId) return;
    
    try {
      setActionLoading(true);
      await registrationsAPI.create(event.eventId, userId);
      await loadEvent();
    } catch (err) {
      setError('Error al inscribirse al evento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    
    try {
      setActionLoading(true);
      await eventsAPI.delete(event.eventId);
      router.push('/events');
    } catch (err) {
      setError('Error al eliminar el evento');
      setActionLoading(false);
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

  if (!event) {
    return (
      <div>
        <Navbar />
        <div className="container">Evento no encontrado</div>
      </div>
    );
  }

  const isCreator = event.createdBy === userId;

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
          marginBottom: '20px',
          background: '#fafafa'
        }}>
          <h1 style={{ marginBottom: '15px' }}>{event.name}</h1>
          <p style={{ marginBottom: '15px' }}>{event.description}</p>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Ciudad:</strong> {event.city}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Fecha:</strong> {new Date(event.date).toLocaleString()}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Participantes:</strong> {registrations.length}
          </div>

          {error && <div style={{ color: '#cc0000', marginBottom: '15px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {!isCreator && !isRegistered && (
              <button onClick={handleRegister} disabled={actionLoading}>
                {actionLoading ? 'Inscribiendo...' : 'Inscribirse'}
              </button>
            )}
            
            {isRegistered && !isCreator && (
              <div style={{ padding: '8px', background: '#e0e0e0' }}>
                Ya estás inscrito
              </div>
            )}

            {isCreator && (
              <>
                <Link href={`/events/${event.eventId}/edit`}>
                  <button>Editar Evento</button>
                </Link>
                <button onClick={handleDelete} disabled={actionLoading}>
                  {actionLoading ? 'Eliminando...' : 'Eliminar Evento'}
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>
            Participantes ({participants.length})
          </h2>
          
          {participants.length === 0 ? (
            <p>No hay participantes inscritos aún.</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {participants.map(participant => (
                <div 
                  key={participant.userId}
                  style={{ 
                    border: '1px solid #ddd', 
                    padding: '10px',
                    background: '#fafafa'
                  }}
                >
                  <Link href={`/users/${participant.userId}`}>
                    {participant.name}
                  </Link>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {participant.email} - {participant.city}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

