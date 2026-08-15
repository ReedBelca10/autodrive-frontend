"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VehicleImage } from '@/components/VehicleImage';
import { Heart, MapPin, Fuel, Users, Settings, Trash2, AlertCircle, Loader } from 'lucide-react';

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
  status?: 'available' | 'reserved' | 'maintenance';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/users/favorites`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setError('Veuillez vous connecter pour voir vos favoris');
          return;
        }
        throw new Error('Erreur lors du chargement des favoris');
      }

      const data = await response.json();
      setFavorites(Array.isArray(data) ? data : []);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Erreur:', err);
      // If we already know we are not authenticated, don’t override the error
      if (isAuthenticated) {
        setError('Impossible de charger vos favoris');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (vehicleId: string) => {
    try {
      setRemovingId(vehicleId);

      const response = await fetch(`${API_BASE_URL}/users/favorites/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setError('Veuillez vous connecter pour voir vos favoris');
          return;
        }
        throw new Error('Erreur lors de la suppression du favori');
      }

      setFavorites(favorites.filter(v => v._id !== vehicleId));
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de supprimer le favori');
    } finally {
      setRemovingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Accès requis</h1>
            <p className="text-gray-600 mb-8">Vous devez être connecté pour consulter vos véhicules favoris.</p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Mes véhicules favoris</h1>
          </div>
          <p className="text-gray-600 mt-2">
            {favorites.length > 0
              ? `Vous avez ${favorites.length} véhicule${favorites.length > 1 ? 's' : ''} en favoris`
              : 'Vous n\'avez pas encore de favoris'}
          </p>
        </div>

        {/* Messages d’erreur */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Erreur</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Chargement */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement de vos favoris...</p>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun favori</h2>
            <p className="text-gray-600 mb-6">Découvrez nos véhicules et ajoutez-les à vos favoris!</p>
            <Link href="/vehicles">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Parcourir les véhicules
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((vehicle) => (
              <Card key={vehicle._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  <VehicleImage
                    src={vehicle.mediaUrls && vehicle.mediaUrls.length > 0 ? vehicle.mediaUrls[0] : ''}
                    alt={vehicle.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  {/* Status Badge */}
                  {vehicle.status && (
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${vehicle.status === 'available'
                        ? 'bg-green-500 text-white'
                        : vehicle.status === 'reserved'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                        }`}>
                        {vehicle.status === 'available' ? 'Disponible' :
                          vehicle.status === 'reserved' ? 'Réservé' : 'Maintenance'}
                      </span>
                    </div>
                  )}
                  {/* Remove from Favorites Button */}
                  <button
                    onClick={() => removeFavorite(vehicle._id)}
                    disabled={removingId === vehicle._id}
                    className="absolute top-3 left-3 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all disabled:opacity-50"
                    title="Supprimer des favoris"
                  >
                    {removingId === vehicle._id ? (
                      <Loader className="w-5 h-5 animate-spin text-red-500" />
                    ) : (
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{vehicle.name}</h3>

                  {/* Price */}
                  <div className="mb-3">
                    <p className="text-2xl font-bold text-blue-600">
                      {vehicle.dailyRate}€ <span className="text-sm text-gray-600">/jour</span>
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {vehicle.description}
                  </p>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{vehicle.passengers} places</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Fuel className="w-4 h-4 text-gray-500" />
                      <span>{vehicle.fuel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>{vehicle.transmission}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{vehicle.city}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/vehicles/${vehicle._id}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Détails
                      </Button>
                    </Link>
                    <Link href={`/reservation?vehicleId=${vehicle._id}`} className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Réserver
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
