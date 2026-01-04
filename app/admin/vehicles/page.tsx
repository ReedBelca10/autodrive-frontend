"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Vehicle {
  _id: string;
  name: string;
  type: string;
  year: string;
  price: string;
  image: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles`);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle._id} className="bg-gray-700 border-gray-600 overflow-hidden">
            <div className="aspect-video bg-gray-600"></div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white">{vehicle.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{vehicle.type} • {vehicle.year}</p>
              <p className="text-blue-400 font-bold mb-4">{vehicle.price}/jour</p>
              <div className="flex gap-2">
                <Link href={`/admin/vehicles/${vehicle._id}`} className="flex-1">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Edit2 size={16} /> Modifier
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="flex-1 flex items-center gap-2"
                  onClick={() => deleteVehicle(vehicle._id)}
                >
                  <Trash2 size={16} /> Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
