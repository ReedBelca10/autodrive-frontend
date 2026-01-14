'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import {
  Car,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
  status: 'available' | 'reserved' | 'maintenance';
  image?: string;
}

interface Reservation {
  _id: string;
  vehicleName: string;
  userName: string;
  startDate: string;
  returnDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'reservations'>('overview');
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer les véhicules du manager (endpoint dédié)
      const vehiclesRes = await fetch(`${API_BASE}/vehicles/manager/my-vehicles`, {
        credentials: 'include',
      });
      if (vehiclesRes.ok) {
        const vData = await vehiclesRes.json();
        setVehicles(Array.isArray(vData) ? vData : []);
      }

      // Récupérer les réservations du manager
      const reservationsRes = await fetch(`${API_BASE}/reservations/admin/all`, {
        credentials: 'include',
      });
      if (reservationsRes.ok) {
        const rData = await reservationsRes.json();
        setReservations(Array.isArray(rData) ? rData : []);
      }

      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (id: string, skipConfirm = false) => {
    if (!skipConfirm) {
      toast("Confirmation de suppression", {
        description: "Êtes-vous sûr de vouloir supprimer ce véhicule ?",
        action: {
          label: "Supprimer",
          onClick: () => handleDeleteVehicle(id, true),
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
        toast.success('Véhicule supprimé avec succès');
      }
    } catch (err) {
      setError('Erreur lors de la suppression du véhicule');
    }
  };

  const handleToggleVehicleStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/vehicles/${id}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        // Retirer le véhicule de la liste au lieu de le garder
        setVehicles(vehicles.filter(v => v._id !== id));
        toast.success('Véhicule masqué');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleConfirmReservation = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/reservations/${id}/confirm`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        setReservations(reservations.map(r => r._id === id ? { ...r, status: 'confirmed' } : r));
        toast.success('Réservation confirmée avec succès');
      } else {
        setError('Erreur lors de la confirmation de la réservation');
      }
    } catch (err) {
      setError('Erreur lors de la confirmation de la réservation');
    }
  };

  const handleArchiveReservation = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/reservations/${id}/archive`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        setReservations(reservations.filter(r => r._id !== id));
        toast.success('Réservation archivée avec succès');
      } else {
        setError("Erreur lors de l'archivage de la réservation");
      }
    } catch (err) {
      setError("Erreur lors de l'archivage de la réservation");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/login');
    }
  };

  const stats = {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    reservedVehicles: vehicles.filter(v => v.status === 'reserved').length,
    totalReservations: reservations.length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-900 text-green-200';
      case 'reserved':
        return 'bg-blue-900 text-blue-200';
      case 'maintenance':
        return 'bg-yellow-900 text-yellow-200';
      case 'confirmed':
        return 'bg-green-900 text-green-200';
      case 'pending':
        return 'bg-yellow-900 text-yellow-200';
      case 'cancelled':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      available: 'Disponible',
      reserved: 'Réservé',
      maintenance: 'Maintenance',
      confirmed: 'Confirmée',
      pending: 'En attente',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 shadow">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord Manager</h1>
            <p className="text-gray-400 mt-1">Gérez vos véhicules et réservations</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <p className="text-gray-400 text-sm mb-1">Véhicules</p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalVehicles}</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-4">
            <p className="text-gray-400 text-sm mb-1">Disponibles</p>
            <p className="text-3xl font-bold text-green-400">{stats.availableVehicles}</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-4">
            <p className="text-gray-400 text-sm mb-1">Réservés</p>
            <p className="text-3xl font-bold text-purple-400">{stats.reservedVehicles}</p>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-4">
            <p className="text-gray-400 text-sm mb-1">Réservations</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.totalReservations}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700 flex-wrap">
          {[
            { id: 'overview', label: 'Aperçu', icon: BarChart3 },
            { id: 'vehicles', label: 'Véhicules', icon: Car },
            { id: 'reservations', label: 'Réservations', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Actions Rapides</h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/manager/vehicles/new"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  Ajouter un véhicule
                </Link>
              </div>
            </Card>

            {/* Véhicules récents */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Véhicules Récents</h2>
              {vehicles.length === 0 ? (
                <p className="text-gray-400">Aucun véhicule pour le moment</p>
              ) : (
                <div className="space-y-3">
                  {vehicles.slice(0, 5).map(vehicle => (
                    <div key={vehicle._id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div>
                        <p className="font-semibold">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-sm text-gray-400">{vehicle.year} • FCFA {vehicle.dailyRate}/jour</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                        {getStatusLabel(vehicle.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mes Véhicules</h2>
              <Link
                href="/manager/vehicles/new"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Nouveau véhicule
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                <p className="text-gray-400">Aucun véhicule pour le moment</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map(vehicle => (
                  <Card key={vehicle._id} className="bg-gray-800 border-gray-700 p-4">
                    {vehicle.image && (
                      <img
                        src={vehicle.image}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                    )}
                    <h3 className="font-bold text-lg mb-2">{vehicle.brand} {vehicle.model}</h3>
                    <div className="space-y-2 mb-4 text-sm text-gray-300">
                      <p>Année: {vehicle.year}</p>
                      <p>Tarif: FCFA {vehicle.dailyRate}/jour</p>
                      <p>
                        Statut:{' '}
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                          {getStatusLabel(vehicle.status)}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleVehicleStatus(vehicle._id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors text-sm"
                      >
                        {vehicle.status === 'available' ? <EyeOff size={16} /> : <Eye size={16} />}
                        {vehicle.status === 'available' ? 'Masquer' : 'Afficher'}
                      </button>
                      <Link
                        href={`/manager/vehicles/${vehicle._id}`}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors text-sm"
                      >
                        <Edit2 size={16} />
                        Éditer
                      </Link>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors text-sm"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Réservations de mes Véhicules</h2>

            {reservations.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 p-8 text-center">
                <p className="text-gray-400">Aucune réservation pour le moment</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {reservations.map(res => (
                  <Card key={res._id} className="bg-gray-800 border-gray-700 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{res.vehicleName}</h3>
                        <p className="text-sm text-gray-400">{res.userName}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(res.startDate).toLocaleDateString('fr-FR')} →{' '}
                          {new Date(res.returnDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right flex flex-col gap-2 items-end">
                        <div>
                          <p className="font-bold text-blue-400">FCFA {res.totalPrice}</p>
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(res.status)}`}>
                            {getStatusLabel(res.status)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {res.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmReservation(res._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                            >
                              Confirmer
                            </button>
                          )}
                          <button
                            onClick={() => handleArchiveReservation(res._id)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                          >
                            Archiver
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
