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
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bell,
  Search
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

      if (vehiclesRes.status === 401 || vehiclesRes.status === 403) {
        window.location.href = '/login';
        return;
      }

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
        setError("Erreur lors de l’archivage de la réservation");
      }
    } catch (err) {
      setError("Erreur lors de l’archivage de la réservation");
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
      window.location.href = '/login';
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
        return 'bg-green-50 text-green-700';
      case 'reserved':
        return 'bg-blue-50 text-blue-700';
      case 'maintenance':
        return 'bg-amber-50 text-amber-700';
      case 'confirmed':
        return 'bg-green-50 text-green-700';
      case 'pending':
        return 'bg-amber-50 text-amber-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-100 text-slate-600';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-slate-500 animate-pulse font-medium">Chargement du tableau de bord...</div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Aperçu', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Mes Véhicules', icon: Car },
    { id: 'reservations', label: 'Réservations', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar (identique à l'admin mais contrôle activeTab) */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#123744] shadow-2xl transition-all duration-300 flex flex-col z-20 flex-shrink-0`}
      >
        <div className="h-20 border-b border-white/10 flex items-center justify-between px-6">
          {sidebarOpen && (
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Auto<span className="text-blue-400">Drive</span>
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-400/10 text-white border border-blue-500/20' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-300 transition-colors'} />
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-slate-300 hover:text-red-400 group"
          >
            <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
            {sidebarOpen && <span className="font-medium whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <div className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-10 sticky top-0 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Espace Manager</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:ring-2 ring-blue-500/20 transition-all">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-transparent border-none outline-none text-sm w-48 placeholder-slate-400"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-[#123744] transition-colors rounded-full hover:bg-slate-100">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-[#123744] flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity">
              M
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto pb-12">
            
            {/* Titre de la section active */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {activeTab === 'overview' && 'Aperçu Général'}
                {activeTab === 'vehicles' && 'Gestion de vos Véhicules'}
                {activeTab === 'reservations' && 'Réservations'}
              </h1>
              <p className="text-slate-500">
                {activeTab === 'overview' && 'Statistiques et activités récentes'}
                {activeTab === 'vehicles' && 'Gérez votre flotte et vos tarifs'}
                {activeTab === 'reservations' && 'Suivez et confirmez les réservations clients'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 shadow-sm flex items-center gap-3">
                <AlertCircle size={20} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-slate-500 text-sm font-semibold mb-2 tracking-wide uppercase">Total Véhicules</p>
                        <p className="text-4xl font-bold text-slate-800">{stats.totalVehicles}</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                        <Car size={28} />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-slate-500 text-sm font-semibold mb-2 tracking-wide uppercase">Disponibles</p>
                        <p className="text-4xl font-bold text-slate-800">{stats.availableVehicles}</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 shadow-inner group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                        <CheckCircle size={28} />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-slate-500 text-sm font-semibold mb-2 tracking-wide uppercase">Réservés</p>
                        <p className="text-4xl font-bold text-slate-800">{stats.reservedVehicles}</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-inner group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                        <Car size={28} />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-slate-500 text-sm font-semibold mb-2 tracking-wide uppercase">Réservations</p>
                        <p className="text-4xl font-bold text-slate-800">{stats.totalReservations}</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                        <BarChart3 size={28} />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Quick Actions */}
                  <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-8 rounded-2xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Actions Rapides</h2>
                    <div className="flex flex-col gap-4">
                      <Link
                        href="/manager/vehicles/new"
                        className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-4 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                      >
                        <div className="bg-white/20 p-2 rounded-lg"><Plus size={20} /></div>
                        Ajouter un nouveau véhicule
                      </Link>
                      <button
                        onClick={() => setActiveTab('reservations')}
                        className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 p-4 rounded-xl transition-all font-medium border border-slate-200 text-left"
                      >
                        <div className="bg-white p-2 rounded-lg text-slate-500 shadow-sm"><BarChart3 size={20} /></div>
                        Gérer les réservations en attente
                      </button>
                    </div>
                  </Card>

                  {/* Véhicules récents */}
                  <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 p-8 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-slate-800">Véhicules Récents</h2>
                      <button onClick={() => setActiveTab('vehicles')} className="text-blue-500 text-sm font-semibold hover:underline">Voir tout</button>
                    </div>
                    {vehicles.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-500">Aucun véhicule pour le moment</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {vehicles.slice(0, 4).map(vehicle => (
                          <div key={vehicle._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex-shrink-0">
                                {vehicle.image ? (
                                  <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Car size={20} /></div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{vehicle.brand} {vehicle.model}</p>
                                <p className="text-sm text-slate-500">{vehicle.year} • <span className="font-semibold text-slate-700">FCFA {vehicle.dailyRate}/j</span></p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(vehicle.status)} border ${vehicle.status === 'available' ? 'border-green-200' : vehicle.status === 'reserved' ? 'border-blue-200' : 'border-slate-200'}`}>
                              {getStatusLabel(vehicle.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* VEHICLES TAB */}
            {activeTab === 'vehicles' && (
              <div className="space-y-6">
                <div className="flex justify-end mb-6">
                  <Link
                    href="/manager/vehicles/new"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl transition-all shadow-md font-medium"
                  >
                    <Plus size={20} />
                    Nouveau véhicule
                  </Link>
                </div>

                {vehicles.length === 0 ? (
                  <Card className="bg-white border border-dashed border-slate-300 p-12 text-center rounded-2xl shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Car size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun véhicule</h3>
                    <p className="text-slate-500 mb-6">Commencez par ajouter votre premier véhicule à votre flotte.</p>
                    <Link
                      href="/manager/vehicles/new"
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all font-medium"
                    >
                      Ajouter un véhicule
                    </Link>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {vehicles.map(vehicle => (
                      <Card key={vehicle._id} className="bg-white border border-slate-100 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden group hover:shadow-xl transition-all">
                        <div className="relative h-56 bg-slate-100 overflow-hidden">
                          {vehicle.image ? (
                            <img
                              src={vehicle.image}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Car size={48} />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-white/90 ${
                              vehicle.status === 'available' ? 'text-green-600' : 
                              vehicle.status === 'reserved' ? 'text-blue-600' : 'text-slate-600'
                            }`}>
                              {getStatusLabel(vehicle.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="font-bold text-xl text-slate-900 mb-1">{vehicle.brand} {vehicle.model}</h3>
                          <div className="flex items-center justify-between mb-6">
                            <p className="text-slate-500 font-medium">Année: {vehicle.year}</p>
                            <p className="text-lg font-bold text-blue-600">FCFA {vehicle.dailyRate}<span className="text-sm text-slate-400 font-normal">/j</span></p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => handleToggleVehicleStatus(vehicle._id)}
                              className="flex flex-col items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 rounded-xl transition-colors border border-slate-200"
                              title={vehicle.status === 'available' ? 'Masquer' : 'Afficher'}
                            >
                              {vehicle.status === 'available' ? <EyeOff size={18} /> : <Eye size={18} />}
                              <span className="text-xs font-semibold">{vehicle.status === 'available' ? 'Masquer' : 'Afficher'}</span>
                            </button>
                            <Link
                              href={`/manager/vehicles/${vehicle._id}`}
                              className="flex flex-col items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-xl transition-colors border border-blue-100"
                            >
                              <Edit2 size={18} />
                              <span className="text-xs font-semibold">Éditer</span>
                            </Link>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle._id)}
                              className="flex flex-col items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl transition-colors border border-red-100"
                            >
                              <Trash2 size={18} />
                              <span className="text-xs font-semibold">Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RESERVATIONS TAB */}
            {activeTab === 'reservations' && (
              <div className="space-y-6">
                {reservations.length === 0 ? (
                  <Card className="bg-white border border-dashed border-slate-300 p-12 text-center rounded-2xl shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <BarChart3 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune réservation</h3>
                    <p className="text-slate-500">Vous n'avez pas encore de réservations pour vos véhicules.</p>
                  </Card>
                ) : (
                  <Card className="bg-white border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wide">
                            <th className="p-5 font-semibold">Client</th>
                            <th className="p-5 font-semibold">Véhicule</th>
                            <th className="p-5 font-semibold">Période</th>
                            <th className="p-5 font-semibold">Montant</th>
                            <th className="p-5 font-semibold">Statut</th>
                            <th className="p-5 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {reservations.map(res => (
                            <tr key={res._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-5">
                                <p className="font-bold text-slate-800">{res.userName}</p>
                              </td>
                              <td className="p-5">
                                <p className="font-semibold text-slate-700">{res.vehicleName}</p>
                              </td>
                              <td className="p-5">
                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 py-1.5 px-3 rounded-md w-max">
                                  <span className="font-medium">{new Date(res.startDate).toLocaleDateString('fr-FR')}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="font-medium">{new Date(res.returnDate).toLocaleDateString('fr-FR')}</span>
                                </div>
                              </td>
                              <td className="p-5">
                                <p className="font-bold text-blue-600 whitespace-nowrap">FCFA {res.totalPrice}</p>
                              </td>
                              <td className="p-5">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                                  res.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                  res.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {getStatusLabel(res.status)}
                                </span>
                              </td>
                              <td className="p-5">
                                <div className="flex justify-end gap-2">
                                  {res.status === 'pending' && (
                                    <button
                                      onClick={() => handleConfirmReservation(res._id)}
                                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                    >
                                      Confirmer
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleArchiveReservation(res._id)}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                  >
                                    Archiver
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
