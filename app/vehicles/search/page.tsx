"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Calendar, Clock, Users, Fuel, Settings, MapPin, ImageOff, Filter, Car, Star, Tag, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
// read URL params on client via window.location
import { VehicleImage } from '@/components/VehicleImage';

interface Vehicle {
  _id: string;
  name: string;
  dailyRate: number;
  bodyType: string;
  mediaUrls: string[];
  transmission: string;
  passengers: number;
  fuel: string;
  city: string;
  status?: 'available' | 'reserved' | 'maintenance';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function SearchVehiclesPage() {
  // Read URL parameters client-side
  const urlStartDate = '';
  const urlStartTime = '10:00';
  const urlReturnDate = '';
  const urlReturnTime = '10:00';
  const urlLocation = '';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [startDate, setStartDate] = useState(urlStartDate);
  const [startTime, setStartTime] = useState(urlStartTime);
  const [returnDate, setReturnDate] = useState(urlReturnDate);
  const [returnTime, setReturnTime] = useState(urlReturnTime);
  const [maxPrice, setMaxPrice] = useState('1000000');
  const [searched, setSearched] = useState(!!urlStartDate && !!urlReturnDate);
  const [showFilters, setShowFilters] = useState(true);

  // Fetch all available vehicles on page load
  useEffect(() => {
    // Parse URL search params on client and initialize filters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sDate = params.get('startDate') || '';
      const sTime = params.get('startTime') || '10:00';
      const rDate = params.get('returnDate') || '';
      const rTime = params.get('returnTime') || '10:00';
      const loc = params.get('location') || '';
      setStartDate(sDate);
      setStartTime(sTime);
      setReturnDate(rDate);
      setReturnTime(rTime);
      setSearchName(loc);
      setSearched(!!sDate && !!rDate);
    }
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/vehicles`);
        if (response.ok) {
          const data = await response.json();
          const availableVehicles = (Array.isArray(data) ? data : []).filter(
            (v: Vehicle) => v.status === 'available' || !v.status
          );
          setVehicles(availableVehicles);

          // If URL parameters are present, automatically perform search
          if (urlStartDate && urlReturnDate) {
            const filtered = availableVehicles.filter((vehicle) => {
              const nameMatch = vehicle.name.toLowerCase().includes(searchName.toLowerCase());
              const priceMatch = vehicle.dailyRate <= parseInt(maxPrice);
              const availabilityMatch = vehicle.status === 'available' || !vehicle.status;
              return nameMatch && priceMatch && availabilityMatch;
            });
            setFilteredVehicles(filtered);
          } else {
            setFilteredVehicles(availableVehicles);
          }
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleSearch = () => {
    // Validate dates
    if (!startDate || !returnDate) {
      toast.warning('Veuillez sélectionner les dates de départ et de retour');
      return;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${returnDate}T${returnTime}`);

    if (start >= end) {
      toast.warning('La date de retour doit être après la date de départ');
      return;
    }

    // Filter vehicles by name, price, and availability for dates
    const filtered = vehicles.filter((vehicle) => {
      const nameMatch = vehicle.name.toLowerCase().includes(searchName.toLowerCase());
      const priceMatch = vehicle.dailyRate <= parseInt(maxPrice);
      const availabilityMatch = vehicle.status === 'available' || !vehicle.status;

      return nameMatch && priceMatch && availabilityMatch;
    });

    setFilteredVehicles(filtered);
    setSearched(true);
  };

  const handleReset = () => {
    setSearchName('');
    setStartDate('');
    setStartTime('10:00');
    setReturnDate('');
    setReturnTime('10:00');
    setMaxPrice('1000000');
    setFilteredVehicles(vehicles);
    setSearched(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Trouvez votre véhicule</h1>
              <p className="text-blue-100">Parcourez nos véhicules disponibles et réservez le vôtre</p>
            </div>
            <Link href="/vehicles">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                ← Retour aux véhicules
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Search size={20} />
                Filtres
              </h2>

              <div className="space-y-6">
                {/* Vehicle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du véhicule
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Toyota, Mercedes..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Date de départ
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Heure de départ
                  </label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Date de retour
                  </label>
                  <Input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Return Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Heure de retour
                  </label>
                  <Input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix max par jour
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="1000000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">FCFA</span>
                  </div>
                </div>

                {/* Search Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSearch}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 py-6"
                  >
                    <Search size={18} />
                    Rechercher
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">Chargement des véhicules...</p>
              </div>
            ) : !searched ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Commencez votre recherche</h3>
                <p className="text-gray-600 mb-6">Utilisez les filtres à gauche pour trouver un véhicule qui correspond à vos besoins</p>
                <p className="text-sm text-gray-500">
                  {vehicles.length} véhicules disponibles
                </p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun véhicule trouvé</h3>
                <p className="text-gray-600 mb-6">Aucun véhicule ne correspond à vos critères de recherche</p>
                <Button
                  onClick={handleReset}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Réessayer
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <Card
                    key={vehicle._id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-0"
                  >
                    {/* Image */}
                    <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      {vehicle.mediaUrls && vehicle.mediaUrls.length > 0 ? (
                        <VehicleImage
                          src={vehicle.mediaUrls[0]}
                          alt={vehicle.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <div className="flex flex-col items-center gap-2">
                            <ImageOff size={32} className="text-gray-500" />
                            <span className="text-gray-500 text-sm">Pas d'image</span>
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
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                        {vehicle.dailyRate.toLocaleString()} FCFA/j
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                        {vehicle.name}
                      </h3>

                      {/* Quick Details */}
                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-5">
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          {vehicle.passengers} places
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel size={16} />
                          {vehicle.fuel}
                        </div>
                        <div className="flex items-center gap-1">
                          <Settings size={16} />
                          {vehicle.transmission}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {vehicle.city}
                        </div>
                      </div>

                      {/* Select Button */}
                      <Link
                        href={`/reservation?vehicleId=${vehicle._id}&startDate=${startDate}&startTime=${startTime}&returnDate=${returnDate}&returnTime=${returnTime}`}
                      >
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all">
                          Sélectionner ce véhicule
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
