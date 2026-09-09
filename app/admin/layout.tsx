"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Car, Users, MessageSquare, Bookmark, LogOut, Menu, X, MapPin, BookOpen, HelpCircle, Mail, Bell, Search } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      try {
        const res = await fetch(`${base}/auth/profile`, { credentials: 'include' });
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/login';
        } else if (res.ok) {
          const data = await res.json();
          if (data.user?.role !== 'admin') {
            window.location.href = '/';
          }
        }
      } catch (err) {
        // If network error, might want to redirect to login or just ignore
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
    try {
      await fetch(`${base}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Car, label: 'Véhicules', href: '/admin/vehicles' },
    { icon: Users, label: 'Utilisateurs', href: '/admin/users' },
    { icon: MapPin, label: 'Nos agences', href: '/admin/agencies' },
    { icon: Bookmark, label: 'Réservation', href: '/admin/reservations' },
    { icon: BookOpen, label: 'Blog', href: '/admin/blog' },
    { icon: HelpCircle, label: 'FAQ', href: '/admin/faq' },
    { icon: Mail, label: 'Newsletter', href: '/admin/newsletter' },
    { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#123744] shadow-2xl transition-all duration-300 flex flex-col z-20`}
      >
        {/* Logo */}
        <div className="h-20 border-b border-white/10 flex items-center justify-between px-6">
          {sidebarOpen && (
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Auto<span className="text-blue-400">Drive</span>
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-400/10 text-white border border-blue-500/20' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-300 transition-colors'} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-slate-300 hover:text-red-400 group"
          >
            <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
            {sidebarOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <div className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Espace d'administration</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:ring-2 ring-blue-500/20 transition-all">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-transparent border-none outline-none text-sm w-48 placeholder-slate-400"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-[#123744] transition-colors rounded-full hover:bg-slate-100">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-[#123744] flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity">
              AD
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
