import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Racha da Terça | Dashboard',
  description: 'Cards de overall e estatísticas do racha semanal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-black antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
