'use client';

import React from 'react';
import { BengaliBook } from '@/lib/bengali-catalog';

interface BookCoverArtProps {
  book: BengaliBook;
  size?: 'sm' | 'md' | 'lg';
}

export function BookCoverArt({ book, size = 'md' }: BookCoverArtProps) {
  const { coverMotif, palette, titleBn, authorBn, publishedYear, accessionNumber } = book;

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none flex flex-col justify-between"
      style={{
        backgroundColor: palette.bg,
        color: palette.ink,
      }}
    >
      {/* Fine-press linen spine shadow & archival frame */}
      <div
        className="absolute inset-y-0 left-0 w-3.5 z-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.12) 45%, rgba(0,0,0,0.22) 85%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-2.5 pointer-events-none z-10 border"
        style={{ borderColor: `${palette.ink}28` }}
      />
      <div
        className="absolute inset-3.5 pointer-events-none z-10 border"
        style={{ borderColor: `${palette.accent}45` }}
      />

      {/* Motif SVG Illustration Layer */}
      <svg
        viewBox="0 0 300 400"
        className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`glow-${book.id}`} cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.32" />
            <stop offset="100%" stopColor={palette.bg} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="300" height="400" fill={`url(#glow-${book.id})`} />

        {/* Corner Alpona / Kala Bhavana Ornamental Flourishes */}
        <g stroke={palette.accent} strokeWidth="1" fill="none" opacity="0.55">
          <path d="M 22 22 L 48 22 M 22 22 L 22 48 M 26 26 A 14 14 0 0 1 40 40" />
          <path d="M 278 22 L 252 22 M 278 22 L 278 48 M 274 26 A 14 14 0 0 0 260 40" />
          <path d="M 22 378 L 48 378 M 22 378 L 22 352 M 26 374 A 14 14 0 0 0 40 360" />
          <path d="M 278 378 L 252 378 M 278 378 L 278 352 M 274 374 A 14 14 0 0 1 260 360" />
        </g>

        {coverMotif === 'pather_panchali' && (
          <g>
            {/* Monsoon sky, distant steam locomotive, and swaying white kashful reeds */}
            <circle cx="215" cy="115" r="28" fill={palette.accent} opacity="0.75" />
            <path
              d="M 25 220 Q 95 205 160 220 T 275 215"
              stroke={palette.ink}
              strokeWidth="1.5"
              fill="none"
              opacity="0.45"
            />
            {/* Train silhouette & smoke */}
            <path
              d="M 45 213 L 135 213 L 135 202 L 122 202 L 122 194 L 116 194 L 116 202 L 45 202 Z"
              fill={palette.ink}
              opacity="0.75"
            />
            <path
              d="M 118 188 Q 100 172 78 176 Q 60 165 40 172"
              stroke={palette.ink}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.45"
            />
            {/* Winding village path */}
            <path
              d="M 155 220 Q 120 265 145 310 L 185 310 Q 150 265 170 220 Z"
              fill={palette.accent}
              opacity="0.5"
            />
            {/* Kashful reeds */}
            <g stroke={palette.ink} strokeWidth="1.4" fill="none" opacity="0.75">
              <path d="M 55 295 Q 68 250 82 228" />
              <path d="M 70 300 Q 85 255 98 232" />
              <path d="M 225 295 Q 212 248 196 226" />
              <path d="M 240 300 Q 225 255 212 235" />
            </g>
          </g>
        )}

        {coverMotif === 'gitanjali' && (
          <g>
            {/* Sacred Santiniketan lotus & celestial mandala */}
            <circle cx="150" cy="185" r="64" stroke={palette.accent} strokeWidth="1.2" fill="none" opacity="0.5" />
            <circle cx="150" cy="185" r="46" stroke={palette.ink} strokeWidth="0.9" strokeDasharray="3 3" fill="none" opacity="0.45" />
            <path
              d="M 150 130 C 166 155 166 185 150 205 C 134 185 134 155 150 130 Z"
              fill={palette.accent}
              opacity="0.8"
            />
            <path
              d="M 150 205 C 175 195 192 170 185 148 C 168 158 158 180 150 205 Z"
              fill={palette.ink}
              opacity="0.65"
            />
            <path
              d="M 150 205 C 125 195 108 170 115 148 C 132 158 142 180 150 205 Z"
              fill={palette.ink}
              opacity="0.65"
            />
            <path d="M 95 222 Q 150 232 205 222" stroke={palette.accent} strokeWidth="1.5" fill="none" />
            <path d="M 112 232 Q 150 240 188 232" stroke={palette.ink} strokeWidth="1" fill="none" opacity="0.5" />
          </g>
        )}

        {coverMotif === 'sonar_kella' && (
          <g>
            {/* Jaisalmer Golden Fortress battlements & desert sun */}
            <circle cx="150" cy="145" r="38" fill={palette.accent} opacity="0.35" />
            <path
              d="M 65 235 L 65 180 L 82 180 L 82 165 L 105 165 L 105 180 L 122 180 L 122 145 L 178 145 L 178 180 L 195 180 L 195 165 L 218 165 L 218 180 L 235 180 L 235 235 Z"
              fill={palette.accent}
              opacity="0.82"
            />
            <path
              d="M 40 235 Q 150 218 260 235 L 260 265 L 40 265 Z"
              fill={palette.ink}
              opacity="0.22"
            />
            {/* Archways */}
            <path d="M 138 235 L 138 195 A 12 12 0 0 1 162 195 L 162 235 Z" fill={palette.bg} />
          </g>
        )}

        {coverMotif === 'sultanas_dream' && (
          <g>
            {/* Solar concentrator rays, astronomical rings & Ladyland air-car */}
            <circle cx="150" cy="175" r="52" stroke={palette.accent} strokeWidth="1.5" fill="none" opacity="0.7" />
            <ellipse cx="150" cy="175" rx="75" ry="24" stroke={palette.ink} strokeWidth="1" fill="none" opacity="0.45" transform="rotate(-18 150 175)" />
            <ellipse cx="150" cy="175" rx="75" ry="24" stroke={palette.accent} strokeWidth="1" fill="none" opacity="0.45" transform="rotate(18 150 175)" />
            <circle cx="150" cy="175" r="18" fill={palette.accent} opacity="0.85" />
          </g>
        )}

        {coverMotif === 'abol_tabol' && (
          <g>
            {/* Whimsical U. Ray & Sons woodcut crescent moon & geometric cadence */}
            <path
              d="M 170 130 A 48 48 0 1 0 170 226 A 36 36 0 1 1 170 130 Z"
              fill={palette.accent}
              opacity="0.88"
            />
            <circle cx="122" cy="162" r="6" fill={palette.ink} opacity="0.7" />
            <path d="M 95 215 Q 150 245 205 215" stroke={palette.ink} strokeWidth="2" fill="none" opacity="0.6" />
          </g>
        )}

        {coverMotif === 'bidrohi' && (
          <g>
            {/* Himalayan peak & fiery vina strings */}
            <polygon points="150,115 215,235 85,235" fill={palette.accent} opacity="0.35" />
            <polygon points="150,132 195,235 105,235" stroke={palette.accent} strokeWidth="1.8" fill="none" />
            <line x1="142" y1="105" x2="142" y2="255" stroke={palette.ink} strokeWidth="1.2" opacity="0.7" />
            <line x1="150" y1="100" x2="150" y2="260" stroke={palette.accent} strokeWidth="1.6" opacity="0.9" />
            <line x1="158" y1="105" x2="158" y2="255" stroke={palette.ink} strokeWidth="1.2" opacity="0.7" />
          </g>
        )}

        {(coverMotif === 'kapalkundala' ||
          coverMotif === 'banalata_sen' ||
          coverMotif === 'kabuliwala' ||
          coverMotif === 'padma_nadir_majhi' ||
          coverMotif === 'byomkesh' ||
          coverMotif === 'devdas' ||
          coverMotif === 'archive_edition') && (
          <g>
            {/* Classical Bengal riverine boat, arch & moon reflection */}
            <path
              d="M 95 225 L 95 155 A 55 55 0 0 1 205 155 L 205 225"
              stroke={palette.accent}
              strokeWidth="1.5"
              fill="none"
              opacity="0.65"
            />
            <circle cx="150" cy="155" r="22" fill={palette.accent} opacity="0.7" />
            {/* Country boat hull */}
            <path
              d="M 85 215 Q 150 242 215 215 L 195 228 Q 150 245 105 228 Z"
              fill={palette.ink}
              opacity="0.8"
            />
            {/* Sail */}
            <path d="M 148 162 L 148 214 L 182 206 Z" fill={palette.ink} opacity="0.55" />
            {/* River ripples */}
            <path d="M 75 245 Q 150 252 225 245" stroke={palette.accent} strokeWidth="1.2" fill="none" opacity="0.6" />
          </g>
        )}
      </svg>

      {/* Top Archival Imprint Header */}
      <div className="relative z-10 px-5 pt-5 flex items-center justify-between text-[10px] tracking-widest uppercase font-[family-name:var(--font-mono)] opacity-75">
        <span>{accessionNumber.split('-').slice(0, 2).join(' · ')}</span>
        <span className="tabular-nums">{publishedYear}</span>
      </div>

      {/* Center / Bottom Bengali & English Fine-Press Typography */}
      <div className="relative z-10 px-5 pb-5 pt-16 bg-gradient-to-t from-black/75 via-black/35 to-transparent">
        <p
          className={`font-[family-name:var(--font-bengali)] font-semibold leading-snug tracking-tight ${
            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'
          } line-clamp-2`}
          style={{ color: palette.ink }}
        >
          {titleBn}
        </p>
        <p className="mt-1 text-xs font-[family-name:var(--font-display)] italic opacity-85 line-clamp-1">
          {book.titleEn}
        </p>
        <div
          className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] opacity-80"
          style={{ borderColor: `${palette.ink}25` }}
        >
          <span className="font-[family-name:var(--font-bengali)] truncate">{authorBn}</span>
          <span className="font-[family-name:var(--font-mono)] tabular-nums text-[10px] shrink-0 ml-2">
            {book.totalDurationFormatted}
          </span>
        </div>
      </div>
    </div>
  );
}
