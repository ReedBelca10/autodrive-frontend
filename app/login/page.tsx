'use client';

import LoginForm from './LoginForm';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const metadata = {
  title: 'Connexion - AutoDrive',
};

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Si un token est déjà présent, récupère le profil et redirige selon le rôle
    const redirectIfAuthenticated = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3001/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // token invalide -> on laisse l'utilisateur se connecter
          return;
        }
        const user = await res.json();
        if (user.role === 'admin') router.push('/admin');
        else if (user.role === 'manager') router.push('/manager');
        else router.push('/');
      } catch {
        // ignore et reste sur la page de connexion
      }
    };

    redirectIfAuthenticated();
  }, [router]);

  return <LoginForm />;
}
