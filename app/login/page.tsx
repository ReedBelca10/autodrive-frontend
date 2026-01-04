'use client';

import LoginForm from './LoginForm';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const metadata = {
  title: 'Connexion - AutoDrive',
};

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est déjà authentifié, redirige selon son rôle
    const redirectIfAuthenticated = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
        const res = await fetch(`${base}/auth/profile`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          // Not authenticated, stay on login page
          return;
        }
        const profileData = await res.json();
        const userRole = profileData.user?.role;
        
        if (userRole === 'admin') {
          router.push('/admin');
        } else if (userRole === 'manager') {
          router.push('/manager');
        } else {
          router.push('/');
        }
      } catch (err) {
        // Ignore and stay on login page
        console.debug('User not authenticated yet');
      }
    };

    redirectIfAuthenticated();
  }, [router]);

  return <LoginForm />;
}
