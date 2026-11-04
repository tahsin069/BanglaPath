'use client';

import React from 'react';

interface SoundwaveVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  heightClass?: string;
}

export function SpotifySoundwaveVisualizer({
  isPlaying,
  barCount = 28,
  heightClass = 'h-24',
}: SoundwaveVisualizerProps) {
  // Symmetric waveform curve weights (peaking in center like the reference image)
  const baseHeights = [
    12, 18, 28, 42, 60, 78, 92, 100, 95, 84, 70, 56, 45, 52, 68, 85, 96, 100, 88, 74, 58, 44, 32, 22, 15, 10, 8, 6
  ];

  return (
    <div
      className={`relative w-full ${heightClass} flex items-center justify-between gap-1 px-3 py-2 rounded-2xl bg-black/30 backdrop-blur-md border border-white/5 overflow-hidden`}
      aria-label="Audio Waveform Visualizer"
    >
      {/* Background ambient gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-sky-500/10 pointer-events-none" />

      {Array.from({ length: barCount }).map((_, idx) => {
        const baseHeight = baseHeights[idx % baseHeights.length];
        const isCyanZone = idx > barCount * 0.6;
        const isTransitionZone = idx > barCount * 0.4 && idx <= barCount * 0.6;

        // Dynamic height calculation
        const heightPercent = isPlaying
          ? Math.max(14, Math.min(100, baseHeight))
          : Math.max(8, baseHeight * 0.28);

        // Animation duration variation for natural organic wave motion
        const animDuration = 0.8 + ((idx * 7) % 11) * 0.08;
        const animDelay = ((idx * 5) % 13) * 0.07;

        return (
          <div
            key={idx}
            className="flex-1 flex items-center justify-center h-full relative"
          >
            <div
              className={`w-full max-w-[4px] rounded-full transition-all duration-300 ${
                isCyanZone
                  ? 'bg-gradient-to-t from-sky-500 via-cyan-400 to-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                  : isTransitionZone
                  ? 'bg-gradient-to-t from-orange-500 via-amber-400 to-cyan-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  : 'bg-gradient-to-t from-amber-600 via-amber-400 to-orange-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
              }`}
              style={{
                height: `${heightPercent}%`,
                animation: isPlaying
                  ? `wave-bounce ${animDuration}s ease-in-out infinite alternate ${animDelay}s`
                  : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
