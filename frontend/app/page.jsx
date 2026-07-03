'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/rooms');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Don't render anything while checking auth — prevents flash redirect
  if (loading) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading ChatterBox...</p>
    </div>
  );
}