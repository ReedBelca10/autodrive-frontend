"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Agency {
  _id: string;
  name: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export default function Footer() {
  const pathname = usePathname();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch(`${API_BASE}/agencies`);
        if (response.ok) {
          const data = await response.json();
          setAgencies(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des agences:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, [API_BASE]);

  // Hide the footer on the login and register pages
  if (pathname && (pathname.startsWith('/login') || pathname.startsWith('/register'))) return null;

  // Fallback agencies if API fails
  const fallbackAgencies = [
    { _id: '1', name: 'AutoDrive KPALIMÉ', city: 'Kpalimé' },
    { _id: '2', name: 'AutoDrive ATAKPAMÉ', city: 'Atakpamé' },
    { _id: '3', name: 'AutoDrive SOKODÉ', city: 'Sokodé' },
    { _id: '4', name: 'AutoDrive BITITA', city: 'Bitita' },
    { _id: '5', name: 'AutoDrive KARA', city: 'Kara' },
    { _id: '6', name: 'AutoDrive DAPAONG', city: 'Dapaong' },
    { _id: '7', name: 'AutoDrive SINKASSÉ', city: 'Sinkassé' },
  ];

  const displayedAgencies = agencies.length > 0 ? agencies : fallbackAgencies;

  const handleAgencyClick = (agency: Agency) => {
    if (agency.latitude && agency.longitude) {
      const mapsUrl = `https://www.google.com/maps/search/${agency.latitude},${agency.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-1 mb-0">
              <Image
                src="/assets/logoBlanc.png"
                alt="AutoDrive Logo"
                width={100}
                height={100}
                className="rounded"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Location de véhicules particuliers et utilitaires au Togo. Service fiable depuis plus de 20 ans.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-blue-400 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-blue-400 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-blue-400 transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Nos agences */}
          <div>
            <h3 className="font-bold text-white mb-4">Nos agences</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              {displayedAgencies.slice(0, 7).map((agency) => (
                <li key={agency._id}>
                  <button
                    onClick={() => handleAgencyClick(agency)}
                    className="flex items-start gap-1 hover:text-emerald-300 transition cursor-pointer text-left"
                  >
                    <MapPin size={14} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                    <span>{agency.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">AutoDrive</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  QUI SOMMES-NOUS?
                </Link>
              </li>
              <li>
                <a href="/blog" className="hover:text-white transition">
                  NOTRE BLOG
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  PROGRAMME DE FIDÉLITÉ AutoDrive
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="/blog" className="hover:text-white transition">
                  CONSEILS LOCATION DE VOITURES
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">Suivez-Nous</h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>+228 90000000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>location@autodrive.tg</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>Togo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>Copyright 2025 • Location Véhicules, Tous Droits Réservés</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">
              Conditions d&apos;utilisation
            </a>
            <a href="#" className="hover:text-white transition">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
