"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Trash2, CheckCircle } from 'lucide-react';

interface Reservation {
  _id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  returnDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`${API_BASE}/reservations`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    try {
      const response = await fetch(`${API_BASE}/reservations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setReservations(reservations.map(r => 
          r._id === id ? { ...r, status: 'cancelled' } : r
        ));
      }
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Réservations</h1>
        <p className="text-gray-400">{reservations.length} réservations</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reservations.map((res) => (
          <Card key={res._id} className="bg-gray-800 border-gray-700 p-4">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div>
                <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getStatusColor(res.status)}`}>
                  {getStatusLabel(res.status)}
                </span>
              </div>
              <p className="text-blue-400 font-bold">${res.totalPrice}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-300 mb-4">
              <p>
                <span className="text-gray-400">Du:</span>{' '}
                {new Date(res.startDate).toLocaleDateString('fr-FR')}
              </p>
              <p>
                <span className="text-gray-400">Au:</span>{' '}
                {new Date(res.returnDate).toLocaleDateString('fr-FR')}
              </p>
              <p>
                <span className="text-gray-400">Utilisateur:</span> {res.userId}
              </p>
            </div>
            {res.status !== 'cancelled' && (
              <button
                onClick={() => cancelReservation(res._id)}
                className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Annuler
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
