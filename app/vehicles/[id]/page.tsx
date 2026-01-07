"use client";

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VehicleImage } from '@/components/VehicleImage';
// Navbar and Footer provided by root layout
import { Star, Users, Gauge, Zap, Calendar, ChevronLeft, MapPin, Fuel, Settings } from 'lucide-react';
import { useState, useEffect, use } from 'react';

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

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: vehicleId } = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Récupérer le détail du véhicule depuis l'API
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/vehicles/${vehicleId}`;
        console.log('Fetching vehicle from:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Vehicle data received:', data);

        setVehicle(data);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('Error fetching vehicle:', errorMsg);
        setError(errorMsg);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-blue-600 rounded-full opacity-10 animate-pulse"></div>
                  <div className="absolute inset-2 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
              </div>
              <p className="text-gray-600 text-lg font-medium">Chargement du véhicule...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !vehicle) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/vehicles" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-2">
            <ChevronLeft size={20} />
            Retour aux véhicules
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 text-lg font-medium">
              {error ? `Erreur : ${error}` : 'Véhicule non trouvé'}
            </p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Retour
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const mainImage = vehicle.mediaUrls && vehicle.mediaUrls.length > 0 
    ? vehicle.mediaUrls[selectedImageIndex] 
    : undefined;

  const rating = vehicle.reviews?.averageRating || 0;
  const reviewCount = vehicle.reviews?.totalRatings || 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/vehicles" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-2 font-medium transition-colors">
          <ChevronLeft size={20} />
          Retour aux véhicules
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section Images */}
          <div className="space-y-4">
            {/* Image principale - Container responsif avec aspect ratio 16:9 */}
            <div className="relative w-full bg-gray-100 rounded-2xl overflow-hidden shadow-xl border border-gray-200" style={{ aspectRatio: '16 / 9' }}>
              <VehicleImage
                src={mainImage}
                alt={vehicle.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, (max-width: 1280px) 45vw, 500px"
                className="object-cover hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>

            {/* Galerie de photos - Responsive Grid */}
            {vehicle.mediaUrls && vehicle.mediaUrls.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">
                  {vehicle.mediaUrls.length} photo{vehicle.mediaUrls.length > 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {vehicle.mediaUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden transition-all cursor-pointer border-2 ${
                        selectedImageIndex === idx 
                          ? 'border-blue-600 ring-2 ring-blue-400 ring-offset-1' 
                          : 'border-gray-200 opacity-75 hover:opacity-100'
                      }`}
                      aria-label={`Photo ${idx + 1}`}
                    >
                      <VehicleImage
                        src={url}
                        alt={`${vehicle.name} - Photo ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 18vw, 100px"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {/* Badge du numéro */}
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs font-bold rounded px-1.5 py-0.5">
                        {idx + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section Détails */}
          <div>
            {/* En-tête */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                  {vehicle.bodyType}
                </span>
                {/* Badge de statut */}
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white ${
                  vehicle.status === 'available' 
                    ? 'bg-green-500' 
                    : vehicle.status === 'reserved'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}>
                  {vehicle.status === 'available' && '✓ Disponible'}
                  {vehicle.status === 'reserved' && '⊗ Réservé'}
                  {vehicle.status === 'maintenance' && '⚙ Maintenance'}
                  {!vehicle.status && '✓ Disponible'}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{vehicle.name}</h1>
              
              {/* Évaluation */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                {reviewCount > 0 && (
                  <span className="text-gray-600 text-sm">{rating.toFixed(1)} ({reviewCount} avis)</span>
                )}
              </div>

              {/* Localisation */}
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin size={18} className="text-orange-600" />
                <span>{vehicle.city}</span>
              </div>

              {/* Agence */}
              {vehicle.agency && (
                <div className="flex items-start gap-2 text-gray-600 mb-4">
                  <MapPin size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Agence</p>
                    <p className="font-medium text-gray-900">{vehicle.agency.name}</p>
                    <p className="text-sm text-gray-600">{vehicle.agency.city}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Prix */}
            <div className="mb-6 pb-6 border-b-2 border-gray-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {vehicle.dailyRate.toLocaleString()} FCFA
                <span className="text-lg text-gray-600 font-normal">/jour</span>
              </div>
            </div>

            {/* Spécifications */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Spécifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-blue-600" size={24} />
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Année</p>
                      <p className="text-sm font-bold text-gray-900">{vehicle.year}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Users className="text-green-600" size={24} />
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Passagers</p>
                      <p className="text-sm font-bold text-gray-900">{vehicle.passengers}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Zap className="text-amber-600" size={24} />
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Carburant</p>
                      <p className="text-sm font-bold text-gray-900 capitalize">{vehicle.fuel}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Gauge className="text-purple-600" size={24} />
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Transmission</p>
                      <p className="text-sm font-bold text-gray-900 capitalize">{vehicle.transmission}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Équipements */}
            {vehicle.equipment && vehicle.equipment.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Équipements</h3>
                <div className="space-y-2">
                  {vehicle.equipment.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
                      <span className="text-gray-700 capitalize">{feature.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Réservation */}
            <div className="space-y-3">
              <Link href={`/reservation?vehicleId=${vehicle._id}`} className="block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-bold rounded-lg transition-all">
                  Réserver ce véhicule
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg transition-all"
              >
                Ajouter aux favoris
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
