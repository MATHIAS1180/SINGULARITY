'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded" />
              <span className="font-bold text-white">Swarm Arena</span>
            </div>
            <p className="text-sm text-gray-400">
              100% on-chain P2P competition on Solana
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/activity" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Activity
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://docs.solana.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Solana Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Network Info */}
          <div>
            <h3 className="font-semibold text-white mb-3">Network</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-400">Devnet</span>
              </div>
              <a
                href={`https://explorer.solana.com/address/${process.env.NEXT_PUBLIC_PROGRAM_ID}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors block"
              >
                View Program
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <p>© {currentYear} Swarm Arena. Built on Solana.</p>
        </div>
      </div>
    </footer>
  );
}
