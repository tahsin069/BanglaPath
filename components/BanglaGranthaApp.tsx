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

  // Audiobook Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [isExpandingChapters, setIsExpandingChapters] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [narratorPersona] = useState<MaleNarratorPersona>('deep-baritone');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ambientTanpura, setAmbientTanpura] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [engineNotice, setEngineNotice] = useState<string>(
    'গল্প পাঠে: অগ্নি (শ্রুতি-গল্প কথক) · Storyteller Voice: Agni (Friday Classics Style)'
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
          ? `স্বাভাবিক বাংলা পুরুষ কণ্ঠে পাঠ প্রস্তুত হচ্ছে · Ch ${chNumber}, Passage 0${paraIdx + 1}...`
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
              ? `বাংলা পুরুষ কণ্ঠ (Generic Bangla Male Voice) · Ch ${chNumber}, Passage 0${paraIdx + 1}`
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
          const utterance = new SpeechSynthesisUtterance(text);
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

  const paperStyles: Record<
    PaperTheme,
    { bg: string; text: string; muted: string; border: string; highlight: string }
  > = {
    alabaster: {
      bg: 'bg-[#FBF9F5]',
      text: 'text-[#1C1917]',
      muted: 'text-[#57534E]',
      border: 'border-[#E7E2D8]',
      highlight: 'bg-[#9A3412]/[0.07] border-[#9A3412]/40',
    },
    sepia: {
      bg: 'bg-[#F3EDE0]',
      text: 'text-[#292524]',
      muted: 'text-[#57534E]',
      border: 'border-[#DDD4C2]',
      highlight: 'bg-[#78350F]/[0.09] border-[#78350F]/45',
    },
    night: {
      bg: 'bg-[#171513]',
      text: 'text-[#F5F5F4] tracking-[0.01em]',
      muted: 'text-[#A8A29E]',
      border: 'border-[#292524]',
      highlight: 'bg-[#F59E0B]/[0.12] border-[#F59E0B]/50',
    },
  };

  const currentPaper = paperStyles[paperTheme];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] font-[family-name:var(--font-body)] pb-24">
      <OfflineIndicator />

      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-[#FBF9F5]/95 backdrop-blur-sm border-b border-stone-200">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="text-xl font-bold tracking-tight text-stone-900 font-[family-name:var(--font-display)] whitespace-nowrap shrink-0"
        >
          BanglaGrantha
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <a
            href="#catalog"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Genre Catalog
          </a>
          <a
            href="#reader-studio"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Unabridged Reader &amp; Audio
          </a>
          <a
            href="#federated-sources"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            E-Book Sources
          </a>
          <button
            type="button"
            onClick={() => setShowDigitizeForm((prev) => !prev)}
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Digitize Volume
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (readerSectionRef.current) {
                readerSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }
              if (!isPlaying) {
                startPlayback(activeParagraphIdx, audioLangMode, activeChapterIdx, activeBook);
              }
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-[#9A3412] rounded-lg hover:bg-[#7C2D12] transition-colors whitespace-nowrap shrink-0"
          >
            {isPlaying ? 'Listening to Full Book' : 'Play Full Audiobook'}
          </button>
        </div>
      </header>

      {/* INSTITUTIONAL HERO & OPERATIONAL ARCHIVE RIBBON */}
      <section id="top" className="px-6 lg:px-12 pt-8 pb-12 border-b border-stone-200">
        <div className="max-w-[1320px] mx-auto">
          {/* Operational Utility Strip */}
          <div className="pb-6 mb-8 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-900 font-[family-name:var(--font-bengali)]">
                সম্পূর্ণ অখণ্ড অডিওবুক ও বিশ্ব বাংলা ডিজিটাল গ্রন্থাগার
              </span>
              <span aria-hidden="true">·</span>
              <span>Unabridged Multi-Chapter Bengali &amp; English Audiobooks</span>
              <span aria-hidden="true">·</span>
              <span>Installable Cross-Device Web App</span>
            </div>
            <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] tabular-nums text-stone-500">
              <span>বাংলা অডিও (BN)</span>
              <span aria-hidden="true">·</span>
              <span>English Audio (EN)</span>
              <span aria-hidden="true">·</span>
              <span>All Chapters Audible</span>
            </div>
          </div>

          {/* 2-Column Balanced Split Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Editorial Lead */}
            <div className="lg:col-span-7 flex flex-col justify-between py-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold">
                  Santiniketan &amp; Calcutta Archival Initiative · Unabridged Bilingual Edition
                </p>

                <h1
                  className="mt-4 text-4xl sm:text-5xl lg:text-[3.35rem] font-[family-name:var(--font-display)] font-semibold text-stone-900 leading-[1.1] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Every Bengali Classic, Totally Audible Across All Chapters in Bengali &amp; English.
                </h1>

                <p className="mt-3 text-xl sm:text-2xl font-[family-name:var(--font-bengali)] text-stone-800 leading-relaxed">
                  প্রথম অধ্যায় থেকে শেষ অধ্যায় পর্যন্ত প্রতিটি বইয়ের সম্পূর্ণ অখণ্ড শ্রুতি-সংস্করণ—বাংলা ও ইংরেজি উভয় কণ্ঠে বিরতিহীনভাবে শুনুন।
                </p>

                <p className="mt-5 text-base text-stone-600 leading-relaxed max-w-2xl">
                  Listen to entire books from beginning to end with continuous chapter-to-chapter
                  auto-advance. Every volume includes all core narrative movements preloaded plus an
                  on-demand <strong>Unabridged Archival Chapter Stream</strong> so you can expand and
                  listen to every chapter in <strong>Bengali (বাংলা অডিও)</strong>,{' '}
                  <strong>English</strong>, or <strong>Bilingual Alternating Mode</strong>.
                </p>
              </div>

              {/* Hero Actions & PWA Install Prompt */}
              <div className="mt-8 pt-6 border-t border-stone-200">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => selectBook(CURATED_BENGALI_BOOKS[0], true, true, 'bn')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#9A3412] rounded-lg hover:bg-[#7C2D12] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Headphones className="w-4 h-4" />
                    <span className="font-[family-name:var(--font-bengali)]">
                      সম্পূর্ণ বই বাংলায় শুনুন (Play Full Book in Bengali)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectBook(CURATED_BENGALI_BOOKS[0], true, true, 'en')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-stone-900 bg-[#EBE6DF] hover:bg-stone-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>Play Full Book in English</span>
                  </button>

                  {/* Mandatory In-App PWA Install Button */}
                  <PWAInstallButton />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span>Direct Genre Collections:</span>
                  {GENRE_CATEGORIES.slice(1).map((cat, index) => (
                    <React.Fragment key={cat.id}>
                      {index > 0 && <span aria-hidden="true">·</span>}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGenre(cat.id);
                          document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:text-[#9A3412] underline decoration-stone-300 underline-offset-4 transition-colors whitespace-nowrap"
                      >
                        {cat.bengaliName} ({cat.countLabel})
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Featured Archival Accession Card */}
            <div className="lg:col-span-5 flex">
              <div className="w-full rounded-xl bg-[#F3EFE6] border border-stone-200/90 p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-stone-500 pb-4 border-b border-stone-200">
                  <span>UNABRIDGED MULTI-CHAPTER AUDIOBOOK</span>
                  <span className="font-[family-name:var(--font-mono)] tabular-nums">
                    {activeBook.chapters.length} Chapters · {totalBookPassages} Passages
                  </span>
                </div>

                <div className="my-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  <div className="sm:col-span-5 aspect-[3/4] rounded-lg overflow-hidden border border-stone-300 shadow-sm">
                    <BookCoverArt book={activeBook} size="md" />
                  </div>

                  <div className="sm:col-span-7 flex flex-col justify-between">
                    <div className="text-xs text-stone-500 flex items-center gap-1.5">
                      <span>{activeBook.genreLabelEn}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-[family-name:var(--font-mono)] tabular-nums">
                        {activeBook.publishedYear}
                      </span>
                    </div>

                    <h2 className="mt-1.5 text-2xl font-[family-name:var(--font-bengali)] font-bold text-stone-900">
                      {activeBook.titleBn}
                    </h2>
                    <p className="text-sm font-[family-name:var(--font-display)] italic text-stone-700">
                      {activeBook.titleEn}
                    </p>

                    <p className="mt-2 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {activeBook.synopsisEn}
                    </p>

                    <dl className="mt-4 pt-3 border-t border-stone-200/80 space-y-1.5 text-xs">
                      <div className="flex justify-between gap-2">
                        <dt className="text-stone-500">Author</dt>
                        <dd className="text-stone-800 font-medium text-right font-[family-name:var(--font-bengali)]">
                          {activeBook.authorBn}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-stone-500">Unabridged Scope</dt>
                        <dd className="text-stone-800 font-[family-name:var(--font-mono)] tabular-nums">
                          {activeBook.chapters.length} Full Chapters (Expandable)
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-stone-500">Audio Languages</dt>
                        <dd className="text-stone-800 font-medium text-right">
                          বাংলা (BN) · English (EN)
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Dual-Language Full Book Launch Buttons */}
                <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      readerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      startPlayback(0, 'bn', 0, activeBook);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span className="font-[family-name:var(--font-bengali)]">
                      সম্পূর্ণ বাংলা অডিও (All Chapters)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      readerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      startPlayback(0, 'en', 0, activeBook);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Full English Audio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Archival Metrics Strip */}
          <div className="mt-10 pt-8 border-t border-stone-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl lg:text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900 tabular-nums">
                148,100+
              </p>
              <p className="mt-1 text-xs text-stone-600">
                Indexed Bengali Monographs &amp; Periodicals Across Connected Sources
              </p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900 tabular-nums">
                বাংলা + English
              </p>
              <p className="mt-1 text-xs text-stone-600">
                Every Book Equipped with Continuous Multi-Chapter Bilingual Audiobooks
              </p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900 tabular-nums">
                6 Literary Genres
              </p>
              <p className="mt-1 text-xs text-stone-600">
                Upanyas, Kabita, Chhotogolpo, Rahasya &amp; Kalpabigyan, Prabandha, Shishu
              </p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900 tabular-nums">
                PWA &amp; Offline
              </p>
              <p className="mt-1 text-xs text-stone-600">
                Installable on Desktop, iOS &amp; Android with Deep-Link Sharing &amp; Export
              </p>
            </div>
          </div>
        </div>
      </section>

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
      <section id="catalog" className="px-6 lg:px-12 py-12 border-b border-stone-200">
        <div className="max-w-[1320px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500">
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
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#9A3412]"
              />
            </div>
          </div>

          {/* Interactive Genre Filter Bar */}
          <div className="mt-6 flex items-center gap-1.5 p-1.5 bg-[#EBE6DF] rounded-xl overflow-x-auto">
            {GENRE_CATEGORIES.map((genre) => {
              const active = selectedGenre === genre.id;
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#FBF9F5] text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
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
                  className={`group rounded-xl border transition-transform duration-150 hover:-translate-y-0.5 flex flex-col justify-between p-5 ${
                    isCurrentBook
                      ? 'bg-[#F3EFE6] border-[#9A3412]/60'
                      : 'bg-[#F7F4EE] border-stone-200/90 hover:border-stone-300'
                  }`}
                >
                  <div>
                    {/* Top Row: Cover Art + Core Metadata */}
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <div
                        onClick={() => selectBook(book, false, true)}
                        className="col-span-4 aspect-[3/4] rounded-lg overflow-hidden border border-stone-300 cursor-pointer"
                      >
                        <BookCoverArt book={book} size="sm" />
                      </div>

                      <div className="col-span-8 flex flex-col">
                        {/* Clean Unboxed Metadata */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                          <span>{book.genreLabelBn}</span>
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
                          className="mt-1.5 text-lg font-[family-name:var(--font-bengali)] font-bold text-stone-900 group-hover:text-[#9A3412] transition-colors cursor-pointer line-clamp-1"
                        >
                          {book.titleBn}
                        </h3>
                        <p className="text-xs font-[family-name:var(--font-display)] italic text-stone-700 line-clamp-1">
                          {book.titleEn}
                        </p>

                        <p className="mt-1 text-xs font-medium text-stone-800 font-[family-name:var(--font-bengali)]">
                          {book.authorBn} ·{' '}
                          <span className="font-normal text-stone-600">{book.authorEn}</span>
                        </p>

                        <p className="mt-2.5 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                          {book.synopsisEn}
                        </p>
                      </div>
                    </div>

                    {/* Full Book Audio Scope Line */}
                    <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2 text-[11px] text-stone-500">
                      <span className="truncate">
                        Unabridged Audio: All {book.chapters.length} Chapters (বাংলা &amp; EN)
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(book.id)}
                        aria-label="Bookmark volume"
                        className="text-stone-500 hover:text-[#9A3412] transition-colors shrink-0"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-[#9A3412]" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Controls: Read + Full Bengali Audio + Full English Audio */}
                  <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => selectBook(book, false, true)}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-stone-800 bg-[#FBF9F5] border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>All Chapters</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectBook(book, true, true, 'bn')}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Headphones className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-[family-name:var(--font-bengali)]">বাংলা অডিও</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectBook(book, true, true, 'en')}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap"
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
        className="px-6 lg:px-12 py-14 border-b border-stone-200"
      >
        <div className="max-w-[1320px] mx-auto">
          {/* Reader Header & Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold">
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
              <div className="flex items-center gap-1 p-1 bg-[#EBE6DF] rounded-lg">
                <button
                  type="button"
                  onClick={() => setScriptMode('bilingual')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    scriptMode === 'bilingual'
                      ? 'bg-[#FBF9F5] text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Parallel (বাংলা + EN)
                </button>
                <button
                  type="button"
                  onClick={() => setScriptMode('bn')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap font-[family-name:var(--font-bengali)] ${
                    scriptMode === 'bn'
                      ? 'bg-[#FBF9F5] text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  বাংলা মূল পাঠ
                </button>
                <button
                  type="button"
                  onClick={() => setScriptMode('en')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    scriptMode === 'en'
                      ? 'bg-[#FBF9F5] text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  English Text
                </button>
              </div>

              {/* Paper Theme Selector */}
              <div className="flex items-center gap-1 p-1 bg-[#EBE6DF] rounded-lg">
                <button
                  type="button"
                  onClick={() => setPaperTheme('alabaster')}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    paperTheme === 'alabaster'
                      ? 'bg-[#FBF9F5] text-stone-900 shadow-xs'
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

            {/* Right 4 Columns: Bilingual Full-Book Audiobook Console & Chapter Queue */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="rounded-xl bg-[#F3EFE6] border border-stone-200 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold">
                      Unabridged Audiobook Console
                    </p>
                    <h3 className="text-lg font-[family-name:var(--font-display)] font-semibold text-stone-900 mt-0.5">
                      Full-Book Continuous Player
                    </h3>
                  </div>
                  <span className="text-xs font-[family-name:var(--font-mono)] tabular-nums text-stone-600">
                    {formatTimecode(elapsedSeconds)} / {activeChapter.durationFormatted}
                  </span>
                </div>

                {/* AUDIO LANGUAGE SELECTOR */}
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wider text-stone-600 font-semibold mb-2">
                    Select Audiobook Narration Language (অডিও ভাষা)
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#E5DEC9] rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleSelectAudioLanguage('bn', true)}
                      className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap font-[family-name:var(--font-bengali)] ${
                        audioLangMode === 'bn'
                          ? 'bg-[#9A3412] text-white shadow-xs'
                          : 'text-stone-800 hover:bg-[#FBF9F5]/60'
                      }`}
                    >
                      বাংলা অডিও
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAudioLanguage('en', true)}
                      className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        audioLangMode === 'en'
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-800 hover:bg-[#FBF9F5]/60'
                      }`}
                    >
                      English Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAudioLanguage('bilingual', true)}
                      className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        audioLangMode === 'bilingual'
                          ? 'bg-[#1E3A8A] text-white shadow-xs'
                          : 'text-stone-800 hover:bg-[#FBF9F5]/60'
                      }`}
                    >
                      বাংলা + EN
                    </button>
                  </div>
                </div>

                {/* WEBSITE STORYTELLER VOICE: AGNI (FRIDAY CLASSICS STYLE) */}
                <div className="mt-4 pt-3 border-t border-stone-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-stone-600 font-semibold">
                        Storyteller Voice (গল্প পাঠে)
                      </p>
                      <p className="text-xs font-semibold text-stone-900 font-[family-name:var(--font-bengali)] mt-0.5">
                        অগ্নি · শ্রুতি-গল্প কথক (Agni · Friday Classics Style)
                      </p>
                    </div>
                    {activeBook.id !== 'apadartho-satyajit-ray' && (
                      <button
                        type="button"
                        onClick={() => selectBook(CURATED_BENGALI_BOOKS[0], true, false, 'bn')}
                        className="px-2.5 py-1.5 text-[11px] font-medium text-[#9A3412] bg-[#FBF9F5] border border-[#9A3412]/40 hover:bg-[#9A3412] hover:text-white rounded-md transition-colors whitespace-nowrap font-[family-name:var(--font-bengali)]"
                      >
                        অগ্নি · অপদার্থ শুনুন
                      </button>
                    )}
                  </div>
                </div>

                {/* Continuous Multi-Chapter Auto-Advance Toggle */}
                <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs">
                  <span className="text-stone-600">Continuous Chapter Auto-Advance</span>
                  <button
                    type="button"
                    onClick={() => setContinuousBookPlay((prev) => !prev)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                      continuousBookPlay
                        ? 'bg-[#9A3412] text-white'
                        : 'bg-[#FBF9F5] text-stone-700 border border-stone-300'
                    }`}
                  >
                    {continuousBookPlay ? 'All Chapters ON' : 'Single Chapter'}
                  </button>
                </div>

                {/* Progress Scrubber */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-[family-name:var(--font-mono)] tabular-nums text-stone-500 mb-1.5">
                    <span>
                      Ch {activeChapter.number}/{activeBook.chapters.length} · Passage{' '}
                      {activeParagraphIdx + 1}/{activeChapter.paragraphsBn.length}
                    </span>
                    <span>{totalBookPassages} Passages Total</span>
                  </div>
                  <div className="w-full h-2 bg-stone-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9A3412] transition-transform duration-200 origin-left"
                      style={{
                        transform: `scaleX(${Math.min(
                          1,
                          (activeParagraphIdx + (isPlaying ? 0.6 : 0.2)) /
                            Math.max(1, activeChapter.paragraphsBn.length)
                        )})`,
                      }}
                    />
                  </div>
                </div>

                {/* Primary Playback Transport Controls */}
                <div className="mt-5 flex items-center justify-between gap-2">
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
                    className="p-2.5 text-stone-700 hover:text-stone-900 bg-[#FBF9F5] border border-stone-300 rounded-lg transition-colors"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayPause}
                    disabled={isLoadingAudio}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-white bg-[#9A3412] hover:bg-[#7C2D12] rounded-lg transition-colors whitespace-nowrap"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>
                      {isLoadingAudio
                        ? 'Synthesizing Audio...'
                        : isPlaying
                        ? `Pause (${
                            audioLangMode === 'bn'
                              ? 'বাংলা'
                              : audioLangMode === 'en'
                              ? 'English'
                              : 'বাংলা+EN'
                          })`
                        : `Play Unabridged (${
                            audioLangMode === 'bn'
                              ? 'বাংলা'
                              : audioLangMode === 'en'
                              ? 'English'
                              : 'বাংলা+EN'
                          })`}
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
                    className="p-2.5 text-stone-700 hover:text-stone-900 bg-[#FBF9F5] border border-stone-300 rounded-lg transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* FULL BOOK CHAPTER QUEUE LIST */}
                <div className="mt-5 pt-4 border-t border-stone-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <ListMusic className="w-3.5 h-3.5 text-[#9A3412]" />
                      <span>Full-Book Audio Chapter Queue</span>
                    </span>
                    <span className="font-[family-name:var(--font-mono)] text-[11px] text-stone-500">
                      {activeBook.chapters.length} Parts
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
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
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between gap-2 ${
                            isCurrentCh
                              ? 'bg-[#9A3412]/10 border-[#9A3412] text-stone-900'
                              : 'bg-[#FBF9F5] border-stone-200/90 text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-[family-name:var(--font-bengali)] font-medium truncate">
                              {ch.titleBn}
                            </p>
                            <p className="text-[11px] text-stone-500 truncate">{ch.titleEn}</p>
                          </div>
                          <span className="font-[family-name:var(--font-mono)] tabular-nums text-[11px] text-stone-500 shrink-0">
                            {ch.paragraphsBn.length}p · {ch.durationFormatted}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={isExpandingChapters}
                    onClick={() => loadMoreUnabridgedChapters(activeBook, false)}
                    className="mt-3 w-full py-2 px-3 text-xs font-medium text-[#9A3412] bg-[#FBF9F5] border border-[#9A3412]/40 hover:bg-[#9A3412] hover:text-white rounded-lg transition-colors"
                  >
                    {isExpandingChapters
                      ? 'Loading Additional Chapters...'
                      : '+ Expand Book with Next 3 Unabridged Chapters'}
                  </button>
                </div>

                {/* Speed & Ambient Tanpura Controls */}
                <div className="mt-5 pt-4 border-t border-stone-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Narration Speed</span>
                    <div className="flex items-center gap-1 font-[family-name:var(--font-mono)] tabular-nums">
                      {[0.85, 1.0, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-2 py-1 rounded border text-[11px] ${
                            playbackSpeed === spd
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-[#FBF9F5] text-stone-700 border-stone-300'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Santiniketan Tanpura Drone</span>
                    <button
                      type="button"
                      onClick={() => setAmbientTanpura((prev) => !prev)}
                      className={`px-3 py-1 rounded border text-[11px] font-medium ${
                        ambientTanpura
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-[#FBF9F5] text-stone-700 border-stone-300'
                      }`}
                    >
                      {ambientTanpura ? 'Accompaniment On' : 'Voice Only'}
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-600 pt-1 font-[family-name:var(--font-bengali)]">
                    {engineNotice}
                  </p>
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

      {/* PERSISTENT CROSS-DEVICE BOTTOM BILINGUAL FULL-BOOK AUDIOBOOK PLAYER BAR */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[#1C1917] text-[#FBF9F5] border-t border-stone-800 px-4 sm:px-8 py-3 shadow-lg">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-4">
          {/* Active Book & Chapter Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] text-white flex items-center justify-center transition-colors shrink-0"
              aria-label={isPlaying ? 'Pause audiobook' : 'Play audiobook'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-[family-name:var(--font-bengali)] font-semibold truncate">
                  {activeBook.titleBn}
                </p>
                <span className="hidden sm:inline text-xs text-stone-400 truncate">
                  · Ch {activeChapter.number}/{activeBook.chapters.length}: {activeChapter.titleEn}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate font-[family-name:var(--font-bengali)]">
                {engineNotice}
              </p>
            </div>
          </div>

          {/* Center Transport & Timecode */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
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
              className="p-1.5 text-stone-300 hover:text-white transition-colors"
              aria-label="Previous passage or chapter"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <span className="text-xs font-[family-name:var(--font-mono)] tabular-nums text-stone-300">
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
              className="p-1.5 text-stone-300 hover:text-white transition-colors"
              aria-label="Next passage or chapter"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right Audio Language Switcher (বাংলা / EN / বাংলা+EN), Speed & Mute */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-stone-700">
              <button
                type="button"
                onClick={() => handleSelectAudioLanguage('bn', true)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap font-[family-name:var(--font-bengali)] ${
                  audioLangMode === 'bn'
                    ? 'bg-[#9A3412] text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                বাংলা অডিও
              </button>
              <button
                type="button"
                onClick={() => handleSelectAudioLanguage('en', true)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  audioLangMode === 'en'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                EN Audio
              </button>
              <button
                type="button"
                onClick={() => handleSelectAudioLanguage('bilingual', true)}
                className={`hidden sm:inline-block px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  audioLangMode === 'bilingual'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                বাংলা+EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const speeds = [0.85, 1.0, 1.25, 1.5];
                const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                setPlaybackSpeed(nextSpeed);
              }}
              className="hidden sm:inline-block px-2.5 py-1 text-xs font-[family-name:var(--font-mono)] tabular-nums bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md transition-colors whitespace-nowrap"
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
              className="p-2 text-stone-300 hover:text-white bg-stone-800 rounded-md transition-colors"
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
