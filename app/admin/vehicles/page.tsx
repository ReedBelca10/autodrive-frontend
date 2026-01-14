"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  _id: string;
  name: string;
  dailyRate: number;
  passengers: number;
  year: number;
  transmission: string;
  fuel: string;
  city: string;
  agencyId: {
    _id: string;
    name: string;
  };
  bodyType: string;
  description: string;
  equipment: string[];
  mediaUrls: string[];
  reviews: {
    totalRatings: number;
    averageRating: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setVehicles(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string, skipConfirm = false) => {
    if (!skipConfirm) {
      toast("Confirmation de suppression", {
        description: "Êtes-vous sûr de vouloir supprimer ce véhicule ?",
        action: {
          label: "Supprimer",
          onClick: () => deleteVehicle(id, true),
        },
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/vehicles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setVehicles(vehicles.filter(v => v._id !== id));
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/vehicles/${id}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        const updatedVehicle = await response.json();
        setVehicles(vehicles.map(v => v._id === id ? updatedVehicle : v));
      }
    } catch (err) {
      setError('Erreur lors de la modification du statut');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Véhicules</h1>
        <Link href="/admin/vehicles/new">
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
            <Plus size={20} /> Ajouter un véhicule
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <Card className="bg-gray-800 border-gray-700 overflow-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-32">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-24">Tarif/jour</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-20">Ville</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-28">Agence</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-20">Passagers</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-20">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-24">Carburant</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-20">Année</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-24">Avis</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-24">Création</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-20">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-200 min-w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {vehicles.map((vehicle) => (
              <tr key={vehicle._id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 text-sm text-white font-medium">{vehicle.name}</td>
                <td className="px-6 py-4 text-sm text-white font-bold">{vehicle.dailyRate.toLocaleString('fr-FR')} F</td>
                <td className="px-6 py-4 text-sm text-gray-300">{vehicle.city}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{vehicle.agencyId?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{vehicle.passengers}</td>
                <td className="px-6 py-4 text-sm text-gray-300 capitalize">{vehicle.bodyType}</td>
                <td className="px-6 py-4 text-sm text-gray-300 capitalize">{vehicle.fuel}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{vehicle.year}</td>
                <td className="px-6 py-4 text-sm">
                  {vehicle.reviews?.totalRatings > 0 ? (
                    <span className="text-yellow-400 font-semibold">
                      {vehicle.reviews.averageRating.toFixed(1)} ⭐ ({vehicle.reviews.totalRatings})
                    </span>
                  ) : (
                    <span className="text-gray-500">Aucun avis</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{formatDate(vehicle.createdAt)}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => toggleStatus(vehicle._id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium ${vehicle.isActive
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                      }`}
                  >
                    {vehicle.isActive ? (
                      <>
                        <Check size={14} /> Actif
                      </>
                    ) : (
                      <>
                        <X size={14} /> Inactif
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <Link href={`/admin/vehicles/${vehicle._id}`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Edit2 size={14} />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteVehicle(vehicle._id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {vehicles.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Aucun véhicule trouvé
        </div>
      )}
    </div>
  );
}
