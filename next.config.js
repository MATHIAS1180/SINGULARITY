/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Webpack configuration for Solana/Anchor compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Polyfills for browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: require.resolve('buffer/'),
      };
    }
    
    // Ignore backend and programs folders
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/backend/**', '**/programs/**', '**/tests/**', '**/node_modules/**'],
    };
    
    return config;
  },
  
  // Transpile Solana packages
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
  ],
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
    NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID || 'A9W89qV4i21ZCmFTLYZZE3HgwnqimWEFjGd3rowYcZpr',
  },
};

module.exports = nextConfig;
