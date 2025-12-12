"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName?: string; email?: string; avatarUrl?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  const displayName = user?.fullName || (user?.email ? user.email.split('@')[0] : null) || 'Utilisateur';
  const initials = (() => {
    if (!user) return 'AD';
    if (user.fullName) {
      return user.fullName.split(' ').map(n => n[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
    }
    if (user.email) return user.email.split('@')[0].slice(0,2).toUpperCase();
    return 'AD';
  })();

  useEffect(() => {
    // try to fetch profile silently to display user in navbar
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/auth/profile`, { credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          // backend returns { user: {...} } — accept either shape
          const profile = (data && (data.user || data)) as any;
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    }
    load();
    function onStorage(e: StorageEvent) {
      if (e.key === 'profile_updated_at') {
        load();
      }
    }
    window.addEventListener('storage', onStorage);
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => {
      mounted = false;
      document.removeEventListener('click', onDoc);
      window.removeEventListener('storage', onStorage);
    };
  }, [API_BASE]);

  // Hide the navbar on the login and register pages
  if (pathname && (pathname.startsWith('/login') || pathname.startsWith('/register'))) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-1 md:py-2 lg:py-3">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center gap-3 flex-shrink-0 bg-transparent">
            <Image
              src="/assets/logoSansBack.png"
              alt="AutoDrive Logo"
              width={400}
              height={400}
              className="bg-transparent h-10 sm:h-12 md:h-14 lg:h-16 xl:h-18 w-auto object-contain sm:scale-110 md:scale-125 lg:scale-150"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              ACCUEIL
            </Link>
            <Link href="/vehicles" className="text-gray-700 hover:text-blue-600 font-medium">
              VÉHICULES
            </Link>
            <Link href="/promotions" className="text-gray-700 hover:text-blue-600 font-medium">
              PROMOTIONS
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
              À PROPOS
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
              CONTACT
            </Link>
          </div>

          {/* Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/reservation">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                RÉSERVER
              </Button>
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="flex items-center gap-3 rounded-md px-3 py-1 hover:bg-gray-100"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                    {/* Avatar image when available, otherwise initials */}
                    {user && (user as any).avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(user as any).avatarUrl} alt="avatar" className="w-9 h-9 object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-slate-700">{initials}</span>
                    )}
                  </div>
                  <span className="hidden sm:inline-block text-sm font-medium text-gray-700">{displayName}</span>
                </button>

                <div className={`absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg py-1 z-50 transform origin-top-right transition-all duration-150 ease-out ${menuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                    Profil
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={async () => {
                      try {
                        await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
                      } catch (e) {
                        // ignore
                      }
                      setUser(null);
                      setMenuOpen(false);
                      router.push('/login');
                    }}
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-gray-300">
                  Connexion
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              ACCUEIL
            </Link>
            <Link
              href="/vehicles"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              VÉHICULES
            </Link>
            <Link
              href="/promotions"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              PROMOTIONS
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              À PROPOS
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              CONTACT
            </Link>
            <Link
              href="/reservation"
              onClick={() => setIsOpen(false)}
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                RÉSERVER
              </Button>
            </Link>
            {user ? (
              <div className="px-4">
                <Link href="/profile" onClick={() => setIsOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Profil
                </Link>
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={async () => {
                    try {
                      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
                    } catch (e) {}
                    setUser(null);
                    setIsOpen(false);
                    router.push('/login');
                  }}
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full border border-gray-300">Connexion</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
