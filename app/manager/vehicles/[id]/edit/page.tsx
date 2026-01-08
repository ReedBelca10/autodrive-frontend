'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface VehicleForm {
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuel: string;
  bodyType: string;
  dailyRate: number;
  seats: number;
  luggage: number;
  mileage: number;
  description: string;
  features: string[];
}

interface Config {
  transmissions: string[];
  fuels: string[];
  bodyTypes: string[];
  equipments: string[];
  years: number[];
}

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<VehicleForm>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    transmission: '',
    fuel: '',
    bodyType: '',
    dailyRate: 0,
    seats: 5,
    luggage: 0,
    mileage: 0,
    description: '',
    features: [],
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    Promise.all([fetchConfig(), fetchVehicle()]);
  }, [vehicleId]);

  const fetchConfig = async () => {
    try {
      const [transmissionsRes, fuelsRes, bodyTypesRes, equipmentsRes, yearsRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles/config/transmissions`),
        fetch(`${API_BASE}/vehicles/config/fuels`),
        fetch(`${API_BASE}/vehicles/config/body-types`),
        fetch(`${API_BASE}/vehicles/config/equipments`),
        fetch(`${API_BASE}/vehicles/config/years`),
      ]);

      const [transmissions, fuels, bodyTypes, equipments, years] = await Promise.all([
        transmissionsRes.json(),
        fuelsRes.json(),
        bodyTypesRes.json(),
        equipmentsRes.json(),
        yearsRes.json(),
      ]);

      setConfig({
        transmissions: transmissions.data || [],
        fuels: fuels.data || [],
        bodyTypes: bodyTypes.data || [],
        equipments: equipments.data || [],
        years: years.data || [],
      });
    } catch (err) {
      setError('Erreur lors du chargement de la configuration');
    }
  };

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const vehicle = await response.json();
        setForm({
          brand: vehicle.brand || '',
          model: vehicle.model || '',
          year: vehicle.year || new Date().getFullYear(),
          transmission: vehicle.transmission || '',
          fuel: vehicle.fuel || '',
          bodyType: vehicle.bodyType || '',
          dailyRate: vehicle.dailyRate || 0,
          seats: vehicle.seats || 5,
          luggage: vehicle.luggage || 0,
          mileage: vehicle.mileage || 0,
          description: vehicle.description || '',
          features: vehicle.features || [],
        });
      } else {
        setError('Véhicule non trouvé');
      }
    } catch (err) {
      setError('Erreur lors du chargement du véhicule');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSuccess('Véhicule mis à jour avec succès !');
        setTimeout(() => {
          router.push('/manager');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la mise à jour du véhicule');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du véhicule');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/manager" className="hover:text-blue-400 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Éditer un Véhicule</h1>
            <p className="text-gray-400 mt-1">Modifiez les informations de votre véhicule</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg text-green-200 flex items-center gap-2">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Informations de base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Marque</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={e => handleInputChange('brand', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Modèle</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={e => handleInputChange('model', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Année</label>
                <select
                  value={form.year}
                  onChange={e => handleInputChange('year', parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {config.years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Tarif journalier (FCFA)</label>
                <input
                  type="number"
                  value={form.dailyRate}
                  onChange={e => handleInputChange('dailyRate', parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Spécifications */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Spécifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Type de carburant</label>
                <select
                  value={form.fuel}
                  onChange={e => handleInputChange('fuel', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sélectionnez un carburant</option>
                  {config.fuels.map(fuel => (
                    <option key={fuel} value={fuel}>
                      {fuel}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Transmission</label>
                <select
                  value={form.transmission}
                  onChange={e => handleInputChange('transmission', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sélectionnez une transmission</option>
                  {config.transmissions.map(trans => (
                    <option key={trans} value={trans}>
                      {trans}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Type de carrosserie</label>
                <select
                  value={form.bodyType}
                  onChange={e => handleInputChange('bodyType', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sélectionnez un type</option>
                  {config.bodyTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Sièges</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={form.seats}
                  onChange={e => handleInputChange('seats', parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Maletage (litres)</label>
                <input
                  type="number"
                  min="0"
                  value={form.luggage}
                  onChange={e => handleInputChange('luggage', parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Kilométrage</label>
                <input
                  type="number"
                  min="0"
                  value={form.mileage}
                  onChange={e => handleInputChange('mileage', parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Description et Équipements */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Description et Équipements</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Équipements inclus</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {config.equipments.map(equipment => (
                  <label key={equipment} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.features.includes(equipment)}
                      onChange={() => handleFeatureToggle(equipment)}
                      className="w-4 h-4 bg-gray-700 border border-gray-600 rounded"
                    />
                    <span className="text-sm">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* Buttons */}
          <div className="flex gap-4">
            <Link
              href="/manager"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors text-center font-semibold"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              {saving ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
