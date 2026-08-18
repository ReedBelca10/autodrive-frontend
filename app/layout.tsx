import './globals.css';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'AutoDrive',
  description: "Location de voitures et services AutoDrive",
  icons: {
    icon: '/assets/logoSansBack.png',
    apple: '/assets/logoSansBack.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/assets/logoSansBack.png" />
      </head>
      <body className="antialiased bg-white text-gray-900">
        <div className="min-h-screen flex flex-col">
          <Toaster position="top-right" richColors />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
