"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalUsers: number;
  totalManagers: number;
  totalVehicles: number;
  totalReservations: number;
}

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

interface Agency {
  _id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

        // Récupère les statistiques du dashboard
        const statsRes = await fetch(`${base}/admin/dashboard/stats`, {
          credentials: 'include',
        });

        if (statsRes.status === 403) {
          router.push('/login');
          return;
        }

        if (!statsRes.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }

        const statsData = await statsRes.json();
        setStats(statsData);

        // Récupère la liste des utilisateurs
        const usersRes = await fetch(`${base}/admin/dashboard/users`, {
          credentials: 'include',
        });

        if (!usersRes.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs');
        }

        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);

        // Récupère la liste des agences
        const agenciesRes = await fetch(`${base}/agencies`, {
          credentials: 'include',
        });

        if (agenciesRes.ok) {
          const agenciesData = await agenciesRes.json();
          setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  // Gestion de la déconnexion
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
        <div className="text-xl text-gray-700">Chargement du tableau de bord...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded shadow-sm border-l-4 border-blue-600">
              <h2 className="text-gray-600 text-sm font-semibold uppercase">Clients</h2>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded shadow-sm border-l-4 border-green-600">
              <h2 className="text-gray-600 text-sm font-semibold uppercase">Managers</h2>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalManagers}</p>
            </div>
            <div className="bg-white p-6 rounded shadow-sm border-l-4 border-purple-600">
              <h2 className="text-gray-600 text-sm font-semibold uppercase">Véhicules</h2>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVehicles}</p>
            </div>
            <div className="bg-white p-6 rounded shadow-sm border-l-4 border-orange-600">
              <h2 className="text-gray-600 text-sm font-semibold uppercase">Réservations</h2>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReservations}</p>
            </div>
          </div>
        )}

        {/* Tableau des clients */}
        <div className="bg-white p-6 rounded shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Derniers Clients</h2>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Nom complet</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Rôle</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Date d'inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-900">{user.email}</td>
                      <td className="px-4 py-3 text-gray-900">{user.fullName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                          Client
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Aucun client trouvé</p>
          )}
        </div>

        {/* Tableau des agences */}
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Agences Disponibles</h2>
          {agencies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Nom</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Adresse</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Ville</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Code Postal</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Téléphone</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((agency) => (
                    <tr key={agency._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-900 font-medium">{agency.name}</td>
                      <td className="px-4 py-3 text-gray-900">{agency.address}</td>
                      <td className="px-4 py-3 text-gray-900">{agency.city}</td>
                      <td className="px-4 py-3 text-gray-900">{agency.zipCode}</td>
                      <td className="px-4 py-3 text-gray-600">{agency.phone || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600">{agency.email || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Aucune agence trouvée</p>
          )}
        </div>
      </div>
    </div>
  );
}
