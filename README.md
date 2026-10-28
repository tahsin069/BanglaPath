# বাংলাগ্রন্থ · BanglaGrantha

**Global Bengali Literary Archive & Bilingual Neural Audiobook Sanctuary**

BanglaGrantha is an open-access digital library and unabridged bilingual audiobook platform dedicated to preserving classic Bengali literature (*Upanyas*, *Kabita*, *Chhotogolpo*, *Rahasya & Sci-Fi*, *Prabandha*, and *Shishu Sahitya*) and making it accessible worldwide in both **Bengali (`বাংলা`)** and **English (`English`)** with synchronized sentence-by-sentence neural narration.

---

## Key Features

- **Unabridged Multi-Chapter Classics**: Complete multi-chapter editions of 12 foundational works of Bengali literature (*Pather Panchali*, *Gitanjali*, *Sonar Kella*, *Kapalkundala*, *Sultana's Dream*, *Abol Tabol*, *Agnibina & Bidrohi*, *Banalata Sen & Rupasi Bangla*, *Kabuliwala & The Postmaster*, *Padma Nadir Majhi*, *Satyanweshi · Byomkesh Bakshi*, and *Sabhyatar Sankat*), plus dynamic AI-assisted archival chapter expansion.
- **Native Male Bengali & English Neural Narration**:
  - **Bengali (`বাংলা অডিও`)**: Powered by 100% native Bengali male neural voices (`bn-IN-BashkarNeural` Kolkata Literary Baritone and `bn-BD-PradeepNeural` Dhaka Warm Storyteller) at 24kHz 96kbps MP3 with custom storytelling SSML prosody and natural sentence pauses.
  - **English (`English Audio`)**: Powered by natural male neural voices (`en-US-BrianMultilingualNeural`, `en-US-AndrewMultilingualNeural`, `en-GB-RyanNeural`), optional ElevenLabs Multilingual v2 (`ELEVENLABS_API_KEY`), and Gemini TTS (`GEMINI_API_KEY`).
  - **Bilingual Alternating Mode (`বাংলা + EN`)**: Reads each passage in native Bengali followed immediately by its English literary translation.
- **Federated Global E-Book Sources**: Live catalog discovery across **Open Library**, **Project Gutenberg (Gutendex)**, **Internet Archive / Digital Library of India**, and **Bengali Wikisource / Bichitra**.
- **Installable PWA & Offline Bilingual Export**: Full Web App Manifest, Service Worker caching, and one-click downloadable standalone HTML/Markdown bilingual editions.
- **SEO & Structured Data**: Dynamic OpenGraph social cards, XML sitemap (`/sitemap.xml`), `robots.txt`, and Schema.org `WebApplication`, `Book`, and `Audiobook` JSON-LD graph.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript, Standalone Output)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Typography**: `Noto Serif Bengali`, `Cormorant Garamond`, `Lora`, `JetBrains Mono`
- **Audio & Synthesis**:
  - Native Node.js WebSocket Neural Speech Engine (`/lib/bangla-neural-tts.ts`) with automatic server clock-skew synchronization
  - Web Audio API 3-Stage Warmth Mastering Chain (`/lib/baritone-audio-engine.ts`)
  - Optional ElevenLabs v2 & Google Gemini 2.5 Flash TTS integration

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/banglagrantha.git
cd banglagrantha
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| :--- | :---: | :--- |
| `APP_URL` | Optional | Public URL of your deployment (defaults to `http://localhost:3000`) |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for on-demand literary chapter expansion and English fallback TTS |
| `ELEVENLABS_API_KEY` | Optional | ElevenLabs API key for studio-grade English narration |
| `ELEVENLABS_VOICE_ID` | Optional | Custom ElevenLabs male voice ID (defaults to `JBFqnCBsd6RMkjVDRZzb`) |

> **Note:** Native Bengali (`bn-IN-BashkarNeural` & `bn-BD-PradeepNeural`) and English (`en-US-BrianMultilingualNeural`) neural audiobook synthesis works out of the box with **zero API keys required**.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Deployment

### Standard Node.js Build

```bash
npm run build
npm start
```

### Docker / Google Cloud Run Deployment

This repository includes a multi-stage `Dockerfile` optimized for Next.js standalone mode (`output: 'standalone'`):

```bash
docker build -t banglagrantha .
docker run -p 3000:3000 -e PORT=3000 banglagrantha
```

### Continuous Integration (GitHub Actions)

Every push and pull request to `main` automatically runs `.github/workflows/ci-publish.yml`, verifying:
1. Clean dependency installation (`npm ci`)
2. TypeScript static type validation (`npm run typecheck`)
3. ESLint validation (`npm run lint`)
4. Production Next.js build (`npm run build`)

---

## License

Released under the [MIT License](./LICENSE). Classic literary texts featured in the archive belong to the public domain.
