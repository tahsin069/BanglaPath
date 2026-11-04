'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Headphones,
  BookOpen,
  Sparkles,
  Maximize2,
  Minimize2,
  ListMusic,
  Check,
} from 'lucide-react';
import { BengaliBook, BookChapter } from '@/lib/bengali-catalog';
import { BookCoverArt } from '@/components/BookCoverArt';
import { DirectedNarrationSegment } from '@/lib/bengali-narration-director';
import { SpotifySoundwaveVisualizer } from '@/components/SpotifySoundwaveVisualizer';

type AudioLanguageMode = 'bn' | 'en' | 'bilingual';

interface SpotifyPopupAudioPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  book: BengaliBook;
  chapter: BookChapter;
  chapterIndex: number;
  paragraphIndex: number;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  elapsedSeconds: number;
  audioLangMode: AudioLanguageMode;
  playbackSpeed: number;
  ambientTanpura: boolean;
  continuousBookPlay: boolean;
  activeDirectedSegments: DirectedNarrationSegment[];
  activeDirectedSegmentId: string | null;
  engineNotice: string;
  onTogglePlayPause: () => void;
  onPrevPassage: () => void;
  onNextPassage: () => void;
  onSliderChapterJump: (chIdx: number, playImmediately?: boolean) => void;
  onSliderPassageScrub: (globalIdx: number, playImmediately?: boolean) => void;
  onSelectAudioLang: (mode: AudioLanguageMode, forceStart?: boolean) => void;
  onSetPlaybackSpeed: (speed: number) => void;
  onToggleAmbientTanpura: () => void;
  onToggleContinuousBookPlay: () => void;
  onSpeakDirectedSegment: (seg: DirectedNarrationSegment) => void;
  onPlayAllDirectedSegments: () => void;
  onSelectChapter: (chIdx: number) => void;
  totalBookPassages: number;
  currentGlobalPassageIdx: number;
}

