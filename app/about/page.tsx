"use client";

// Navbar and Footer provided by root layout
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Award, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            À propos d&apos;AutoDrive
          </h1>
          <p className="text-gray-600 text-lg">
            Depuis plus de 20 ans, AutoDrive est votre partenaire de confiance pour la location de véhicules au Togo.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/assets/voiture-3d-sur-une-ville-animee-la-nuit.jpg"
                alt="Our Story"
                width={400}
                height={300}
                className="rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Histoire</h2>
              <p className="text-gray-600 mb-4">
                AutoDrive a été fondée avec une vision simple : offrir une location de voitures fiable, transparente et abordable à tous les clients du Togo.
              </p>
              <p className="text-gray-600 mb-4">
                Depuis sa création, notre entreprise a grandi pour devenir l&apos;une des agences de location les plus réputées de la région, avec 14 agences réparties à travers le pays.
              </p>
              <p className="text-gray-600">
                Nous continuons à améliorer nos services et à élargir notre flotte de véhicules pour répondre aux besoins croissants de nos clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: 'Qualité',
                description: 'Nous maintenons la plus haute qualité de service et d\'équipements.',
              },
              {
                icon: Users,
                title: 'Client d\'abord',
                description: 'La satisfaction de nos clients est notre priorité absolue.',
              },
              {
                icon: Clock,
                title: 'Fiabilité',
                description: 'Ponctualité et fiabilité garanties à chaque location.',
              },
              {
                icon: MapPin,
                title: 'Accessibilité',
                description: 'Présents partout au Togo pour votre commodité.',
              },
            ].map((value, idx) => {
              const IconComponent = value.icon;
              return (
                <Card key={idx} className="p-6 text-center bg-white">
                  <div className="flex justify-center mb-4">
                    <IconComponent className="text-blue-600" size={40} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agencies */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Nos Agences</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            AutoDrive opère dans 14 villes à travers le Togo pour mieux vous servir.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'KPALIMÉ',
              'ATAKPAMÉ',
              'SOKODÉ',
              'BITITA',
              'KARA',
              'DAPAONG',
              'SINKASSÉ',
              'TOKOIN',
              'ADIDOGOME',
              'AKODESSEWA',
              'ANEHO',
              'VOGAN',
              'NOTSÉ',
              'TSÉVIÉ',
            ].map((city, idx) => (
              <Card key={idx} className="p-4 flex items-center gap-3 bg-blue-50 border-0">
                <MapPin className="text-blue-600 flex-shrink-0" size={20} />
                <span className="font-medium text-gray-900">AutoDrive {city}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à louer?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Découvrez notre sélection complète de véhicules et réservez en ligne dès aujourd&apos;hui.
          </p>
          <Link href="/vehicles">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg">
              Voir nos véhicules
            </Button>
          </Link>
        </div>
      </section>

      
    </main>
  );
}
