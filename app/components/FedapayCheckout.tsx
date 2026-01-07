'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface FedapayCheckoutProps {
    paymentUrl: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export function FedapayCheckout({ paymentUrl, onSuccess, onError }: FedapayCheckoutProps) {
    useEffect(() => {
        // Redirect to FedaPay payment page
        if (paymentUrl) {
            window.location.href = paymentUrl;
        }
    }, [paymentUrl]);

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
            </div>

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
