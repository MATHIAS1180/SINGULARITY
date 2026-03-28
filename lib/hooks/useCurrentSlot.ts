'use client';

import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';

/**
 * Hook to track current Solana slot in real-time
 */
export function useCurrentSlot() {
  const { connection } = useConnection();
  const [slot, setSlot] = useState(0);

  useEffect(() => {
    const updateSlot = async () => {
      try {
        const currentSlot = await connection.getSlot();
        setSlot(currentSlot);
      } catch (error) {
        console.error('Failed to fetch slot:', error);
      }
    };

    // Initial fetch
    updateSlot();

    // Update every second
    const interval = setInterval(updateSlot, 1000);

    return () => clearInterval(interval);
  }, [connection]);

  return slot;
}
