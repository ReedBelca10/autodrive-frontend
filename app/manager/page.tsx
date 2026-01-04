'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

        // Vérifie que l'utilisateur est manager via le middleware
        // Le middleware a déjà vérifié le rôle, nous sommes sûr d'être manager
        setLoading(false);
      } catch (err) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
    try {
      await fetch(`${base}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-700">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Manager</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bienvenue Manager</h2>
          <p className="text-gray-600">Gérez vos véhicules et réservations depuis ce tableau de bord.</p>
        </div>
      </div>
    </div>
  );
}