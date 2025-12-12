"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      const res = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Erreur lors de l\'inscription');
        setLoading(false);
        return;
      }
      // Registration successful - redirect to login
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#123744] to-[#0b3a47] flex items-center justify-center p-8">
      <div className="max-w-7xl w-full rounded-2xl relative">
        {/* Card */}
        <div className="bg-white rounded-[34px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
          {/* Left - form area */}
          <div className="md:w-1/2 p-8 md:p-12 lg:p-16">
            <div className="flex flex-col items-start">
                    <img
                      src="/assets/logoSansBack.png"
                      alt="AutoDrive Logo"
                      width={128}
                      height={128}
                      className="object-contain w-32 h-32"
                    />
            </div>

            <h1 className="mt-6 text-4xl font-extrabold text-gray-900">Inscription</h1>

            <form className="mt-8 space-y-4 max-w-md" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Prénom Nom"
                  className="mt-2 block w-full rounded-md bg-[#d7eef8] border border-transparent px-4 py-3 placeholder-gray-600 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="utilisateur@domaine.com"
                  className="mt-2 block w-full rounded-md bg-[#d7eef8] border border-transparent px-4 py-3 placeholder-gray-600 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <div className="mt-2 relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="************"
                    className="block w-full rounded-lg bg-[#dff3fb] border border-transparent px-4 py-3 placeholder-gray-500 focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    aria-label={passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {passwordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.67 21.67 0 014.17-5.09" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <div className="mt-2 relative">
                  <input
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="************"
                    className="block w-full rounded-lg bg-[#dff3fb] border border-transparent px-4 py-3 placeholder-gray-500 focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    aria-label={confirmPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {confirmPasswordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.67 21.67 0 014.17-5.09" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <button disabled={loading} className="mt-2 inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full font-semibold disabled:opacity-60">
                  <span>{loading ? "Inscription..." : "S'inscrire"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

                <div className="mt-4 text-sm text-blue-400">ou continuer avec</div>

                <div className="mt-4 flex items-center gap-4">
                  <button aria-label="Google" className="px-6 h-10 min-w-[96px] rounded-full border-2 border-[#cfeaf7] bg-white flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M533.5 278.4c0-18.2-1.6-36-4.6-53.2H272v100.8h147.5c-6.3 33.8-25.6 62.5-54.9 81.5v67.8h88.7c52-48 81.2-118.6 81.2-197z" fill="#4285F4"/>
                      <path d="M272 544.3c73.6 0 135.4-24.4 180.5-66.5l-88.7-67.8c-24.7 16.6-56.2 26.5-91.8 26.5-70.6 0-130.4-47.6-151.9-111.5H27.5v69.9C72.6 486.6 167.8 544.3 272 544.3z" fill="#34A853"/>
                      <path d="M120.1 322.4c-10.5-31.3-10.5-64.9 0-96.2V156.3H27.5c-39.5 77.1-39.5 168 0 245.1l92.6-78.9z" fill="#FBBC05"/>
                      <path d="M272 109.7c38.9 0 74 13.4 101.6 39.6l76.1-76.1C409.3 24 345.5 0 272 0 167.8 0 72.6 57.7 27.5 145.9l92.6 69.9C141.6 157.3 201.4 109.7 272 109.7z" fill="#EA4335"/>
                    </svg>
                  </button>
                  <button aria-label="Twitter (X)" className="px-6 h-10 min-w-[96px] rounded-full border-2 border-[#cfeaf7] bg-white flex items-center justify-center">
                    <span className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm border border-[#e6f7fb] overflow-hidden">
                      <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="block">
                        <rect x="0" y="0" width="24" height="24" rx="6" fill="#1DA1F2" />
                        <path d="M21.538 6.548c-.599.266-1.244.446-1.922.527.692-.414 1.223-1.07 1.473-1.854-.648.384-1.364.663-2.126.814-.611-.651-1.48-1.057-2.444-1.057-1.848 0-3.347 1.605-3.047 3.37C8.22 8.02 6.08 6.6 4.44 4.701c-.67 1.166-.334 2.69 1.021 3.456-.52-.016-1.01-.159-1.437-.396v.04c0 1.591 1.123 2.926 2.615 3.229-.486.133-.997.16-1.54.06.434 1.364 1.689 2.349 3.176 2.379-1.163.9-2.63 1.436-4.218 1.436-.274 0-.545-.016-.813-.047C5.98 19.1 8.36 20 10.98 20c7.56 0 11.692-6.374 11.692-11.893 0-.181-.004-.36-.013-.538.8-.57 1.493-1.28 2.043-2.092-.734.325-1.525.545-2.356.646z" fill="#fff" />
                      </svg>
                    </span>
                  </button>
                  <button aria-label="Facebook" className="px-6 h-10 min-w-[96px] rounded-full border-2 border-[#cfeaf7] bg-white flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="12" cy="12" r="11" fill="#1877F2" />
                      <path d="M15.5 8h-1.3c-.6 0-.9.3-.9.9V10h2.2l-.3 2H13.3v6h-2v-6H9.7v-2h1.6v-1.3C11.3 7 12.4 6 13.9 6c.7 0 1.2 0 1.6.1V8z" fill="#fff" />
                    </svg>
                  </button>
                </div>

                <p className="mt-6 text-sm text-gray-400">Déjà un compte ? <Link href="/login" className="text-blue-600 underline">Connexion</Link></p>
              </div>
            </form>
          </div>

          {/* Right - blue panel with car */}
          <div className="md:w-1/2 hidden md:block relative overflow-visible">
            {/* light-blue rounded panel (right half) */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#cfeaf7] rounded-l-3xl" />
            <div className="relative h-full">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[640px] h-[420px] pointer-events-none translate-x-12">
                <Image
                  src="/assets/car 2 1.png"
                  alt="Car"
                  fill
                  sizes="(min-width: 1024px) 760px, (min-width: 768px) 560px, 320px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
