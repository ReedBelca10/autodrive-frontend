"use client";

// Navbar and Footer provided by root layout
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Percent, Calendar, Gift } from 'lucide-react';

export default function PromotionsPage() {
  const promotions = [
    {
      id: 1,
      title: 'Réduction de 20% sur 3 jours',
      description: 'Obtenez 20% de réduction si vous louez un véhicule pour 3 jours ou plus.',
      icon: Percent,
      code: 'PROMO20',
      validUntil: '31 Décembre 2025',
    },
    {
      id: 2,
      title: 'Deuxième location gratuite',
      description: 'Louez une voiture et recevez 50% de réduction sur votre prochaine location.',
      icon: Gift,
      code: 'PROMO50',
      validUntil: '31 Décembre 2025',
    },
    {
      id: 3,
      title: 'Offre week-end',
      description: 'Louez du vendredi au dimanche et économisez jusqu\'à 15%.',
      icon: Calendar,
      code: 'WEEKEND',
      validUntil: '31 Décembre 2025',
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nos Promotions
          </h1>
          <p className="text-gray-600 text-lg">
            Profitez de nos offres exclusives et économisez sur votre location.
          </p>
        </div>
      </section>

      {/* Promotions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {promotions.map((promo) => {
              const IconComponent = promo.icon;
              return (
                <Card key={promo.id} className="p-8 border-2 border-blue-200 hover:shadow-lg transition">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-600 p-4 rounded-full">
                      <IconComponent className="text-white" size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{promo.title}</h3>
                  <p className="text-gray-600 text-center mb-4">{promo.description}</p>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Code promo</p>
                    <p className="text-2xl font-bold text-blue-600">{promo.code}</p>
                  </div>
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Valide jusqu&apos;au {promo.validUntil}
                  </p>
                  <Link href="/vehicles" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Réserver maintenant
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>

          <Card className="p-8 bg-gray-50 border-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Conditions d&apos;utilisation</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Les codes promo ne peuvent pas être combinés</li>
              <li>• Valide pour toutes les locations de 1 jour minimum</li>
              <li>• Non applicable sur les assurances supplémentaires</li>
              <li>• Remboursement non disponible pour les réductions appliquées</li>
              <li>• Offres soumises à disponibilité et conditions d&apos;AutoDrive</li>
            </ul>
          </Card>
        </div>
      </section>

      
    </main>
  );
}
