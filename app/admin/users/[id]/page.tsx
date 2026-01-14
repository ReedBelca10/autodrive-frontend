"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: 'admin' | 'manager' | 'client';
  createdAt: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  const [form, setForm] = useState<{
    fullName: string;
    email: string;
    phone: string;
    address: string;
    role: 'admin' | 'manager' | 'client';
  }>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    role: 'client',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const user: User = await response.json();
          setForm({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            role: user.role || 'client',
          });
        } else {
          setError('Utilisateur non trouvé');
        }
      } catch (err) {
        setError('Erreur lors du chargement');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [API_BASE, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push('/admin/users');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur réseau';
      setError(errorMessage);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (skipConfirm = false) => {
    if (!skipConfirm) {
      toast("Confirmation de suppression", {
        description: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
        action: {
          label: "Supprimer",
          onClick: () => handleDelete(true),
        },
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/admin/users');
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur réseau';
      setError(errorMessage);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users">
          <Button variant="outline">← Retour</Button>
        </Link>
        <h1 className="text-3xl font-bold">Modifier l&apos;utilisateur</h1>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              className="w-full px-4 py-2 rounded bg-gray-600 border border-gray-500 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas être modifié</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+228 XXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 123 Rue de la Paix, Lomé"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Rôle *
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="client">Client</option>
              <option value="manager">Gestionnaire</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
            >
              {submitting ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleDelete()}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Supprimer
            </Button>
            <Link href="/admin/users" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
