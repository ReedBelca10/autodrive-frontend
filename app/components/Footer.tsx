"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const agencies = [
    'AutoDrive KPALIMÉ',
    'AutoDrive ATAKPAMÉ',
    'AutoDrive SOKODÉ',
    'AutoDrive BITITA',
    'AutoDrive KARA',
    'AutoDrive DAPAONG',
    'AutoDrive SINKASSÉ',
    'AutoDrive TOKOIN',
    'AutoDrive ADIDOGOME',
    'AutoDrive AKODESSEWA',
    'AutoDrive ANEHO',
    'AutoDrive VOGAN',
    'AutoDrive NOTSÉ',
    'AutoDrive TSÉVIÉ',
  ];

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
              {agencies.slice(0, 7).map((agency, idx) => (
                <li key={idx}>{agency}</li>
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
                <a href="#" className="hover:text-white transition">
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
                <a href="#" className="hover:text-white transition">
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
