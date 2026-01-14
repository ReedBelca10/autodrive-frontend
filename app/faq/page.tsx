'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle, HelpCircle } from 'lucide-react';

interface Faq {
    _id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
}

export default function FaqPage() {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('Tous');

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/faq`);
            const data = await response.json();
            setFaqs(data);
        } catch (error) {
            console.error('Erreur lors du chargement des FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFaq = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    const categories = ['Tous', ...Array.from(new Set(faqs.map(f => f.category)))];

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'Tous' || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-8">

            <main className="flex-grow">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-4xl font-bold mb-4">Comment pouvons-nous vous aider ?</h1>
                        <p className="text-xl text-blue-100 mb-8">Trouvez rapidement des réponses aux questions les plus fréquentes.</p>

                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une question..."
                                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-12">
                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 rounded-full font-medium transition ${activeCategory === cat
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* FAQ List */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredFaqs.length > 0 ? (
                        <div className="space-y-4">
                            {filteredFaqs.map((faq) => (
                                <div
                                    key={faq._id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
                                >
                                    <button
                                        onClick={() => toggleFaq(faq._id)}
                                        className="w-full px-6 py-5 text-left flex justify-between items-center group"
                                    >
                                        <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {faq.question}
                                        </span>
                                        {openId === faq._id ? (
                                            <ChevronUp className="text-blue-600 transition-transform duration-200" />
                                        ) : (
                                            <ChevronDown className="text-gray-400 group-hover:text-blue-600 transition-transform duration-200" />
                                        )}
                                    </button>

                                    <div
                                        className={`px-6 transition-all duration-300 ease-in-out ${openId === faq._id ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="text-gray-600 leading-relaxed pt-2 border-t border-gray-50">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <HelpCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-gray-500 text-xl font-medium">Aucun résultat trouvé pour votre recherche.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveCategory('Tous'); }}
                                className="mt-4 text-blue-600 font-semibold hover:underline"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}

                    {/* Contact Support */}
                    <div className="mt-16 bg-blue-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-100">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vous n'avez pas trouvé votre réponse ?</h2>
                            <p className="text-gray-600">Notre équipe est là pour vous aider personnellement.</p>
                        </div>
                        <a
                            href="/contact"
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
                        >
                            <MessageCircle size={20} />
                            Nous contacter
                        </a>
                    </div>
                </div>
            </main>

        </div>
    );
}
