"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function EditFaqPage() {
    const router = useRouter();
    const params = useParams();
    const faqId = params?.id as string;
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        question: '',
        answer: '',
        category: 'Général',
        order: 0,
        published: true,
    });

    const categories = [
        'Général',
        'Réservation',
        'Paiement',
        'Véhicules',
        'Support',
        'Assurance'
    ];

    useEffect(() => {
        if (faqId) {
            fetchFaq();
        }
    }, [faqId]);

    const fetchFaq = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/faq/${faqId}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement de la FAQ');
            }

            const data = await response.json();
            setForm({
                question: data.question || '',
                answer: data.answer || '',
                category: data.category || 'Général',
                order: data.order || 0,
                published: data.published ?? true,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.question.trim()) {
            setError('La question est obligatoire');
            return;
        }
        if (!form.answer.trim()) {
            setError('La réponse est obligatoire');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`${API_BASE}/faq/${faqId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    order: Number(form.order)
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erreur lors de la mise à jour');
            }

            router.push('/admin/faq');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <Link href="/admin/faq" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
                    <ArrowLeft size={20} />
                    Retour à la gestion
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Modifier la FAQ</h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question
                        </label>
                        <input
                            type="text"
                            name="question"
                            value={form.question}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Réponse
                        </label>
                        <textarea
                            name="answer"
                            value={form.answer}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catégorie
                            </label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ordre d’affichage
                            </label>
                            <input
                                type="number"
                                name="order"
                                value={form.order}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="published"
                            name="published"
                            checked={form.published}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="published" className="ml-3 text-sm font-medium text-gray-700">
                            Article publié
                        </label>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {submitting ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                        <Link href="/admin/faq" className="flex-1">
                            <Button
                                type="button"
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3"
                            >
                                Annuler
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
}
