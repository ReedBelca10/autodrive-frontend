"use client";

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// Navbar and Footer provided by root layout
import { Star, Users, Gauge, Zap, Calendar } from 'lucide-react';
import { useState } from 'react';

const allVehicles: Record<number, any> = {
  1: {
    id: 1,
    name: 'BMW X5',
    type: 'SUV',
    year: 2006,
    price: 300,
    image: '/assets/car_image1.png',
    transmission: 'Semi-automatique',
    seats: 4,
    fuel: 'Hybride',
    location: 'New York',
    description: 'Le BMW X5 est un SUV premium offrant confort, performance et technologie de pointe. Parfait pour les longs trajets et les familles.',
    features: ['Climatisation automatique', 'Système audio premium', 'GPS intégré', 'Toit panoramique', 'Système de sécurité avancé'],
    rating: 4.8,
    reviews: 124,
  },
  2: {
    id: 2,
    name: 'Toyota Corolla',
    type: 'Berline',
    year: 2021,
    price: 130,
    image: '/assets/car_image2.png',
    transmission: 'Automatique',
    seats: 4,
    fuel: 'Diesel',
    location: 'Los Angeles',
    description: 'La Toyota Corolla est une voiture fiable et économique, idéale pour les trajets quotidiens en ville ou sur autoroute.',
    features: ['Consommation faible', 'Maintenance économique', 'GPS', 'Système de climatisation', 'Sièges confortables'],
    rating: 4.5,
    reviews: 89,
  },
  3: {
    id: 3,
    name: 'Jeep Wrangler',
    type: 'SUV',
    year: 2023,
    price: 200,
    image: '/assets/car_image4.png',
    transmission: 'Automatique',
    seats: 4,
    fuel: 'Hybride',
    location: 'Los Angeles',
    description: 'Le Jeep Wrangler est un véhicule tout-terrain robuste, parfait pour les aventures en off-road et les routes accidentées.',
    features: ['Traction intégrale', 'Suspension robuste', 'Capacité de franchissement', 'Système audio premium', 'Sièges chauffants'],
    rating: 4.6,
    reviews: 156,
  },
  4: {
    id: 4,
    name: 'Ford Néo 6',
    type: 'Berline',
    year: 2022,
    price: 209,
    image: '/assets/car_image3.png',
    transmission: 'Semi-automatique',
    seats: 2,
    fuel: 'Diesel',
    location: 'Houston',
    description: 'La Ford Néo 6 combine style moderne et performances élevées. Un choix excellent pour les voyages de longue distance.',
    features: ['Design moderne', 'Moteur performant', 'Consommation réduite', 'Technologie hybride', 'Intérieur spacieux'],
    rating: 4.7,
    reviews: 112,
  },
};

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicleId = parseInt(params.id);
  const vehicle = allVehicles[vehicleId];
  const [quantity, setQuantity] = useState(1);

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/vehicles" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Retour aux véhicules
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src={vehicle.image}
                alt={vehicle.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[vehicle.image, vehicle.image, vehicle.image, vehicle.image].map((img, idx) => (
                <div key={idx} className="relative w-full h-20 bg-gray-200 rounded cursor-pointer hover:opacity-75">
                  <Image
                    src={img}
                    alt="Thumbnail"
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold mb-2">
                {vehicle.type}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{vehicle.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(vehicle.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">{vehicle.rating} ({vehicle.reviews} avis)</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                ${vehicle.price}
                <span className="text-lg text-gray-600 font-normal">/jour</span>
              </div>
            </div>

            {/* Specs */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Spécifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: 'Année', value: vehicle.year },
                  { icon: Users, label: 'Passagers', value: `${vehicle.seats}` },
                  { icon: Zap, label: 'Carburant', value: vehicle.fuel },
                  { icon: Gauge, label: 'Transmission', value: vehicle.transmission },
                ].map((spec, idx) => {
                  const IconComponent = spec.icon;
                  return (
                    <Card key={idx} className="p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <IconComponent className="text-blue-600" size={24} />
                        <div>
                          <p className="text-xs text-gray-600 font-bold">{spec.label}</p>
                          <p className="text-sm font-bold text-gray-900">{spec.value}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Équipements</h3>
              <ul className="space-y-2">
                {vehicle.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{vehicle.description}</p>
            </div>

            {/* Reservation */}
            <div className="space-y-3">
              <Link href={`/reservation?vehicleId=${vehicle.id}`} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-bold">
                  Réserver ce véhicule
                </Button>
              </Link>
              <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-3">
                Ajouter aux favoris
              </Button>
            </div>
          </div>
        </div>
      </div>

      
    </main>
  );
}
