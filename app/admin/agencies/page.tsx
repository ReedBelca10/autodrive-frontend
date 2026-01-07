"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit2, Trash2, MapPin, Check, X } from 'lucide-react';

interface Agency {
  _id: string;
  name: string;
  city: string;
  managerId: {
    _id: string;
    fullName: string;
    email: string;
  };
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch(`${API_BASE}/agencies`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setAgencies(Array.isArray(data) ? data : []);
        } else {
          setError('Erreur lors du chargement des agences');
        }
      } catch (err) {
        setError('Erreur réseau');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, [API_BASE]);

  const deleteAgency = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) return;

    try {
      const response = await fetch(`${API_BASE}/agencies/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setAgencies(agencies.filter(a => a._id !== id));
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur réseau');
      console.error(err);
    }
  };

  const toggleAgencyStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/agencies/${id}/toggle-status`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        const updatedAgency = await response.json();
        setAgencies(agencies.map(a => a._id === id ? { ...a, isActive: updatedAgency.isActive } : a));
      } else {
        alert('Erreur lors de la modification du statut');
      }
    } catch (err) {
      alert('Erreur réseau');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400"><p className="text-lg">⏳ Chargement des agences...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
            Gestion des Agences
          </h1>
          <p className="text-gray-400">Gérez les agences de location de véhicules</p>
        </div>
        <Link href="/admin/agencies/new">
          <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 flex items-center gap-2 shadow-lg">
            <Plus size={20} /> Ajouter une agence
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-500/50 p-4 text-red-200 rounded-lg">
          <p className="font-semibold">⚠️ Erreur</p>
          <p className="text-sm mt-1">{error}</p>
        </Card>
      )}

      {agencies.length === 0 && !error && (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-12 text-center">
          <div className="text-gray-400 space-y-4">
            <p className="text-lg font-semibold">🏢 Aucune agence enregistrée</p>
            <p className="text-sm text-gray-500">Commencez par créer votre première agence</p>
            <Link href="/admin/agencies/new">
              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 mt-4">
                Créer la première agence
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {agencies.length > 0 && (
        <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-900/50 to-gray-900 p-4 border-b border-gray-700">
            <p className="text-sm text-gray-300">Total: <span className="font-bold text-emerald-400">{agencies.length}</span> agence{agencies.length > 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-900/80 to-gray-900/80 border-b border-emerald-700/50 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-300 min-w-32">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-300 min-w-24">Ville</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-300 min-w-32">Gestionnaire</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-300 min-w-28">Téléphone</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-300 min-w-32">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-300 min-w-40">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-300 min-w-28">Date création</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-300 min-w-20">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-300 min-w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {agencies.map((agency, index) => (
                  <tr 
                    key={agency._id} 
                    className={`transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/60'
                    } hover:bg-gradient-to-r hover:from-emerald-900/40 hover:to-gray-800/40`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-100">{agency.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{agency.city}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{agency.managerId?.fullName || <span className="text-gray-600 italic">N/A</span>}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{agency.phone || <span className="text-gray-600 italic">-</span>}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{agency.email || <span className="text-gray-600 italic">-</span>}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate" title={agency.description || ''}>
                      {agency.description || <span className="text-gray-600 italic">-</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(agency.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAgencyStatus(agency._id)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                          agency.isActive 
                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white' 
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-gray-300'
                        }`}
                      >
                        {agency.isActive ? <Check size={16} /> : <X size={16} />}
                        {agency.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <a
                        href={`https://www.google.com/maps?q=${agency.latitude},${agency.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-cyan-300 hover:text-cyan-200 transition-colors"
                        title="Voir sur Google Maps"
                      >
                        <MapPin size={16} />
                      </a>
                      <Link href={`/admin/agencies/${agency._id}`}>
                        <Button 
                          variant="ghost"
                          size="sm" 
                          className="hover:bg-blue-900/60 hover:text-blue-300 text-gray-400 transition-all duration-200 hover:shadow-lg flex items-center gap-1"
                        >
                          <Edit2 size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAgency(agency._id)}
                        className="hover:bg-red-900/60 hover:text-red-300 text-gray-400 transition-all duration-200 hover:shadow-lg flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                      </Button>
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
