"use client";

// Navbar and Footer provided by root layout
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { VehicleImage } from '@/components/VehicleImage';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutForm } from '@/components/CheckoutForm';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { FedapayCheckout } from '@/components/FedapayCheckout';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Vehicle {
  _id: string;
  name: string;
  dailyRate: number;
  bodyType: string;
  mediaUrls: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function ReservationPage() {
  const [vehicleIdParam, setVehicleIdParam] = useState<string | null>(null);
  const [paramStartDate, setParamStartDate] = useState('');
  const [paramStartTime, setParamStartTime] = useState('10:00');
  const [paramReturnDate, setParamReturnDate] = useState('');
  const [paramReturnTime, setParamReturnTime] = useState('10:00');

  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '10:00',
    returnDate: '',
    returnTime: '10:00',
    location: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    drivingLicense: '',
    insuranceOption: 'basic',
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'fedapay'>('fedapay'); // FedaPay default for African users
  const [fedapayUrl, setFedapayUrl] = useState<string | null>(null);

  // Fetch vehicle details
  useEffect(() => {
    if (vehicleIdParam) {
      const fetchVehicle = async () => {
        try {
          setLoadingVehicle(true);
          const res = await fetch(`${API_BASE_URL}/vehicles/${vehicleIdParam}`);
          if (res.ok) {
            const data = await res.json();
            setVehicle(data);
          }
        } catch (e) {
          console.error("Error fetching vehicle", e);
        } finally {
          setLoadingVehicle(false);
        }
      };
      fetchVehicle();
    }
  }, [vehicleIdParam]);

  // Read query params from URL on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const vid = params.get('vehicleId');
    setVehicleIdParam(vid);
    const sDate = params.get('startDate') || '';
    const sTime = params.get('startTime') || '10:00';
    const rDate = params.get('returnDate') || '';
    const rTime = params.get('returnTime') || '10:00';
    setParamStartDate(sDate);
    setParamStartTime(sTime);
    setParamReturnDate(rDate);
    setParamReturnTime(rTime);
    setFormData((prev) => ({ ...prev, startDate: sDate, startTime: sTime, returnDate: rDate, returnTime: rTime }));
  }, []);

  // Calculate duration and price
  const calculation = useMemo(() => {
    if (!formData.startDate || !formData.returnDate || !vehicle) return null;

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.returnDate}T${formData.returnTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    // Difference in milliseconds
    const diff = end.getTime() - start.getTime();

    // Validate dates
    if (diff <= 0) return { error: "La date de retour doit être après la date de départ" };

    // Duration in days (round up to next active 24h chunk, or just simplified day diff)
    // Business logic: Any part of a day counts as a day? Or 24h blocks?
    // Let's us 24h blocks rounded up.
    const hours = diff / (1000 * 60 * 60);
    const days = Math.ceil(hours / 24);

    const basePrice = days * vehicle.dailyRate;
    const insurancePrice = formData.insuranceOption === 'premium' ? (days * 15000) : 0; // Assuming 15000 FCFA for premium
    const total = basePrice + insurancePrice;

    return { days, basePrice, insurancePrice, total };
  }, [formData.startDate, formData.startTime, formData.returnDate, formData.returnTime, formData.insuranceOption, vehicle]);

  const handleStepSubmit = (nextStep: number) => {
    setValidationError(null);

    if (step === 1) {
      if (!formData.startDate || !formData.returnDate || !formData.location) {
        setValidationError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const now = new Date();
      if (start < now) {
        setValidationError('La date de départ ne peut pas être dans le passé');
        return;
      }

      if (calculation && 'error' in calculation) {
        setValidationError(calculation.error as string);
        return;
      }

      if (!vehicle) {
        setValidationError('Erreur: Aucun véhicule sélectionné');
        return;
      }
    }

    if (step === 3) { // Note: Step 2 skipped if vehicle pre-selected? 
      // Actually let's keep step 2 as just "Review Vehicle" or skip it if we have one.
      // But preserving the original structure:
      // If we have a vehicle, we might want to skip the "selection list" step or just show the selected one.
      // Let's assume step 2 is "Details & Options" now.
    }

    if (step === 2) {
      // Step 2 in original was Vehicle Selection. 
      // Since users click "Reserve" on a specific vehicle, we already have it.
      // We can repurpose Step 2 for "Review & Options" or just move to personal info.
      // Let's make Step 2 "Personal Info" and Step 3 "Summary/Payment" for better flow.
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.drivingLicense) {
        setValidationError('Veuillez remplir toutes les informations personnelles');
        return;
      }
    }

    setStep(nextStep);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!vehicle || !formData.startDate || !formData.returnDate) return;

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.returnDate}T${formData.returnTime}`);

      const payload = {
        vehicleId: vehicle._id,
        startDate: startDateTime.toISOString(),
        returnDate: endDateTime.toISOString(),
        pickupLocation: formData.location,
        returnLocation: formData.location,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        drivingLicense: formData.drivingLicense,
        insuranceOption: formData.insuranceOption
      };

      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Veuillez vous connecter pour effectuer une réservation");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la réservation');
      }

      const data = await response.json();
      setReservationId(data._id);

      // Create Payment Intent with selected gateway
      const paymentRes = await fetch(`${API_BASE_URL}/reservations/${data._id}/payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ gateway: paymentGateway })
      });

      if (!paymentRes.ok) {
        const paymentErrorData = await paymentRes.json();
        console.error('Payment error response:', paymentErrorData);
        throw new Error(paymentErrorData.message || `Erreur ${paymentRes.status} lors de l\'initialisation du paiement`);
      }

      const paymentData = await paymentRes.json();

      if (paymentGateway === 'fedapay') {
        setFedapayUrl(paymentData.paymentUrl);
      } else {
        setClientSecret(paymentData.clientSecret);
      }
      setStep(4); // Move to payment step

    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!reservationId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/reservations/${reservationId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentIntentId })
      });

      if (res.ok) {
        toast.success(`Réservation confirmée avec succès ! ID: ${reservationId}`);
        window.location.href = '/profile/reservations';
      } else {
        toast.error("Erreur lors de la confirmation finale");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur réseau");
    }
  };

  if (loadingVehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement du véhicule...</p>
      </div>
    );
  }

  // If no vehicle is selected, show a helpful message
  if (!vehicle && !loadingVehicle) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Aucun véhicule sélectionné</h2>
            <p className="text-gray-600 mb-6">
              Veuillez d'abord sélectionner un véhicule avant de procéder à la réservation.
            </p>
            <Link href="/vehicles">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Parcourir les véhicules
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/vehicles" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-2 font-medium">
          ← Retour aux véhicules
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form Area */}
          <div className="lg:w-2/3">
            {/* Steps Indicator */}
            <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center relative">
                {/* Connecting Line */}
                <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-100 -z-10" />

                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2 bg-white px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      {s}
                    </div>
                    <span className={`text-xs font-medium ${step >= s ? 'text-blue-600' : 'text-gray-500'}`}>
                      {s === 1 ? 'Trajet' : s === 2 ? 'Identité' : s === 3 ? 'Récap' : 'Paiement'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {validationError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {validationError}
              </div>
            )}

            {step === 1 && (
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="text-blue-600" />
                  Dates et Lieu
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lieu de prise en charge</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                      <Input
                        placeholder="Aéroport, Gare, Centre-ville..."
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 border-b pb-2">Départ</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                        <Input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 border-b pb-2">Retour</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <Input
                          type="date"
                          value={formData.returnDate}
                          onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                        <Input
                          type="time"
                          value={formData.returnTime}
                          onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => handleStepSubmit(2)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl"
                  >
                    Continuer vers mes informations
                  </Button>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos informations</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de permis de conduire</label>
                  <Input
                    value={formData.drivingLicense}
                    onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 py-6">
                    Retour
                  </Button>
                  <Button onClick={() => handleStepSubmit(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6">
                    Voir le récapitulatif
                  </Button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Récapitulatif et Paiement</h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Client</span>
                    <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Permis</span>
                    <span className="font-medium">{formData.drivingLicense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact</span>
                    <span className="font-medium text-sm text-right">{formData.email}<br />{formData.phone}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="font-bold">Options d'assurance</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'basic', label: 'Assurance Tiers (Incluse)', price: 0 },
                      { value: 'premium', label: 'Assurance Tous Risques (+15 000 FCFA/j)', price: 15000 },
                    ].map((option) => (
                      <label key={option.value} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.insuranceOption === option.value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200'
                        }`}>
                        <input
                          type="radio"
                          name="insurance"
                          value={option.value}
                          checked={formData.insuranceOption === option.value}
                          onChange={(e) => setFormData({ ...formData, insuranceOption: e.target.value })}
                          className="mr-3 w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium block">{option.label}</span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {option.price === 0 ? 'Gratuit' : `+${option.price.toLocaleString()} FCFA`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <PaymentMethodSelector
                  selectedMethod={paymentGateway}
                  onSelect={setPaymentGateway}
                />

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 py-6">
                    Retour
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Traitement...' : 'Procéder au paiement'}
                  </Button>
                </div>
              </Card>
            )}

            {step === 4 && (
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Paiement sécurisé</h2>

                {paymentGateway === 'fedapay' && fedapayUrl && reservationId ? (
                  <FedapayCheckout
                    paymentUrl={fedapayUrl}
                    reservationId={reservationId}
                    onSuccess={() => {
                      toast.success('Paiement réussi ! Votre réservation est confirmée.');
                      window.location.href = '/profile/reservations';
                    }}
                    onError={(error) => {
                      toast.error(`Erreur: ${error}`);
                      setStep(3);
                    }}
                  />
                ) : paymentGateway === 'stripe' && clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm onSuccess={handlePaymentSuccess} />
                  </Elements>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p>Initialisation du paiement...</p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sticky Summary Side */}
          <div className="lg:w-1/3">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b">Votre sélection</h3>

              {vehicle ? (
                <div className="mb-6">
                  <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                    <VehicleImage
                      src={vehicle.mediaUrls?.[0]}
                      alt={vehicle.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-xl">{vehicle.name}</h4>
                  <p className="text-gray-500">{vehicle.bodyType}</p>
                  <div className="flex items-center gap-1 text-blue-600 font-bold mt-1">
                    {vehicle.dailyRate.toLocaleString()} FCFA <span className="text-sm font-normal text-gray-500">/ jour</span>
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                  Aucun véhicule sélectionné
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Lieu</span>
                  <span className="font-medium text-right">{formData.location || '-'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Départ</span>
                  <span className="font-medium text-right">
                    {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : '-'}
                    <br />
                    <span className="text-gray-400 text-xs">{formData.startTime}</span>
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Retour</span>
                  <span className="font-medium text-right">
                    {formData.returnDate ? new Date(formData.returnDate).toLocaleDateString() : '-'}
                    <br />
                    <span className="text-gray-400 text-xs">{formData.returnTime}</span>
                  </span>
                </div>

                {calculation && !('error' in calculation) && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durée</span>
                        <span className="font-medium">{calculation.days} jour{calculation.days > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assurance</span>
                        <span className="font-medium">{calculation.insurancePrice.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-2xl text-blue-600">{calculation.total.toLocaleString()} FCFA</span>
                      </div>
                      <p className="text-xs text-gray-400 text-right mt-1">Taxes incluses</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
