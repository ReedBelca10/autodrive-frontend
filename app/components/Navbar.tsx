"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

interface UserProfile {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  // Handle logo click based on user role
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (user) {
      const userRole = user.role;
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'manager') {
        router.push('/manager');
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  const displayName = user?.fullName || (user?.email ? user.email.split('@')[0] : null) || 'Utilisateur';

  const initials = (() => {
    if (!user) return 'AD';
    if (user.fullName) {
      return user.fullName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    }
    if (user.email) return user.email.split('@')[0].slice(0, 2).toUpperCase();
    return 'AD';
  })();

  useEffect(() => {
    const mountedRef = { current: true };

    async function loadProfile() {
      try {
        const res = await fetch(`${API_BASE}/auth/profile`, { credentials: 'include' });
        if (!mountedRef.current) return;
        if (res.ok) {
          const data = await res.json();
          const profile = (data && (data.user || data)) as any;
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (e) {
        if (mountedRef.current) setUser(null);
      }
    }

    loadProfile();

    function onStorage(e: StorageEvent) {
      if (e.key === 'profile_updated_at') loadProfile();
    }

    function onLoginEvent() {
      loadProfile();
    }

    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('autodrive:login', onLoginEvent as EventListener);
    document.addEventListener('click', onDoc);

    return () => {
      mountedRef.current = false;
      document.removeEventListener('click', onDoc);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('autodrive:login', onLoginEvent as EventListener);
    };
  }, [API_BASE]);

  if (pathname && (pathname.startsWith('/login') || pathname.startsWith('/register'))) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-1 md:py-2 lg:py-3">
          {/* Logo */}
          <Link href="/" onClick={handleLogoClick} className="relative z-50 flex items-center gap-3 flex-shrink-0 bg-transparent">
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
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">ACCUEIL</Link>
            <Link href="/vehicles" className="text-gray-700 hover:text-blue-600 font-medium">VÉHICULES</Link>
            <Link href="/promotions" className="text-gray-700 hover:text-blue-600 font-medium">PROMOTIONS</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium">BLOG</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">À PROPOS</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">CONTACT</Link>
          </div>

          {/* Buttons Area */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="hidden md:block">
              <Link href="/vehicles/search">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">RÉSERVER</Button>
              </Link>
            </div>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <NotificationBell />
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center ring-2 ring-gray-100">
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="avatar" width={36} height={36} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs sm:text-sm font-medium text-slate-700">{initials}</span>
                      )}
                    </div>
                    <span className="hidden lg:inline-block text-sm font-medium text-gray-700">{displayName}</span>
                  </button>

                  <div className={`absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 transform origin-top-right transition-all duration-200 ease-out ${menuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                    <div className="px-4 py-2 border-b border-gray-50 mb-1 lg:hidden">
                      <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => setMenuOpen(false)}>Profil</Link>
                    <Link href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => setMenuOpen(false)}>Mes favoris</Link>
                    <div className="border-t border-gray-50 my-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                      onClick={async () => {
                        try {
                          await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
                        } catch (e) {}
                        setUser(null);
                        setMenuOpen(false);
                        router.push('/login');
                      }}
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 hidden sm:flex">Inscription</Button>
                </Link>
                <Link href="/login" className="sm:hidden">
                  <Button size="sm" className="bg-blue-600 text-white">Connexion</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 pb-6 space-y-4 animate-in slide-in-from-top-1">
            <div className="space-y-1 px-2">
              <Link href="/" className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl" onClick={() => setIsOpen(false)}>ACCUEIL</Link>
              <Link href="/vehicles" className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl" onClick={() => setIsOpen(false)}>VÉHICULES</Link>
              <Link href="/favorites" className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl" onClick={() => setIsOpen(false)}>MES FAVORIS</Link>
              <Link href="/promotions" className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl" onClick={() => setIsOpen(false)}>PROMOTIONS</Link>
              <Link href="/blog" className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl" onClick={() => setIsOpen(false)}>BLOG</Link>
              <Link href="/about" className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl" onClick={() => setIsOpen(false)}>À PROPOS</Link>
              <Link href="/contact" className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl" onClick={() => setIsOpen(false)}>CONTACT</Link>
            </div>
            
            <div className="px-4 pt-2">
              <Link href="/vehicles/search" onClick={() => setIsOpen(false)}>
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-lg shadow-blue-200">RÉSERVER MAINTENANT</Button>
              </Link>
            </div>

            {user ? (
               <div className="px-4 pt-4 border-t border-gray-100 mx-2">
                <div className="flex items-center justify-between px-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? <Image src={user.avatarUrl} alt="avatar" width={40} height={40} /> : <span className="font-bold text-slate-700">{initials}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                    </div>
                  </div>
                  <NotificationBell />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium">Profil</Link>
                  <button
                    className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium"
                    onClick={async () => {
                      try { await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' }); } catch (e) {}
                      setUser(null);
                      setIsOpen(false);
                      router.push('/login');
                    }}
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 grid grid-cols-2 gap-3 pt-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full h-11 rounded-xl">Connexion</Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full h-11 rounded-xl bg-gray-900 hover:bg-black text-white">S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
