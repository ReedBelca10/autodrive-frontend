"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Edit, Trash2, Plus, Eye, EyeOff, AlertCircle, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Faq {
    _id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    published: boolean;
}

export default function FaqManagementPage() {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

    const fetchFaqs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/faq/admin`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des FAQs');
            }

            const data = await response.json();
            setFaqs(data);
            setError('');
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleDelete = async (id: string, skipConfirm = false) => {
        if (!skipConfirm) {
            toast("Confirmation de suppression", {
                description: "Êtes-vous sûr de vouloir supprimer cette question ?",
                action: {
                    label: "Supprimer",
                    onClick: () => handleDelete(id, true),
                },
            });
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/faq/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            setFaqs(faqs.filter(faq => faq._id !== id));
            toast.success('Question supprimée de la FAQ');
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        }
    };

    const handleTogglePublish = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`${API_BASE}/faq/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: !currentStatus }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour');
            }

            setFaqs(faqs.map(faq =>
                faq._id === id ? { ...faq, published: !currentStatus } : faq
            ));
            toast.success(currentStatus ? 'Question masquée' : 'Question publiée');
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion de la FAQ</h1>
                    <p className="text-gray-600 mt-2">Gérez les questions fréquemment posées par vos clients</p>
                </div>
                <Link href="/admin/faq/new">
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6">
                        <Plus size={20} />
                        Ajouter une question
                    </Button>
                </Link>
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
            ) : faqs.length === 0 ? (
                <Card className="p-12 text-center">
                    <HelpCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-xl mb-6">Aucune question trouvée</p>
                    <Link href="/admin/faq/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                            Créer la première FAQ
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                                <th className="px-6 py-4 w-10">ORDRE</th>
                                <th className="px-6 py-4">QUESTION / RÉPONSE</th>
                                <th className="px-6 py-4">CATÉGORIE</th>
                                <th className="px-6 py-4 text-center">STATUT</th>
                                <th className="px-6 py-4 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {faqs.map((faq) => (
                                <tr key={faq._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-400 font-medium">
                                        {faq.order}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-md">
                                            <p className="font-bold text-gray-900 mb-1">{faq.question}</p>
                                            <p className="text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {faq.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleTogglePublish(faq._id, faq.published)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${faq.published
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {faq.published ? (
                                                    <><Eye size={14} /> Publié</>
                                                ) : (
                                                    <><EyeOff size={14} /> Brouillon</>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/faq/${faq._id}/edit`}>
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                                                    <Edit size={18} />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(faq._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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

function HelpCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}
