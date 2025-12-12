export const metadata = {
  title: 'Inscription - AutoDrive',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  // Keep the register page full-viewport (no global header/footer)
  return <>{children}</>;
}
