'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen,
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Search,
  Globe,
  Bookmark,
  BookmarkCheck,
  Plus,
  ListMusic,
  Share2,
  Check,
  FileDown,
  Home,
  Compass,
  Maximize2,
  Repeat,
  ArrowLeft,
  Heart,
  MoreHorizontal,
  Star,
} from 'lucide-react';
import {
  GENRE_CATEGORIES,
  EBOOK_SOURCES,
  CURATED_BENGALI_BOOKS,
  BengaliBook,
  BookChapter,
  GenreId,
} from '@/lib/bengali-catalog';
import { BookCoverArt } from '@/components/BookCoverArt';
import { PWAInstallButton, OfflineIndicator } from '@/components/PWAInstallButton';
import {
  BARITONE_VOICE_PRESETS,
  MaleNarratorPersona,
  playBaritoneMasteredAudio,
  getBrowserVoicesAsync,
  selectUniversalMaleSpeechVoice,
} from '@/lib/baritone-audio-engine';
import {
  buildIndicTTSSetupAndSynthesisScript,
  directBengaliLiteraryPassage,
  DirectedNarrationSegment,
} from '@/lib/bengali-narration-director';
import { SpotifySoundwaveVisualizer } from '@/components/SpotifySoundwaveVisualizer';
import { SpotifyPopupAudioPlayer } from '@/components/SpotifyPopupAudioPlayer';
import {
  applyRJKebriaBanglaPhoneticTraining,
  RJ_KEBRIA_REFERENCE_AUDIO_PATH,
} from '@/lib/rj-kebria-voice-model';

type ReadingScriptMode = 'bilingual' | 'bn' | 'en';
type AudioLanguageMode = 'bn' | 'en' | 'bilingual';
type PaperTheme = 'alabaster' | 'sepia' | 'night';

interface SavedProgress {
  bookId: string;
  chapterIndex: number;
  paragraphIndex: number;
  audioLangMode?: AudioLanguageMode;
  timestamp: number;
}

