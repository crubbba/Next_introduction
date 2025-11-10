'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { logout, userId } = useAuth();

  return (
    <nav style={{ 
      borderBottom: '1px solid #ddd', 
      padding: '15px 0',
      marginBottom: '20px'
    }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/events">Eventos</Link>
            <Link href="/events/create">Crear Evento</Link>
            <Link href="/users/create">Crear Usuario</Link>
            <Link href={`/users/${userId}`}>Mi Perfil</Link>
          </div>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      </div>
    </nav>
  );
}

