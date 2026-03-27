import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Swarm Arena | Solana P2P Competition',
  description: 'A 100% on-chain P2P competition arena on Solana. Set your exposure, compete with others, and earn rewards.',
  keywords: ['Solana', 'Web3', 'DeFi', 'P2P', 'Competition', 'Arena', 'Blockchain'],
  authors: [{ name: 'Swarm Arena' }],
  openGraph: {
    title: 'Swarm Arena',
    description: 'A 100% on-chain P2P competition arena on Solana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swarm Arena',
    description: 'A 100% on-chain P2P competition arena on Solana',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 min-h-screen`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              
              <main className="flex-1 container mx-auto px-4 py-8">
                {children}
              </main>
              
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}