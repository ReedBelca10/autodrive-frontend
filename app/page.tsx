"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// Navbar and Footer are provided by the root layout
import { MapPin, Calendar, CheckCircle, CalendarDays, Car, Shield, Users, Star } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [searchData, setSearchData] = useState({
    location: '',
    startDate: '',
    startTime: '08:00',
    returnDate: '',
    returnTime: '08:00',
    returnLocation: '',
  });

  const vehicles = [
    {
      id: 1,
      name: 'BMW X5',
      type: 'SUV',
      year: '2006',
      price: '$300',
      availability: 'Disponible maintenant',
      image: '/assets/car_image1.png',
      features: ['4 Sièges', 'Hybride', 'Semi-automatique', 'New York'],
    },
    {
      id: 2,
      name: 'Toyota Corolla',
      type: 'Berline',
      year: '2021',
      price: '$130',
      availability: 'Disponible maintenant',
      image: '/assets/car_image2.png',
      features: ['4 Sièges', 'Diesel', 'Automatique', 'Los Angeles'],
    },
    {
      id: 3,
      name: 'BMW X5',
      type: 'SUV',
      year: '2006',
      price: '$300',
      availability: 'Disponible maintenant',
      image: '/assets/car_image3.png',
      features: ['4 Sièges', 'Hybride', 'Semi-automatique', 'New York'],
    },
    {
      id: 4,
      name: 'Jeep Wrangler',
      type: 'SUV',
      year: '2023',
      price: '$200',
      availability: 'Disponible maintenant',
      image: '/assets/car_image4.png',
      features: ['4 Sièges', 'Hybride', 'Automatique', 'Los Angeles'],
    },
    {
      id: 5,
      name: 'Toyota Corolla',
      type: 'Berline',
      year: '2021',
      price: '$130',
      availability: 'Disponible maintenant',
      image: '/assets/car_image2.png',
      features: ['4 Sièges', 'Diesel', 'Manuel', 'Chicago'],
    },
    {
      id: 6,
      name: 'Ford Néo 6',
      type: 'Berline',
      year: '2022',
      price: '$209',
      availability: 'Disponible maintenant',
      image: '/assets/car_image3.png',
      features: ['2 Sièges', 'Diesel', 'Semi-automatique', 'Houston'],
    },
  ];

  const testimonials = [
    {
      name: 'Emma Rodriguez',
      location: 'Barcelone, Espagne',
      rating: 5,
      text: "J'ai loué des voitures auprès de diverses entreprises, mais l'expérience avec AutoDrive a été exceptionnelle.",
      image: '/assets/testimonial_image_1.png',
    },
    {
      name: 'John Smith',
      location: 'New York, États-Unis',
      rating: 5,
      text: 'AutoDrive a rendu mon voyage tellement plus facile. La voiture a été livrée directement à ma porte, et le service à la clientèle était fantastique!',
      image: '/assets/user_profile.png',
    },
    {
      name: 'Ava Johnson',
      location: 'Sydney, Australie',
      rating: 5,
      text: "Je recommande vivement AutoDrive! Leur flotte est incroyable et j'ai toujours l'impression de bénéficier de la meilleure offre avec un excellent service.",
      image: '/assets/testimonial_image_2.png',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      location: searchData.location,
      startDate: searchData.startDate,
      startTime: searchData.startTime,
      returnDate: searchData.returnDate,
      returnTime: searchData.returnTime,
    });
    window.location.href = `/vehicles?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative bg-white overflow-visible min-h-[720px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 md:py-20">
            <div className="max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Location de vos
                <br />
                véhicules préférés
                <br />
                simple et{' '}
                <span className="relative inline-block text-blue-600">
                  Abordable
                  <svg
                    className="absolute left-0"
                    style={{ bottom: '-10px', width: '100%', height: '20px', minWidth: '230px' }}
                    viewBox="0 0 230 20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0 15 Q 57.5 5, 115 10 T 230 15"
                      stroke="#2563eb"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-gray-700 text-lg mb-8">
                Avec plus de 20 ans d&apos;expérience, AutoDrive est un des principaux loueur de voitures au Togo
              </p>
            </div>

            <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 pointer-events-none">
              <Image
                src="/assets/car 2 1.png"
                alt="Porsche Blue"
                width={900}
                height={700}
                className="object-contain w-full h-auto"
              />
            </div>
          </div>

          {/* Reservation form overlay - visible on first view */}
          <div className="w-full flex justify-center">
            <form onSubmit={handleSearchSubmit} className="md:absolute md:left-1/2 md:-translate-x-1/2 md:bottom-8 relative -mt-20 w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-4 md:p-6 z-50">
              <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-12">
                {/* Departure group (row 1 / left) */}
                <div className="row-start-1 md:row-auto md:col-span-4 flex items-center gap-4 px-4 py-4">
                  <div className="p-3 rounded-full bg-gray-50 text-blue-600 shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 uppercase">Lieu de départ</div>
                    <input
                      type="text"
                      placeholder="Rechercher un lieu"
                      value={searchData.location}
                      onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                      className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date group (center) */}
                <div className="md:col-span-4 flex items-center gap-4 px-4 py-4 md:border-l md:border-r md:border-gray-100">
                  <div className="p-3 rounded-full bg-gray-50 text-blue-600 shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 uppercase">Date de départ</div>
                    <input
                      type="date"
                      value={searchData.startDate}
                      onChange={(e) => setSearchData({ ...searchData, startDate: e.target.value })}
                      className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Time + button (right) */}
                <div className="md:col-span-2 flex items-center justify-between px-4 py-4">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 uppercase">Heure</div>
                    <input
                      type="time"
                      value={searchData.startTime}
                      onChange={(e) => setSearchData({ ...searchData, startTime: e.target.value })}
                      className="w-full text-sm text-gray-600 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Return row - mirrors above */}
                <div className="row-start-2 md:col-span-4 flex items-center gap-4 px-4 py-4">
                  <div className="p-3 rounded-full bg-gray-50 text-blue-600 shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 uppercase">Lieu de retour</div>
                    <input
                      type="text"
                      placeholder="Rechercher un lieu"
                      value={searchData.returnLocation || ''}
                      onChange={(e) => setSearchData({ ...searchData, returnLocation: e.target.value })}
                      className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 flex items-center gap-4 px-4 py-4 md:border-l md:border-r md:border-gray-100">
                  <div className="p-3 rounded-full bg-gray-50 text-blue-600 shadow-sm">
                    <CalendarDays size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 uppercase">Date de retour</div>
                    <input
                      type="date"
                      value={searchData.returnDate}
                      onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                      className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-between px-4 py-4">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700 uppercase">Heure</div>
                    <input
                      type="time"
                      value={searchData.returnTime || ''}
                      onChange={(e) => setSearchData({ ...searchData, returnTime: e.target.value })}
                      className="w-full text-sm text-gray-600 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Single CTA spanning both rows on desktop, and full-width on mobile (appears last) */}
                <div className="row-start-1 md:row-span-2 md:col-span-2 flex items-center justify-center px-4 py-4">
                  <Button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg w-40 md:w-44">RESERVER</Button>
                </div>

              </div>
            </form>
          </div>
        </div>

        <div className="h-16"></div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-bold uppercase mb-3 tracking-wide">Comment louer une voiture?</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Louez avec les trois étapes
            </h2>
            <p className="text-gray-600 text-lg">suivantes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Renseignez la date/lieu',
                description: 'Entrez le créneau et la ville auquels vous souhaitez prendre/rendre votre voiture',
              },
              {
                icon: CalendarDays,
                title: 'Choisissez votre voiture',
                description: 'Faites votre choix en indiquant vos préférences; les disponibilités sont en temps réel!',
              },
              {
                icon: Car,
                title: 'Validez le paiement',
                description: 'Entrez les informations nécessaires et effectuez votre paiement en ligne',
              },
            ].map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <Card key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 p-8 text-center rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="flex justify-center mb-6">
                    <div className="bg-blue-600 p-5 rounded-full shadow-lg">
                      <IconComponent className="text-white" size={40} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Véhicules en vedette
            </h2>
            <p className="text-gray-600">
              Explorez notre sélection de véhicules haut de gamme disponibles pour votre prochaine aventure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {vehicles.map((vehicle) => (
              <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0 rounded-xl transform hover:-translate-y-2">
                  <div className="relative h-56 bg-gray-200 overflow-hidden">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                      Disponible
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{vehicle.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{vehicle.type} • {vehicle.year}</p>
                    <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-gray-700 font-medium">
                      {vehicle.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className="text-blue-600 mr-1">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                      <span className="text-3xl font-bold text-blue-600">{vehicle.price}</span>
                      <span className="text-sm text-gray-600 font-medium">/jour</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/vehicles">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Explorez toutes les voitures →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <Image
                src="/assets/voiture-3d-sur-une-ville-animee-la-nuit.jpg"
                alt="Luxury Car"
                width={500}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Pourquoi nous
                <br />
                choisir?
              </h2>
              <p className="text-gray-700 text-lg mb-10 font-medium">
                Votre location de voiture, urbaine ou familiale.
              </p>

              {[
                {
                  icon: Shield,
                  title: 'Nos tarifs',
                  description: 'Nos prix sont compétitifs et avantageux.',
                },
                {
                  icon: Calendar,
                  title: 'Disponibilité',
                  description: 'Vous pouvez réserver à tout moment.',
                },
                {
                  icon: MapPin,
                  title: 'Proximité',
                  description: 'Nous sommes présents dans "X" villes au Togo avec "Y" agences.',
                },
                {
                  icon: Users,
                  title: 'Notre offre',
                  description: 'Nos véhicules sont diversifiés et adaptés à vos besoins.',
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex gap-5 mb-8 p-4 rounded-xl hover:bg-blue-50 transition-colors duration-300">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-blue-100">
                        <IconComponent className="text-blue-600" size={28} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-700 text-sm">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-gray-600 text-lg">Des témoignages d&apos;utilisateurs satisfaits du monde entier</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl bg-white hover:scale-105">
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className="rounded-full object-cover border-2 border-blue-100"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-blue-600 text-blue-600" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic">&quot;{testimonial.text}&quot;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ne manquez jamais une offre!
          </h2>
          <p className="text-blue-100 text-lg mb-10 font-medium">
            Abonnez-vous pour bénéficier des dernières offres, des nouveaux arrivants et des réductions exclusives
          </p>

          <form className="flex flex-col md:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Entrez votre adresse email"
              className="flex-1 px-6 py-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-gray-800"
            />
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg">
              S&apos;abonner
            </Button>
          </form>
        </div>
      </section>

      
    </main>
  );
}

