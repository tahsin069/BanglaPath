'use client';

import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '@/hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-stone-800 bg-[#FBF9F5] border border-stone-300 hover:border-[#9A3412] rounded-lg transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4 text-[#9A3412]" />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-[#FBF9F5] border border-stone-300 p-6 shadow-xl text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#9A3412]" />
                <h3 className="text-base font-[family-name:var(--font-display)] font-semibold">
                  Install BanglaGrantha on Your Device
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-stone-500 hover:text-stone-900 rounded-md"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-stone-700 leading-relaxed">
              {isIOS ? (
                <p>
                  1. Tap the <strong>Share</strong> icon in the Safari toolbar.<br />
                  2. Scroll down and select <strong>Add to Home Screen</strong>.<br />
                  3. Launch <strong>BanglaGrantha</strong> directly from your home screen for full-screen reading and continuous audiobook playback.
                </p>
              ) : (
                <p>
                  1. Open the published app URL in your browser tab.<br />
                  2. Click the <strong>Install BanglaGrantha</strong> icon in the browser address bar (or open the browser menu and select <strong>Install App / Add to Home Screen</strong>).<br />
                  3. Enjoy offline reading, saved bookmarks, and synchronized Bengali &amp; English audiobooks across all your devices.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full rounded-lg bg-[#9A3412] py-2.5 text-xs font-medium text-white hover:bg-[#7C2D12] transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-lg bg-[#9A3412] px-3.5 py-2 text-xs font-medium text-white shadow-lg">
      <span>Offline Mode — Cached Bengali &amp; English editions and local voice synthesizer active.</span>
    </div>
  );
};
