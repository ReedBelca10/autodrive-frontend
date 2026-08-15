"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Subscriber {
    _id: string;
    email: string;
    active: boolean;
    createdAt: string;
}

export default function NewsletterAdminPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/newsletter/admin`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des abonnés');
            }

            const data = await response.json();
            setSubscribers(data);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Abonnés Newsletter</h1>
                    <p className="text-gray-600 mt-2">Gérez la liste des personnes inscrites à votre newsletter</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-blue-700 font-bold">{subscribers.length}</span>
                    <span className="text-blue-600 ml-1 font-medium text-sm text-uppercase">Abonnés au total</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : subscribers.length === 0 ? (
                <Card className="p-12 text-center">
                    <Mail className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-xl font-medium">Aucun abonné pour le moment</p>
                </Card>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                                <th className="px-6 py-4">EMAIL</th>
                                <th className="px-6 py-4">DATE D’INSCRIPTION</th>
                                <th className="px-6 py-4 text-center">STATUT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subscribers.map((subscriber) => (
                                <tr key={subscriber._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Mail size={16} />
                                            </div>
                                            <span className="font-medium text-gray-900">{subscriber.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm italic">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(subscriber.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${subscriber.active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {subscriber.active ? (
                                                    <><CheckCircle size={14} /> Actif</>
                                                ) : (
                                                    <><XCircle size={14} /> Désabonné</>
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
