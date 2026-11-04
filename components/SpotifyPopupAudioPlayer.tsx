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
  Repeat,
  Headphones,
  Star,
  MoreHorizontal,
} from 'lucide-react';
import { BengaliBook, BookChapter } from '@/lib/bengali-catalog';
import { BookCoverArt } from '@/components/BookCoverArt';
import { DirectedNarrationSegment } from '@/lib/bengali-narration-director';
import { SpotifySoundwaveVisualizer } from '@/components/SpotifySoundwaveVisualizer';
import { MaleNarratorPersona } from '@/lib/baritone-audio-engine';

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
  narratorPersona?: MaleNarratorPersona;
  onSelectNarratorPersona?: (persona: MaleNarratorPersona) => void;
  isPlayingKebriaSample?: boolean;
  onToggleKebriaSample?: () => void;
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
  narratorPersona = 'deep-baritone',
  onSelectNarratorPersona,
  isPlayingKebriaSample = false,
  onToggleKebriaSample,
}: SpotifyPopupAudioPlayerProps) {
  const [activeTab, setActiveTab] = useState<'reader' | 'director' | 'queue'>('reader');

  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${book.titleBn} Audiobook Player`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-stone-900/30 backdrop-blur-2xl animate-in fade-in duration-200"
    >
      {/* Soft Light Frosted Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#557153]/20 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/80 rounded-full filter blur-[130px] pointer-events-none" />

      {/* Main Light Frosted Glass Player Container */}
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-[32px] bg-white/80 backdrop-blur-3xl border border-white/95 shadow-[0_32px_90px_rgba(24,29,26,0.22),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden text-stone-900">
        {/* Top Frosted Glass Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 bg-white/55">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#557153]/12 text-[#557153] border border-[#557153]/20">
              <Headphones className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#557153] font-semibold">
                Now Playing · শ্রুতিনাটক ({engineNotice.split('·')[0]?.trim()})
              </p>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 truncate max-w-md font-[family-name:var(--font-bengali)]">
                {book.titleBn}{' '}
                <span className="text-stone-500 text-xs font-normal">({book.titleEn})</span>
              </h2>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 p-1 bg-stone-200/60 rounded-full border border-white/80">
              <button
                type="button"
                onClick={() => onSelectAudioLang('bn')}
                className={`px-3.5 py-1 text-xs rounded-full font-medium transition-all font-[family-name:var(--font-bengali)] ${
                  audioLangMode === 'bn'
                    ? 'bg-[#557153] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => onSelectAudioLang('en')}
                className={`px-3.5 py-1 text-xs rounded-full font-medium transition-all ${
                  audioLangMode === 'en'
                    ? 'bg-[#557153] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onSelectAudioLang('bilingual')}
                className={`px-3.5 py-1 text-xs rounded-full font-medium transition-all ${
                  audioLangMode === 'bilingual'
                    ? 'bg-[#557153] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                বাংলা+EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
              aria-label="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Player Body Split: Left Stage & Right Stage */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto relative">
          {/* Left Column (5 cols): Cover, About & Floating Sage-Green Player */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Cover Artwork Container with Soft Elevation Shadow */}
            <div className="relative mx-auto w-52 sm:w-60 aspect-[3/3.6] rounded-[28px] overflow-hidden shadow-[0_24px_48px_-12px_rgba(24,29,26,0.3)] border-4 border-white/95 group">
              <BookCoverArt book={book} size="lg" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-semibold">
                  Ch {chapter.number} of {book.chapters.length}
                </span>
                <p className="text-xs font-semibold truncate font-[family-name:var(--font-bengali)]">
                  {chapter.titleBn}
                </p>
              </div>
            </div>

            {/* Waveform Visualizer */}
            <div className="space-y-1">
              <SpotifySoundwaveVisualizer isPlaying={isPlaying} barCount={30} heightClass="h-16" />
              <div className="flex justify-between items-center text-[11px] text-stone-500 font-[family-name:var(--font-mono)] px-1">
                <span>{formatTime(elapsedSeconds)}</span>
                <span className="text-[#557153] font-semibold">{chapter.durationFormatted}</span>
              </div>
            </div>

            {/* Signature Sage-Olive Green Player Card (like bottom-right card in reference image) */}
            <div className="sage-glass-player rounded-3xl p-4 text-white space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate font-[family-name:var(--font-bengali)]">
                    {chapter.titleBn}
                  </p>
                  <p className="text-xs text-white/80 truncate">{book.authorBn}</p>
                </div>

                {/* Scrubber Slider inside Sage Card */}
                <div className="w-32 sm:w-36 shrink-0 flex flex-col items-end">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, totalBookPassages - 1)}
                    step={1}
                    value={currentGlobalPassageIdx}
                    aria-label="Passage Scrubber"
                    onChange={(e) => onSliderPassageScrub(Number(e.target.value), false)}
                    className="w-full h-1 bg-white/35 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <span className="text-[10px] text-white/75 font-[family-name:var(--font-mono)] mt-1">
                    Track {paragraphIndex + 1}/{chapter.paragraphsBn.length}
                  </span>
                </div>
              </div>

              {/* Transport Icons Row */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={onPrevPassage}
                  className="p-2 text-white/85 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Previous Passage"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onTogglePlayPause}
                  disabled={isLoadingAudio}
                  className="p-3 rounded-full bg-white text-[#557153] shadow-md hover:scale-105 active:scale-95 transition-all"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isLoadingAudio ? (
                    <div className="w-4 h-4 border-2 border-[#557153] border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 fill-[#557153]" />
                  ) : (
                    <Play className="w-4 h-4 fill-[#557153] ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onNextPassage}
                  className="p-2 text-white/85 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Next Passage"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onToggleContinuousBookPlay}
                  title={continuousBookPlay ? 'Continuous Chapters On' : 'Single Chapter Play'}
                  className={`p-2 rounded-full transition-colors ${
                    continuousBookPlay ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onToggleAmbientTanpura}
                  title={ambientTanpura ? 'Santiniketan Tanpura On' : 'Voice Only'}
                  className={`p-2 rounded-full transition-colors ${
                    ambientTanpura ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {ambientTanpura ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Speed & RJ Kebria Voice Model Controls */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 font-[family-name:var(--font-mono)]">
                  {[0.75, 0.85, 0.92, 1.0, 1.15].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => onSetPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                        playbackSpeed === spd
                          ? 'bg-[#557153] text-white shadow-xs'
                          : 'bg-white/60 text-stone-600 hover:text-stone-900 border border-stone-200/80'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
                {onToggleKebriaSample && (
                  <button
                    type="button"
                    onClick={onToggleKebriaSample}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      isPlayingKebriaSample
                        ? 'bg-[#557153] text-white shadow-xs'
                        : 'bg-white/75 hover:bg-white text-[#557153] border border-[#557153]/30'
                    }`}
                  >
                    {isPlayingKebriaSample ? (
                      <>
                        <Pause className="w-2.5 h-2.5 fill-white" />
                        <span>Stop Ref MP3</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-[#557153]" />
                        <span>RJ Kebria Ref MP3</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* RJ Kebria Voice Model Tone Selector */}
              {onSelectNarratorPersona && (
                <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-stone-200/60 border border-white/80">
                  <button
                    type="button"
                    onClick={() => onSelectNarratorPersona('deep-baritone')}
                    className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all font-[family-name:var(--font-bengali)] truncate ${
                      narratorPersona === 'deep-baritone'
                        ? 'bg-[#557153] text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    কিবরিয়া · জীবন গল্প
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectNarratorPersona('resonant-bass')}
                    className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all font-[family-name:var(--font-bengali)] truncate ${
                      narratorPersona === 'resonant-bass'
                        ? 'bg-[#557153] text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    রাতের রেডিও (FM)
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectNarratorPersona('warm-storyteller')}
                    className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all font-[family-name:var(--font-bengali)] truncate ${
                      narratorPersona === 'warm-storyteller'
                        ? 'bg-[#557153] text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    সাহিত্য পাঠ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Transparent Frosted Glass Tracklist & Synchronized Text */}
          <div className="lg:col-span-7 flex flex-col h-full bg-white/55 backdrop-blur-2xl rounded-3xl border border-white/90 p-5 shadow-xs overflow-hidden relative">
            {/* Header Info & Sage Stars (Like "4 Your Eyez Only." in reference image) */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-stone-200/70 mb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-[family-name:var(--font-bengali)]">
                  {book.titleBn}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {book.authorBn} <span className="mx-1.5">•</span> MP3{' '}
                  <span className="mx-1.5">•</span> {book.chapters.length} Chapters
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#557153] pt-1">
                <Star className="w-4 h-4 fill-[#557153]" />
                <Star className="w-4 h-4 fill-[#557153]" />
                <Star className="w-4 h-4 fill-[#557153]" />
              </div>
            </div>

            {/* View Switcher Pill Tabs (Reference Image Style) */}
            <div className="flex items-center justify-between pb-3 mb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('reader')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                    activeTab === 'reader'
                      ? 'bg-[#557153] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  Passages (পাঠ)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('queue')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                    activeTab === 'queue'
                      ? 'bg-[#557153] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  Chapters ({book.chapters.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('director')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all font-[family-name:var(--font-bengali)] ${
                    activeTab === 'director'
                      ? 'bg-[#557153] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  পাঠ নির্দেশনা ({activeDirectedSegments.length})
                </button>
              </div>

              {activeTab === 'director' && (
                <button
                  type="button"
                  onClick={onPlayAllDirectedSegments}
                  className="px-3 py-1 text-[11px] font-medium text-white bg-[#557153] hover:bg-[#435B41] rounded-full transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Play All</span>
                </button>
              )}
            </div>

            {/* TAB 1: SYNCHRONIZED PASSAGES (Styled with Sage-Green Active Row like Reference Image) */}
            {activeTab === 'reader' && (
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {chapter.paragraphsBn.map((pBn, idx) => {
                  const isCurrent = idx === paragraphIndex;
                  const pEn = chapter.paragraphsEn[idx] || '';
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl transition-all ${
                        isCurrent
                          ? 'bg-[#557153] text-white shadow-[0_10px_25px_rgba(85,113,83,0.3)]'
                          : 'bg-white/60 hover:bg-white/90 text-stone-800 border border-white/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-[family-name:var(--font-mono)] font-semibold flex items-center gap-1.5">
                          {isCurrent ? (
                            <Play className="w-3 h-3 fill-white" />
                          ) : (
                            <span className="text-stone-400">{idx + 1}</span>
                          )}
                          <span>Passage 0{idx + 1}</span>
                        </span>
                        <MoreHorizontal
                          className={`w-4 h-4 ${isCurrent ? 'text-white/80' : 'text-stone-400'}`}
                        />
                      </div>

                      {(audioLangMode === 'bn' || audioLangMode === 'bilingual') && (
                        <p
                          className={`text-sm sm:text-base leading-relaxed font-[family-name:var(--font-bengali)] ${
                            isCurrent ? 'text-white font-medium' : 'text-stone-800'
                          }`}
                        >
                          {pBn}
                        </p>
                      )}

                      {(audioLangMode === 'en' || audioLangMode === 'bilingual') && (
                        <p
                          className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                            isCurrent
                              ? 'text-white/85'
                              : audioLangMode === 'bilingual'
                              ? 'text-stone-500 italic'
                              : 'text-stone-700'
                          }`}
                        >
                          {pEn}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: CHAPTERS QUEUE (Exact Tracklist Look from Reference Image) */}
            {activeTab === 'queue' && (
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {book.chapters.map((ch, idx) => {
                  const isCurrentCh = idx === chapterIndex;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => onSelectChapter(idx)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                        isCurrentCh
                          ? 'bg-[#557153] text-white shadow-[0_8px_20px_rgba(85,113,83,0.3)]'
                          : 'bg-white/45 hover:bg-white/80 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-xs font-[family-name:var(--font-mono)] flex items-center justify-center shrink-0">
                          {isCurrentCh ? (
                            <Play className="w-3.5 h-3.5 fill-white" />
                          ) : (
                            <span className="text-stone-500">{ch.number}</span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate font-[family-name:var(--font-bengali)]">
                            {ch.titleBn}
                          </p>
                          <p
                            className={`text-[11px] truncate ${
                              isCurrentCh ? 'text-white/80' : 'text-stone-500'
                            }`}
                          >
                            {ch.titleEn}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[11px] font-[family-name:var(--font-mono)] ${
                            isCurrentCh ? 'text-white/90' : 'text-stone-500'
                          }`}
                        >
                          {ch.durationFormatted}
                        </span>
                        <MoreHorizontal
                          className={`w-4 h-4 ${isCurrentCh ? 'text-white' : 'text-stone-400'}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 3: NARRATION DIRECTOR SEGMENTS */}
            {activeTab === 'director' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {activeDirectedSegments.map((seg) => {
                  const isSegPlaying = activeDirectedSegmentId === seg.id;
                  return (
                    <div
                      key={seg.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        isSegPlaying
                          ? 'bg-[#557153] border-[#557153] text-white shadow-sm'
                          : 'bg-white/65 border-white/85 text-stone-800 hover:bg-white/90'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between text-[10px] mb-1 ${
                          isSegPlaying ? 'text-white/90' : 'text-[#557153]'
                        }`}
                      >
                        <span className="font-[family-name:var(--font-mono)] font-semibold">
                          SEG 0{seg.index} · {seg.typeLabelBn}
                        </span>
                        <span
                          className={`font-[family-name:var(--font-bengali)] ${
                            isSegPlaying ? 'text-white/85' : 'text-stone-500'
                          }`}
                        >
                          {seg.emotionLabelBn}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed font-[family-name:var(--font-bengali)]">
                        {seg.text}
                      </p>
                      <div
                        className={`mt-2 flex items-center justify-between text-[10px] ${
                          isSegPlaying ? 'text-white/80' : 'text-stone-500'
                        }`}
                      >
                        <span className="font-[family-name:var(--font-bengali)]">
                          {seg.pauseCueBn}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSpeakDirectedSegment(seg)}
                          className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                            isSegPlaying
                              ? 'bg-white text-[#557153]'
                              : 'bg-[#557153] text-white hover:bg-[#435B41]'
                          }`}
                        >
                          {isSegPlaying ? 'Speaking...' : 'Speak'}
                        </button>
                      </div>
                    </div>
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
