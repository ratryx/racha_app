import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Racha da Terça',
    template: '%s | Racha da Terça',
  },
  description:
    'Cards, estatísticas e histórico do elenco do Racha da Terça.',
  applicationName: 'Racha da Terça',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#030605',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#030605] antialiased"
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
