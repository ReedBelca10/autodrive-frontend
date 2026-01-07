"use client";

import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
    selectedMethod: 'stripe' | 'fedapay';
    onSelect: (method: 'stripe' | 'fedapay') => void;
}

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
    return (
        <div className="space-y-4 mb-6">
            <h3 className="font-bold text-gray-900">Mode de paiement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => onSelect('fedapay')}
                    className={`flex items-center p-4 border-2 rounded-lg transition-all ${selectedMethod === 'fedapay'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <Smartphone className={`mr-3 ${selectedMethod === 'fedapay' ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                    <div className="text-left">
                        <div className="font-semibold">Mobile Money</div>
                        <div className="text-sm text-gray-500">FedaPay (MTN, Moov, etc.)</div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => onSelect('stripe')}
                    className={`flex items-center p-4 border-2 rounded-lg transition-all ${selectedMethod === 'stripe'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <CreditCard className={`mr-3 ${selectedMethod === 'stripe' ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                    <div className="text-left">
                        <div className="font-semibold">Carte Bancaire</div>
                        <div className="text-sm text-gray-500">Visa, Mastercard</div>
                    </div>
                </button>
            </div>
        </div>
    );
}