export default function BanglaGranthaApp() {
  // Library state (curated + federated imports + user digitized books)
  const [books, setBooks] = useState<BengaliBook[]>(CURATED_BENGALI_BOOKS);
  const [selectedGenre, setSelectedGenre] = useState<GenreId>('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Active Book, Chapter, and Paragraph for Reader + Audiobook
  const [activeBookId, setActiveBookId] = useState<string>(CURATED_BENGALI_BOOKS[0].id);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [activeParagraphIdx, setActiveParagraphIdx] = useState<number>(0);

  // Reader & Audio Language Settings
  const [scriptMode, setScriptMode] = useState<ReadingScriptMode>('bilingual');
  const [audioLangMode, setAudioLangMode] = useState<AudioLanguageMode>('bn');
  const [currentlySpeakingLang, setCurrentlySpeakingLang] = useState<'bn' | 'en'>('bn');
  const [continuousBookPlay, setContinuousBookPlay] = useState<boolean>(true);
  const [paperTheme, setPaperTheme] = useState<PaperTheme>('alabaster');
  const [fontSizeStep, setFontSizeStep] = useState<number>(1);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const [showPopupPlayer, setShowPopupPlayer] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'catalog' | 'reader' | 'sources' | 'digitize'>('home');

  // Audiobook Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [isExpandingChapters, setIsExpandingChapters] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [narratorPersona, setNarratorPersona] = useState<MaleNarratorPersona>('deep-baritone');
  const [isPlayingKebriaSample, setIsPlayingKebriaSample] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ambientTanpura, setAmbientTanpura] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [engineNotice, setEngineNotice] = useState<string>(
    'কণ্ঠ মডেল: আরজে কিবরিয়া · জীবন গল্প (RJ Kebria Voice Model · স = শ "Sh" Diction · Calm Pacing)'
  );

  // Federated E-Book Source Search State
  const [federatedQuery, setFederatedQuery] = useState<string>('Rabindranath Tagore');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');
  const [federatedResults, setFederatedResults] = useState<BengaliBook[]>([]);
  const [isSearchingSources, setIsSearchingSources] = useState<boolean>(false);
  const [sourceSearchCompleted, setSourceSearchCompleted] = useState<boolean>(false);

  // Custom Book Digitization Form State
  const [showDigitizeForm, setShowDigitizeForm] = useState<boolean>(false);
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newAuthorBn, setNewAuthorBn] = useState('');
  const [newGenre, setNewGenre] = useState<Exclude<GenreId, 'all'>>('upanyas');
  const [newPassageBn, setNewPassageBn] = useState('');
  const [newPassageEn, setNewPassageEn] = useState('');

  // Audio Refs
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const kebriaSampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const baritoneControllerRef = useRef<{ stop: () => void } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tanpuraGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readerSectionRef = useRef<HTMLElement | null>(null);
  const playbackSessionRef = useRef<number>(0);
  const customBookCounterRef = useRef<number>(1);
  const startPlaybackRef = useRef<
    | ((
        targetParaIdx?: number,
        overrideLangMode?: AudioLanguageMode,
        targetChapterIdx?: number,
        bookOverride?: BengaliBook
      ) => void)
    | null
  >(null);

  const activeBook = books.find((b) => b.id === activeBookId) || books[0];
  const activeChapter = activeBook.chapters[activeChapterIdx] || activeBook.chapters[0];

  // Calculate total passages across all chapters of the active book
  const totalBookPassages = activeBook.chapters.reduce(
    (sum, ch) => sum + Math.max(ch.paragraphsBn.length, ch.paragraphsEn.length),
    0
  );

  // Calculate current global passage index across all chapters (0 .. totalBookPassages - 1)
  const currentGlobalPassageIdx =
    activeBook.chapters
      .slice(0, activeChapterIdx)
      .reduce((sum, ch) => sum + Math.max(ch.paragraphsBn.length, ch.paragraphsEn.length), 0) +
    activeParagraphIdx;

  // Load URL deep-link params (?book=...&chapter=...&lang=...) or saved progress from localStorage
  useEffect(() => {
    const hydrateTimer = window.setTimeout(() => {
      try {
        const savedBookmarks = localStorage.getItem('banglagrantha_bookmarks');
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks));
        }

        const params = new URLSearchParams(window.location.search);
        const urlBook = params.get('book');
        const urlChapter = params.get('chapter');
        const urlLang = params.get('lang') as AudioLanguageMode | null;

        if (urlBook && CURATED_BENGALI_BOOKS.some((b) => b.id === urlBook)) {
          setActiveBookId(urlBook);
          if (urlChapter) {
            const chNum = Math.max(0, parseInt(urlChapter, 10) - 1);
            setActiveChapterIdx(isNaN(chNum) ? 0 : chNum);
          }
          if (urlLang && ['bn', 'en', 'bilingual'].includes(urlLang)) {
            setAudioLangMode(urlLang);
          }
          return;
        }

        const savedProgressRaw = localStorage.getItem('banglagrantha_progress');
        if (savedProgressRaw) {
          const saved: SavedProgress = JSON.parse(savedProgressRaw);
          if (CURATED_BENGALI_BOOKS.some((b) => b.id === saved.bookId)) {
            setActiveBookId(saved.bookId);
            setActiveChapterIdx(saved.chapterIndex || 0);
            setActiveParagraphIdx(saved.paragraphIndex || 0);
            if (saved.audioLangMode) {
              setAudioLangMode(saved.audioLangMode);
            }
          }
        }
      } catch {
        // Ignore storage errors
      }
    }, 0);

    return () => window.clearTimeout(hydrateTimer);
  }, []);

  // Persist current reading/listening state & sync shareable query parameters
  useEffect(() => {
    try {
      const payload: SavedProgress = {
        bookId: activeBookId,
        chapterIndex: activeChapterIdx,
        paragraphIndex: activeParagraphIdx,
        audioLangMode,
        timestamp: Date.now(),
      };
      localStorage.setItem('banglagrantha_progress', JSON.stringify(payload));

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('book', activeBookId);
        url.searchParams.set('chapter', String(activeChapterIdx + 1));
        url.searchParams.set('lang', audioLangMode);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // Ignore storage errors
    }
  }, [activeBookId, activeChapterIdx, activeParagraphIdx, audioLangMode]);

  // Copy Shareable Deep Link to Clipboard
  const handleShareCurrentBook = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?book=${encodeURIComponent(
      activeBookId
    )}&chapter=${activeChapterIdx + 1}&lang=${audioLangMode}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${activeBook.titleBn} (${activeBook.titleEn}) — BanglaGrantha`,
          text: `Read and listen to ${activeBook.titleBn} by ${activeBook.authorEn} in Bengali & English on BanglaGrantha.`,
          url: shareUrl,
        });
        return;
      }
    } catch {
      // Fall back to clipboard copy
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    } catch {
      // ignore
    }
  };

  // Download Full Unabridged Bilingual Edition (.md) for Offline Reading
  const handleDownloadBilingualEdition = () => {
    const lines: string[] = [
      `# ${activeBook.titleBn} — ${activeBook.titleEn}`,
      `**Author:** ${activeBook.authorBn} (${activeBook.authorEn})`,
      `**First Published:** ${activeBook.publishedYear} · **Genre:** ${activeBook.genreLabelEn}`,
      `**Archive Accession:** ${activeBook.accessionNumber} · **Source:** ${activeBook.sourceName}`,
      '',
      `> ${activeBook.synopsisBn}`,
      `> ${activeBook.synopsisEn}`,
      '',
      '---',
      '',
    ];

    activeBook.chapters.forEach((ch) => {
      lines.push(`## ${ch.titleBn}`);
      lines.push(`### ${ch.titleEn}`);
      lines.push('');
      ch.paragraphsBn.forEach((pBn, idx) => {
        lines.push(pBn);
        lines.push('');
        if (ch.paragraphsEn[idx]) {
          lines.push(`*${ch.paragraphsEn[idx]}*`);
          lines.push('');
        }
      });
      lines.push('---');
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBook.id}-unabridged-bilingual.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Stop all audio helper
  const stopAllAudio = useCallback(() => {
    playbackSessionRef.current += 1;
    if (baritoneControllerRef.current) {
      baritoneControllerRef.current.stop();
      baritoneControllerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.onended = null;
      htmlAudioRef.current.onerror = null;
      htmlAudioRef.current.pause();
      htmlAudioRef.current.currentTime = 0;
      htmlAudioRef.current = null;
    }
    if (kebriaSampleAudioRef.current) {
      kebriaSampleAudioRef.current.onended = null;
      kebriaSampleAudioRef.current.onerror = null;
      kebriaSampleAudioRef.current.pause();
      kebriaSampleAudioRef.current = null;
      setIsPlayingKebriaSample(false);
    }
    if (tanpuraGainRef.current && audioCtxRef.current) {
      try {
        tanpuraGainRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.15);
      } catch {
        // ignore
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsLoadingAudio(false);
  }, []);

  // Toggle RJ Kebria Reference MP3 Sample (/assets/aistudio/Voice_Model___RJ_Kebria__d6ddbc00.mp3)
  const toggleKebriaReferenceSample = useCallback(() => {
    if (isPlayingKebriaSample && kebriaSampleAudioRef.current) {
      kebriaSampleAudioRef.current.pause();
      kebriaSampleAudioRef.current = null;
      setIsPlayingKebriaSample(false);
      setEngineNotice('RJ Kebria Reference MP3 paused · Ready for audiobook narration');
      return;
    }

    stopAllAudio();
    setIsPlaying(false);

    try {
      const sampleAudio = new Audio(RJ_KEBRIA_REFERENCE_AUDIO_PATH);
      sampleAudio.muted = isMuted;
      kebriaSampleAudioRef.current = sampleAudio;
      setIsPlayingKebriaSample(true);
      setEngineNotice(
        'Playing RJ Kebria Reference Voice Sample (Voice_Model___RJ_Kebria__d6ddbc00.mp3)'
      );

      sampleAudio.onended = () => {
        setIsPlayingKebriaSample(false);
        kebriaSampleAudioRef.current = null;
      };
      sampleAudio.onerror = () => {
        setIsPlayingKebriaSample(false);
        kebriaSampleAudioRef.current = null;
      };

      sampleAudio.play().catch(() => {
        setIsPlayingKebriaSample(false);
        kebriaSampleAudioRef.current = null;
      });
    } catch {
      setIsPlayingKebriaSample(false);
    }
  }, [isPlayingKebriaSample, isMuted, stopAllAudio]);

  // Start warm Santiniketan Tanpura acoustic harmonic drone via Web Audio API
  const startTanpuraDrone = useCallback(() => {
    if (typeof window === 'undefined' || isMuted || !ambientTanpura) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      if (!tanpuraGainRef.current) {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.connect(ctx.destination);

        const oscSa = ctx.createOscillator();
        const oscPa = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        oscSa.type = 'sine';
        oscSa.frequency.setValueAtTime(130.81, ctx.currentTime);

        oscPa.type = 'triangle';
        oscPa.frequency.setValueAtTime(196.0, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, ctx.currentTime);

        oscSa.connect(filter);
        oscPa.connect(filter);
        filter.connect(masterGain);

        oscSa.start();
        oscPa.start();
        tanpuraGainRef.current = masterGain;
      }

      tanpuraGainRef.current.gain.setTargetAtTime(0.03, ctx.currentTime, 0.25);
    } catch {
      // Ignore Web Audio errors on restricted devices
    }
  }, [isMuted, ambientTanpura]);

  // Play subtle chapter chime when narration starts
  const playArchivalBellNote = useCallback(() => {
    if (typeof window === 'undefined' || isMuted) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch {
      // ignore
    }
  }, [isMuted]);

  /**
   * Dynamically fetches and appends additional unabridged chapters (in Bengali & English)
   * for any book from /api/books/chapters so the book never runs out of audible chapters.
   */
  const loadMoreUnabridgedChapters = useCallback(
    async (bookToExpand: BengaliBook, autoPlayFirstNew = false) => {
      if (isExpandingChapters) return null;
      setIsExpandingChapters(true);
      const nextChapterNum = bookToExpand.chapters.length + 1;
      setEngineNotice(
        `গ্রন্থগার থেকে পরবর্তী অধ্যায়সমূহ লোড হচ্ছে (Loading Chapters ${nextChapterNum}–${
          nextChapterNum + 2
        } in Bengali & English)...`
      );

      try {
        const res = await fetch('/api/books/chapters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: bookToExpand.id,
            titleBn: bookToExpand.titleBn,
            titleEn: bookToExpand.titleEn,
            authorBn: bookToExpand.authorBn,
            authorEn: bookToExpand.authorEn,
            nextChapterNumber: nextChapterNum,
            count: 3,
          }),
        });
        const data = await res.json();
        const newChapters: BookChapter[] = Array.isArray(data.chapters) ? data.chapters : [];

        if (newChapters.length > 0) {
          const updatedBook: BengaliBook = {
            ...bookToExpand,
            chapters: [...bookToExpand.chapters, ...newChapters],
          };

          setBooks((prev) => prev.map((b) => (b.id === bookToExpand.id ? updatedBook : b)));
          setEngineNotice(
            `Added Chapters ${nextChapterNum}–${
              nextChapterNum + newChapters.length - 1
            } (${newChapters.reduce((s, c) => s + c.paragraphsBn.length, 0)} new audible passages)`
          );

          if (autoPlayFirstNew) {
            const targetChIdx = bookToExpand.chapters.length;
            setActiveChapterIdx(targetChIdx);
            setActiveParagraphIdx(0);
            return { updatedBook, targetChIdx };
          }
        }
      } catch {
        setEngineNotice('Could not fetch additional chapters at this moment.');
      } finally {
        setIsExpandingChapters(false);
      }
      return null;
    },
    [isExpandingChapters]
  );

  /**
   * Plays a single passage in the requested language ('bn' or 'en') using the soothing deep male baritone voice.
   */
  const playSingleLanguageSegment = useCallback(
    async (
      text: string,
      lang: 'bn' | 'en',
      chNumber: number,
      paraIdx: number,
      bookForVoice: BengaliBook,
      chapterNote: string,
      sessionId: number,
      onComplete: () => void,
      personaOverride?: MaleNarratorPersona
    ) => {
      if (sessionId !== playbackSessionRef.current) return;

      const activePersona = personaOverride || narratorPersona;
      const preset = BARITONE_VOICE_PRESETS[activePersona] || BARITONE_VOICE_PRESETS['deep-baritone'];

      setCurrentlySpeakingLang(lang);
      setIsLoadingAudio(true);
      setEngineNotice(
        lang === 'bn'
          ? `${preset.labelBn} কণ্ঠে পাঠ প্রস্তুত হচ্ছে · Ch ${chNumber}, Passage 0${paraIdx + 1}...`
          : `Synthesizing ${preset.labelEn} Narration · Ch ${chNumber}, Passage 0${paraIdx + 1}...`
      );

      try {
        const res = await fetch('/api/audiobook/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            lang,
            persona: activePersona,
            voiceName: preset.geminiVoice,
            style: `${preset.descriptionEn} ${chapterNote}`,
          }),
        });
        const data = await res.json();

        if (sessionId !== playbackSessionRef.current) return;
        setIsLoadingAudio(false);

        if (data.audioBase64 && !data.fallback) {
          if (ambientTanpura) {
            startTanpuraDrone();
          }

          if (typeof window !== 'undefined' && !audioCtxRef.current) {
            try {
              const AudioContextClass =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
              audioCtxRef.current = new AudioContextClass();
            } catch {
              // ignore
            }
          }

          setEngineNotice(
            lang === 'bn'
              ? `${preset.labelBn} · Ch ${chNumber}, Passage 0${paraIdx + 1}`
              : `Storyteller: ${preset.labelEn} · Ch ${chNumber}, Passage 0${paraIdx + 1}`
          );

          try {
            const controller = await playBaritoneMasteredAudio({
              audioCtx: audioCtxRef.current,
              audioBase64: data.audioBase64,
              mimeType: data.mimeType || 'audio/mpeg',
              engine: data.engine || 'generic-bangla-male-neural-96k',
              persona: activePersona,
              playbackSpeed,
              isMuted,
              onEnded: () => {
                if (sessionId === playbackSessionRef.current) {
                  onComplete();
                }
              },
              onError: () => {
                if (sessionId === playbackSessionRef.current) {
                  onComplete();
                }
              },
            });
            baritoneControllerRef.current = controller;
            return;
          } catch {
            const audio = new Audio(
              `data:${data.mimeType || 'audio/mpeg'};base64,${data.audioBase64}`
            );
            (audio as unknown as { preservesPitch: boolean }).preservesPitch = true;
            audio.playbackRate = playbackSpeed;
            audio.muted = isMuted;
            htmlAudioRef.current = audio;

            audio.onended = () => {
              if (sessionId === playbackSessionRef.current) {
                onComplete();
              }
            };
            audio.onerror = () => {
              if (sessionId === playbackSessionRef.current) {
                onComplete();
              }
            };

            await audio.play();
            return;
          }
        }
      } catch {
        setIsLoadingAudio(false);
      }

      // Universal Cross-Platform Browser Male SpeechSynthesis Fallback
      if (sessionId !== playbackSessionRef.current) return;
      if (ambientTanpura) {
        startTanpuraDrone();
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isMuted) {
        try {
          window.speechSynthesis.cancel();
          const voices = await getBrowserVoicesAsync();
          if (sessionId !== playbackSessionRef.current) return;

          const selected = selectUniversalMaleSpeechVoice(voices, lang);
          const spokenText =
            lang === 'bn' ? applyRJKebriaBanglaPhoneticTraining(text) : text;
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.pitch = selected.pitch;
          utterance.rate = playbackSpeed * selected.rateMultiplier;
          utterance.lang = selected.langTag;
          if (selected.voice) {
            utterance.voice = selected.voice;
          }

          setEngineNotice(
            lang === 'bn'
              ? `বাংলা পুরুষ কণ্ঠ · Ch ${chNumber}, Passage 0${paraIdx + 1}`
              : `${preset.labelEn} Audio Active · Ch ${chNumber}, Passage 0${paraIdx + 1}`
          );

          utterance.onend = () => {
            if (sessionId === playbackSessionRef.current) {
              onComplete();
            }
          };
          utterance.onerror = () => {
            if (sessionId === playbackSessionRef.current) {
              onComplete();
            }
          };

          window.speechSynthesis.speak(utterance);
          return;
        } catch {
          // ignore
        }
      }

      onComplete();
    },
    [ambientTanpura, isMuted, narratorPersona, playbackSpeed, startTanpuraDrone]
  );

  /**
   * Starts continuous unabridged playback across all passages AND all chapters of the book.
   */
  const startPlayback = useCallback(
    (
      targetParaIdx = activeParagraphIdx,
      overrideLangMode?: AudioLanguageMode,
      targetChapterIdx = activeChapterIdx,
      bookOverride?: BengaliBook
    ) => {
      stopAllAudio();
      const sessionId = playbackSessionRef.current;
      const modeToUse = overrideLangMode || audioLangMode;
      const currentBook = bookOverride || activeBook;
      const chapterToUse =
        currentBook.chapters[targetChapterIdx] || currentBook.chapters[0];

      const paragraphsBn = chapterToUse.paragraphsBn;
      const paragraphsEn = chapterToUse.paragraphsEn;
      const maxLen = Math.max(paragraphsBn.length, paragraphsEn.length);

      if (targetParaIdx >= maxLen) {
        if (continuousBookPlay && targetChapterIdx + 1 < currentBook.chapters.length) {
          const nextChIdx = targetChapterIdx + 1;
          setActiveChapterIdx(nextChIdx);
          setActiveParagraphIdx(0);
          setElapsedSeconds(0);
          startPlaybackRef.current?.(0, modeToUse, nextChIdx, currentBook);
          return;
        }
        setIsPlaying(false);
        setElapsedSeconds(0);
        setEngineNotice(
          `সম্পূর্ণ গ্রন্থ পাঠ সমাপ্ত · Completed all ${currentBook.chapters.length} chapters of ${currentBook.titleEn}. Click "+ Load More Chapters" to continue further.`
        );
        return;
      }

      setActiveChapterIdx(targetChapterIdx);
      setActiveParagraphIdx(targetParaIdx);
      setIsPlaying(true);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) =>
          prev + 1 >= chapterToUse.durationSeconds ? chapterToUse.durationSeconds : prev + 1
        );
      }, 1000);

      const textBn = paragraphsBn[targetParaIdx] || paragraphsEn[targetParaIdx] || '';
      const textEn = paragraphsEn[targetParaIdx] || paragraphsBn[targetParaIdx] || '';

      const advanceToNextPassageOrChapter = () => {
        if (sessionId !== playbackSessionRef.current) return;
        if (targetParaIdx + 1 < maxLen) {
          startPlaybackRef.current?.(targetParaIdx + 1, modeToUse, targetChapterIdx, currentBook);
        } else if (continuousBookPlay && targetChapterIdx + 1 < currentBook.chapters.length) {
          const nextChIdx = targetChapterIdx + 1;
          setElapsedSeconds(0);
          startPlaybackRef.current?.(0, modeToUse, nextChIdx, currentBook);
        } else {
          setIsPlaying(false);
          stopAllAudio();
          setEngineNotice(
            `পূর্ণাঙ্গ অডিওবুক সমাপ্ত · Completed Chapter ${chapterToUse.number} of ${currentBook.chapters.length}`
          );
        }
      };

      if (modeToUse === 'bn') {
        playSingleLanguageSegment(
          textBn,
          'bn',
          chapterToUse.number,
          targetParaIdx,
          currentBook,
          chapterToUse.narratorNote,
          sessionId,
          advanceToNextPassageOrChapter
        );
      } else if (modeToUse === 'en') {
        playSingleLanguageSegment(
          textEn,
          'en',
          chapterToUse.number,
          targetParaIdx,
          currentBook,
          chapterToUse.narratorNote,
          sessionId,
          advanceToNextPassageOrChapter
        );
      } else {
        playSingleLanguageSegment(
          textBn,
          'bn',
          chapterToUse.number,
          targetParaIdx,
          currentBook,
          chapterToUse.narratorNote,
          sessionId,
          () => {
            if (sessionId !== playbackSessionRef.current) return;
            playSingleLanguageSegment(
              textEn,
              'en',
              chapterToUse.number,
              targetParaIdx,
              currentBook,
              chapterToUse.narratorNote,
              sessionId,
              advanceToNextPassageOrChapter
            );
          }
        );
      }
    },
    [
      activeBook,
      activeChapterIdx,
      activeParagraphIdx,
      audioLangMode,
      continuousBookPlay,
      playSingleLanguageSegment,
      stopAllAudio,
    ]
  );

  useEffect(() => {
    startPlaybackRef.current = startPlayback;
  }, [startPlayback]);

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAllAudio();
      setEngineNotice('Audiobook paused · Position saved across devices');
    } else {
      startPlayback(activeParagraphIdx, audioLangMode, activeChapterIdx, activeBook);
    }
  };

  // Switch audio language on the fly
  const handleSelectAudioLanguage = (newMode: AudioLanguageMode, forceStart = false) => {
    setAudioLangMode(newMode);
    if (isPlaying || forceStart) {
      startPlayback(activeParagraphIdx, newMode, activeChapterIdx, activeBook);
    } else {
      setEngineNotice(
        newMode === 'bn'
          ? 'বাংলা অডিও নির্বাচিত · Bengali Full-Book Audio Selected'
          : newMode === 'en'
          ? 'English Full-Book Audio Selected · ইংরেজি অডিও নির্বাচিত'
          : 'দ্বিভাষিক অডিও নির্বাচিত · Bilingual (বাংলা → English) Audio Selected'
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  // Select a book and optionally start playing immediately in a chosen language
  const selectBook = (
    book: BengaliBook,
    autoPlay = false,
    scrollToReader = true,
    preferredAudioLang?: AudioLanguageMode
  ) => {
    stopAllAudio();
    setActiveBookId(book.id);
    setActiveChapterIdx(0);
    setActiveParagraphIdx(0);
    setElapsedSeconds(0);

    const langToUse = preferredAudioLang || audioLangMode;
    if (preferredAudioLang) {
      setAudioLangMode(preferredAudioLang);
    }

    if (scrollToReader && readerSectionRef.current) {
      readerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (autoPlay) {
      setShowPopupPlayer(true);
      setTimeout(() => {
        startPlayback(0, langToUse, 0, book);
      }, 80);
    } else {
      setIsPlaying(false);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (bookId: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId];
      try {
        localStorage.setItem('banglagrantha_bookmarks', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Query Federated E-Book Sources
  const handleFederatedSearch = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!federatedQuery.trim()) return;

      setIsSearchingSources(true);
      try {
        const res = await fetch(
          `/api/sources/search?q=${encodeURIComponent(
            federatedQuery
          )}&source=${encodeURIComponent(selectedSourceFilter)}`
        );
        const data = await res.json();
        if (Array.isArray(data.books)) {
          setFederatedResults(data.books);
        }
        setSourceSearchCompleted(true);
      } catch {
        setFederatedResults([]);
      } finally {
        setIsSearchingSources(false);
      }
    },
    [federatedQuery, selectedSourceFilter]
  );

  // Import a federated volume into the main catalog & open reader/audiobook
  const importFederatedBookAndOpen = (
    fedBook: BengaliBook,
    autoPlay: boolean,
    preferredAudioLang?: AudioLanguageMode
  ) => {
    setBooks((prev) => {
      if (prev.some((b) => b.id === fedBook.id)) return prev;
      return [fedBook, ...prev];
    });
    selectBook(fedBook, autoPlay, true, preferredAudioLang);
  };

  // Handle Custom Book / Manuscript Digitization
  const handleCreateDigitizedBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleBn.trim() && !newTitleEn.trim()) return;

    customBookCounterRef.current += 1;
    const seqId = customBookCounterRef.current;

    const customBook: BengaliBook = {
      id: `custom-${books.length + 1}-${seqId}`,
      accessionNumber: `BG-2026-USR-${books.length + 1}`,
      titleBn: newTitleBn.trim() || newTitleEn.trim(),
      titleEn: newTitleEn.trim() || newTitleBn.trim(),
      authorBn: newAuthorBn.trim() || 'আধুনিক বাংলা লেখক',
      authorEn: newAuthorBn.trim() || 'Contemporary Bengali Author',
      authorLifespan: 'Digitized Edition',
      publishedYear: 2026,
      genre: newGenre,
      genreLabelEn:
        GENRE_CATEGORIES.find((g) => g.id === newGenre)?.englishName || 'Upanyas · Novel',
      genreLabelBn:
        GENRE_CATEGORIES.find((g) => g.id === newGenre)?.bengaliName || 'উপন্যাস',
      sourceId: 'wikisource-bn',
      sourceName: 'BanglaGrantha Community Digitization Studio',
      totalDurationFormatted: '1h 15m',
      totalDurationSeconds: 4500,
      narratorVoice: 'Charon',
      narratorNameBn: 'সৌমিত্র শর্মা (গভীর প্রশান্ত ব্যারিটোন)',
      narratorNameEn: 'Soumitra Sharma · Deep Soothing Baritone',
      coverMotif: 'gitanjali',
      palette: {
        bg: '#1E293B',
        ink: '#FBF9F5',
        accent: '#9A3412',
        border: '#334155',
      },
      synopsisEn:
        'Digitized directly in BanglaGrantha Studio with instant Bengali and English unabridged audiobook narration.',
      synopsisBn:
        'বাংলা গ্রন্থগার স্টুডিওতে ডিজিটাইজকৃত সংস্করণ—বাংলা ও ইংরেজি উভয় ভাষায় তাৎক্ষণিক অডিওবুক শ্রুতির সুবিধাসহ।',
      provenance: 'User-contributed digital manuscript · Indexed in local & session archive.',
      firstEditionPress: 'BanglaGrantha Open Press',
      chapters: [
        {
          id: `custom-ch-1-${seqId}`,
          number: 1,
          titleBn: `প্রথম অধ্যায় — ${newTitleBn || newTitleEn}`,
          titleEn: `Chapter I · ${newTitleEn || newTitleBn}`,
          durationSeconds: 320,
          durationFormatted: '05:20',
          narratorNote: 'Clear literary narration in both Bengali and English.',
          paragraphsBn: (
            newPassageBn.trim() ||
            'বাংলার সাহিত্য ও সংস্কৃতির চিরন্তন ধারাকে বিশ্বময় ছড়িয়ে দেবার লক্ষ্যে এই নতুন ডিজিটাল অধ্যায়টি সংযোজিত হয়েছে।'
          )
            .split(/\n+/)
            .filter(Boolean),
          paragraphsEn: (
            newPassageEn.trim() ||
            'This digitized passage has been indexed for universal reading and synchronized Bengali and English audiobook playback across all devices.'
          )
            .split(/\n+/)
            .filter(Boolean),
        },
      ],
    };

    setBooks((prev) => [customBook, ...prev]);
    setShowDigitizeForm(false);
    setNewTitleBn('');
    setNewTitleEn('');
    setNewAuthorBn('');
    setNewPassageBn('');
    setNewPassageEn('');
    selectBook(customBook, true, true, 'bilingual');
  };

  // Filtered Catalog Books
  const filteredBooks = books.filter((book) => {
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    if (!catalogSearch.trim()) return matchesGenre;
    const q = catalogSearch.toLowerCase();
    const matchesQuery =
      book.titleBn.toLowerCase().includes(q) ||
      book.titleEn.toLowerCase().includes(q) ||
      book.authorBn.toLowerCase().includes(q) ||
      book.authorEn.toLowerCase().includes(q) ||
      book.genreLabelEn.toLowerCase().includes(q) ||
      String(book.publishedYear).includes(q);
    return matchesGenre && matchesQuery;
  });

  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // Movable MP3 Slider Handler 1: Skip directly from one Chapter to another Chapter
  const handleSliderChapterJump = (targetChIdx: number, playImmediately = false) => {
    const clampedCh = Math.max(0, Math.min(activeBook.chapters.length - 1, targetChIdx));
    stopAllAudio();
    setActiveChapterIdx(clampedCh);
    setActiveParagraphIdx(0);
    setElapsedSeconds(0);
    if (isPlaying || playImmediately) {
      startPlayback(0, audioLangMode, clampedCh, activeBook);
    }
  };

  // Movable MP3 Slider Handler 2: Scrub continuously across all Chapters & Passages of the book
  const handleSliderGlobalPassageScrub = (targetGlobalIdx: number, playImmediately = false) => {
    const clampedGlobal = Math.max(0, Math.min(totalBookPassages - 1, targetGlobalIdx));
    let running = 0;
    let resolvedChIdx = 0;
    let resolvedParaIdx = 0;

    for (let c = 0; c < activeBook.chapters.length; c++) {
      const chLen = Math.max(
        activeBook.chapters[c].paragraphsBn.length,
        activeBook.chapters[c].paragraphsEn.length
      );
      if (clampedGlobal < running + chLen) {
        resolvedChIdx = c;
        resolvedParaIdx = clampedGlobal - running;
        break;
      }
      running += chLen;
    }

    stopAllAudio();
    setActiveChapterIdx(resolvedChIdx);
    setActiveParagraphIdx(resolvedParaIdx);
    setElapsedSeconds(0);
    if (isPlaying || playImmediately) {
      startPlayback(resolvedParaIdx, audioLangMode, resolvedChIdx, activeBook);
    }
  };

  // Bengali Audiobook Narration Director State
  const [showDirectorCueSheet, setShowDirectorCueSheet] = useState(true);
  const [showIndicBatchSpec, setShowIndicBatchSpec] = useState(false);
  const [copiedBatchSpec, setCopiedBatchSpec] = useState(false);
  const [activeDirectedSegmentId, setActiveDirectedSegmentId] = useState<string | null>(null);
  const [customDirectorInput, setCustomDirectorInput] = useState('');
  const [customDirectedSegments, setCustomDirectedSegments] = useState<
    DirectedNarrationSegment[] | null
  >(null);

  const activeBnPassageText =
    activeChapter.paragraphsBn[activeParagraphIdx] || activeChapter.paragraphsBn[0] || '';
  const activeDirectedSegments: DirectedNarrationSegment[] =
    customDirectedSegments ?? directBengaliLiteraryPassage(activeBnPassageText, 'bn');
  const activeIndicBatchSpec = buildIndicTTSSetupAndSynthesisScript(activeDirectedSegments, 'bn');

  const handlePrepareCustomDirection = () => {
    if (!customDirectorInput.trim()) {
      setCustomDirectedSegments(null);
      return;
    }
    const prepared = directBengaliLiteraryPassage(customDirectorInput.trim(), 'bn');
    setCustomDirectedSegments(prepared);
  };

  const handleSpeakDirectedSegment = (seg: DirectedNarrationSegment) => {
    stopAllAudio();
    const sessionId = playbackSessionRef.current;
    setIsPlaying(true);
    setActiveDirectedSegmentId(seg.id);
    playSingleLanguageSegment(
      seg.text,
      'bn',
      activeChapter.number,
      activeParagraphIdx,
      activeBook,
      seg.emotionLabelEn,
      sessionId,
      () => {
        setActiveDirectedSegmentId(null);
        setIsPlaying(false);
      }
    );
  };

  const handlePlayAllDirectedSegments = () => {
    if (activeDirectedSegments.length === 0) return;
    stopAllAudio();
    const sessionId = playbackSessionRef.current;
    setIsPlaying(true);

    const playSegmentAt = (segIdx: number) => {
      if (sessionId !== playbackSessionRef.current) return;
      if (segIdx >= activeDirectedSegments.length) {
        setActiveDirectedSegmentId(null);
        setIsPlaying(false);
        return;
      }
      const seg = activeDirectedSegments[segIdx];
      setActiveDirectedSegmentId(seg.id);
      playSingleLanguageSegment(
        seg.text,
        'bn',
        activeChapter.number,
        activeParagraphIdx,
        activeBook,
        seg.emotionLabelEn,
        sessionId,
        () => {
          if (sessionId !== playbackSessionRef.current) return;
          setTimeout(() => {
            if (sessionId !== playbackSessionRef.current) return;
            playSegmentAt(segIdx + 1);
          }, seg.pauseAfterMs);
        }
      );
    };

    playSegmentAt(0);
  };

  const handleCopyIndicBatchSpec = async () => {
    try {
      await navigator.clipboard.writeText(activeIndicBatchSpec.setupScript);
      setCopiedBatchSpec(true);
      setTimeout(() => setCopiedBatchSpec(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const featuredWritersQuickList = [
    { labelBn: 'হুমায়ূন আহমেদ', labelEn: 'Humayun Ahmed', query: 'Humayun Ahmed' },
    { labelBn: 'জসীমউদ্দীন', labelEn: 'Joshim Uddin', query: 'Joshim Uddin' },
    { labelBn: 'জাফর ইকবাল', labelEn: 'Jafar Iqbal', query: 'Jafar Iqbal' },
    { labelBn: 'আহসান হাবীব', labelEn: 'Ahsan Habib', query: 'Ahsan Habib' },
    { labelBn: 'প্রমথ চৌধুরী', labelEn: 'Promoth Chowdhury', query: 'Promoth Chowdhury' },
    { labelBn: 'জাহানারা ইমাম', labelEn: 'Jahanara Imam', query: 'Jahanara Imam' },
    { labelBn: 'হুমায়ুন আজাদ', labelEn: 'Humayun Azad', query: 'Humayun Azad' },
    { labelBn: 'শামসুর রাহমান', labelEn: 'Shamsur Rahman Khan', query: 'Shamsur Rahman' },
    { labelBn: 'সুফিয়া কামাল', labelEn: 'Sufia Kamal', query: 'Sufia Kamal' },
    { labelBn: 'মাইকেল মধুসূদন দত্ত', labelEn: 'Michel Madhushudan Datt', query: 'Madhusudan' },
    { labelBn: 'আল মাহমুদ', labelEn: 'Al Mahmud', query: 'Al Mahmud' },
    { labelBn: 'সৈয়দ ওয়ালীউল্লাহ', labelEn: 'Syed Waliullah', query: 'Syed Waliullah' },
    { labelBn: 'জহির রায়হান', labelEn: 'Zahir Raihan', query: 'Zahir Raihan' },
    { labelBn: 'আখতারুজ্জামান ইলিয়াস', labelEn: 'Akhtaruzzaman Elias', query: 'Akhtaruzzaman Elias' },
  ];

  const paperStyles: Record<
    PaperTheme,
    { bg: string; text: string; muted: string; border: string; highlight: string }
  > = {
    alabaster: {
      bg: 'bg-white/75 backdrop-blur-2xl shadow-[0_20px_50px_rgba(24,29,26,0.06)]',
      text: 'text-stone-900',
      muted: 'text-stone-500',
      border: 'border-white/90',
      highlight: 'bg-[#557153]/12 border-[#557153]/45',
    },
    sepia: {
      bg: 'bg-[#F5EFE2]/88 backdrop-blur-xl shadow-sm',
      text: 'text-stone-900',
      muted: 'text-stone-600',
      border: 'border-stone-300/80',
      highlight: 'bg-[#557153]/15 border-[#557153]/50',
    },
    night: {
      bg: 'bg-[#181D1A]/95 backdrop-blur-xl shadow-lg',
      text: 'text-[#F9FAFB] tracking-[0.01em]',
      muted: 'text-stone-400',
      border: 'border-white/10',
      highlight: 'bg-[#557153]/30 border-[#557153]',
    },
  };

  const currentPaper = paperStyles[paperTheme];
  const activeBookIndex = Math.max(
    0,
    books.findIndex((b) => b.id === activeBook.id)
  );
  const prevCarouselBook = books[(activeBookIndex - 1 + books.length) % books.length];
  const nextCarouselBook = books[(activeBookIndex + 1) % books.length];
  const isCurrentBookmarked = bookmarks.includes(activeBook.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#ECF0EC] text-stone-900 font-[family-name:var(--font-body)] pb-28 relative overflow-x-hidden selection:bg-[#557153]/20 selection:text-[#3A4F39]">
      <OfflineIndicator />

      {/* Atmospheric Blurred Light & Cover Aura Orbs (True Transparent Glass Backdrop) */}
      <div className="fixed top-[-8%] left-[-4%] w-[560px] h-[560px] bg-white/90 rounded-full filter blur-[110px] pointer-events-none z-0" />
      <div className="fixed top-[18%] left-[28%] w-[520px] h-[520px] bg-[#557153]/[0.14] rounded-full filter blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[20%] right-[-5%] w-[520px] h-[520px] bg-amber-200/35 rounded-full filter blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[15%] w-[640px] h-[640px] bg-white/85 rounded-full filter blur-[130px] pointer-events-none z-0" />

      {/* LIGHT FROSTED GLASS TOP BAR (Inspired by Reference UI) */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-8 lg:px-12 py-3.5 bg-white/70 backdrop-blur-2xl border-b border-white/90 shadow-[0_4px_24px_rgba(24,29,26,0.04)]">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 font-[family-name:var(--font-display)] flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#557153] text-white text-xs font-bold shadow-xs">
            ব
          </span>
          <span>
            Bangla<span className="text-[#557153]">Grantha</span>
          </span>
        </a>

        {/* Zone 2: Minimal Centered Frosted Glass Search Input (Like "Search..." in Reference UI) */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={catalogSearch}
              onChange={(e) => {
                setCatalogSearch(e.target.value);
                setSelectedGenre('all');
              }}
              placeholder="Search books, writers (হুমায়ূন আহমেদ, জাফর ইকবাল, ফেলুদা...)"
              className="w-full pl-10 pr-16 py-2 text-xs sm:text-sm bg-white/75 hover:bg-white/95 focus:bg-white border border-stone-200/90 focus:border-[#557153] rounded-full text-stone-900 placeholder:text-stone-400 focus:outline-none transition-all shadow-2xs"
            />
            {catalogSearch.trim() && (
              <button
                type="button"
                onClick={() => setCatalogSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-medium text-stone-600 hover:text-stone-900 bg-stone-200/70 rounded-full transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Language Switcher, Popup Player & Install */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1 p-1 bg-stone-200/65 rounded-full border border-white/80">
            <button
              type="button"
              onClick={() => handleSelectAudioLanguage('bn', true)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all font-[family-name:var(--font-bengali)] ${
                audioLangMode === 'bn'
                  ? 'bg-[#557153] text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => handleSelectAudioLanguage('en', true)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                audioLangMode === 'en'
                  ? 'bg-[#557153] text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPopupPlayer(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#557153] hover:bg-[#435B41] rounded-full transition-all shadow-[0_6px_16px_rgba(85,113,83,0.3)] whitespace-nowrap"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Popup Player</span>
          </button>

          <PWAInstallButton />
        </div>
      </header>

      {/* MAIN LIGHT TRANSPARENT GLASS SHOWCASE CONTAINER */}
      <div
        id="top"
        className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 relative z-10 space-y-8"
      >
        {/* PRIMARY FROSTED GLASS STAGE (Modeled after Reference UI `image_f3a0137e.png`) */}
        <div className="rounded-[36px] glass-panel p-5 sm:p-8 lg:p-10 relative overflow-hidden">
          {/* Center Soft Blurred Silhouette Backdrop (Produces the Frosted Album Depth behind the Tracklist) */}
          <div
            aria-hidden="true"
            className="absolute top-12 left-1/2 -translate-x-1/2 w-[380px] sm:w-[460px] h-[380px] sm:h-[460px] rounded-full bg-gradient-to-b from-stone-400/25 via-[#557153]/18 to-transparent blur-3xl pointer-events-none"
          />

          {/* Top Navigation Row inside Frosted Frame (Back Arrow + Centered Pill Tabs + Menu) */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6">
            {/* Left: Back Arrow + Active Writer Name (like `← J Cole` in reference image) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => selectBook(prevCarouselBook, false, false)}
                title={`Switch to ${prevCarouselBook.titleEn}`}
                className="p-2 rounded-full bg-white/75 hover:bg-white text-stone-800 border border-stone-200/80 transition-colors shadow-2xs"
                aria-label="Previous Book in Archive"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <p className="text-xs sm:text-sm font-bold text-stone-900 font-[family-name:var(--font-bengali)]">
                  {activeBook.authorBn}
                </p>
                <p className="text-[11px] text-stone-500">{activeBook.authorEn}</p>
              </div>
            </div>

            {/* Center: Clean Category / View Pill Bar (`Home`, `Writers`, `Audiobooks`, `Chapters`, `Radio`) */}
            <nav
              aria-label="Showcase Sections"
              className="flex items-center gap-2 sm:gap-5 overflow-x-auto py-1"
            >
              {[
                { id: 'home' as const, label: 'Home', href: '#top' },
                { id: 'catalog' as const, label: 'Writers', href: '#writers-strip' },
                { id: 'reader' as const, label: 'Audiobooks', href: '#catalog' },
                { id: 'sources' as const, label: 'Chapters', href: '#reader-studio' },
                { id: 'digitize' as const, label: 'Radio', href: '#federated-sources' },
              ].map((tab) => {
                const isActive = activeNavTab === tab.id;
                return (
                  <a
                    key={tab.id}
                    href={tab.href}
                    onClick={() => setActiveNavTab(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#557153] text-white shadow-[0_6px_16px_rgba(85,113,83,0.35)]'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                    }`}
                  >
                    {tab.label}
                  </a>
                );
              })}
            </nav>

            {/* Right: Digitize / Fullscreen Player Trigger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDigitizeForm((prev) => !prev)}
                className="px-3 py-1.5 rounded-full bg-white/75 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-200/80 text-xs font-medium transition-colors whitespace-nowrap"
              >
                + Digitize Book
              </button>
              <button
                type="button"
                onClick={() => setShowPopupPlayer(true)}
                className="p-2 rounded-full bg-white/75 hover:bg-white text-stone-700 border border-stone-200/80 transition-colors"
                aria-label="Open Fullscreen Audio Player"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/*Instant Search Results Dropdown when typing in top search bar*/}
          {catalogSearch.trim() !== '' && (
            <div className="relative z-20 mb-6 p-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-stone-200/90 shadow-sm">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-3">
                <span>
                  Showing <strong>{filteredBooks.length}</strong> matching book(s) for &ldquo;
                  {catalogSearch}&rdquo;:
                </span>
                <button
                  type="button"
                  onClick={() => setCatalogSearch('')}
                  className="text-[#557153] font-semibold hover:underline"
                >
                  Clear Search
                </button>
              </div>

              {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                  {filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      className="p-3 rounded-xl bg-white/90 border border-stone-200/80 flex items-center justify-between gap-3 hover:border-[#557153] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-stone-900 font-[family-name:var(--font-bengali)] truncate">
                          {book.titleBn}
                        </p>
                        <p className="text-xs text-stone-500 truncate">
                          {book.authorBn} · {book.chapters.length} Ch
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => selectBook(book, false, true)}
                          className="px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg whitespace-nowrap"
                        >
                          Read
                        </button>
                        <button
                          type="button"
                          onClick={() => selectBook(book, true, false, 'bn')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-[#557153] hover:bg-[#435B41] rounded-lg whitespace-nowrap font-[family-name:var(--font-bengali)]"
                        >
                          শুনুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-stone-100/80 flex items-center justify-between gap-2 text-xs text-stone-600">
                  <span>No local catalog matches. Search connected global repositories:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFederatedQuery(catalogSearch.trim());
                      document
                        .getElementById('federated-sources')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1 text-xs font-medium text-white bg-[#557153] rounded-lg whitespace-nowrap"
                  >
                    Search Global Archives
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MAIN SHOWCASE BODY: Peeking Left Cover + Featured Cover & About + Transparent Tracklist + Peeking Right Cover */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            {/* LEFT COLUMN (4 cols): Peeking Previous Cover + Main Featured Book Cover + Icons + "About" */}
            <div className="lg:col-span-5 flex items-start gap-4">
              {/* Peeking Left Book Cover (like Forest Hills Drive on the left of reference image) */}
              <div
                onClick={() => selectBook(prevCarouselBook, false, false)}
                title={`Previous: ${prevCarouselBook.titleBn} (${prevCarouselBook.titleEn})`}
                className="hidden sm:block w-20 md:w-24 aspect-[3/4.2] rounded-2xl overflow-hidden shadow-lg border-2 border-white/85 opacity-75 hover:opacity-100 hover:scale-[1.03] transition-all cursor-pointer shrink-0 mt-6 relative"
              >
                <BookCoverArt book={prevCarouselBook} size="sm" />
              </div>

              {/* Featured Book Cover + Action Bar + About */}
              <div className="flex-1 max-w-[300px] mx-auto">
                <div
                  onClick={togglePlayPause}
                  className="aspect-[3/3.5] rounded-[28px] overflow-hidden shadow-[0_28px_60px_-12px_rgba(24,29,26,0.32)] border-4 border-white/95 relative group cursor-pointer"
                >
                  <BookCoverArt book={activeBook} size="lg" />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-4 rounded-full bg-white text-[#557153] shadow-xl group-hover:scale-110 transition-transform">
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-[#557153]" />
                      ) : (
                        <Play className="w-6 h-6 fill-[#557153] ml-0.5" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Icon Trio under Cover (`Share`, `Heart/Bookmark`, `More/Popup`) — Exact Match to Reference Image */}
                <div className="mt-5 flex items-center justify-center gap-8 text-stone-700">
                  <button
                    type="button"
                    onClick={handleShareCurrentBook}
                    title="Share Book Link"
                    className="p-2 rounded-full hover:bg-white/80 hover:text-stone-950 transition-colors"
                  >
                    {copiedShareLink ? (
                      <Check className="w-4 h-4 text-[#557153]" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(activeBook.id)}
                    title="Bookmark Book"
                    className="p-2 rounded-full hover:bg-white/80 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isCurrentBookmarked
                          ? 'fill-[#557153] text-[#557153]'
                          : 'text-stone-800 hover:text-[#557153]'
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPopupPlayer(true)}
                    title="Open Fullscreen Audio Player"
                    className="p-2 rounded-full hover:bg-white/80 hover:text-stone-950 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* "About" Description Block under Cover — Exact Match to Reference Image */}
                <div className="mt-4 pt-3 border-t border-stone-200/70 text-left">
                  <h2 className="text-xs font-bold text-stone-900">About</h2>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed line-clamp-3">
                    Published in {activeBook.publishedYear},{' '}
                    <strong className="font-[family-name:var(--font-bengali)] text-stone-800">
                      {activeBook.titleBn}
                    </strong>{' '}
                    ({activeBook.titleEn}) by {activeBook.authorEn} — {activeBook.synopsisEn}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (7 cols): Transparent Frosted Tracklist + Peeking Right Cover + Floating Sage-Olive Mini-Player */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5 relative">
              <div className="flex items-start gap-5">
                {/* Center-Right Transparent Tracklist Stage */}
                <div className="flex-1 min-w-0">
                  {/* Book Title, Subtitle & 3 Sage Stars (Like "4 Your Eyez Only. ★★★" in Reference Image) */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-[family-name:var(--font-bengali)] truncate">
                        {activeBook.titleBn}{' '}
                        <span className="text-lg sm:text-xl font-normal text-stone-600 font-[family-name:var(--font-display)]">
                          · {activeBook.titleEn}
                        </span>
                      </h1>
                      <p className="text-xs text-stone-600 mt-1 flex flex-wrap items-center gap-2">
                        <span className="font-[family-name:var(--font-bengali)] font-medium text-stone-800">
                          {activeBook.authorBn}
                        </span>
                        <span>•</span>
                        <span>MP3 (RJ Kebria Voice Model)</span>
                        <span>•</span>
                        <span>
                          {activeBook.chapters.length} Chapters · {activeChapter.paragraphsBn.length}{' '}
                          Passages
                        </span>
                      </p>
                    </div>

                    {/* 3 Sage-Olive Rating Stars */}
                    <div
                      className="flex items-center gap-1 text-[#557153] shrink-0 pt-1.5"
                      aria-label="Curated Masterpiece"
                    >
                      <Star className="w-4 h-4 fill-[#557153]" />
                      <Star className="w-4 h-4 fill-[#557153]" />
                      <Star className="w-4 h-4 fill-[#557153]" />
                    </div>
                  </div>

                  {/* Quick Chapter Selector Pills above Tracklist */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
                    {activeBook.chapters.map((ch, idx) => {
                      const isCurrentCh = idx === activeChapterIdx;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => handleSliderChapterJump(idx, true)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            isCurrentCh
                              ? 'bg-[#557153] text-white shadow-xs'
                              : 'bg-white/65 hover:bg-white text-stone-700 border border-stone-200/80'
                          }`}
                        >
                          Ch {ch.number}:{' '}
                          <span className="font-[family-name:var(--font-bengali)]">
                            {ch.titleBn.split('—')[1]?.trim() || ch.titleBn}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Numbered Interactive Passage Tracklist (Active Row in Signature `#557153` Sage-Olive Bar) */}
                  <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
                    {activeChapter.paragraphsBn.map((paraBn, idx) => {
                      const isCurrentRow = idx === activeParagraphIdx;
                      const previewTitleBn =
                        paraBn.length > 68 ? `${paraBn.slice(0, 68)}...` : paraBn;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveParagraphIdx(idx);
                            startPlayback(idx, audioLangMode, activeChapterIdx, activeBook);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                            isCurrentRow
                              ? 'bg-[#557153] text-white shadow-[0_10px_25px_rgba(85,113,83,0.32)]'
                              : 'bg-white/40 hover:bg-white/80 text-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="w-5 text-xs font-[family-name:var(--font-mono)] tabular-nums flex items-center justify-center shrink-0">
                              {isCurrentRow ? (
                                isPlaying ? (
                                  <Pause className="w-3.5 h-3.5 fill-white" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-white" />
                                )
                              ) : (
                                <span className="text-stone-500">{idx + 1}</span>
                              )}
                            </span>
                            <span
                              className={`text-xs sm:text-sm font-[family-name:var(--font-bengali)] truncate ${
                                isCurrentRow ? 'font-semibold text-white' : 'text-stone-800'
                              }`}
                            >
                              {previewTitleBn}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-[10px] font-[family-name:var(--font-mono)] ${
                                isCurrentRow ? 'text-white/85' : 'text-stone-400'
                              }`}
                            >
                              P 0{idx + 1}
                            </span>
                            <MoreHorizontal
                              className={`w-4 h-4 ${
                                isCurrentRow ? 'text-white' : 'text-stone-500'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Peeking Right Book Cover (Like KOD cover on the right of reference image) */}
                <div
                  onClick={() => selectBook(nextCarouselBook, false, false)}
                  title={`Next: ${nextCarouselBook.titleBn} (${nextCarouselBook.titleEn})`}
                  className="hidden xl:block w-28 aspect-[3/4.2] rounded-2xl overflow-hidden shadow-xl border-2 border-white/90 opacity-85 hover:opacity-100 hover:scale-[1.03] transition-all cursor-pointer shrink-0 mt-6"
                >
                  <BookCoverArt book={nextCarouselBook} size="sm" />
                </div>
              </div>

              {/* BOTTOM-RIGHT FLOATING SAGE-OLIVE GLASS MINI-PLAYER CARD (Exact Match to "Photograph - J Cole" Card in Reference Image) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                {/* RJ Kebria Voice Model Quick Pill & Sample Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleKebriaReferenceSample}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isPlayingKebriaSample
                        ? 'bg-[#557153] text-white shadow-sm'
                        : 'bg-white/80 hover:bg-white text-[#557153] border border-[#557153]/30 shadow-2xs'
                    }`}
                  >
                    {isPlayingKebriaSample ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-white" />
                        <span>Stop RJ Kebria Ref MP3</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-[#557153]" />
                        <span>RJ Kebria Voice Ref MP3</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-stone-600 font-[family-name:var(--font-bengali)]">
                    স = শ (&ldquo;Sh&rdquo;) নিখুঁত উচ্চারণ · ধীরস্থির জীবন গল্প ছন্দ
                  </span>
                </div>

                {/* Floating Sage-Green Glass Mini-Player Card */}
                <div className="sage-glass-player rounded-[26px] p-4 sm:p-5 text-white w-full sm:w-[370px] shrink-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate font-[family-name:var(--font-bengali)]">
                        {activeChapter.titleBn.split('—')[1]?.trim() || activeChapter.titleBn}
                      </p>
                      <p className="text-xs text-white/80 truncate mt-0.5">
                        {activeBook.authorBn}
                      </p>
                    </div>

                    {/* Movable Scrubber Slider inside Sage Card */}
                    <div className="w-32 sm:w-36 shrink-0 flex flex-col items-end">
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, totalBookPassages - 1)}
                        step={1}
                        value={currentGlobalPassageIdx}
                        aria-label="Movable passage scrubber"
                        onChange={(e) =>
                          handleSliderGlobalPassageScrub(Number(e.target.value), true)
                        }
                        className="w-full h-1 bg-white/35 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>

                  {/* Transport Controls Row inside Sage Card */}
                  <div className="mt-4 flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeParagraphIdx > 0) {
                          const prev = activeParagraphIdx - 1;
                          setActiveParagraphIdx(prev);
                          if (isPlaying)
                            startPlayback(prev, audioLangMode, activeChapterIdx, activeBook);
                        } else if (activeChapterIdx > 0) {
                          handleSliderChapterJump(activeChapterIdx - 1, true);
                        }
                      }}
                      className="p-1.5 text-white/85 hover:text-white transition-colors"
                      aria-label="Previous Track"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlayPause}
                      disabled={isLoadingAudio}
                      className="p-2 text-white hover:scale-110 transition-transform"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isLoadingAudio ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (activeParagraphIdx + 1 < activeChapter.paragraphsBn.length) {
                          const next = activeParagraphIdx + 1;
                          setActiveParagraphIdx(next);
                          if (isPlaying)
                            startPlayback(next, audioLangMode, activeChapterIdx, activeBook);
                        } else if (activeChapterIdx + 1 < activeBook.chapters.length) {
                          handleSliderChapterJump(activeChapterIdx + 1, true);
                        }
                      }}
                      className="p-1.5 text-white/85 hover:text-white transition-colors"
                      aria-label="Next Track"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPopupPlayer(true)}
                      className="p-1.5 text-white/85 hover:text-white transition-colors"
                      title="Open Fullscreen Queue & Player"
                      aria-label="Open Queue"
                    >
                      <ListMusic className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMuted((m) => {
                          const next = !m;
                          if (next) stopAllAudio();
                          return next;
                        });
                      }}
                      className="p-1.5 text-white/85 hover:text-white transition-colors"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Select Renowned Bangladeshi & Classic Writers Ribbon */}
          <div id="writers-strip" className="mt-7 pt-5 border-t border-stone-200/70 relative z-10">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2.5">
              <span className="font-semibold text-stone-800">
                Renowned Writers · বিশিষ্ট লেখকবৃন্দ:
              </span>
              {catalogSearch && (
                <button
                  type="button"
                  onClick={() => setCatalogSearch('')}
                  className="text-[#557153] font-semibold hover:underline text-[11px]"
                >
                  Show All Books
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {featuredWritersQuickList.map((writer) => {
                const isSelected = catalogSearch.toLowerCase() === writer.query.toLowerCase();
                return (
                  <button
                    key={writer.query}
                    type="button"
                    onClick={() => {
                      setSelectedGenre('all');
                      setCatalogSearch((prev) =>
                        prev.toLowerCase() === writer.query.toLowerCase() ? '' : writer.query
                      );
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#557153] text-white font-semibold shadow-xs'
                        : 'glass-pill text-stone-700 hover:text-stone-950 hover:bg-white/90'
                    }`}
                  >
                    <span className="font-[family-name:var(--font-bengali)]">{writer.labelBn}</span>
                    <span className="ml-1 opacity-70 text-[10px]">({writer.labelEn})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RECENTLY PLAYED / জনপ্রিয় গ্রন্থ (Light Frosted Glass Cards Row) */}
        <section aria-label="Recently Played Audiobooks">
          <div className="flex items-center justify-between mb-3.5 px-1">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Recently Played</span>
              <span className="text-xs text-[#557153] font-normal font-[family-name:var(--font-bengali)]">
                (সম্প্রতি পঠিত ও শ্রুত)
              </span>
            </h2>
            <a
              href="#catalog"
              className="text-xs text-stone-600 hover:text-[#557153] font-medium transition-colors"
            >
              See All ({books.length})
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {books.slice(0, 4).map((book) => {
              const isCurrent = book.id === activeBook.id;
              return (
                <div
                  key={book.id}
                  onClick={() => selectBook(book, true, false, 'bn')}
                  className={`p-3.5 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                    isCurrent ? 'ring-2 ring-[#557153] bg-white/85' : ''
                  }`}
                >
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md relative border border-white/90">
                    <BookCoverArt
                      motif={book.coverMotif}
                      palette={book.palette}
                      titleBn={book.titleBn}
                      titleEn={book.titleEn}
                      authorBn={book.authorBn}
                      authorEn={book.authorEn}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-3.5 rounded-full bg-[#557153] text-white shadow-lg group-hover:scale-110 transition-transform">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-5 h-5 fill-white" />
                        ) : (
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs sm:text-sm font-bold text-stone-900 truncate font-[family-name:var(--font-bengali)] group-hover:text-[#557153] transition-colors">
                      {book.titleBn}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">{book.authorBn}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-200/70 flex items-center justify-between text-[10px] text-stone-500 font-[family-name:var(--font-mono)]">
                    <span>{book.chapters.length} Ch</span>
                    <span className="text-[#557153] font-semibold">
                      {book.totalDurationFormatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* OPTIONAL CUSTOM DIGITIZATION DRAWER */}
      {showDigitizeForm && (
        <section className="px-6 lg:px-12 py-8 bg-[#F3EFE6] border-b border-stone-300">
          <div className="max-w-[1320px] mx-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-300">
              <div>
                <h2 className="text-xl font-[family-name:var(--font-display)] font-semibold text-stone-900">
                  Digitize &amp; Add a Full Bengali Volume to Your Library
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Paste any Bengali manuscript and English translation below to immediately generate a multi-chapter Bengali and English audiobook.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDigitizeForm(false)}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 border border-stone-300 rounded-md whitespace-nowrap"
              >
                Close Studio
              </button>
            </div>

            <form onSubmit={handleCreateDigitizedBook} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Bengali Title (বাংলা শিরোনাম)
                </label>
                <input
                  type="text"
                  required
                  value={newTitleBn}
                  onChange={(e) => setNewTitleBn(e.target.value)}
                  placeholder="যেমন: শেষের কবিতা"
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#9A3412]"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  English Title
                </label>
                <input
                  type="text"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g., Shesher Kabita (The Last Poem)"
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#9A3412]"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Author (লেখক)
                </label>
                <input
                  type="text"
                  value={newAuthorBn}
                  onChange={(e) => setNewAuthorBn(e.target.value)}
                  placeholder="রবীন্দ্রনাথ ঠাকুর / Rabindranath Tagore"
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#9A3412]"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Literary Genre
                </label>
                <select
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value as Exclude<GenreId, 'all'>)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#9A3412]"
                >
                  {GENRE_CATEGORIES.filter((g) => g.id !== 'all').map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.englishName} ({g.bengaliName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-6">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Bengali Manuscript Text (বাংলা অডিওর জন্য)
                </label>
                <textarea
                  rows={3}
                  value={newPassageBn}
                  onChange={(e) => setNewPassageBn(e.target.value)}
                  placeholder="এখানে বাংলা অনুচ্ছেদ বা কবিতা লিখুন..."
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#9A3412] font-[family-name:var(--font-bengali)]"
                />
              </div>
              <div className="md:col-span-6">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  English Translation (For English Audio Narration)
                </label>
                <textarea
                  rows={3}
                  value={newPassageEn}
                  onChange={(e) => setNewPassageEn(e.target.value)}
                  placeholder="Paste English translation for English audiobook playback..."
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#9A3412]"
                />
              </div>
              <div className="md:col-span-12 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Digitize &amp; Generate Bengali + English Audiobooks</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* SECTION 1: GENRE-CLASSIFIED BENGALI LITERARY CATALOG */}
      <section id="catalog" className="px-6 lg:px-12 py-12 border-b border-white/80">
        <div className="max-w-[1320px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200/80">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#557153] font-semibold">
                01 · Unabridged Literary Archive by Genre
              </p>
              <h2 className="mt-1 text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900">
                Browse Complete Multi-Chapter Classics by Genre (সাহিত্য বিভাগ)
              </h2>
            </div>

            {/* Instant Catalog Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search title, রবীন্দ্রনাথ, Feluda, 1929..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white/75 backdrop-blur-md border border-white/90 rounded-full text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#557153] shadow-2xs"
              />
            </div>
          </div>

          {/* Interactive Genre Filter Bar */}
          <div className="mt-6 flex items-center gap-2 p-2 glass-panel-subtle rounded-2xl overflow-x-auto">
            {GENRE_CATEGORIES.map((genre) => {
              const active = selectedGenre === genre.id;
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`px-4 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#557153] text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  <span className="font-[family-name:var(--font-bengali)] mr-1.5">
                    {genre.bengaliName}
                  </span>
                  <span>· {genre.countLabel}</span>
                </button>
              );
            })}
          </div>

          {/* 3-Column Book Catalog Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredBooks.map((book) => {
              const isCurrentBook = book.id === activeBookId;
              const isBookmarked = bookmarks.includes(book.id);
              const passageCount = book.chapters.reduce(
                (s, ch) => s + ch.paragraphsBn.length,
                0
              );

              return (
                <article
                  key={book.id}
                  className={`group rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between p-5 ${
                    isCurrentBook
                      ? 'ring-2 ring-[#557153] bg-white/85'
                      : ''
                  }`}
                >
                  <div>
                    {/* Top Row: Cover Art + Core Metadata */}
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <div
                        onClick={() => selectBook(book, false, true)}
                        className="col-span-4 aspect-[3/4] rounded-2xl overflow-hidden border border-white/90 shadow-md cursor-pointer"
                      >
                        <BookCoverArt book={book} size="sm" />
                      </div>

                      <div className="col-span-8 flex flex-col">
                        {/* Clean Unboxed Metadata */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                          <span className="text-[#557153] font-medium">{book.genreLabelBn}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-[family-name:var(--font-mono)] tabular-nums">
                            {book.chapters.length} Chapters
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-[family-name:var(--font-mono)] tabular-nums">
                            {passageCount} Passages
                          </span>
                        </div>

                        <h3
                          onClick={() => selectBook(book, false, true)}
                          className="mt-1.5 text-lg font-[family-name:var(--font-bengali)] font-bold text-stone-900 group-hover:text-[#557153] transition-colors cursor-pointer line-clamp-1"
                        >
                          {book.titleBn}
                        </h3>
                        <p className="text-xs font-[family-name:var(--font-display)] italic text-stone-600 line-clamp-1">
                          {book.titleEn}
                        </p>

                        <p className="mt-1 text-xs font-medium text-stone-800 font-[family-name:var(--font-bengali)]">
                          {book.authorBn} ·{' '}
                          <span className="font-normal text-stone-500">{book.authorEn}</span>
                        </p>

                        <p className="mt-2.5 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                          {book.synopsisEn}
                        </p>
                      </div>
                    </div>

                    {/* Full Book Audio Scope Line */}
                    <div className="mt-4 pt-3 border-t border-stone-200/70 flex items-center justify-between gap-2 text-[11px] text-stone-500">
                      <span className="truncate">
                        Unabridged Audio: All {book.chapters.length} Chapters (বাংলা &amp; EN)
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(book.id)}
                        aria-label="Bookmark volume"
                        className="text-stone-500 hover:text-[#557153] transition-colors shrink-0"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-[#557153]" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Controls: Read + Full Bengali Audio + Full English Audio */}
                  <div className="mt-4 pt-3 border-t border-stone-200/70 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => selectBook(book, false, true)}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-stone-800 bg-white/80 border border-stone-200 hover:bg-white rounded-xl transition-colors whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>All Chapters</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectBook(book, true, true, 'bn')}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold text-white bg-[#557153] hover:bg-[#465E44] rounded-xl transition-colors whitespace-nowrap shadow-xs"
                    >
                      <Headphones className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-[family-name:var(--font-bengali)]">বাংলা অডিও</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectBook(book, true, true, 'en')}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <Headphones className="w-3.5 h-3.5 shrink-0" />
                      <span>EN Audio</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: UNABRIDGED MULTI-CHAPTER READER & CONTINUOUS BILINGUAL AUDIOBOOK STUDIO */}
      <section
        id="reader-studio"
        ref={readerSectionRef}
        className="px-6 lg:px-12 py-14 border-b border-white/80"
      >
        <div className="max-w-[1320px] mx-auto">
          {/* Reader Header & Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#557153] font-semibold">
                02 · Unabridged Full-Book Reader &amp; Continuous Audiobook Studio
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-bengali)] font-bold text-stone-900">
                  {activeBook.titleBn}
                </h2>
                <span className="text-lg font-[family-name:var(--font-display)] italic text-stone-600">
                  {activeBook.titleEn}
                </span>
              </div>
            </div>

            {/* Interactive Script Mode, Theme, Share & Offline Export Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Script Selector */}
              <div className="flex items-center gap-1 p-1 glass-panel-subtle rounded-xl">
                <button
                  type="button"
                  onClick={() => setScriptMode('bilingual')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    scriptMode === 'bilingual'
                      ? 'bg-[#557153] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Parallel (বাংলা + EN)
                </button>
                <button
                  type="button"
                  onClick={() => setScriptMode('bn')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap font-[family-name:var(--font-bengali)] ${
                    scriptMode === 'bn'
                      ? 'bg-[#557153] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  বাংলা মূল পাঠ
                </button>
                <button
                  type="button"
                  onClick={() => setScriptMode('en')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    scriptMode === 'en'
                      ? 'bg-[#557153] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  English Text
                </button>
              </div>

              {/* Paper Theme Selector */}
              <div className="flex items-center gap-1 p-1 glass-panel-subtle rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaperTheme('alabaster')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    paperTheme === 'alabaster'
                      ? 'bg-[#557153] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Paper
                </button>
                <button
                  type="button"
                  onClick={() => setPaperTheme('sepia')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    paperTheme === 'sepia'
                      ? 'bg-[#F3EDE0] text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Sepia
                </button>
                <button
                  type="button"
                  onClick={() => setPaperTheme('night')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    paperTheme === 'night'
                      ? 'bg-stone-900 text-stone-100 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Night Ink
                </button>
              </div>

              {/* Font Scale */}
              <div className="flex items-center gap-1 p-1 bg-[#EBE6DF] rounded-lg">
                <button
                  type="button"
                  onClick={() => setFontSizeStep((s) => Math.max(0, s - 1))}
                  className="px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 rounded-md"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeStep((s) => Math.min(2, s + 1))}
                  className="px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 rounded-md"
                >
                  A+
                </button>
              </div>

              {/* Share Link & Offline Export Buttons */}
              <button
                type="button"
                onClick={handleShareCurrentBook}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-800 bg-[#FBF9F5] border border-stone-300 hover:border-[#9A3412] rounded-lg transition-colors whitespace-nowrap"
              >
                {copiedShareLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#9A3412]" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Book</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadBilingualEdition}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-800 bg-[#FBF9F5] border border-stone-300 hover:border-stone-900 rounded-lg transition-colors whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Edition</span>
              </button>
            </div>
          </div>

          {/* FULL-BOOK CHAPTER TIMELINE & EXPANSION BAR */}
          <div className="mt-6 p-4 rounded-xl bg-[#F3EFE6] border border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-stone-700 whitespace-nowrap mr-1">
                Book Chapters ({activeBook.chapters.length}):
              </span>
              {activeBook.chapters.map((ch, idx) => {
                const isSelectedCh = activeChapterIdx === idx;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      stopAllAudio();
                      setActiveChapterIdx(idx);
                      setActiveParagraphIdx(0);
                      setElapsedSeconds(0);
                      if (isPlaying) {
                        startPlayback(0, audioLangMode, idx, activeBook);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                      isSelectedCh
                        ? 'bg-[#9A3412] text-white border-[#9A3412]'
                        : 'bg-[#FBF9F5] text-stone-700 border-stone-300 hover:border-stone-500'
                    }`}
                  >
                    <span>Part {ch.number}</span>
                    <span className="hidden md:inline font-[family-name:var(--font-bengali)] ml-1.5">
                      · {ch.titleBn.split('—')[1]?.trim() || ch.titleBn}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={isExpandingChapters}
              onClick={() => loadMoreUnabridgedChapters(activeBook, false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-900 bg-[#FBF9F5] border border-stone-300 hover:border-[#9A3412] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>
                {isExpandingChapters
                  ? 'Loading Archival Chapters...'
                  : '+ Load Next 3 Unabridged Chapters'}
              </span>
            </button>
          </div>

          {/* Pattern D: Two-Column Asymmetric Reading Canvas */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Archival Reading Page */}
            <div
              className={`lg:col-span-8 rounded-xl border ${currentPaper.bg} ${currentPaper.text} ${currentPaper.border} p-6 sm:p-10 transition-colors duration-200`}
            >
              {/* Active Chapter Header & Play Entire Chapter Buttons */}
              <div
                className={`pb-5 mb-8 border-b ${currentPaper.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div>
                  <p className={`text-xs uppercase tracking-widest ${currentPaper.muted}`}>
                    CHAPTER {activeChapter.number} OF {activeBook.chapters.length} ·{' '}
                    {activeChapter.paragraphsBn.length} PASSAGES · {activeChapter.durationFormatted}
                  </p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-[family-name:var(--font-bengali)] font-semibold">
                    {activeChapter.titleBn}
                  </h3>
                  <p
                    className={`text-sm font-[family-name:var(--font-display)] italic ${currentPaper.muted}`}
                  >
                    {activeChapter.titleEn}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setAudioLangMode('bn');
                      startPlayback(0, 'bn', activeChapterIdx, activeBook);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors whitespace-nowrap font-[family-name:var(--font-bengali)]"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>এই অধ্যায় বাংলায় শুনুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioLangMode('en');
                      startPlayback(0, 'en', activeChapterIdx, activeBook);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Narrate Chapter in EN</span>
                  </button>
                </div>
              </div>

              {/* Reading Measure (65-75ch) with Direct Bengali & English Passage Audio Controls */}
              <div className="max-w-2xl mx-auto space-y-6">
                {activeChapter.paragraphsBn.map((paraBn, idx) => {
                  const paraEn = activeChapter.paragraphsEn[idx] || '';
                  const isCurrentPara = idx === activeParagraphIdx;
                  const textScaleBn =
                    fontSizeStep === 0 ? 'text-base' : fontSizeStep === 2 ? 'text-xl' : 'text-lg';
                  const textScaleEn =
                    fontSizeStep === 0 ? 'text-sm' : fontSizeStep === 2 ? 'text-lg' : 'text-base';

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-lg border transition-colors ${
                        isCurrentPara
                          ? currentPaper.highlight
                          : `border-transparent hover:${currentPaper.border}`
                      }`}
                    >
                      {/* Passage Header with Direct Bengali & English Audio Triggers */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mb-3 pb-2 border-b border-stone-300/40">
                        <span className="font-[family-name:var(--font-mono)] tabular-nums opacity-75">
                          CHAPTER {activeChapter.number} · PASSAGE 0{idx + 1} OF{' '}
                          {activeChapter.paragraphsBn.length}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAudioLangMode('bn');
                              startPlayback(idx, 'bn', activeChapterIdx, activeBook);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                              isCurrentPara && isPlaying && currentlySpeakingLang === 'bn'
                                ? 'bg-[#9A3412] text-white'
                                : 'bg-stone-200/70 text-stone-800 hover:bg-[#9A3412] hover:text-white'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" />
                            <span className="font-[family-name:var(--font-bengali)]">
                              বাংলা শুনুন (Play Bengali)
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAudioLangMode('en');
                              startPlayback(idx, 'en', activeChapterIdx, activeBook);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                              isCurrentPara && isPlaying && currentlySpeakingLang === 'en'
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-200/70 text-stone-800 hover:bg-stone-900 hover:text-white'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Listen in English</span>
                          </button>
                        </div>
                      </div>

                      {/* Bengali Script Paragraph */}
                      {(scriptMode === 'bilingual' || scriptMode === 'bn') && (
                        <p
                          onClick={() => {
                            setAudioLangMode('bn');
                            startPlayback(idx, 'bn', activeChapterIdx, activeBook);
                          }}
                          className={`font-[family-name:var(--font-bengali)] ${textScaleBn} leading-[1.85] cursor-pointer ${
                            idx === 0
                              ? 'first-letter:text-4xl first-letter:font-bold first-letter:mr-2'
                              : ''
                          }`}
                        >
                          {paraBn}
                        </p>
                      )}

                      {/* English Literary Translation Paragraph */}
                      {(scriptMode === 'bilingual' || scriptMode === 'en') && paraEn && (
                        <p
                          onClick={() => {
                            setAudioLangMode('en');
                            startPlayback(idx, 'en', activeChapterIdx, activeBook);
                          }}
                          className={`${
                            scriptMode === 'bilingual'
                              ? `mt-3 pt-3 border-t ${currentPaper.border}`
                              : ''
                          } ${textScaleEn} leading-[1.75] cursor-pointer ${
                            scriptMode === 'bilingual' ? currentPaper.muted : ''
                          }`}
                        >
                          {paraEn}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Chapter Navigation Footer */}
              <div
                className={`mt-10 pt-6 border-t ${currentPaper.border} flex flex-wrap items-center justify-between gap-4`}
              >
                <button
                  type="button"
                  disabled={activeChapterIdx === 0}
                  onClick={() => {
                    const prevCh = Math.max(0, activeChapterIdx - 1);
                    setActiveChapterIdx(prevCh);
                    setActiveParagraphIdx(0);
                    if (isPlaying) startPlayback(0, audioLangMode, prevCh, activeBook);
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-stone-300 disabled:opacity-40 hover:bg-stone-200/50 transition-colors"
                >
                  ← Previous Chapter
                </button>

                <span
                  className={`text-xs font-[family-name:var(--font-mono)] tabular-nums ${currentPaper.muted}`}
                >
                  Chapter {activeChapter.number} of {activeBook.chapters.length}
                </span>

                {activeChapterIdx + 1 < activeBook.chapters.length ? (
                  <button
                    type="button"
                    onClick={() => {
                      const nextCh = activeChapterIdx + 1;
                      setActiveChapterIdx(nextCh);
                      setActiveParagraphIdx(0);
                      if (isPlaying) startPlayback(0, audioLangMode, nextCh, activeBook);
                    }}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors"
                  >
                    Next Chapter (Part {activeChapter.number + 1}) →
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isExpandingChapters}
                    onClick={async () => {
                      const res = await loadMoreUnabridgedChapters(activeBook, true);
                      if (res && isPlaying) {
                        startPlayback(0, audioLangMode, res.targetChIdx, res.updatedBook);
                      }
                    }}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors"
                  >
                    {isExpandingChapters
                      ? 'Loading Next Chapters...'
                      : 'Load & Listen to Chapter ' + (activeBook.chapters.length + 1) + ' →'}
                  </button>
                )}
              </div>
            </div>

            {/* Right 4 Columns: Spotify Glass Unabridged Player & Chapter Queue */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-white/10 shadow-2xl backdrop-blur-2xl">
                {/* Ambient glow bubble */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Now Playing
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5 truncate max-w-[200px] font-[family-name:var(--font-bengali)]">
                      {activeBook.titleBn}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-[family-name:var(--font-mono)] tabular-nums text-stone-400">
                      {formatTimecode(elapsedSeconds)} / {activeChapter.durationFormatted}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPopupPlayer(true)}
                      title="Open Dedicated Spotify Popup Audio Player"
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105"
                    >
                      <Maximize2 className="w-4 h-4 text-amber-300" />
                    </button>
                  </div>
                </div>

                {/* Animated Soundwave Visualizer (Spotify Style) */}
                <div className="my-4 relative z-10">
                  <SpotifySoundwaveVisualizer isPlaying={isPlaying} barCount={26} heightClass="h-16" />
                </div>

                {/* AUDIO LANGUAGE SELECTOR */}
                <div className="mt-4 relative z-10">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-2">
                    Audio Language (অডিও ভাষা)
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/[0.05] rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => handleSelectAudioLanguage('bn', true)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all font-[family-name:var(--font-bengali)] ${
                        audioLangMode === 'bn'
                          ? 'bg-amber-500 text-stone-950 font-semibold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      বাংলা
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAudioLanguage('en', true)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        audioLangMode === 'en'
                          ? 'bg-sky-500 text-stone-950 font-semibold shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAudioLanguage('bilingual', true)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        audioLangMode === 'bilingual'
                          ? 'bg-purple-500 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      বাংলা+EN
                    </button>
                  </div>
                </div>

                {/* WEBSITE STORYTELLER VOICE: RJ KEBRIA REPLICATED VOICE MODEL */}
                <div className="mt-4 pt-3 border-t border-white/10 relative z-10 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        RJ Kebria Voice Model · স = শ (Sh) Calibrated
                      </p>
                      <p className="text-xs font-semibold text-white font-[family-name:var(--font-bengali)] mt-0.5">
                        {BARITONE_VOICE_PRESETS[narratorPersona]?.labelBn}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleKebriaReferenceSample}
                      className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                        isPlayingKebriaSample
                          ? 'bg-emerald-500 text-stone-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                          : 'text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      {isPlayingKebriaSample ? (
                        <>
                          <Pause className="w-3 h-3 fill-stone-950" />
                          <span>Stop Ref MP3</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-amber-300" />
                          <span>RJ Kebria Ref MP3</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* RJ Kebria Tone & Style Selector */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setNarratorPersona('deep-baritone');
                        if (isPlaying) {
                          startPlayback(activeParagraphIdx, audioLangMode, activeChapterIdx, activeBook);
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all font-[family-name:var(--font-bengali)] truncate ${
                        narratorPersona === 'deep-baritone'
                          ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      কিবরিয়া · জীবন গল্প
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNarratorPersona('resonant-bass');
                        if (isPlaying) {
                          startPlayback(activeParagraphIdx, audioLangMode, activeChapterIdx, activeBook);
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all font-[family-name:var(--font-bengali)] truncate ${
                        narratorPersona === 'resonant-bass'
                          ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      রাতের রেডিও (FM)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNarratorPersona('warm-storyteller');
                        if (isPlaying) {
                          startPlayback(activeParagraphIdx, audioLangMode, activeChapterIdx, activeBook);
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all font-[family-name:var(--font-bengali)] truncate ${
                        narratorPersona === 'warm-storyteller'
                          ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      সাহিত্য পাঠ
                    </button>
                  </div>
                </div>

                {/* Continuous Multi-Chapter Auto-Advance Toggle */}
                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
                  <span className="text-stone-300">Continuous Auto-Advance</span>
                  <button
                    type="button"
                    onClick={() => setContinuousBookPlay((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      continuousBookPlay
                        ? 'bg-amber-500 text-stone-950 font-semibold'
                        : 'bg-white/10 text-stone-300 hover:bg-white/15'
                    }`}
                  >
                    {continuousBookPlay ? 'All Chapters ON' : 'Single Chapter'}
                  </button>
                </div>

                {/* MOVABLE CHAPTER & PASSAGE MP3 SCRUBBER SLIDERS */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-3 relative z-10">
                  {/* Slider 1: Movable Chapter-to-Chapter Skip Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] font-[family-name:var(--font-mono)] tabular-nums text-stone-300 mb-1">
                      <span className="font-semibold text-amber-400">
                        Chapter {activeChapter.number} of {activeBook.chapters.length}
                      </span>
                      <span className="text-stone-400">Slide to jump chapters</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, activeBook.chapters.length - 1)}
                      step={1}
                      value={activeChapterIdx}
                      aria-label="Skip from one chapter to another chapter"
                      onChange={(e) => handleSliderChapterJump(Number(e.target.value), false)}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="mt-1 flex justify-between text-[10px] font-[family-name:var(--font-mono)] text-stone-400">
                      {activeBook.chapters.map((ch, idx) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => handleSliderChapterJump(idx, true)}
                          className={`hover:text-amber-400 transition-colors ${
                            idx === activeChapterIdx ? 'font-bold text-amber-400' : ''
                          }`}
                        >
                          Ch {ch.number}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slider 2: Movable Full-Book Continuous Passage Scrubber */}
                  <div>
                    <div className="flex justify-between text-[11px] font-[family-name:var(--font-mono)] tabular-nums text-stone-400 mb-1">
                      <span>
                        Ch {activeChapter.number} · Passage {activeParagraphIdx + 1}/
                        {activeChapter.paragraphsBn.length}
                      </span>
                      <span>
                        Track {currentGlobalPassageIdx + 1} of {totalBookPassages}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, totalBookPassages - 1)}
                      step={1}
                      value={currentGlobalPassageIdx}
                      aria-label="Scrub across all chapters and passages of the audiobook"
                      onChange={(e) =>
                        handleSliderGlobalPassageScrub(Number(e.target.value), false)
                      }
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>

                {/* Primary Playback Transport Controls */}
                <div className="mt-5 flex items-center justify-between gap-3 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeParagraphIdx > 0) {
                        const prevIdx = activeParagraphIdx - 1;
                        setActiveParagraphIdx(prevIdx);
                        if (isPlaying)
                          startPlayback(prevIdx, audioLangMode, activeChapterIdx, activeBook);
                      } else if (activeChapterIdx > 0) {
                        const prevCh = activeChapterIdx - 1;
                        const lastPara = activeBook.chapters[prevCh].paragraphsBn.length - 1;
                        setActiveChapterIdx(prevCh);
                        setActiveParagraphIdx(lastPara);
                        if (isPlaying)
                          startPlayback(lastPara, audioLangMode, prevCh, activeBook);
                      }
                    }}
                    aria-label="Previous passage or chapter"
                    className="p-3 text-stone-300 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] rounded-full transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayPause}
                    disabled={isLoadingAudio}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all hover:scale-[1.02] whitespace-nowrap text-xs sm:text-sm"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-stone-950" /> : <Play className="w-5 h-5 fill-stone-950 ml-0.5" />}
                    <span>
                      {isLoadingAudio
                        ? 'Synthesizing Audio...'
                        : isPlaying
                        ? `Pause`
                        : `Play Unabridged`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeParagraphIdx + 1 < activeChapter.paragraphsBn.length) {
                        const nextIdx = activeParagraphIdx + 1;
                        setActiveParagraphIdx(nextIdx);
                        if (isPlaying)
                          startPlayback(nextIdx, audioLangMode, activeChapterIdx, activeBook);
                      } else if (activeChapterIdx + 1 < activeBook.chapters.length) {
                        const nextCh = activeChapterIdx + 1;
                        setActiveChapterIdx(nextCh);
                        setActiveParagraphIdx(0);
                        if (isPlaying) startPlayback(0, audioLangMode, nextCh, activeBook);
                      }
                    }}
                    aria-label="Next passage or chapter"
                    className="p-3 text-stone-300 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] rounded-full transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* FULL BOOK CHAPTER QUEUE LIST (Spotify 'Listen Again' Style) */}
                <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
                  <div className="flex items-center justify-between text-xs font-semibold text-white mb-2.5">
                    <span className="inline-flex items-center gap-1.5 text-stone-200">
                      <ListMusic className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chapter Queue</span>
                    </span>
                    <span className="font-[family-name:var(--font-mono)] text-[11px] text-stone-400">
                      {activeBook.chapters.length} Parts
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {activeBook.chapters.map((ch, idx) => {
                      const isCurrentCh = idx === activeChapterIdx;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            setActiveChapterIdx(idx);
                            setActiveParagraphIdx(0);
                            startPlayback(0, audioLangMode, idx, activeBook);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                            isCurrentCh
                              ? 'bg-amber-500/15 border-amber-400/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                              : 'bg-white/[0.04] border-white/10 text-stone-300 hover:bg-white/[0.08] hover:border-white/20'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-[family-name:var(--font-bengali)] font-medium truncate text-white">
                              {ch.titleBn}
                            </p>
                            <p className="text-[11px] text-stone-400 truncate">{ch.titleEn}</p>
                          </div>
                          <span className="font-[family-name:var(--font-mono)] tabular-nums text-[10px] text-stone-400 shrink-0">
                            {ch.durationFormatted}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={isExpandingChapters}
                    onClick={() => loadMoreUnabridgedChapters(activeBook, false)}
                    className="mt-3 w-full py-2 px-3 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl transition-colors"
                  >
                    {isExpandingChapters
                      ? 'Loading Additional Chapters...'
                      : '+ Expand Book with Next 3 Unabridged Chapters'}
                  </button>
                </div>

                {/* Speed & Ambient Tanpura Controls */}
                <div className="mt-5 pt-4 border-t border-white/10 space-y-3 text-xs relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">Narration Speed</span>
                    <div className="flex items-center gap-1 font-[family-name:var(--font-mono)] tabular-nums">
                      {[0.75, 0.85, 0.92, 1.0, 1.15].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-2 py-1 rounded-lg border text-[11px] transition-colors ${
                            playbackSpeed === spd
                              ? 'bg-amber-500 text-stone-950 font-semibold border-amber-500'
                              : 'bg-white/[0.06] text-stone-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">Santiniketan Tanpura Drone</span>
                    <button
                      type="button"
                      onClick={() => setAmbientTanpura((prev) => !prev)}
                      className={`px-3 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                        ambientTanpura
                          ? 'bg-amber-500 text-stone-950 font-semibold border-amber-500'
                          : 'bg-white/[0.06] text-stone-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {ambientTanpura ? 'Accompaniment On' : 'Voice Only'}
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-400 pt-1 font-[family-name:var(--font-bengali)]">
                    {engineNotice}
                  </p>
                </div>

                {/* BENGALI AUDIOBOOK NARRATION DIRECTOR SCRIPT */}
                <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Bengali Narration Director (পাঠ নির্দেশনা)
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Verbatim breath segments · Authentic bn-BD
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDirectorCueSheet((prev) => !prev)}
                      className="px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors shrink-0"
                    >
                      {showDirectorCueSheet ? 'Hide' : 'Show Cue Sheet'}
                    </button>
                  </div>

                  {showDirectorCueSheet && (
                    <div className="space-y-2.5">
                      {/* Multi-Segment Playback & Indic-TTS Batch Synthesis Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={handlePlayAllDirectedSegments}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                        >
                          <Play className="w-3 h-3 fill-stone-950" />
                          <span>
                            Play All {activeDirectedSegments.length} Segments
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowIndicBatchSpec((prev) => !prev)}
                          className="px-2 py-1 text-[10px] font-[family-name:var(--font-mono)] font-medium text-stone-300 bg-white/10 border border-white/15 hover:border-amber-400/50 rounded-lg transition-colors"
                        >
                          {showIndicBatchSpec ? 'Hide CSV' : 'Indic-TTS CSV'}
                        </button>
                      </div>

                      {showIndicBatchSpec && (
                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-stone-200 text-[10px] font-[family-name:var(--font-mono)] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-amber-400 font-semibold">
                              AI4Bharat/Indic-TTS (speaker_idx=male)
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyIndicBatchSpec}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md transition-colors shrink-0"
                            >
                              {copiedBatchSpec ? (
                                <>
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>Copied Script</span>
                                </>
                              ) : (
                                <span>Copy Setup &amp; CSV</span>
                              )}
                            </button>
                          </div>
                          <pre className="p-2 rounded bg-black/80 text-stone-300 overflow-x-auto whitespace-pre-wrap leading-relaxed font-[family-name:var(--font-bengali)]">
                            {activeIndicBatchSpec.batchCsv}
                          </pre>
                          <pre className="p-2 rounded bg-black/80 text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                            {activeIndicBatchSpec.cliCommand}
                          </pre>
                        </div>
                      )}

                      {/* Structured Narration Segments List */}
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {activeDirectedSegments.map((seg) => {
                          const isSegPlaying = activeDirectedSegmentId === seg.id;
                          return (
                            <div
                              key={seg.id}
                              className={`p-2.5 rounded-xl border transition-all ${
                                isSegPlaying
                                  ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                  : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-stone-400 mb-1">
                                <span className="font-[family-name:var(--font-mono)] font-semibold text-amber-400">
                                  SEG 0{seg.index} · {seg.typeLabelBn}
                                </span>
                                <span className="font-[family-name:var(--font-bengali)] text-stone-300 font-medium">
                                  ভাব: {seg.emotionLabelBn}
                                </span>
                              </div>

                              <p className="text-xs font-[family-name:var(--font-bengali)] text-stone-200 leading-relaxed">
                                {seg.text}
                              </p>

                              <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-stone-400">
                                <span className="font-[family-name:var(--font-bengali)] text-stone-400">
                                  {seg.pauseCueBn}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSpeakDirectedSegment(seg)}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-medium text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
                                >
                                  <Play className="w-2.5 h-2.5 fill-stone-950" />
                                  <span>{isSegPlaying ? 'Speaking...' : 'Speak'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Literary Text Narration Director Input */}
                      <div className="pt-2 border-t border-white/10">
                        <label
                          htmlFor="custom-director-textarea"
                          className="block text-[11px] font-medium text-stone-300 mb-1"
                        >
                          Prepare Literary Text for Narration:
                        </label>
                        <textarea
                          id="custom-director-textarea"
                          rows={2}
                          value={customDirectorInput}
                          onChange={(e) => setCustomDirectorInput(e.target.value)}
                          placeholder="যেকোনো বাংলা সাহিত্য অনুচ্ছেদ এখানে পেস্ট করুন..."
                          className="w-full px-2.5 py-1.5 text-xs font-[family-name:var(--font-bengali)] bg-white/[0.05] border border-white/15 rounded-xl text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                        />
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handlePrepareCustomDirection}
                            className="px-3 py-1 text-[11px] font-medium text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                          >
                            Direct Segments
                          </button>
                          {customDirectedSegments && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomDirectorInput('');
                                setCustomDirectedSegments(null);
                              }}
                              className="px-2.5 py-1 text-[11px] font-medium text-stone-300 hover:text-white bg-white/10 border border-white/15 rounded-lg transition-colors"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEDERATED GLOBAL BENGALI E-BOOK SOURCES CONNECTOR */}
      <section id="federated-sources" className="px-6 lg:px-12 py-14">
        <div className="max-w-[1320px] mx-auto">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold">
              03 · Connected Global E-Book Repositories
            </p>
            <h2 className="mt-1 text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900">
              Search Every Bengali Book Ever Published Across Global Archives
            </h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Query Open Library’s Bengali Corpus, the Digital Library of India on Internet Archive,
              Project Gutenberg South Asia, and Bengali Wikisource in real time. Every book discovered
              is provisioned with a 5-chapter unabridged structure (expandable to unlimited chapters)
              in both Bengali and English audio.
            </p>
          </div>

          {/* Connected Repository Directory Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {EBOOK_SOURCES.map((source) => {
              const isSelected = selectedSourceFilter === source.id;
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() =>
                    setSelectedSourceFilter((prev) => (prev === source.id ? 'all' : source.id))
                  }
                  className={`text-left p-4 rounded-xl border transition-colors flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#F3EFE6] border-[#9A3412]'
                      : 'bg-[#F7F4EE] border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-[family-name:var(--font-mono)] tabular-nums text-[#9A3412]">
                      {source.indexedWorks}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-stone-900 leading-snug">
                      {source.name}
                    </h3>
                    <p className="text-xs font-[family-name:var(--font-bengali)] text-stone-600 mt-0.5">
                      {source.bengaliName}
                    </p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate">{source.endpointType}</span>
                    <span className="font-medium text-stone-800 shrink-0 ml-1">
                      {isSelected ? 'Filtered' : 'Active'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Federated Search Form */}
          <form
            onSubmit={handleFederatedSearch}
            className="mt-8 p-5 rounded-xl bg-[#F3EFE6] border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center gap-3"
          >
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={federatedQuery}
                onChange={(e) => setFederatedQuery(e.target.value)}
                placeholder="Search any Bengali author, novel, or title (e.g., Sarat Chandra, Bankim, Gora, Chokher Bali, Nazrul)..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="flex items-center gap-2">
              {['Sarat Chandra', 'Satyajit Ray', 'Bankim Chandra', 'Gitanjali'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setFederatedQuery(preset);
                  }}
                  className="hidden xl:inline-flex px-3 py-2 text-xs text-stone-700 bg-[#FBF9F5] border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  {preset}
                </button>
              ))}

              <button
                type="submit"
                disabled={isSearchingSources}
                className="px-5 py-2.5 text-xs font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {isSearchingSources ? 'Querying Global Archives...' : 'Search Federated Archives'}
              </button>
            </div>
          </form>

          {/* Live Federated Results */}
          {federatedResults.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-4">
                <span>
                  Found{' '}
                  <strong className="font-[family-name:var(--font-mono)] tabular-nums">
                    {federatedResults.length}
                  </strong>{' '}
                  multi-chapter editions from connected global e-book repositories for &ldquo;
                  {federatedQuery}&rdquo;
                </span>
                <span>Every edition includes Full Multi-Chapter Bengali &amp; English Audio</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {federatedResults.map((fedBook) => (
                  <div
                    key={fedBook.id}
                    className="p-5 rounded-xl bg-[#F7F4EE] border border-stone-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>{fedBook.genreLabelEn}</span>
                        <span className="font-[family-name:var(--font-mono)] tabular-nums">
                          {fedBook.chapters.length} Chapters · {fedBook.publishedYear}
                        </span>
                      </div>
                      <h4 className="mt-1.5 text-base font-semibold text-stone-900 line-clamp-1">
                        {fedBook.titleEn}
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Author: <strong className="text-stone-800">{fedBook.authorEn}</strong>
                      </p>
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                        {fedBook.synopsisEn}
                      </p>
                      <p className="mt-2 text-[11px] text-stone-500 truncate">
                        Source: {fedBook.sourceName}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => importFederatedBookAndOpen(fedBook, false)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-stone-800 bg-[#FBF9F5] border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>All Chapters</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => importFederatedBookAndOpen(fedBook, true, 'bn')}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span className="font-[family-name:var(--font-bengali)]">বাংলা অডিও</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => importFederatedBookAndOpen(fedBook, true, 'en')}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>EN Audio</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* QUIET EDITORIAL FOOTER */}
      <footer className="mt-auto px-6 lg:px-12 py-10 border-t border-stone-200 bg-[#F7F4EE] text-xs text-stone-600">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-display)] font-semibold text-stone-900 text-sm">
              BanglaGrantha — বিশ্ব বাংলা ডিজিটাল গ্রন্থাগার ও অখণ্ড দ্বিভাষিক অডিওবুক সংগ্রহশালা
            </p>
            <p className="mt-0.5 text-stone-500">
              Preserving classic and contemporary Bengali literature with complete multi-chapter Bengali &amp; English audiobooks across all devices.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-stone-500">
            <a href="#catalog" className="hover:text-stone-900 transition-colors">
              Genre Catalog
            </a>
            <span aria-hidden="true">·</span>
            <a href="#reader-studio" className="hover:text-stone-900 transition-colors">
              Reader Studio
            </a>
            <span aria-hidden="true">·</span>
            <a href="#federated-sources" className="hover:text-stone-900 transition-colors">
              Federated Sources
            </a>
            <span aria-hidden="true">·</span>
            <a href="/sitemap.xml" className="hover:text-stone-900 transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </footer>

      {/* PERSISTENT LIGHT FROSTED GLASS & SAGE-OLIVE BOTTOM AUDIOBOOK PLAYER BAR */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-2xl text-stone-900 border-t border-white/95 px-4 sm:px-8 py-2.5 shadow-[0_-10px_35px_rgba(24,29,26,0.08)]">
        <div className="max-w-[1320px] mx-auto space-y-2">
          {/* Movable MP3 Chapter & Timeline Scrubber Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-1 border-b border-stone-200/80">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] font-[family-name:var(--font-mono)] tabular-nums text-[#557153] font-semibold whitespace-nowrap">
                Ch {activeChapter.number}/{activeBook.chapters.length}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, totalBookPassages - 1)}
                step={1}
                value={currentGlobalPassageIdx}
                aria-label="Movable MP3 player slider to skip chapters and passages"
                onChange={(e) => handleSliderGlobalPassageScrub(Number(e.target.value), true)}
                className="w-full h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-[#557153]"
              />
              <span className="text-[11px] font-[family-name:var(--font-mono)] tabular-nums text-stone-500 whitespace-nowrap">
                P {activeParagraphIdx + 1}/{activeChapter.paragraphsBn.length} (
                {currentGlobalPassageIdx + 1}/{totalBookPassages})
              </span>
            </div>

            {/* Direct Movable Chapter-to-Chapter Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-[10px] uppercase tracking-wider text-stone-500 whitespace-nowrap mr-1">
                Skip Chapter:
              </span>
              {activeBook.chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleSliderChapterJump(idx, true)}
                  className={`px-2.5 py-0.5 text-[11px] font-[family-name:var(--font-mono)] rounded-full transition-colors whitespace-nowrap ${
                    idx === activeChapterIdx
                      ? 'bg-[#557153] text-white font-semibold shadow-2xs'
                      : 'bg-stone-200/75 text-stone-700 hover:bg-stone-300/80 hover:text-stone-950'
                  }`}
                >
                  Ch {ch.number}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Active Book & Chapter Info */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-2xl bg-[#557153] hover:bg-[#435B41] text-white flex items-center justify-center transition-colors shrink-0 shadow-[0_6px_16px_rgba(85,113,83,0.35)]"
                aria-label={isPlaying ? 'Pause audiobook' : 'Play audiobook'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-[family-name:var(--font-bengali)] font-bold text-stone-900 truncate">
                    {activeBook.titleBn}
                  </p>
                  <span className="hidden sm:inline text-xs text-stone-500 truncate">
                    · Ch {activeChapter.number}/{activeBook.chapters.length}:{' '}
                    {activeChapter.titleEn}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 truncate font-[family-name:var(--font-bengali)]">
                  {engineNotice}
                </p>
              </div>
            </div>

            {/* Center Transport & Chapter Skip Buttons */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={activeChapterIdx === 0}
                onClick={() => handleSliderChapterJump(activeChapterIdx - 1, true)}
                className="px-2.5 py-1 text-[11px] font-medium bg-stone-200/80 hover:bg-stone-300 disabled:opacity-40 text-stone-800 rounded-full transition-colors whitespace-nowrap"
                title="Previous Chapter"
              >
                « Prev Ch
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeParagraphIdx > 0) {
                    const prev = activeParagraphIdx - 1;
                    setActiveParagraphIdx(prev);
                    if (isPlaying)
                      startPlayback(prev, audioLangMode, activeChapterIdx, activeBook);
                  } else if (activeChapterIdx > 0) {
                    const prevCh = activeChapterIdx - 1;
                    const lastPara = activeBook.chapters[prevCh].paragraphsBn.length - 1;
                    setActiveChapterIdx(prevCh);
                    setActiveParagraphIdx(lastPara);
                    if (isPlaying) startPlayback(lastPara, audioLangMode, prevCh, activeBook);
                  }
                }}
                className="p-1.5 text-stone-600 hover:text-stone-950 transition-colors"
                aria-label="Previous passage or chapter"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <span className="text-xs font-[family-name:var(--font-mono)] tabular-nums text-stone-600">
                Ch {activeChapter.number}/{activeBook.chapters.length} · P {activeParagraphIdx + 1}/
                {activeChapter.paragraphsBn.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (activeParagraphIdx + 1 < activeChapter.paragraphsBn.length) {
                    const next = activeParagraphIdx + 1;
                    setActiveParagraphIdx(next);
                    if (isPlaying)
                      startPlayback(next, audioLangMode, activeChapterIdx, activeBook);
                  } else if (activeChapterIdx + 1 < activeBook.chapters.length) {
                    const nextCh = activeChapterIdx + 1;
                    setActiveChapterIdx(nextCh);
                    setActiveParagraphIdx(0);
                    if (isPlaying) startPlayback(0, audioLangMode, nextCh, activeBook);
                  }
                }}
                className="p-1.5 text-stone-600 hover:text-stone-950 transition-colors"
                aria-label="Next passage or chapter"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={activeChapterIdx + 1 >= activeBook.chapters.length}
                onClick={() => handleSliderChapterJump(activeChapterIdx + 1, true)}
                className="px-2.5 py-1 text-[11px] font-medium bg-stone-200/80 hover:bg-stone-300 disabled:opacity-40 text-stone-800 rounded-full transition-colors whitespace-nowrap"
                title="Next Chapter"
              >
                Next Ch »
              </button>
            </div>

            {/* Right Audio Language Switcher (বাংলা / EN / বাংলা+EN), Speed & Mute */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-stone-200/75 p-0.5 rounded-full border border-white/80">
                <button
                  type="button"
                  onClick={() => handleSelectAudioLanguage('bn', true)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap font-[family-name:var(--font-bengali)] ${
                    audioLangMode === 'bn'
                      ? 'bg-[#557153] text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  বাংলা অডিও
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAudioLanguage('en', true)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                    audioLangMode === 'en'
                      ? 'bg-[#557153] text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  EN Audio
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAudioLanguage('bilingual', true)}
                  className={`hidden sm:inline-block px-2.5 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                    audioLangMode === 'bilingual'
                      ? 'bg-[#557153] text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  বাংলা+EN
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const speeds = [0.75, 0.85, 0.92, 1.0, 1.15];
                  const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                  setPlaybackSpeed(nextSpeed);
                }}
                className="hidden sm:inline-block px-2.5 py-1 text-xs font-[family-name:var(--font-mono)] tabular-nums bg-stone-200/80 hover:bg-stone-300 text-stone-800 rounded-full transition-colors whitespace-nowrap"
              >
                {playbackSpeed}x
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMuted((m) => {
                    const next = !m;
                    if (next) stopAllAudio();
                    return next;
                  });
                }}
                className="p-2 text-stone-600 hover:text-stone-950 bg-stone-200/80 rounded-full transition-colors"
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowPopupPlayer(true)}
                className="p-2 text-white bg-[#557153] hover:bg-[#435B41] rounded-full transition-colors"
                title="Expand Fullscreen Audio Player"
                aria-label="Expand Fullscreen Audio Player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SPOTIFY POPUP AUDIO PLAYER (DEDICATED MODAL FOR EACH BOOK) */}
      <SpotifyPopupAudioPlayer
        isOpen={showPopupPlayer}
        onClose={() => setShowPopupPlayer(false)}
        book={activeBook}
        chapter={activeChapter}
        chapterIndex={activeChapterIdx}
        paragraphIndex={activeParagraphIdx}
        isPlaying={isPlaying}
        isLoadingAudio={isLoadingAudio}
        elapsedSeconds={elapsedSeconds}
        audioLangMode={audioLangMode}
        playbackSpeed={playbackSpeed}
        ambientTanpura={ambientTanpura}
        continuousBookPlay={continuousBookPlay}
        activeDirectedSegments={activeDirectedSegments}
        activeDirectedSegmentId={activeDirectedSegmentId}
        engineNotice={engineNotice}
        onTogglePlayPause={togglePlayPause}
        onPrevPassage={() => {
          if (activeParagraphIdx > 0) {
            const prevIdx = activeParagraphIdx - 1;
            setActiveParagraphIdx(prevIdx);
            if (isPlaying) startPlayback(prevIdx, audioLangMode, activeChapterIdx, activeBook);
          } else if (activeChapterIdx > 0) {
            const prevCh = activeChapterIdx - 1;
            const lastPara = activeBook.chapters[prevCh].paragraphsBn.length - 1;
            setActiveChapterIdx(prevCh);
            setActiveParagraphIdx(lastPara);
            if (isPlaying) startPlayback(lastPara, audioLangMode, prevCh, activeBook);
          }
        }}
        onNextPassage={() => {
          if (activeParagraphIdx + 1 < activeChapter.paragraphsBn.length) {
            const nextIdx = activeParagraphIdx + 1;
            setActiveParagraphIdx(nextIdx);
            if (isPlaying) startPlayback(nextIdx, audioLangMode, activeChapterIdx, activeBook);
          } else if (activeChapterIdx + 1 < activeBook.chapters.length) {
            const nextCh = activeChapterIdx + 1;
            setActiveChapterIdx(nextCh);
            setActiveParagraphIdx(0);
            if (isPlaying) startPlayback(0, audioLangMode, nextCh, activeBook);
          }
        }}
        onSliderChapterJump={handleSliderChapterJump}
        onSliderPassageScrub={handleSliderGlobalPassageScrub}
        onSelectAudioLang={handleSelectAudioLanguage}
        onSetPlaybackSpeed={setPlaybackSpeed}
        onToggleAmbientTanpura={() => setAmbientTanpura((prev) => !prev)}
        onToggleContinuousBookPlay={() => setContinuousBookPlay((prev) => !prev)}
        onSpeakDirectedSegment={handleSpeakDirectedSegment}
        onPlayAllDirectedSegments={handlePlayAllDirectedSegments}
        onSelectChapter={(chIdx) => {
          setActiveChapterIdx(chIdx);
          setActiveParagraphIdx(0);
          startPlayback(0, audioLangMode, chIdx, activeBook);
        }}
        totalBookPassages={totalBookPassages}
        currentGlobalPassageIdx={currentGlobalPassageIdx}
        narratorPersona={narratorPersona}
        onSelectNarratorPersona={(persona) => {
          setNarratorPersona(persona);
          if (isPlaying) {
            startPlayback(activeParagraphIdx, audioLangMode, activeChapterIdx, activeBook);
          }
        }}
        isPlayingKebriaSample={isPlayingKebriaSample}
        onToggleKebriaSample={toggleKebriaReferenceSample}
      />
    </div>
  );
}
