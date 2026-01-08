"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

interface VehicleForm {
  name: string;
  dailyRate: number;
  passengers: number;
  year: number;
  transmission: string;
  fuel: string;
  city: string;
  agencyId: string;
  bodyType: string;
  description: string;
  equipment: string[];
  mediaUrls: string[];
}

interface Agency {
  _id: string;
  name: string;
  city: string;
  managerId?: string;
}

interface ManagerProfile {
  agencyId: string;
  agencyName: string;
  city: string;
}

export default function NewVehiclePage() {
  const [form, setForm] = useState<VehicleForm>({
    name: '',
    dailyRate: 0,
    passengers: 1,
    year: new Date().getFullYear(),
    transmission: 'automatique',
    fuel: 'essence',
    city: '',
    agencyId: '',
    bodyType: 'berline',
    description: '',
    equipment: [],
    mediaUrls: [],
  });

  const [years, setYears] = useState<number[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [configLoading, setConfigLoading] = useState(true);
  const [manager, setManager] = useState<ManagerProfile | null>(null);

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    loadManagerAndConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadManagerAndConfig = async () => {
    try {
      // Fetch manager profile
      const token = localStorage.getItem('token');
      const managerRes = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (managerRes.ok) {
        const managerData = await managerRes.json();
        if (managerData.agencyId) {
          setManager({
            agencyId: managerData.agencyId,
            agencyName: managerData.agencyName || 'Mon Agence',
            city: managerData.city || '',
          });
          setForm((prev) => ({
            ...prev,
            agencyId: managerData.agencyId,
            city: managerData.city || '',
          }));
        }
      }

      // Fetch configurations
      const [yearsRes, transRes, fuelRes, bodyRes, equipRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles/config/years`, { credentials: 'include' }),
        fetch(`${API_BASE}/vehicles/config/transmissions`, { credentials: 'include' }),
        fetch(`${API_BASE}/vehicles/config/fuels`, { credentials: 'include' }),
        fetch(`${API_BASE}/vehicles/config/body-types`, { credentials: 'include' }),
        fetch(`${API_BASE}/vehicles/config/equipments`, { credentials: 'include' }),
      ]);

      if (yearsRes.ok) setYears(await yearsRes.json());
      if (transRes.ok) setTransmissions(await transRes.json());
      if (fuelRes.ok) setFuels(await fuelRes.json());
      if (bodyRes.ok) setBodyTypes(await bodyRes.json());
      if (equipRes.ok) setEquipments(await equipRes.json());
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setConfigLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE}/vehicles/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setForm((prev) => ({
          ...prev,
          mediaUrls: [...prev.mediaUrls, ...data.urls],
        }));
      } else {
        setError('Erreur lors de l\'upload');
      }
    } catch (err) {
      setError('Erreur lors de l\'upload des fichiers');
    } finally {
      setUploading(false);
    }
  };

  const toggleEquipment = (equip: string) => {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equip)
        ? prev.equipment.filter((e) => e !== equip)
        : [...prev.equipment, equip],
    }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.dailyRate || !form.agencyId) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSuccess('Véhicule créé avec succès !');
        setTimeout(() => {
          router.push('/manager');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la création du véhicule');
      }
    } catch (err) {
      setError('Erreur lors de la création du véhicule');
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold">Ajouter un véhicule</h1>
          <p className="text-gray-400 mt-2">Publiez un nouveau véhicule dans votre agence</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg text-green-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Informations de base</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Nom et modèle du véhicule *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Mercedes C-Class 2023"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Tarif journalier (F CFA) *
                  </label>
                  <input
                    type="number"
                    value={form.dailyRate}
                    onChange={(e) => setForm({ ...form, dailyRate: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Nombre de passagers *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.passengers}
                    onChange={(e) => setForm({ ...form, passengers: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Année *
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    required
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Type de carrosserie *
                  </label>
                  <select
                    value={form.bodyType}
                    onChange={(e) => setForm({ ...form, bodyType: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    required
                  >
                    {bodyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Transmission *
                  </label>
                  <select
                    value={form.transmission}
                    onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    required
                  >
                    {transmissions.map((trans) => (
                      <option key={trans} value={trans}>
                        {trans.charAt(0).toUpperCase() + trans.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Carburant *
                  </label>
                  <select
                    value={form.fuel}
                    onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                    required
                  >
                    {fuels.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Localisation - Pré-remplie et désactivée */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Localisation</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  value={form.city || 'N/A'}
                  disabled
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 focus:outline-none opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Automatiquement définie par votre agence</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Agence
                </label>
                <input
                  type="text"
                  value={manager?.agencyName || 'N/A'}
                  disabled
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 focus:outline-none opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Automatiquement définie par votre compte</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Description et détails</h2>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Décrivez votre véhicule de manière détaillée..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          {/* Équipements */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Équipements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {equipments.map((equip) => (
                <label key={equip} className="flex items-center gap-2 text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.equipment.includes(equip)}
                    onChange={() => toggleEquipment(equip)}
                    className="rounded border-gray-600"
                  />
                  <span className="text-sm capitalize">{equip.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Photos</h2>

            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Upload className="mx-auto mb-4 text-gray-400" size={32} />
              <label className="cursor-pointer">
                <span className="text-blue-400 hover:text-blue-300">Télécharger des images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-gray-500 text-sm mt-2">ou glissez-déposez vos images</p>
            </div>

            {form.mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {form.mediaUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt={`Vehicle ${index}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/manager')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white"
            >
              {loading ? 'Création en cours...' : 'Créer le véhicule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
