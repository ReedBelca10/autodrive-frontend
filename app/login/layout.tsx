export const metadata = {
  title: 'Connexion - AutoDrive',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // Return children directly so the login page can occupy the full viewport
  return <>{children}</>;
}
