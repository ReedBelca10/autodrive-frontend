"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { VehicleImage } from '@/components/VehicleImage';
import { toast } from 'sonner';
// Navbar and Footer are provided by the root layout
import { useState, useMemo, useEffect } from 'react';
import {
  Filter,
  Search,
  ArrowUpDown,
  Users,
  Fuel,
  Settings,
  MapPin,
  Star,
  ChevronDown,
  X,
  ImageOff
} from 'lucide-react';

interface Vehicle {
  _id: string;
  name: string;
  bodyType: string;
  year: number;
  dailyRate: number;
  mediaUrls: string[];
  transmission: string;
  passengers: number;
  fuel: string;
  city: string;
  description: string;
  equipment: string[];
  isActive: boolean;
  agencyId?: string;
  agency?: {
    _id: string;
    name: string;
    city: string;
  };
  status?: 'available' | 'reserved' | 'maintenance';
  reviews?: {
    totalRatings: number;
    averageRating: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function VehiclesPage() {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: [1000, 1000000],
    transmission: 'all',
    fuel: 'all',
    location: '',
    status: 'all', // Nouveau filtre pour le statut
  });
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer les véhicules depuis la BD
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/vehicles`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // S’assurer que c’est un tableau
        const vehicles = Array.isArray(data) ? data : [];
        setAllVehicles(vehicles);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('Error fetching vehicles:', errorMsg);
        setError(errorMsg);
        setAllVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/favorites`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const favIds = new Set<string>((data || []).map((v: Vehicle) => v._id));
        setFavorites(favIds);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err);
    }
  };

  const toggleFavorite = async (vehicleId: string) => {
    try {
      setLoadingFavorites(prev => new Set(prev).add(vehicleId));

      const isFavorite = favorites.has(vehicleId);
      const method = isFavorite ? 'DELETE' : 'POST';

      const response = await fetch(`${API_BASE_URL}/users/favorites/${vehicleId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        toast.error('Veuillez vous connecter pour ajouter des favoris');
        return;
      }

      if (response.ok) {
        setFavorites(prev => {
          const newFavs = new Set(prev);
          if (isFavorite) {
            newFavs.delete(vehicleId);
            toast.success('Retiré des favoris');
          } else {
            newFavs.add(vehicleId);
            toast.success('Ajouté aux favoris');
          }
          return newFavs;
        });
      }
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la mise à jour des favoris');
    } finally {
      setLoadingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleId);
        return newSet;
      });
    }
  };

  const filteredVehicles = useMemo(() => {
    let result = allVehicles;

    if (filters.type !== 'all') {
      result = result.filter(v => v.bodyType.toLowerCase() === filters.type.toLowerCase());
    }

    result = result.filter(v => v.dailyRate >= filters.priceRange[0] && v.dailyRate <= filters.priceRange[1]);

    if (filters.transmission !== 'all') {
      result = result.filter(v => v.transmission.toLowerCase() === filters.transmission.toLowerCase());
    }

    if (filters.fuel !== 'all') {
      result = result.filter(v => v.fuel.toLowerCase() === filters.fuel.toLowerCase());
    }

    // Filtrer par statut
    if (filters.status !== 'all') {
      result = result.filter(v => (v.status || 'available') === filters.status);
    }

    if (searchTerm) {
      result = result.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.bodyType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.dailyRate - b.dailyRate;
        case 'price-high':
          return b.dailyRate - a.dailyRate;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [filters, sortBy, searchTerm, allVehicles]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Page Header - Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Notre Flotte de Véhicules
            </h1>
            <p className="text-xl text-blue-100 mb-2">
              Découvrez {allVehicles.length} véhicules premium pour tous vos besoins
            </p>
            <p className="text-blue-100">
              Location flexible • Service premium • Tarifs compétitifs
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* État de chargement */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-blue-600 rounded-full opacity-10 animate-pulse"></div>
                  <div className="absolute inset-2 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
              </div>
              <p className="text-gray-600 text-lg font-medium">Chargement des véhicules...</p>
            </div>
          </div>
        )}

        {/* État d’erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
            <p className="text-red-700 text-lg font-medium">Erreur : {error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        )}

        {/* Contenu principal */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filtres */}
            <div className="lg:col-span-1">
              <div className={`bg-white rounded-2xl shadow-md p-6 sticky top-24 transition-all duration-300 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Filter size={20} className="text-blue-600" />
                    </div>
                    Filtres
                  </h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Recherche */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Rechercher</label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Marque, type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Type */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Settings size={16} className="text-blue-600" />
                    Type de véhicule
                  </label>
                  <div className="space-y-2">
                    {['all', 'SUV', 'berline', 'camionnette', 'monospace', 'cabriolet', 'coupé', 'break'].map(type => (
                      <label key={type} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={filters.type === type}
                          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition">
                          {type === 'all' ? 'Tous les types' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Transmission */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Settings size={16} className="text-blue-600" />
                    Transmission
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'Toutes' },
                      { value: 'automatique', label: 'Automatique' },
                      { value: 'manuelle', label: 'Manuelle' },
                      { value: 'semi-automatique', label: 'Semi-automatique' }
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="transmission"
                          value={opt.value}
                          checked={filters.transmission === opt.value}
                          onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Carburant */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Fuel size={16} className="text-blue-600" />
                    Carburant
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'Tous' },
                      { value: 'essence', label: 'Essence' },
                      { value: 'diesel', label: 'Diesel' },
                      { value: 'hybride', label: 'Hybride' },
                      { value: 'électrique', label: 'Électrique' }
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="fuel"
                          value={opt.value}
                          checked={filters.fuel === opt.value}
                          onChange={(e) => setFilters({ ...filters, fuel: e.target.value })}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Statut */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Statut
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'Tous les statuts' },
                      { value: 'available', label: '✓ Disponible' },
                      { value: 'reserved', label: '⊗ Réservé' },
                      { value: 'maintenance', label: '⚙ En maintenance' }
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="status"
                          value={opt.value}
                          checked={filters.status === opt.value}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Prix */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Plage de prix
                  </label>
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-center font-bold text-blue-600">
                      {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} FCFA
                    </p>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="1000000"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({ ...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Filter size={20} />
                Afficher les filtres
              </button>
            </div>

            {/* Véhicules */}
            <div className="lg:col-span-3">
              {/* Barre d’outils */}
              <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-gray-700 font-medium">
                    <span className="text-2xl font-bold text-gray-900">{filteredVehicles.length}</span>
                    <span className="ml-2">véhicule{filteredVehicles.length !== 1 ? 's' : ''} trouvé{filteredVehicles.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Trier par:</span>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none pr-10 cursor-pointer hover:bg-gray-100 transition"
                      >
                        <option value="name">Nom (A-Z)</option>
                        <option value="price-low">Prix: bas à haut</option>
                        <option value="price-high">Prix: haut à bas</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grille de véhicules */}
              {filteredVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredVehicles.map((vehicle) => (
                    <div key={vehicle._id} className="relative">
                      {/* Bouton Favoris */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(vehicle._id);
                        }}
                        disabled={loadingFavorites.has(vehicle._id)}
                        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all hover:scale-110 disabled:opacity-50"
                        title={favorites.has(vehicle._id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Star
                          size={20}
                          className={`${favorites.has(vehicle._id)
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-400 hover:text-yellow-400'
                            } transition-colors`}
                        />
                      </button>
                      <Link key={vehicle._id} href={`/vehicles/${vehicle._id}`}>
                        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0 h-full flex flex-col bg-white hover:-translate-y-1">
                          {/* Image Container */}
                          <div className="relative h-52 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                            {vehicle.mediaUrls && vehicle.mediaUrls.length > 0 ? (
                              <VehicleImage
                                src={vehicle.mediaUrls[0]}
                                alt={vehicle.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                <div className="flex flex-col items-center gap-2">
                                  <ImageOff size={32} className="text-gray-500" />
                                  <span className="text-gray-500 text-sm">Pas d’image</span>
                                </div>
                              </div>
                            )}
                            {/* Badge Statut */}
                            <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 ${vehicle.status === 'available' || !vehicle.status
                              ? 'bg-green-500 text-white'
                              : vehicle.status === 'reserved'
                                ? 'bg-orange-500 text-white'
                                : 'bg-red-500 text-white'
                              }`}>
                              {vehicle.status === 'available' && '✓ Disponible'}
                              {vehicle.status === 'reserved' && '⊗ Déjà réservé'}
                              {vehicle.status === 'maintenance' && '⚙ En révision'}
                              {!vehicle.status && '✓ Disponible'}
                            </div>
                            {/* Badge Prix */}
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-blue-600 px-3 py-2 rounded-lg text-xs font-bold shadow-lg">
                              {vehicle.dailyRate.toLocaleString()} FCFA/j
                            </div>
                          </div>

                          {/* Contenu Card */}
                          <div className="p-5 flex-1 flex flex-col">
                            {/* Titre */}
                            <div className="mb-2">
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                                {vehicle.name}
                              </h3>
                              <p className="text-sm text-gray-500">{vehicle.bodyType} • {vehicle.year}</p>
                            </div>

                            {/* Description */}
                            {vehicle.description && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {vehicle.description}
                              </p>
                            )}

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                              <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-2">
                                <Users size={16} className="text-blue-600 flex-shrink-0" />
                                <span className="text-gray-700">{vehicle.passengers} places</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm bg-green-50 rounded-lg p-2">
                                <Fuel size={16} className="text-green-600 flex-shrink-0" />
                                <span className="text-gray-700 capitalize">{vehicle.fuel}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm bg-purple-50 rounded-lg p-2">
                                <Settings size={16} className="text-purple-600 flex-shrink-0" />
                                <span className="text-gray-700 capitalize">{vehicle.transmission}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm bg-orange-50 rounded-lg p-2">
                                <MapPin size={16} className="text-orange-600 flex-shrink-0" />
                                <span className="text-gray-700">{vehicle.city}</span>
                              </div>
                            </div>

                            {/* Agence Info */}
                            {vehicle.agency && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-4 border-l-4 border-blue-600">
                                <p className="text-xs font-semibold text-gray-600 mb-1">Agence</p>
                                <p className="text-sm font-bold text-gray-900">{vehicle.agency.name}</p>
                                <p className="text-xs text-gray-600">{vehicle.agency.city}</p>
                              </div>
                            )}

                            {/* Équipements */}
                            {vehicle.equipment && vehicle.equipment.length > 0 && (
                              <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-600 mb-2">Équipements</p>
                                <div className="flex flex-wrap gap-1">
                                  {vehicle.equipment.slice(0, 3).map((eq, idx) => (
                                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                      {eq.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                  {vehicle.equipment.length > 3 && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                      +{vehicle.equipment.length - 3} plus
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Bouton Action */}
                            <div className="mt-auto pt-4 border-t border-gray-200">
                              <Button
                                disabled={vehicle.status === 'reserved' || vehicle.status === 'maintenance'}
                                className={`w-full font-semibold py-2 rounded-lg transition-all ${vehicle.status === 'reserved' || vehicle.status === 'maintenance'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                  }`}
                              >
                                {vehicle.status === 'reserved'
                                  ? 'Victime de son succès (Réservé)'
                                  : vehicle.status === 'maintenance'
                                    ? 'En soin (Maintenance)'
                                    : 'Voir détails & réserver'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                  <div className="mb-4">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun véhicule trouvé</h3>
                  <p className="text-gray-600 mb-6">Aucun véhicule ne correspond à vos critères de filtrage.</p>
                  <Button
                    onClick={() => {
                      setFilters({ type: 'all', priceRange: [1000, 1000000], transmission: 'all', fuel: 'all', location: '', status: 'all' });
                      setSearchTerm('');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


    </main>
  );
}