export function SpotifyPopupAudioPlayer({
  isOpen,
  onClose,
  book,
  chapter,
  chapterIndex,
  paragraphIndex,
  isPlaying,
  isLoadingAudio,
  elapsedSeconds,
  audioLangMode,
  playbackSpeed,
  ambientTanpura,
  continuousBookPlay,
  activeDirectedSegments,
  activeDirectedSegmentId,
  engineNotice,
  onTogglePlayPause,
  onPrevPassage,
  onNextPassage,
  onSliderChapterJump,
  onSliderPassageScrub,
  onSelectAudioLang,
  onSetPlaybackSpeed,
  onToggleAmbientTanpura,
  onToggleContinuousBookPlay,
  onSpeakDirectedSegment,
  onPlayAllDirectedSegments,
  onSelectChapter,
  totalBookPassages,
  currentGlobalPassageIdx,
}: SpotifyPopupAudioPlayerProps) {
  const [activeTab, setActiveTab] = useState<'reader' | 'director' | 'queue'>('reader');

  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const currentBnText = chapter.paragraphsBn[paragraphIndex] || chapter.paragraphsBn[0] || '';
  const currentEnText = chapter.paragraphsEn[paragraphIndex] || chapter.paragraphsEn[0] || '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${book.titleBn} Audiobook Player`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200"
    >
      {/* Background Ambient Colored Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full filter blur-[130px] pointer-events-none" />

      {/* Main Frosted Glass Player Container */}
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0B0F17]/95 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.15)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Headphones className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-amber-400/90 font-medium">
                Now Playing · শ্রুতিনাটক
              </p>
              <h2 className="text-sm sm:text-base font-semibold text-white truncate max-w-md font-[family-name:var(--font-bengali)]">
                {book.titleBn} <span className="opacity-60 text-xs font-normal">({book.titleEn})</span>
              </h2>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 p-1 bg-white/[0.06] rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => onSelectAudioLang('bn')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all font-[family-name:var(--font-bengali)] ${
                  audioLangMode === 'bn'
                    ? 'bg-amber-500 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => onSelectAudioLang('en')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  audioLangMode === 'en'
                    ? 'bg-sky-500 text-stone-950 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onSelectAudioLang('bilingual')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  audioLangMode === 'bilingual'
                    ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                বাংলা+EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Player Body Split: Left Stage & Right Stage */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
          {/* Left Column (5 cols): Cover, Waveform & Core Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            {/* Cover Artwork Container with Ambient Glow */}
            <div className="relative mx-auto w-56 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.7)] border border-white/10 group">
              <BookCoverArt
                book={book}
                size="lg"
              />
              {/* Overlay Glass Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
                  Ch {chapter.number} of {book.chapters.length}
                </span>
                <p className="text-xs font-semibold truncate font-[family-name:var(--font-bengali)]">
                  {chapter.titleBn}
                </p>
              </div>
            </div>

            {/* Glowing Soundwave Waveform Visualizer */}
            <div className="space-y-1">
              <SpotifySoundwaveVisualizer isPlaying={isPlaying} barCount={32} heightClass="h-20" />
              <div className="flex justify-between items-center text-[10px] text-stone-400 font-[family-name:var(--font-mono)] px-1">
                <span>{formatTime(elapsedSeconds)}</span>
                <span className="text-amber-400 font-semibold">{chapter.durationFormatted}</span>
              </div>
            </div>

            {/* Interactive Movable Chapter & Global Scrubber */}
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={Math.max(0, totalBookPassages - 1)}
                step={1}
                value={currentGlobalPassageIdx}
                aria-label="Passage Scrubber"
                onChange={(e) => onSliderPassageScrub(Number(e.target.value), false)}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:bg-white/30 transition-colors"
              />

              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span className="truncate max-w-[180px]">
                  {chapter.titleEn}
                </span>
                <span className="font-[family-name:var(--font-mono)] text-amber-300">
                  Passage {paragraphIndex + 1}/{chapter.paragraphsBn.length}
                </span>
              </div>
            </div>

            {/* Spotify Transport Controls Bar */}
            <div className="flex items-center justify-between px-2 pt-2">
              <button
                type="button"
                onClick={onToggleContinuousBookPlay}
                title={continuousBookPlay ? 'Continuous Chapters On' : 'Single Chapter Play'}
                className={`p-2 rounded-full transition-colors ${
                  continuousBookPlay ? 'text-amber-400 bg-amber-400/10' : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onPrevPassage}
                className="p-3 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Previous Passage"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Big Glowing Spotify Play/Pause Button */}
              <button
                type="button"
                onClick={onTogglePlayPause}
                disabled={isLoadingAudio}
                className="p-4 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoadingAudio ? (
                  <div className="w-6 h-6 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 fill-stone-950" />
                ) : (
                  <Play className="w-6 h-6 fill-stone-950 ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={onNextPassage}
                className="p-3 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Next Passage"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onToggleAmbientTanpura}
                title={ambientTanpura ? 'Santiniketan Tanpura Accompaniment On' : 'Voice Only'}
                className={`p-2 rounded-full transition-colors ${
                  ambientTanpura ? 'text-sky-400 bg-sky-400/10' : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {ambientTanpura ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Speed & Narration Engine Badge */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
              <div className="flex items-center gap-1 font-[family-name:var(--font-mono)]">
                {[0.85, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onSetPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-amber-300/80 font-medium font-[family-name:var(--font-bengali)] truncate max-w-[200px]">
                AI4Bharat Indic-TTS · বাংলা পুরুষ কণ্ঠ
              </span>
            </div>
          </div>

          {/* Right Column (7 cols): Synced Reading Text & Narration Director */}
          <div className="lg:col-span-7 flex flex-col h-full bg-white/[0.03] rounded-2xl border border-white/10 p-4 sm:p-5 overflow-hidden">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('reader')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'reader'
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Synchronized Text (পাঠ)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('director')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors font-[family-name:var(--font-bengali)] ${
                    activeTab === 'director'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  পাঠ নির্দেশনা ({activeDirectedSegments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('queue')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'queue'
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Chapters ({book.chapters.length})
                </button>
              </div>

              {activeTab === 'director' && (
                <button
                  type="button"
                  onClick={onPlayAllDirectedSegments}
                  className="px-2.5 py-1 text-[11px] font-medium text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                >
                  <Play className="w-3 h-3 fill-stone-950" />
                  <span>Play All (speaker_idx=male)</span>
                </button>
              )}
            </div>

            {/* TAB 1: SYNCHRONIZED TEXT */}
            {activeTab === 'reader' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {chapter.paragraphsBn.map((pBn, idx) => {
                  const isCurrent = idx === paragraphIndex;
                  const pEn = chapter.paragraphsEn[idx] || '';
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                          : 'bg-white/[0.02] border-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Bengali Text */}
                      {(audioLangMode === 'bn' || audioLangMode === 'bilingual') && (
                        <p className={`text-sm sm:text-base leading-relaxed font-[family-name:var(--font-bengali)] ${
                          isCurrent ? 'text-amber-100 font-medium' : 'text-stone-300'
                        }`}>
                          {pBn}
                        </p>
                      )}

                      {/* English Text */}
                      {(audioLangMode === 'en' || audioLangMode === 'bilingual') && (
                        <p className={`mt-2 text-xs sm:text-sm leading-relaxed text-stone-400 ${
                          audioLangMode === 'bilingual' ? 'italic' : isCurrent ? 'text-stone-200' : ''
                        }`}>
                          {pEn}
                        </p>
                      )}

                      {isCurrent && (
                        <div className="mt-2.5 flex items-center justify-between text-[10px] text-amber-400/90 font-medium pt-2 border-t border-amber-500/20">
                          <span>Currently Narrating · পাঠ চলছে</span>
                          <span className="font-[family-name:var(--font-mono)]">
                            Passage {idx + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: NARRATION DIRECTOR SEGMENTS */}
            {activeTab === 'director' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {activeDirectedSegments.map((seg) => {
                  const isSegPlaying = activeDirectedSegmentId === seg.id;
                  return (
                    <div
                      key={seg.id}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isSegPlaying
                          ? 'bg-amber-500/15 border-amber-500 text-amber-100'
                          : 'bg-white/[0.02] border-white/5 text-stone-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-amber-400 mb-1">
                        <span className="font-[family-name:var(--font-mono)] font-semibold">
                          SEG 0{seg.index} · {seg.typeLabelBn}
                        </span>
                        <span className="font-[family-name:var(--font-bengali)] text-stone-400">
                          {seg.emotionLabelBn}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed font-[family-name:var(--font-bengali)]">
                        {seg.text}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-stone-500">
                        <span className="font-[family-name:var(--font-bengali)]">
                          {seg.pauseCueBn}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSpeakDirectedSegment(seg)}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-amber-500 hover:text-stone-950 text-white transition-colors"
                        >
                          {isSegPlaying ? 'Speaking...' : 'Speak'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: CHAPTERS QUEUE */}
            {activeTab === 'queue' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {book.chapters.map((ch, idx) => {
                  const isCurrentCh = idx === chapterIndex;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => onSelectChapter(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                        isCurrentCh
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-white/[0.02] border-white/5 text-stone-300 hover:border-white/20'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold truncate font-[family-name:var(--font-bengali)]">
                          {ch.titleBn}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">{ch.titleEn}</p>
                      </div>
                      <span className="text-[11px] font-[family-name:var(--font-mono)] text-amber-400 shrink-0">
                        {ch.durationFormatted}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
