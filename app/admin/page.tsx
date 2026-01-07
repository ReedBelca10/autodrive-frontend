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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Tableau de Bord</h1>
        <p className="text-gray-400">Vue d'ensemble des réservations et paiements</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* KPI Cards - Compacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-semibold mb-1">TOTAL</p>
              <p className="text-4xl font-bold text-white">{stats.totalReservations}</p>
            </div>
            <Car className="text-blue-300 opacity-30" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-xs font-semibold mb-1">CONFIRMÉES</p>
              <p className="text-4xl font-bold text-white">{stats.confirmedCount}</p>
            </div>
            <TrendingUp className="text-green-300 opacity-30" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-xs font-semibold mb-1">REVENU</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <CreditCard className="text-purple-300 opacity-30" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-xs font-semibold mb-1">EN ATTENTE</p>
              <p className="text-4xl font-bold text-white">{stats.pendingCount}</p>
            </div>
            <Users className="text-yellow-300 opacity-30" size={40} />
          </div>
        </Card>
      </div>

      {/* Premier rang - Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenus - Graphique grande taille */}
        <Card className="bg-gray-800 border-gray-700 p-6 lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Revenus</h2>
            <p className="text-gray-400 text-sm">Évolution des 30 derniers jours</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="montant"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Montant (FCFA)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Statut Réservations - Pie */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Statuts</h2>
            <p className="text-gray-400 text-sm">Répartition des réservations</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${value}`}
                outerRadius={85}
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
          <div className="mt-4 space-y-2">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Deuxième rang - Autres graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paiements par Méthode */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Méthodes de Paiement</h2>
            <p className="text-gray-400 text-sm">Répartition par gateway</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${value}`}
                outerRadius={85}
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
          <div className="mt-4 space-y-2">
            {paymentMethodData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Statut Paiements */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Statut des Paiements</h2>
            <p className="text-gray-400 text-sm">État des transactions</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${value}`}
                outerRadius={85}
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
          <div className="mt-4 space-y-2">
            {paymentStatusData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Troisième rang - Top véhicules */}
      {topVehiclesData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Véhicules les Plus Réservés</h2>
            <p className="text-gray-400 text-sm">Top 5 des véhicules populaires</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topVehiclesData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <defs>
                <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(value) => `${value} réservations`}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar
                dataKey="reservations"
                fill="url(#colorReservations)"
                name="Réservations"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
