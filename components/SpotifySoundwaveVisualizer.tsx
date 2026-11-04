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
  heightClass = 'h-20',
}: SoundwaveVisualizerProps) {
  // Symmetric waveform curve weights
  const baseHeights = [
    12, 18, 28, 42, 60, 78, 92, 100, 95, 84, 70, 56, 45, 52, 68, 85, 96, 100, 88, 74, 58, 44, 32, 22, 15, 10, 8, 6,
  ];

  return (
    <div
      className={`relative w-full ${heightClass} flex items-center justify-between gap-1 px-3.5 py-2.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/85 shadow-inner overflow-hidden`}
      aria-label="Audio Waveform Visualizer"
    >
      {/* Subtle light sage & warm amber frosted aura */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#557153]/10 via-[#7A9A78]/10 to-amber-500/10 pointer-events-none" />

      {Array.from({ length: barCount }).map((_, idx) => {
        const baseHeight = baseHeights[idx % baseHeights.length];
        const isWarmZone = idx > barCount * 0.62;
        const isTransitionZone = idx > barCount * 0.38 && idx <= barCount * 0.62;

        const heightPercent = isPlaying
          ? Math.max(14, Math.min(100, baseHeight))
          : Math.max(10, baseHeight * 0.3);

        const animDuration = 0.85 + ((idx * 7) % 11) * 0.08;
        const animDelay = ((idx * 5) % 13) * 0.07;

        return (
          <div
            key={idx}
            className="flex-1 flex items-center justify-center h-full relative"
          >
            <div
              className={`w-full max-w-[4px] rounded-full transition-all duration-300 ${
                isWarmZone
                  ? 'bg-gradient-to-t from-[#557153] via-[#6B8E68] to-[#8FB38C]'
                  : isTransitionZone
                  ? 'bg-gradient-to-t from-[#435B41] via-[#557153] to-[#7A9D76]'
                  : 'bg-gradient-to-t from-[#3A4F39] via-[#557153] to-[#6E8F6B]'
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
