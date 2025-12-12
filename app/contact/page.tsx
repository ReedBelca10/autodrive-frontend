"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, User, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now just simulate a send
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
        <p className="text-gray-600 mb-8">Une question, une réservation spéciale ou besoin d'aide ? Écrivez-nous et nous vous répondrons rapidement.</p>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {sent ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-bold text-green-600">Message envoyé !</h2>
              <p className="text-gray-600 mt-2">Merci, nous reviendrons vers vous bientôt.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <label className="flex items-center gap-3">
                <User className="text-blue-600" />
                <input
                  required
                  placeholder="Votre nom"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg"
                />
              </label>

              <label className="flex items-center gap-3">
                <Mail className="text-blue-600" />
                <input
                  required
                  type="email"
                  placeholder="Votre email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg"
                />
              </label>

              <label className="flex items-start gap-3">
                <MessageSquare className="text-blue-600 mt-2" />
                <textarea
                  required
                  placeholder="Votre message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg min-h-[140px] resize-none"
                />
              </label>

              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 text-white">Envoyer</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
