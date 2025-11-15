'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/serviceWorker';

/**
 * PWAManager - Handles service worker registration and PWA functionality
 */
export function PWAManager() {
  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
  }, []);

  return null; // This component doesn't render anything
}
