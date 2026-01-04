'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main login page
    // Admin, Manager, and Client all use the same login endpoint
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl text-gray-700">Redirection...</div>
    </div>
  );
}

