"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Trash2,
  CheckCircle,
  Clock,
  CreditCard,
  Search,
  FileText,
  AlertCircle,
  MoreVertical,
  Check,
} from 'lucide-react';

interface Reservation {
  _id: string;
  userId: string;
  vehicleId: string;
  vehicleName?: string;
  userName?: string;
  userEmail?: string;
  pickupLocation?: string;
  returnLocation?: string;
  startDate: string;
  returnDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus?: 'paid' | 'pending' | 'failed';
  paymentMethod?: 'stripe' | 'fedapay' | 'none';
  totalPrice: number;
  createdAt?: string;
}

const CURRENCY = {
  code: 'XOF', // Code ISO 4217 pour FCFA (West African CFA Franc)
  symbol: 'FCFA',
  locale: 'fr-FR',
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, statusFilter, paymentFilter, searchTerm]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/reservations/admin/all`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(Array.isArray(data) ? data : []);
      } else {
        setError('Erreur lors du chargement des réservations');
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = reservations;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(r => r.paymentStatus === paymentFilter);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.userName?.toLowerCase().includes(search) ||
        r.userEmail?.toLowerCase().includes(search) ||
        r.vehicleName?.toLowerCase().includes(search) ||
        r._id.toLowerCase().includes(search)
      );
    }

    setFilteredReservations(filtered);
  };

  const confirmReservation = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/reservations/${id}/confirm`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setReservations(reservations.map(r =>
          r._id === id ? { ...r, status: 'confirmed' } : r
        ));
        setSuccessMessage('Réservation confirmée avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Erreur lors de la confirmation');
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
        setSuccessMessage('Réservation annulée');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    }
  };

  const calculateStats = () => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;
    const revenue = reservations
      .filter(r => r.paymentStatus === 'paid' && r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    return { total, pending, confirmed, cancelled, revenue };
  };

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Utilisateur',
      'Email',
      'Véhicule',
      'Pickup',
      'Return',
      'Date début',
      'Date fin',
      'Statut',
      'Paiement',
      'Montant',
    ];

    const rows = filteredReservations.map(r => [
      r._id,
      r.userName || 'N/A',
      r.userEmail || 'N/A',
      r.vehicleName || 'N/A',
      r.pickupLocation || 'N/A',
      r.returnLocation || 'N/A',
      new Date(r.startDate).toLocaleDateString('fr-FR'),
      new Date(r.returnDate).toLocaleDateString('fr-FR'),
      getStatusLabel(r.status),
      r.paymentStatus || 'N/A',
      formatCurrency(r.totalPrice),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getPaymentLabel = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échouée';
      default:
        return 'Non défini';
    }
  };

  const getPaymentColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const stats = calculateStats();

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Chargement des réservations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Réservations</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FileText size={18} />
          Exporter CSV
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg text-red-200 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-900 border border-green-700 rounded-lg text-green-200 flex items-center gap-2">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-gray-400 text-sm mb-1">Total</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-yellow-400 text-sm mb-1">En attente</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-green-400 text-sm mb-1">Confirmées</p>
          <p className="text-3xl font-bold text-green-400">{stats.confirmed}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-red-400 text-sm mb-1">Annulées</p>
          <p className="text-3xl font-bold text-red-400">{stats.cancelled}</p>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <p className="text-blue-400 text-sm mb-1">Revenu</p>
          <p className="text-3xl font-bold text-blue-400">{formatCurrency(stats.revenue)}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Paiement</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous les paiements</option>
              <option value="paid">Payée</option>
              <option value="pending">En attente</option>
              <option value="failed">Échouée</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Recherche</label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Utilisateur, email, véhicule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <p className="text-gray-400 text-sm">
        {filteredReservations.length} réservation{filteredReservations.length !== 1 ? 's' : ''} trouvée
        {filteredReservations.length !== 1 ? 's' : ''}
      </p>

      {/* Reservations Table */}
      <div className="space-y-3">
        {filteredReservations.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700 p-8 text-center">
            <p className="text-gray-400">Aucune réservation correspondant aux critères</p>
          </Card>
        ) : (
          filteredReservations.map((res) => (
            <Card
              key={res._id}
              className="bg-gray-800 border-gray-700 p-4 transition-all"
            >
              {/* Main Row */}
              <div
                onClick={() => setExpandedId(expandedId === res._id ? null : res._id)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white truncate">
                        {res.userName || 'Utilisateur inconnu'}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(res.status)}`}>
                        {getStatusLabel(res.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300">
                      <div>
                        <span className="text-gray-500">Véhicule:</span> {res.vehicleName || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Du:</span>{' '}
                        {new Date(res.startDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div>
                        <span className="text-gray-500">Au:</span>{' '}
                        {new Date(res.returnDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div>
                        <span className="text-gray-500">Montant:</span>{' '}
                        <span className="text-blue-400 font-semibold">{formatCurrency(res.totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getPaymentColor(res.paymentStatus)}`}>
                        {getPaymentLabel(res.paymentStatus)}
                      </div>
                      {res.paymentMethod && (
                        <div className="text-xs text-gray-500">{res.paymentMethod}</div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {res.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmReservation(res._id);
                          }}
                          className="p-2 hover:bg-gray-700 rounded transition-colors"
                          title="Confirmer"
                        >
                          <Check size={18} className="text-green-400" />
                        </button>
                      )}
                      {res.status !== 'cancelled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelReservation(res._id);
                          }}
                          className="p-2 hover:bg-gray-700 rounded transition-colors"
                          title="Annuler"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === res._id && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Utilisateur</p>
                      <p className="text-white">{res.userName || 'N/A'}</p>
                      <p className="text-gray-400">{res.userEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Véhicule</p>
                      <p className="text-white">{res.vehicleName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Pickup</p>
                      <p className="text-white">{res.pickupLocation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Return</p>
                      <p className="text-white">{res.returnLocation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">ID Réservation</p>
                      <p className="text-white font-mono text-xs">{res._id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Date de création</p>
                      <p className="text-white">
                        {res.createdAt
                          ? new Date(res.createdAt).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
