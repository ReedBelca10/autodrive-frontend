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
import { TrendingUp, Users, Car, CreditCard, AlertCircle } from 'lucide-react';

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
    return <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-slate-900 tracking-tight">Tableau de Bord</h1>
        <p className="text-slate-500">Vue d’ensemble des réservations et statistiques financières</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 shadow-sm flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* KPI Cards - Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mb-2 tracking-wide uppercase truncate">TOTAL RÉSERVATIONS</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-800 break-words">{stats.totalReservations}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shrink-0">
              <Car size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mb-2 tracking-wide uppercase truncate">CONFIRMÉES</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-800 break-words">{stats.confirmedCount}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 shadow-inner group-hover:bg-green-500 group-hover:text-white transition-colors duration-300 shrink-0">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mb-2 tracking-wide uppercase truncate">REVENU TOTAL</p>
              <p className="text-lg sm:text-xl xl:text-2xl font-bold text-slate-800 break-words">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-inner group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300 shrink-0">
              <CreditCard size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mb-2 tracking-wide uppercase truncate">EN ATTENTE</p>
              <p className="text-xl sm:text-3xl font-bold text-slate-800 break-words">{stats.pendingCount}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shrink-0">
              <Users size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Premier rang - Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenus - Graphique grande taille */}
        <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-4 sm:p-8 rounded-2xl lg:col-span-2 overflow-hidden">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Revenus</h2>
            <p className="text-slate-500 text-sm">Évolution des 30 derniers jours</p>
          </div>
          <div className="w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} axisLine={false} tickLine={false} dx={-5} width={50} />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#0ea5e9', fontWeight: '600' }}
                />
                <Line
                  type="monotone"
                  dataKey="montant"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ fill: '#fff', stroke: '#0ea5e9', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
                  name="Montant (FCFA)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Statut Réservations - Pie */}
        <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-4 sm:p-8 rounded-2xl flex flex-col overflow-hidden">
          <div className="mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Statuts</h2>
            <p className="text-slate-500 text-sm">Répartition des réservations</p>
          </div>
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => value} 
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: '600' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 uppercase font-semibold truncate">{item.name}</p>
                    <p className="text-base sm:text-lg font-bold text-slate-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Deuxième rang - Autres graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paiements par Méthode */}
        <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-4 sm:p-8 rounded-2xl overflow-hidden">
          <div className="mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Méthodes de Paiement</h2>
            <p className="text-slate-500 text-sm">Répartition par passerelle</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-1/2 min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => value} 
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 mt-4 md:mt-0 space-y-3 pl-0 md:pl-4 min-w-0">
              {paymentMethodData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 min-w-0 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-semibold text-slate-700 truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Statut Paiements */}
        <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-4 sm:p-8 rounded-2xl overflow-hidden">
          <div className="mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Statut des Paiements</h2>
            <p className="text-slate-500 text-sm">État des transactions</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-1/2 min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => value} 
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 mt-4 md:mt-0 space-y-3 pl-0 md:pl-4 min-w-0">
              {paymentStatusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 min-w-0 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-semibold text-slate-700 truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Troisième rang - Top véhicules */}
      {topVehiclesData.length > 0 && (
        <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-4 sm:p-8 rounded-2xl overflow-hidden">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Véhicules les Plus Réservés</h2>
            <p className="text-slate-500 text-sm">Top 5 des véhicules populaires</p>
          </div>
          <div className="w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topVehiclesData} margin={{ top: 10, right: 10, left: -10, bottom: 60 }}>
                <defs>
                  <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="95%" stopColor="#6d28d9" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  angle={-35}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  style={{ fontSize: '11px', fontWeight: '500' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} axisLine={false} tickLine={false} dx={-5} width={40} />
                <Tooltip
                  formatter={(value) => [`${value} réservations`, 'Total']}
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar
                  dataKey="reservations"
                  fill="url(#colorReservations)"
                  name="Réservations"
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
