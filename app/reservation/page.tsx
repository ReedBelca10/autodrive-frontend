"use client";

// Navbar and Footer provided by root layout
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ReservationPage() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '08:00',
    returnDate: '',
    returnTime: '08:00',
    location: '',
    selectedVehicle: vehicleId || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    drivingLicense: '',
    insuranceOption: 'basic',
  });

  const handleStepSubmit = (nextStep: number) => {
    if (step === 1) {
      if (!formData.startDate || !formData.returnDate || !formData.location) {
        alert('Veuillez remplir tous les champs');
        return;
      }
    }
    if (step === 2) {
      if (!formData.selectedVehicle) {
        alert('Veuillez sélectionner un véhicule');
        return;
      }
    }
    if (step === 3) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.drivingLicense) {
        alert('Veuillez remplir tous les champs');
        return;
      }
    }
    setStep(nextStep);
  };

  const handleSubmit = () => {
    console.log('Réservation soumise:', formData);
    alert('Réservation en cours... (À connecter avec le backend)');
  };

  const vehicles = [
    { id: '1', name: 'BMW X5', price: 300, type: 'SUV' },
    { id: '2', name: 'Toyota Corolla', price: 130, type: 'Berline' },
    { id: '3', name: 'Jeep Wrangler', price: 200, type: 'SUV' },
  ];

  return (
    <main className="min-h-screen bg-white">
      

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Accueil
        </Link>

        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Date & Lieu</span>
            <span>Véhicule</span>
            <span>Confirmation</span>
          </div>
        </div>

        {step === 1 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Étape 1: Renseignez la date/lieu</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lieu de départ</label>
                <Input
                  placeholder="Ex: Lomé"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date de départ</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Heure de départ</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date de retour</label>
                  <Input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Heure de retour</label>
                  <Input
                    type="time"
                    value={formData.returnTime}
                    onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={() => handleStepSubmit(2)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center gap-2"
            >
              Continuer <ChevronRight size={20} />
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Étape 2: Choisissez votre voiture</h2>
            <div className="space-y-4 mb-6">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => setFormData({ ...formData, selectedVehicle: vehicle.id })}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.selectedVehicle === vehicle.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900">{vehicle.name}</h3>
                      <p className="text-gray-600 text-sm">{vehicle.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${vehicle.price}</p>
                      <p className="text-gray-600 text-sm">/jour</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 py-3"
              >
                Retour
              </Button>
              <Button
                onClick={() => handleStepSubmit(3)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center gap-2"
              >
                Continuer <ChevronRight size={20} />
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Étape 3: Validez et payez</h2>
            <div className="mb-8 pb-8 border-b">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  placeholder="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  type="tel"
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-8 pb-8 border-b">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Permis de conduire</h3>
              <Input
                placeholder="Numéro de permis"
                value={formData.drivingLicense}
                onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.value })}
              />
            </div>

            <div className="mb-8 pb-8 border-b">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Assurance</h3>
              <div className="space-y-2">
                {[
                  { value: 'basic', label: 'Assurance basique (Incluse)', price: 0 },
                  { value: 'premium', label: 'Assurance premium', price: 15 },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="insurance"
                      value={option.value}
                      checked={formData.insuranceOption === option.value}
                      onChange={(e) => setFormData({ ...formData, insuranceOption: e.target.value })}
                      className="mr-3"
                    />
                    <span className="flex-1">{option.label}</span>
                    <span className="font-bold text-gray-900">${option.price}/jour</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Résumé</h3>
              <div className="space-y-2 text-gray-700 mb-4">
                <div className="flex justify-between">
                  <span>Véhicule:</span>
                  <span className="font-bold">{vehicles.find(v => v.id === formData.selectedVehicle)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Localisation:</span>
                  <span className="font-bold">{formData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span className="font-bold">{formData.startDate} à {formData.returnDate}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 py-3"
              >
                Retour
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-bold"
              >
                Confirmer et payer
              </Button>
            </div>
          </Card>
        )}
      </div>

      
    </main>
  );
}
