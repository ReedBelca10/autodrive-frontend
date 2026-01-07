'use client';

import { Card } from '@/components/ui/card';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
    selectedMethod: 'stripe' | 'fedapay';
    onSelect: (method: 'stripe' | 'fedapay') => void;
}

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
    const methods = [
        {
            id: 'fedapay' as const,
            name: 'Mobile Money',
            description: 'Moov, Orange Money, MTN, Wave',
            icon: Smartphone,
            color: 'from-green-500 to-emerald-600',
        },
        {
            id: 'stripe' as const,
            name: 'Carte bancaire',
            description: 'Visa, Mastercard',
            icon: CreditCard,
            color: 'from-blue-500 to-indigo-600',
        },
    ];

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Choisissez votre mode de paiement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {methods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;

                    return (
                        <Card
                            key={method.id}
                            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${isSelected
                                    ? 'ring-2 ring-offset-2 ring-blue-500 bg-blue-50'
                                    : 'hover:border-blue-300'
                                }`}
                            onClick={() => onSelect(method.id)}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${method.color}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900">{method.name}</h4>
                                        {isSelected && (
                                            <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
