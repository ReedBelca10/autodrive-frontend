"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, User, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setForm({ ...form, email: newEmail });
    
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError('Veuillez entrer une adresse email valide');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Vérifier l’email avant de soumettre
    if (!validateEmail(form.email)) {
      setEmailError('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      // Message envoyé avec succès
      setSent(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi du message');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
        <p className="text-gray-600 mb-8">Une question, une réservation spéciale ou besoin d’aide ? Écrivez-nous et nous vous répondrons rapidement.</p>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {sent ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-bold text-green-600">✓ Message envoyé !</h2>
              <p className="text-gray-600 mt-2">Merci, nous reviendrons vers vous bientôt.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <label className="flex items-center gap-3">
                <User className="text-blue-600" />
                <input
                  required
                  placeholder="Votre nom"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                  disabled={loading}
                />
              </label>

              <label className="flex items-center gap-3">
                <Mail className="text-blue-600" />
                <div className="w-full">
                  <input
                    required
                    type="email"
                    placeholder="Votre email"
                    value={form.email}
                    onChange={handleEmailChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none ${
                      emailError 
                        ? 'border-red-400 focus:border-red-600 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-600'
                    }`}
                    disabled={loading}
                  />
                  {emailError && (
                    <p className="text-red-600 text-xs mt-1">{emailError}</p>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3">
                <MessageSquare className="text-blue-600 mt-2" />
                <textarea
                  required
                  placeholder="Votre message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg min-h-[140px] resize-none focus:outline-none focus:border-blue-600"
                  disabled={loading}
                />
              </label>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
