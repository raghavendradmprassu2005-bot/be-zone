import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { X, Download } from 'lucide-react';

/**
 * PWAInstallPrompt
 *
 * Shows a branded install banner at the bottom of the screen.
 * • Chrome / Edge / Android → triggers the native install dialog.
 * • iOS Safari → shows "Add to Home Screen" instructions.
 * • Disappears once installed or dismissed.
 *
 * Add <PWAInstallPrompt /> inside your App component.
 */
export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed || !isInstallable) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[9999] flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-[#FAF7F4] px-4 py-3 shadow-2xl backdrop-blur-sm"
      role="banner"
      aria-label="Install Be-Zone app"
    >
      {/* Icon */}
      <img
        src="/icons/icon-192x192.png"
        alt="Be-Zone"
        className="h-12 w-12 flex-shrink-0 rounded-xl shadow-sm"
      />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 font-body">Install Be-Zone</p>
        {isIOS ? (
          <p className="text-xs text-gray-500 leading-snug font-body">
            Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
          </p>
        ) : (
          <p className="text-xs text-gray-500 leading-snug font-body">
            Shop faster — works offline too.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {!isIOS && (
          <button
            onClick={promptInstall}
            className="flex items-center gap-1.5 rounded-xl bg-[#C4921A] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#b3841a] active:scale-95 transition-all"
            aria-label="Install app"
          >
            <Download size={12} />
            Install
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
