"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Car, CreditCard } from 'lucide-react';

interface Reservation {
  _id: string;
  userName?: string;
  vehicleName?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus?: 'paid' | 'pending' | 'failed';
  paymentMethod?: 'stripe' | 'fedapay' | 'none';
  startDate: string;
  createdAt?: string;
}

const CURRENCY = {
  code: 'XOF',
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

const COLORS = {
  confirmed: '#10b981',
  pending: '#f59e0b',
  cancelled: '#ef4444',
  paid: '#3b82f6',
};

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    fetchReservations();
  }, []);

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
        setError('Erreur lors du chargement des données');
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques
  const stats = {
    totalReservations: reservations.length,
    totalRevenue: reservations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0),
    confirmedCount: reservations.filter(r => r.status === 'confirmed').length,
    pendingCount: reservations.filter(r => r.status === 'pending').length,
  };

  // Données pour graphique - Réservations par status
  const statusData = [
    {
      name: 'Confirmées',
      value: reservations.filter(r => r.status === 'confirmed').length,
      color: COLORS.confirmed,
    },
    {
      name: 'En attente',
      value: reservations.filter(r => r.status === 'pending').length,
      color: COLORS.pending,
    },
    {
      name: 'Annulées',
      value: reservations.filter(r => r.status === 'cancelled').length,
      color: COLORS.cancelled,
    },
  ];

  // Données pour graphique - Paiements par méthode
  const paymentMethodData = [
    {
      name: 'Stripe',
      value: reservations.filter(r => r.paymentMethod === 'stripe').length,
      color: '#635bff',
    },
    {
      name: 'FedaPay',
      value: reservations.filter(r => r.paymentMethod === 'fedapay').length,
      color: '#ff6b6b',
    },
    {
      name: 'Non payé',
      value: reservations.filter(r => !r.paymentMethod || r.paymentMethod === 'none').length,
      color: '#9ca3af',
    },
  ];

  // Données pour graphique - Revenus par jour (derniers 30 jours)
  const revenueByDay: { [key: string]: number } = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toLocaleDateString('fr-FR');
    revenueByDay[key] = 0;
  }

  reservations.forEach(r => {
    if (r.paymentStatus === 'paid' && r.createdAt) {
      const date = new Date(r.createdAt);
      const key = date.toLocaleDateString('fr-FR');
      revenueByDay[key] = (revenueByDay[key] || 0) + (r.totalPrice || 0);
    }
  });

  const revenueChartData = Object.entries(revenueByDay).map(([date, amount]) => ({
    date: date.substring(0, 5), // Affiche seulement MM/JJ
    montant: amount,
  }));

  // Données pour graphique - Top véhicules
  const vehicleReservations: { [key: string]: number } = {};
  reservations.forEach(r => {
    if (r.vehicleName) {
      vehicleReservations[r.vehicleName] = (vehicleReservations[r.vehicleName] || 0) + 1;
    }
  });

  const topVehiclesData = Object.entries(vehicleReservations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name: name.substring(0, 15), // Limiter la longueur pour le graphique
      reservations: count,
    }));

  // Données pour graphique - Statut paiement
  const paymentStatusData = [
    {
      name: 'Payées',
      value: reservations.filter(r => r.paymentStatus === 'paid').length,
      color: COLORS.paid,
    },
    {
      name: 'En attente',
      value: reservations.filter(r => r.paymentStatus === 'pending').length,
      color: COLORS.pending,
    },
    {
      name: 'Échouées',
      value: reservations.filter(r => r.paymentStatus === 'failed').length,
      color: COLORS.cancelled,
    },
  ];

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de Bord</h1>

      {error && (
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Réservations</p>
              <p className="text-3xl font-bold">{stats.totalReservations}</p>
            </div>
            <div className="p-3 bg-blue-900 rounded-lg">
              <Car className="text-blue-400" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Confirmées</p>
              <p className="text-3xl font-bold text-green-400">{stats.confirmedCount}</p>
            </div>
            <div className="p-3 bg-green-900 rounded-lg">
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Revenu Total</p>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-blue-900 rounded-lg">
              <CreditCard className="text-blue-400" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">En Attente</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.pendingCount}</p>
            </div>
            <div className="p-3 bg-yellow-900 rounded-lg">
              <Users className="text-yellow-400" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Réservations par Status */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Réservations par Statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Paiements par Méthode */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Paiements par Méthode</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenus par Jour */}
        <Card className="bg-gray-800 border-gray-700 p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Revenus - Derniers 30 Jours</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="montant"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                name="Montant (FCFA)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Statut Paiement */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Statut des Paiements</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Véhicules */}
        {topVehiclesData.length > 0 && (
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Top 5 Véhicules</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVehiclesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  formatter={(value) => value}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Bar
                  dataKey="reservations"
                  fill="#8b5cf6"
                  name="Réservations"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
