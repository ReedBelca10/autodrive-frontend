"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  _id: string;
  name: string;
  brand: string;
  model: string;
  year?: number;
  dailyRate: number;
  bodyType?: string;
  mediaUrls?: string[];
}

interface Reservation {
  _id: string;
  vehicleId: Vehicle;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  startDate: string;
  returnDate: string;
  status: "pending" | "confirmed" | "cancelled";
  totalPrice: number;
  paymentStatus: string;
  paymentGateway?: string;
  pickupLocation?: string;
  returnLocation?: string;
  insuranceOption?: string;
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export default function MyReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/reservations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Impossible de charger les réservations");
        }

        const data = await res.json();
        setReservations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur s’est produite"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [router]);

  const handleCancelReservation = async (id: string, skipConfirm = false) => {
    if (!skipConfirm) {
      toast("Confirmation d’annulation", {
        description: "Êtes-vous sûr de vouloir annuler cette réservation ?",
        action: {
          label: "Oui, annuler",
          onClick: () => handleCancelReservation(id, true),
        },
      });
      return;
    }

    try {
      setCancellingId(id);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/reservations/${id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Impossible d’annuler la réservation"
        );
      }

      setReservations((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: "cancelled" } : r
        )
      );

      toast.success("Réservation annulée avec succès");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Une erreur s’est produite";
      toast.error(msg);
      setError(msg);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Mes Réservations
          </h1>
          <p className="text-slate-600">
            Gérez et consultez toutes vos réservations de véhicules
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {reservations.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Aucune réservation
            </h3>
            <p className="text-slate-500 mb-6">
              Vous n’avez pas encore de réservation. Commencez par explorer nos
              véhicules.
            </p>
            <Button
              onClick={() => router.push("/vehicles")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Parcourir les véhicules
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reservations.map((reservation) => (
              <Card
                key={reservation._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {reservation.vehicleId.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {reservation.vehicleId.brand} {reservation.vehicleId.model}
                        {reservation.vehicleId.year && ` • ${reservation.vehicleId.year}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Réservation #{reservation._id.substring(0, 8)} • {reservation.firstName} {reservation.lastName}
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${reservation.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : reservation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                      {reservation.status === "confirmed" && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {reservation.status === "pending" && (
                        <Clock className="w-4 h-4" />
                      )}
                      {reservation.status === "cancelled" && (
                        <XCircle className="w-4 h-4" />
                      )}
                      {reservation.status === "confirmed"
                        ? "Confirmée"
                        : reservation.status === "pending"
                          ? "En attente"
                          : "Annulée"}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 py-4 border-y border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Départ</span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {new Date(reservation.startDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Retour</span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {new Date(reservation.returnDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Montant</span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                        }).format(reservation.totalPrice)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Paiement</span>
                      </div>
                      <p
                        className={`font-semibold ${reservation.paymentStatus === "paid"
                            ? "text-green-600"
                            : "text-orange-600"
                          }`}
                      >
                        {reservation.paymentStatus === "paid"
                          ? "Payé"
                          : "Non payé"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {reservation.status === "pending" && (
                      <Button
                        onClick={() =>
                          handleCancelReservation(reservation._id)
                        }
                        disabled={cancellingId === reservation._id}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {cancellingId === reservation._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Annulation...
                          </>
                        ) : (
                          "Annuler la réservation"
                        )}
                      </Button>
                    )}

                    {reservation.status === "cancelled" && (
                      <p className="text-sm text-slate-500 italic">
                        Cette réservation a été annulée
                      </p>
                    )}

                    {reservation.status === "confirmed" && (
                      <p className="text-sm text-slate-500">
                        Votre réservation est confirmée. Profitez de votre
                        voyage !
                      </p>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Email:</span>
                        <p className="font-medium text-slate-900">{reservation.email}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Téléphone:</span>
                        <p className="font-medium text-slate-900">{reservation.phone}</p>
                      </div>
                      {reservation.pickupLocation && reservation.pickupLocation !== 'N/A' && (
                        <div>
                          <span className="text-slate-600">Lieu de départ:</span>
                          <p className="font-medium text-slate-900">{reservation.pickupLocation}</p>
                        </div>
                      )}
                      {reservation.returnLocation && reservation.returnLocation !== 'N/A' && (
                        <div>
                          <span className="text-slate-600">Lieu de retour:</span>
                          <p className="font-medium text-slate-900">{reservation.returnLocation}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 pt-2">
                      Créée le{" "}
                      {new Date(reservation.createdAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
