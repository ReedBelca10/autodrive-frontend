"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// Navbar and Footer are provided by the root layout
import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Filter, Search, ArrowUpDown } from 'lucide-react';

interface Vehicle {
  id: number;
  name: string;
  type: string;
  year: number;
  price: number;
  availability: string;
  image: string;
  features: string[];
  transmission: 'Manuel' | 'Automatique' | 'Semi-automatique';
  seats: number;
  fuel: 'Essence' | 'Diesel' | 'Hybride' | 'Électrique';
  location: string;
}

const allVehicles: Vehicle[] = [
  {
    id: 1,
    name: 'BMW X5',
    type: 'SUV',
    year: 2006,
    price: 300,
    availability: 'Disponible maintenant',
    image: '/assets/car_image1.png',
    transmission: 'Semi-automatique',
    seats: 4,
    fuel: 'Hybride',
    location: 'New York',
    features: ['4 Sièges', 'Hybride', 'Semi-automatique', 'New York'],
  },
  {
    id: 2,
    name: 'Toyota Corolla',
    type: 'Berline',
    year: 2021,
    price: 130,
    availability: 'Disponible maintenant',
    image: '/assets/car_image2.png',
    transmission: 'Automatique',
    seats: 4,
    fuel: 'Diesel',
    location: 'Los Angeles',
    features: ['4 Sièges', 'Diesel', 'Automatique', 'Los Angeles'],
  },
  {
    id: 3,
    name: 'Jeep Wrangler',
    type: 'SUV',
    year: 2023,
    price: 200,
    availability: 'Disponible maintenant',
    image: '/assets/car_image4.png',
    transmission: 'Automatique',
    seats: 4,
    fuel: 'Hybride',
    location: 'Los Angeles',
    features: ['4 Sièges', 'Hybride', 'Automatique', 'Los Angeles'],
  },
  {
    id: 4,
    name: 'Ford Néo 6',
    type: 'Berline',
    year: 2022,
    price: 209,
    availability: 'Disponible maintenant',
    image: '/assets/car_image3.png',
    transmission: 'Semi-automatique',
    seats: 2,
    fuel: 'Diesel',
    location: 'Houston',
    features: ['2 Sièges', 'Diesel', 'Semi-automatique', 'Houston'],
  },
];

export default function VehiclesPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: [0, 500],
    transmission: 'all',
    fuel: 'all',
    location: '',
  });
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = useMemo(() => {
    let result = allVehicles;

    if (filters.type !== 'all') {
      result = result.filter(v => v.type.toLowerCase() === filters.type.toLowerCase());
    }

    result = result.filter(v => v.price >= filters.priceRange[0] && v.price <= filters.priceRange[1]);

    if (filters.transmission !== 'all') {
      result = result.filter(v => v.transmission === filters.transmission);
    }

    if (filters.fuel !== 'all') {
      result = result.filter(v => v.fuel === filters.fuel);
    }

    if (searchTerm) {
      result = result.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [filters, sortBy, searchTerm]);

  return (
    <main className="min-h-screen bg-white">
      

      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-50 to-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Nos Véhicules
          </h1>
          <p className="text-gray-600">
            Parcourez notre sélection de {allVehicles.length} véhicules disponibles
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-20">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Filter size={20} />
                Filtres
              </h3>

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Rechercher</label>
                <Input
                  type="text"
                  placeholder="Marque, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="SUV">SUV</option>
                  <option value="Berline">Berline</option>
                  <option value="Utilitaire">Utilitaire</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Transmission</label>
                <select
                  value={filters.transmission}
                  onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes</option>
                  <option value="Automatique">Automatique</option>
                  <option value="Manuel">Manuel</option>
                  <option value="Semi-automatique">Semi-automatique</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Carburant</label>
                <select
                  value={filters.fuel}
                  onChange={(e) => setFilters({ ...filters, fuel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybride">Hybride</option>
                  <option value="Électrique">Électrique</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-2 block">
                  Prix: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({ ...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredVehicles.length} véhicule{filteredVehicles.length !== 1 ? 's' : ''} trouvé{filteredVehicles.length !== 1 ? 's' : ''}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <option value="name">Trier par nom</option>
                <option value="price-low">Prix: bas à haut</option>
                <option value="price-high">Prix: haut à bas</option>
              </select>
            </div>

            {filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition group cursor-pointer">
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <Image
                          src={vehicle.image}
                          alt={vehicle.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Disponible
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{vehicle.type} • {vehicle.year}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
                          <span>• {vehicle.seats} Sièges</span>
                          <span>• {vehicle.fuel}</span>
                          <span>• {vehicle.transmission}</span>
                          <span>• {vehicle.location}</span>
                        </div>
                        
                        <div className="flex justify-between items-center border-t pt-3">
                          <span className="text-2xl font-bold text-gray-900">${vehicle.price}</span>
                          <span className="text-sm text-gray-600">/jour</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Aucun véhicule ne correspond à vos filtres.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      
    </main>
  );
}
