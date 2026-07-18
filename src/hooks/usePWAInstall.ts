import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<boolean>;
}

/**
 * Hook to manage the PWA install prompt.
 * Supports Chrome, Edge, Android (beforeinstallprompt) and iOS Safari (manual guide).
 */
export function usePWAInstall(): UsePWAInstallReturn {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIOS =
    /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase()) &&
    !(window as Window & { MSStream?: unknown }).MSStream;

  const isInStandaloneMode =
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    if (isInStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInStandaloneMode]);

  const promptInstall = async (): Promise<boolean> => {
    if (!installPrompt) return false;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (outcome === 'accepted') setIsInstalled(true);
    return outcome === 'accepted';
  };

  return {
    isInstallable: !!installPrompt || isIOS,
    isInstalled,
    isIOS,
    promptInstall,
  };
}
