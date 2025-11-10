'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CreateUserPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name || !email || !city || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await usersAPI.create({
        name,
        email,
        city,
        password,
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setCity('');
      setPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Error al crear el usuario. Verifica que el email no esté registrado.');
    } finally {
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
          <h1 style={{ marginBottom: '20px' }}>Crear Usuario</h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
                Nombre completo:
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
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                Contraseña:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div style={{ color: '#cc0000', marginBottom: '15px' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                color: '#006600', 
                marginBottom: '15px',
                padding: '10px',
                border: '1px solid #006600',
                background: '#f0f8f0'
              }}>
                Usuario creado exitosamente
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

