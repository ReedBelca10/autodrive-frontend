"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/logoSansBack.png"
              alt="AutoDrive Logo"
              width={150}
              height={100}
              className="rounded"
              style={{ width: 'auto', height: 'auto' }}
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
            <Button variant="outline" className="border-gray-300">
              Connexion
            </Button>
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
          </div>
        )}
      </div>
    </nav>
  );
}
