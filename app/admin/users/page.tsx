"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Shield, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'client';
  address?: string;
  createdAt: string;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE}/users`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(Array.isArray(data) ? data : []);
        } else {
          setError('Erreur lors du chargement des utilisateurs');
        }
      } catch (err) {
        setError('Erreur réseau');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [API_BASE]);

  const deleteUser = async (id: string, skipConfirm = false) => {
    if (!skipConfirm) {
      toast("Confirmation de suppression", {
        description: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
        action: {
          label: "Supprimer",
          onClick: () => deleteUser(id, true),
        },
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== id));
        toast.success('Utilisateur supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (err) {
      toast.error('Erreur réseau');
      console.error(err);
    }
  };

  const toggleUserStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/users/${id}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u._id === id ? { ...u, isActive: updatedUser.isActive } : u));
        toast.success(`Statut de ${updatedUser.fullName} mis à jour`);
      } else {
        toast.error('Erreur lors de la modification du statut');
      }
    } catch (err) {
      toast.error('Erreur réseau');
      console.error(err);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-600 to-red-700 shadow-lg';
      case 'manager':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg';
      case 'client':
        return 'bg-gradient-to-r from-green-600 to-green-700 shadow-lg';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'manager':
        return 'Gestionnaire';
      case 'client':
        return 'Client';
      default:
        return role;
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400"><p className="text-lg">⏳ Chargement des utilisateurs...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-400">Gérez les utilisateurs du système</p>
        </div>
        <Link href="/admin/users/new">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg px-6 py-2">
            <Plus size={20} />
            Ajouter un utilisateur
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-500/50 p-4 text-red-200 rounded-lg">
          <p className="font-semibold">⚠️ Erreur</p>
          <p className="text-sm mt-1">{error}</p>
        </Card>
      )}

      {users.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-12 text-center">
          <div className="text-gray-400 space-y-4">
            <p className="text-lg font-semibold">📋 Aucun utilisateur trouvé</p>
            <p className="text-sm text-gray-500">Commencez par créer votre premier utilisateur</p>
            <Link href="/admin/users/new">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 mt-4">
                Créer le premier utilisateur
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-900/50 to-gray-900 p-4 border-b border-gray-700">
            <p className="text-sm text-gray-300">Total: <span className="font-bold text-blue-400">{users.length}</span> utilisateur{users.length > 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-900/80 to-gray-900/80 border-b border-blue-700/50 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Nom complet</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Téléphone</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Adresse</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Date d&apos;inscription</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'
                      } hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-gray-800/40`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-100">{user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.phone || <span className="text-gray-600 italic">-</span>}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold text-white shadow-lg ${getRoleColor(user.role)}`}>
                        <Shield size={14} />
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.address || <span className="text-gray-600 italic">-</span>}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${user.isActive
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                          : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-gray-300'
                          }`}
                      >
                        {user.isActive ? <Check size={16} /> : <X size={16} />}
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/users/${user._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-900/60 hover:text-blue-300 text-gray-400 transition-all duration-200 hover:shadow-lg"
                          >
                            <Edit2 size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(user._id)}
                          className="hover:bg-red-900/60 hover:text-red-300 text-gray-400 transition-all duration-200 hover:shadow-lg"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
