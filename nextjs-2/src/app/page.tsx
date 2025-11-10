'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/events');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="container">
      <p>Redirigiendo...</p>
    </div>
  );
}
