"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== id));
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-gray-400">{users.length} utilisateurs</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <Card className="bg-gray-800 border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Téléphone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date d'inscription</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-3 text-sm">{user.email}</td>
                  <td className="px-6 py-3 text-sm">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-3 text-sm">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-3 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
