"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, XCircle, Smartphone, Loader2 } from 'lucide-react';

interface FedapayCheckoutProps {
    paymentUrl: string;
    reservationId: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export function FedapayCheckout({ paymentUrl, reservationId, onSuccess, onError }: FedapayCheckoutProps) {
    const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (paymentWindow && !paymentWindow.closed) {
                paymentWindow.close();
            }
        };
    }, [paymentWindow]);

    const verifyPaymentStatus = async () => {
        setIsVerifying(true);
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/fedapay-status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la vérification du paiement');
            }

            const data = await response.json();

            if (data.transactionStatus === 'approved' && data.paymentStatus === 'paid') {
                onSuccess();
            } else if (data.transactionStatus === 'declined' || data.transactionStatus === 'canceled') {
                onError('Le paiement a été refusé ou annulé');
            } else {
                // Le paiement est toujours en attente
                onError('Le paiement n’a pas été complété. Veuillez réessayer.');
            }
        } catch (error: unknown) {
            console.error('Error verifying payment:', error);
            onError((error as Error)?.message || 'Erreur lors de la vérification du paiement');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOpenPayment = () => {
        // Open FedaPay payment page in a new window
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const popup = window.open(
            paymentUrl,
            'FedaPay Payment',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        setPaymentWindow(popup);
        setIsChecking(true);

        // Poll to check if payment window is closed
        const checkInterval = setInterval(() => {
            if (popup && popup.closed) {
                clearInterval(checkInterval);
                setIsChecking(false);

                // Verify payment status when window is closed
                verifyPaymentStatus();
            }
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                    <Smartphone className="text-blue-600 mt-1" size={24} />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Paiement Mobile Money</h3>
                        <p className="text-sm text-blue-700">
                            Vous allez être redirigé vers FedaPay pour effectuer votre paiement en toute sécurité
                            via Mobile Money (MTN, Moov, etc.).
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Paiement sécurisé par FedaPay</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Supports MTN Mobile Money, Moov Money, et plus</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Confirmation instantanée</span>
                </div>
            </div>

            <Button
                onClick={handleOpenPayment}
                disabled={isChecking || isVerifying}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold flex items-center justify-center gap-2"
            >
                {isVerifying ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Vérification du paiement...
                    </>
                ) : isChecking ? (
                    'En attente du paiement...'
                ) : (
                    <>
                        Payer avec Mobile Money
                        <ExternalLink size={20} />
                    </>
                )}
            </Button>

            {isChecking && (
                <div className="text-center text-sm text-gray-500">
                    <p>Une fenêtre de paiement s’est ouverte. Veuillez compléter votre paiement.</p>
                    <p className="mt-1">Ne fermez pas cette page pendant le paiement.</p>
                </div>
            )}

            {isVerifying && (
                <div className="text-center text-sm text-blue-600">
                    <p>Vérification du statut de votre paiement...</p>
                    <p className="mt-1">Veuillez patienter.</p>
                </div>
            )}
        </div>
    );
}

