"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

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
}

export default function EditVehiclePage() {
  const params = useParams();
  const vehicleId = params.id as string;

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
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [configLoading, setConfigLoading] = useState(true);

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    loadConfigurations();
  }, []);

  useEffect(() => {
    if (!configLoading && vehicleId) {
      loadVehicle();
    }
  }, [configLoading, vehicleId]);

  const loadConfigurations = async () => {
    try {
      const [yearsRes, transRes, fuelRes, bodyRes, equipRes, agenciesRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles/config/years`, { credentials: 'include' }),
        fetch(`${API_BASE}/vehicles/config/transmissions`, { credentials: 'include' }),
        fetch(`${API_BASE}/vehicles/config/fuels`, { credentials: 'include' }),
        fetch(`${API_BASE}/vehicles/config/body-types`, { credentials: 'include' }),
        fetch(`${API_BASE}/vehicles/config/equipments`, { credentials: 'include' }),
        fetch(`${API_BASE}/agencies`, { credentials: 'include' }),
      ]);

      if (yearsRes.ok) setYears(await yearsRes.json());
      if (transRes.ok) setTransmissions(await transRes.json());
      if (fuelRes.ok) setFuels(await fuelRes.json());
      if (bodyRes.ok) setBodyTypes(await bodyRes.json());
      if (equipRes.ok) setEquipments(await equipRes.json());

      if (agenciesRes.ok) {
        const data = await agenciesRes.json();
        setAgencies(Array.isArray(data) ? data : []);
        const uniqueCities = Array.from(new Set(data.map((a: Agency) => a.city))) as string[];
        setCities(uniqueCities);
      }
    } catch (err) {
      setError('Erreur lors du chargement des configurations');
    } finally {
      setConfigLoading(false);
    }
  };

  const loadVehicle = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setForm({
          name: data.name,
          dailyRate: data.dailyRate,
          passengers: data.passengers,
          year: data.year,
          transmission: data.transmission,
          fuel: data.fuel,
          city: data.city,
          agencyId: data.agencyId._id || data.agencyId,
          bodyType: data.bodyType,
          description: data.description,
          equipment: data.equipment || [],
          mediaUrls: data.mediaUrls || [],
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (form.mediaUrls.length + files.length > 5) {
      setError('Maximum 5 fichiers autorisés');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError('');
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileSize = file.size / (1024 * 1024); // en MB

        // Validation de la taille
        if (fileSize > 10) {
          setError(`Le fichier "${file.name}" dépasse 10 MB`);
          setUploading(false);
          e.target.value = '';
          return;
        }

        // Validation du type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
        if (!validTypes.includes(file.type)) {
          setError(`Le type de fichier "${file.type}" n'est pas supporté`);
          setUploading(false);
          e.target.value = '';
          return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch(`${API_BASE}/vehicles/upload/media`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            // Ne pas mettre Content-Type pour FormData - le navigateur le fait automatiquement
            'Accept': 'application/json',
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Erreur serveur ${uploadResponse.status}`);
        }

        const result = await uploadResponse.json();

        if (!result.publicUrl) {
          throw new Error('URL publique non retournée par le serveur');
        }

        newUrls.push(result.publicUrl);
      }

      // Ajouter toutes les URL à la fois
      setForm({ ...form, mediaUrls: [...form.mediaUrls, ...newUrls] });
      setError('');
      e.target.value = '';
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erreur lors de l\'upload. Vérifiez les logs du serveur');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (url: string) => {
    setForm({ ...form, mediaUrls: form.mediaUrls.filter(u => u !== url) });
  };

  const toggleEquipment = (equipment: string) => {
    setForm({
      ...form,
      equipment: form.equipment.includes(equipment)
        ? form.equipment.filter(e => e !== equipment)
        : [...form.equipment, equipment],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      const response = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push('/admin/vehicles');
      } else {
        const data = await response.json();
        setError(data.message || 'Erreur lors de la modification du véhicule');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteVehicle = async (skipConfirm = false) => {
    if (!skipConfirm) {
      toast("Confirmation de suppression", {
        description: "Êtes-vous sûr de vouloir supprimer ce véhicule ?",
        action: {
          label: "Supprimer",
          onClick: () => deleteVehicle(true),
        },
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/admin/vehicles');
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  if (configLoading || loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Modifier le véhicule</h1>

      <Card className="bg-gray-800 border-gray-700 p-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
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

          {/* Localisation */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Localisation</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Ville *
                </label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  required
                >
                  <option value="">Sélectionner une ville</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Agence *
                </label>
                <select
                  value={form.agencyId}
                  onChange={(e) => setForm({ ...form, agencyId: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  required
                >
                  <option value="">Sélectionner une agence</option>
                  {agencies
                    .filter((agency) => form.city === '' || agency.city === form.city)
                    .map((agency) => (
                      <option key={agency._id} value={agency._id}>
                        {agency.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
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

          {/* Médias */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Médias (Maximum 5 fichiers)</h2>

            {form.mediaUrls.length < 5 && (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Upload size={20} />
                    <span>Cliquez pour ajouter des fichiers</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Jusqu'à 10 MB par fichier</p>
                </label>
              </div>
            )}

            {form.mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {form.mediaUrls.map((url) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt="preview"
                      className="w-full h-32 object-cover rounded-lg bg-gray-700"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(url)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={submitLoading || uploading}
            >
              {submitLoading ? 'Modification...' : 'Modifier le véhicule'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteVehicle()}
            >
              Supprimer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
