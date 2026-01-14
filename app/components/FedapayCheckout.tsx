'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FedapayCheckoutProps {
    paymentUrl: string;
    reservationId: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export function FedapayCheckout({ paymentUrl, reservationId, onSuccess, onError }: FedapayCheckoutProps) {
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // Rediriger vers la page de paiement FedaPay dans un nouvel onglet
        if (paymentUrl) {
            const width = 600;
            const height = 800;
            const left = window.innerWidth / 2 - width / 2;
            const top = window.innerHeight / 2 - height / 2;

            window.open(
                paymentUrl,
                'FedapayPayment',
                `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
            );
        }
    }, [paymentUrl]);

    useEffect(() => {
        if (!reservationId) return;

        // Polling loop to check payment status
        const interval = setInterval(async () => {
            try {
                setIsChecking(true);
                const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/fedapay-status`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.paymentStatus === 'paid' || data.transactionStatus === 'approved') {
                        clearInterval(interval);
                        onSuccess();
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du statut:', error);
            } finally {
                setIsChecking(false);
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }, [reservationId, onSuccess]);

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Redirection vers FedaPay
                </h3>
                <p className="text-gray-600">
                    Vous allez être redirigé vers la page de paiement sécurisée FedaPay...
                </p>
                {isChecking && (
                    <p className="text-xs text-blue-500 mt-2">Vérification du statut en arrière-plan...</p>
                )}
            </div>

            <Button
                onClick={() => window.open(paymentUrl, 'FedapayPayment', 'width=600,height=800')}
                className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
            >
                Ouvrir la fenêtre de paiement
            </Button>

            <div className="text-sm text-gray-500 space-y-2">
                <p className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Paiement sécurisé par FedaPay
                </p>
                <p className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Supports tous les opérateurs (Moov, Orange, MTN, Wave)
                </p>
            </div>

            <p className="text-xs text-center text-gray-400">
                Une fois le paiement effectué, cette page se mettra à jour automatiquement.
            </p>

            {!paymentUrl && (
                <Button
                    onClick={() => onError('URL de paiement invalide')}
                    variant="outline"
                    className="w-full"
                >
                    Retour
                </Button>
            )}
        </div>
    );
}
