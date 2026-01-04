"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface Manager {
  _id: string;
  fullName: string;
  email: string;
}

export default function AgencyFormPage() {
  const router = useRouter();
  const params = useParams();
  const agencyId = params?.id as string | undefined;
  const isEdit = !!agencyId;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  const [form, setForm] = useState({
    name: '',
    city: '',
    managerId: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    description: '',
  });

  const [cities, setCities] = useState<string[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les villes
        const citiesRes = await fetch(`${API_BASE}/agencies/config/cities`);
        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData.cities || []);
        }

        // Charger les managers
        const managersRes = await fetch(`${API_BASE}/agencies/config/managers`, {
          credentials: 'include',
        });
        if (managersRes.ok) {
          const managersData = await managersRes.json();
          setManagers(Array.isArray(managersData) ? managersData : []);
        }

        // Charger l'agence si édition
        if (isEdit) {
          const agencyRes = await fetch(`${API_BASE}/agencies/${agencyId}`, {
            credentials: 'include',
          });
          if (agencyRes.ok) {
            const agencyData = await agencyRes.json();
            setForm({
              name: agencyData.name || '',
              city: agencyData.city || '',
              managerId: agencyData.managerId?._id || '',
              latitude: String(agencyData.latitude || ''),
              longitude: String(agencyData.longitude || ''),
              phone: agencyData.phone || '',
              email: agencyData.email || '',
              description: agencyData.description || '',
            });
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [API_BASE, isEdit, agencyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${API_BASE}/agencies/${agencyId}` : `${API_BASE}/agencies`;

      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/admin/agencies');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de l&apos;enregistrement');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur réseau';
      setError(errorMessage);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/agencies">
          <Button variant="outline">← Retour</Button>
        </Link>
        <h1 className="text-3xl font-bold">{isEdit ? 'Modifier l&apos;agence' : 'Ajouter une agence'}</h1>
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
              Nom de l&apos;agence *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Agence Lomé Centre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Ville *
            </label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une ville</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Gestionnaire *
            </label>
            <select
              name="managerId"
              value={form.managerId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un gestionnaire</option>
              {managers.map((manager) => (
                <option key={manager._id} value={manager._id}>
                  {manager.fullName} ({manager.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                required
                step="0.000001"
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 6.1256"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                required
                step="0.000001"
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 1.2319"
              />
            </div>
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
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="agence@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description de l&apos;agence..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
            >
              {submitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l&apos;agence'}
            </Button>
            <Link href="/admin/agencies" className="flex-1">
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
