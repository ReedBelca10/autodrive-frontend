"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Une erreur est survenue';
      if (errMsg.includes('fetch')) {
        setError('Impossible de se connecter au serveur');
      } else if (errMsg.includes('not found')) {
        setError('Aucun compte associé à cet email');
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={48} className="text-green-600" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Email envoyé!
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
            </p>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Prochaines étapes:</h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Vérifiez votre boîte email</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Cliquez sur le lien de réinitialisation</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Créez un nouveau mot de passe</span>
                </li>
              </ul>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-600 text-center mb-6">
              Le lien est valide pendant 1 heure. Vérifiez aussi votre dossier de spam.
            </p>

            {/* Button */}
            <Link
              href="/login"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-center block"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/assets/logoBlanc.png"
              alt="AutoDrive Logo"
              width={60}
              height={60}
              className="rounded"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AutoDrive</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back Button */}
          <Link
            href="/login"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mot de passe oublié?
          </h2>
          <p className="text-gray-600 mb-6">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  placeholder="vous@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Footer */}
          <p className="text-center text-gray-600 text-sm">
            Vous vous souvenez de votre mot de passe?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
