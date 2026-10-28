export type GenreId =
  | 'all'
  | 'upanyas'
  | 'kabita'
  | 'chhotogolpo'
  | 'rahasya'
  | 'prabandha'
  | 'shishu';

export interface GenreCategory {
  id: GenreId;
  englishName: string;
  bengaliName: string;
  description: string;
  countLabel: string;
}

export interface EbookSourceProvider {
  id: string;
  name: string;
  bengaliName: string;
  institution: string;
  endpointType: 'OpenLibrary' | 'InternetArchive' | 'Gutendex' | 'Wikisource' | 'Bichitra';
  protocol: string;
  indexedWorks: string;
  description: string;
  baseUrl: string;
}

export interface BookChapter {
  id: string;
  number: number;
  titleBn: string;
  titleEn: string;
  durationSeconds: number;
  durationFormatted: string;
  paragraphsBn: string[];
  paragraphsEn: string[];
  narratorNote: string;
}

export type CoverMotif =
  | 'pather_panchali'
  | 'gitanjali'
  | 'sonar_kella'
  | 'devdas'
  | 'kapalkundala'
  | 'abol_tabol'
  | 'bidrohi'
  | 'banalata_sen'
  | 'sultanas_dream'
  | 'padma_nadir_majhi'
  | 'byomkesh'
  | 'kabuliwala'
  | 'archive_edition';

export interface BengaliBook {
  id: string;
  accessionNumber: string;
  titleBn: string;
  titleEn: string;
  authorBn: string;
  authorEn: string;
  authorLifespan: string;
  publishedYear: number;
  genre: Exclude<GenreId, 'all'>;
  genreLabelEn: string;
  genreLabelBn: string;
  sourceId: string;
  sourceName: string;
  totalDurationFormatted: string;
  totalDurationSeconds: number;
  narratorVoice: 'Charon' | 'Orus' | 'Fenrir' | 'Puck';
  narratorNameBn: string;
  narratorNameEn: string;
  coverMotif: CoverMotif;
  palette: {
    bg: string;
    ink: string;
    accent: string;
    border: string;
  };
  synopsisEn: string;
  synopsisBn: string;
  provenance: string;
  firstEditionPress: string;
  chapters: BookChapter[];
  isExternalImport?: boolean;
  externalSourceUrl?: string;
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  {
    id: 'all',
    englishName: 'All Genres',
    bengaliName: 'সকল বিভাগ',
    description: 'Complete curated and federated archive of classic and modern Bengali literature.',
    countLabel: 'Complete Catalog',
  },
  {
    id: 'upanyas',
    englishName: 'Upanyas · Novels',
    bengaliName: 'উপন্যাস',
    description: 'Epic social realism, rural lyricism, and psychological novels from the Bengal Renaissance to modernity.',
    countLabel: 'Novels',
  },
  {
    id: 'kabita',
    englishName: 'Kabita · Poetry',
    bengaliName: 'কবিতা ও গীতি',
    description: 'Nobel-winning mysticism, revolutionary verse, and modern post-Tagorean poetic movements.',
    countLabel: 'Poetry',
  },
  {
    id: 'chhotogolpo',
    englishName: 'Chhotogolpo · Stories',
    bengaliName: 'ছোটগল্প',
    description: 'Intimate short fiction capturing riverine Bengal, urban Calcutta, and human resilience.',
    countLabel: 'Short Stories',
  },
  {
    id: 'rahasya',
    englishName: 'Rahasya & Sci-Fi',
    bengaliName: 'রহস্য ও কল্পবিজ্ঞান',
    description: 'Sleuth chronicles of Feluda and Byomkesh Bakshi alongside pioneering feminist and cosmic science fiction.',
    countLabel: 'Mystery & Sci-Fi',
  },
  {
    id: 'prabandha',
    englishName: 'Prabandha · Essays',
    bengaliName: 'প্রবন্ধ ও নাটক',
    description: 'Philosophical treatises, cultural criticism, and landmark theatrical works.',
    countLabel: 'Essays & Drama',
  },
  {
    id: 'shishu',
    englishName: 'Shishu · Nonsense & Lore',
    bengaliName: 'শিশু ও কিশোর সাহিত্য',
    description: 'Timeless literary nonsense, folklore, and illustrated adventures across generations.',
    countLabel: 'Youth & Lore',
  },
];

export const EBOOK_SOURCES: EbookSourceProvider[] = [
  {
    id: 'openlibrary-ben',
    name: 'Open Library Bengali Corpus',
    bengaliName: 'ওপেন লাইব্রেরি বাংলা সংগ্রহ',
    institution: 'Internet Archive / Open Library Foundation',
    endpointType: 'OpenLibrary',
    protocol: 'REST JSON Search API (language:ben)',
    indexedWorks: '48,200+ Editions',
    description: 'Global bibliographic index and full-text scans of Bengali monographs, early printed books, and global library holdings.',
    baseUrl: 'https://openlibrary.org',
  },
  {
    id: 'internet-archive-dli',
    name: 'Digital Library of India & Bengal Archive',
    bengaliName: 'ভারতের ডিজিটাল গ্রন্থাগার ও বঙ্গীয় সংগ্রহ',
    institution: 'Internet Archive & National Digital Library',
    endpointType: 'InternetArchive',
    protocol: 'AdvancedSearch OAI-PMH / JSON',
    indexedWorks: '62,500+ Volumes',
    description: 'Rare 19th- and 20th-century Bengali imprints from Presidency College, Bangiya Sahitya Parishad, and National Library Calcutta.',
    baseUrl: 'https://archive.org',
  },
  {
    id: 'bichitra-tagore',
    name: 'Bichitra & Rabindra Rachanabali',
    bengaliName: 'বিচিত্রা ও রবীন্দ্র রচনাবলী',
    institution: 'Jadavpur University & Visva-Bharati Variorum',
    endpointType: 'Bichitra',
    protocol: 'Unicode TEI-XML Literary Corpus',
    indexedWorks: '4,900+ Works',
    description: 'Complete chronological manuscripts and first-edition texts of Rabindranath Tagore and Santiniketan Press publications.',
    baseUrl: 'https://bn.wikisource.org',
  },
  {
    id: 'wikisource-bn',
    name: 'Bengali Wikisource Digital Commons',
    bengaliName: 'বাংলা উইকিসংকলন উন্মুক্ত গ্রন্থাগার',
    institution: 'Wikimedia Foundation & Bengali Literary Volunteers',
    endpointType: 'Wikisource',
    protocol: 'MediaWiki OPDS & Full-Text Unicode',
    indexedWorks: '29,400+ Texts',
    description: 'Proofread, peer-verified Unicode transcriptions of public-domain Bengali novels, periodicals (Sabuj Patra, Kallol, Desh), and poetry.',
    baseUrl: 'https://bn.wikisource.org',
  },
  {
    id: 'gutendex-sa',
    name: 'Project Gutenberg South Asia',
    bengaliName: 'প্রজেক্ট গুটেনবার্গ দক্ষিণ এশিয়া',
    institution: 'Project Gutenberg Literary Archive',
    endpointType: 'Gutendex',
    protocol: 'Gutendex JSON & EPUB3 Stream',
    indexedWorks: '3,100+ Translations & Originals',
    description: 'World-accessible editions of classic Bengali literature and English translations by Tagore, Sarat Chandra, and Bankim Chandra.',
    baseUrl: 'https://gutendex.com',
  },
];

export const CURATED_BENGALI_BOOKS: BengaliBook[] = [
  {
    id: 'pather-panchali',
    accessionNumber: 'BG-1929-UPN-001',
    titleBn: 'পথের পাঁচালী',
    titleEn: 'Pather Panchali (Song of the Little Road)',
    authorBn: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়',
    authorEn: 'Bibhutibhushan Bandyopadhyay',
    authorLifespan: '1894–1950',
    publishedYear: 1929,
    genre: 'upanyas',
    genreLabelEn: 'Upanyas · Novel',
    genreLabelBn: 'উপন্যাস',
    sourceId: 'wikisource-bn',
    sourceName: 'Bengali Wikisource · Ranjan Prakashanalay Unabridged Edition',
    totalDurationFormatted: '6h 42m',
    totalDurationSeconds: 24120,
    narratorVoice: 'Charon',
    narratorNameBn: 'সৌমিত্র শর্মা (গভীর প্রশান্ত ব্যারিটোন)',
    narratorNameEn: 'Soumitra Sharma · Deep Soothing Baritone',
    coverMotif: 'pather_panchali',
    palette: {
      bg: '#1E293B',
      ink: '#F8FAFC',
      accent: '#D97706',
      border: '#334155',
    },
    synopsisEn:
      'Complete unabridged three-movement chronicle of Nishchindipur: from Indir Thakrun’s ballad in Ballali Balai and Apu and Durga’s childhood in Am-Antir Bhepu to the family’s departure for Kashi in Akrur Sambad.',
    synopsisBn:
      'বল্লালী বালাই, আম-আঁটির ভেঁপু এবং অক্রূর সংবাদ—তিনটি পূর্ণাঙ্গ পর্বে নিশ্চিন্দিপুর গ্রামের প্রকৃতি, দারিদ্র্য এবং অপু ও দুর্গার শৈশবের অমর আখ্যান।',
    provenance: 'First serialized in Bichitra periodical (1928); published as a monograph in Calcutta, 1929.',
    firstEditionPress: 'Ranjan Prakashanalay, College Street, Calcutta',
    chapters: [
      {
        id: 'pp-ch-1',
        number: 1,
        titleBn: 'প্রথম অধ্যায় — বল্লালী বালাই ও ইন্দির ঠাকরুন',
        titleEn: 'Chapter I · Ballali Balai: Ancestral Homestead & Indir Thakrun',
        durationSeconds: 420,
        durationFormatted: '07:00',
        narratorNote: 'Gentle, nostalgic cadence evoking rural Bengal at dawn.',
        paragraphsBn: [
          'নিশ্চিন্দিপুর গ্রামের একেবারে উত্তর প্রান্তে হরিহর রায়ের ক্ষুদ্র কোঠাবাড়ি। বাড়ির চারিধারে বাঁশবন, আম-কাঁঠালের বাগান ও বুনো ঝোপঝাড়ে ঘেরা। বর্ষার দিনে ইছামতী নদীর জল বাড়িয়া উঠিলে দূর হইতে তাহার মৃদু কলধ্বনি শোনা যায়।',
          'হরিহরের দূরসম্পর্কের দিদি ইন্দির ঠাকরুন দাওয়ার এক কোণে বসিয়া ছেঁড়া কাঁথা সেলাই করেন আর গুনগুন করিয়া পুরানো দিনের ছড়া কাটেন—"হরি দিন তো গেল, সন্ধ্যা হলো, পার করো আমারে।" বৃদ্ধার জীবনে আপন বলিতে এইটুকু আশ্রয়ই অবশিষ্ট আছে।',
          'সকালবেলা রোদ উঠিতেই কিশোরী দুর্গা উঠানের এক কোণে দাঁড়াইয়া হাতের নরম আমের কুশিটি নুন দিয়া চিবাইতেছিল। পিসিমার কোলের কাছে বসিয়া সে রূপকথার রাজপুত্র ও পক্ষীরাজ ঘোড়ার গল্প শোনে।',
          'হরিহর রায় প্রাচীন ব্রাহ্মণ বংশের সন্তান। সামান্য যজমানি ও পৈতৃক ভিটার সামান্য আয়ে সংসার চলে না বলিলেই হয়, তবুও তাঁহার মনে সদা আশা—হয়তো কোনোদিন সুদিন ফিরিবে, পুরানো কোঠাবাড়িটি আবার মেরামত হইবে।',
        ],
        paragraphsEn: [
          'At the far northern edge of the village of Nishchindipur stood the small brick house of Harihar Ray. All around the homestead grew thickets of bamboo, mango and jackfruit orchards, and tangled wild creepers. When the monsoon swelled the waters of the Ichamati river, its low murmur drifted through the trees.',
          'Harihar’s elderly cousin Indir Thakrun sat in her corner of the veranda stitching a worn quilt and humming an old devotional refrain: "O Lord, the day is spent, evening falls—ferry me across the dark water." In all the wide world, this humble veranda was her last refuge.',
          'As the morning sun broke over the courtyard, young Durga stood near the fence chewing a tender green mango shoot dipped in salt. At dusk she would nestle beside old Indir to listen wide-eyed to ballads of winged horses and forgotten kings.',
          'Harihar Ray belonged to an old scholarly Brahmin lineage. Though the meager income from village priesthood scarcely sufficed for the household, an unquenchable hope lingered in his heart that fortune would turn and the crumbling ancestral walls would ring with prosperity once more.',
        ],
      },
      {
        id: 'pp-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় অধ্যায় — আম-আঁটির ভেঁপু ও অপুর শৈশব',
        titleEn: 'Chapter II · Am-Antir Bhepu: The Mango-Seed Whistle & Apu’s Awakening',
        durationSeconds: 450,
        durationFormatted: '07:30',
        narratorNote: 'Warm, sunlit wonder of early childhood.',
        paragraphsBn: [
          'কয়েক বৎসর কাটিয়া গিয়াছে। সর্বজয়ার কোল জুড়িয়া আসিয়াছে ছোট্ট খোকা—অপু। সে এখন দাওয়ায় বসিয়া মায়ের আঁচল ধরিয়া বাহিরের পানে চাহিয়া থাকে, যেখানে সজনে ডালের ফাঁকে ঘুঘু পাখি ডাকে আর কাঠবিড়ালি ছুটিয়া বেড়ায়।',
          'বৈশাখ মাসের দুপুরে দুর্গা বাহির হইতে আঁচল ভরিয়া কচি আম কুড়াইয়া আনে। আমের আঁটি ঘষিয়া সে সুন্দর ভেঁপু তৈরি করিয়া অপুর হাতে দেয়। দুই ভাইবোনে মিলিয়া সেই ভেঁপু বাজাইতে বাজাইতে বাগানের ছায়াপথে ছুটিয়া বেড়ায়।',
          'প্রসন্ন গুরুমহাশয়ের পাঠশালায় অপুর হাতেখড়ি হইল। পাটকেলে রঙের মাটির মেঝেতে চাটাই বিছাইয়া ছেলেরা সুর করিয়া নামতা পড়ে, আর গুরুমহাশয় তামাক টানিতে টানিতে প্রাচীন যুদ্ধের ও দেশভ্রমণের গল্প শোনান।',
          'সেই পাঠশালার জানলা দিয়া অপু দূরের আকাশের দিকে চাহিয়া থাকে। চিল উড়িয়া যায় কোন অজানা মেঘের রাজ্যে—অপুর মনে হয় বড় হইয়া সেও এমনি করিয়া দেশ-দেশান্তরে পাড়ি দিবে।',
        ],
        paragraphsEn: [
          'Several seasons turned over Nishchindipur. Into Sarbajaya’s arms had come a little boy—Apu. He now sat on the earthen veranda clinging to his mother’s sari, watching the sunlight dapple the drumstick tree where doves called and squirrels darted from bough to bough.',
          'On hot summer afternoons in the month of Baishakh, Durga returned from the orchards with the hem of her garment filled with fallen green mangoes. Rubbing a mango stone against the rough courtyard step, she fashioned a reed-like whistle and placed it in Apu’s eager hands.',
          'Soon Apu was enrolled in the village pathshala conducted by Prasanna Gurumahashay. Seated on woven palm mats while the grocer-schoolmaster puffed his hookah, the boys chanted multiplication tables and listened to marvelous tales of ancient battles and distant lands.',
          'Through the open doorway of the schoolroom, Apu gazed at the high white clouds where kiteswheeled endlessly in the blue—dreaming of the day he too would journey beyond the horizon of Nishchindipur.',
        ],
      },
      {
        id: 'pp-ch-3',
        number: 3,
        titleBn: 'তৃতীয় অধ্যায় — কাশবনের পথে রেলগাড়ি ও চিনু ময়রার মিষ্টি',
        titleEn: 'Chapter III · The Kashbon Meadow & The Wonder of the Locomotive',
        durationSeconds: 440,
        durationFormatted: '07:20',
        narratorNote: 'Bright, rhythmic pacing rising to the distant rumble of the train.',
        paragraphsBn: [
          'শরৎকালের এক দুপুরে মায়ের চোখ এড়াইয়া দুর্গা ও অপু চুপিচুপি খিড়কি দরজা দিয়া বাহির হইয়া পড়িল। গ্রামের বাহিরে বিস্তীর্ণ মাঠের শেষে সাদা কাশফুলের বন বাতাসে রুপালি ঢেউ খেলিতেছে।',
          'অপু দিদির পিছনে ছুটিয়া বলিল, "দিদি, আজ সত্যিকারের রেলগাড়ি দেখবি তো?" দুর্গা আঙুল তুলিয়া দেখাইল—দূরে উঁচু মাটির বাঁধের উপর লোহার তার ও টেলিগ্রাফের খুঁটি সারি সারি দাঁড়াইয়া আছে।',
          'হঠাৎ মাটি কাঁপাইয়া ঝমঝম শব্দ তুলিয়া কালো ধোঁয়ার কুণ্ডলী উড়াইয়া কলের গাড়ি ছুটিয়া গেল। অপু অপলক বিস্ময়ে চাহিয়া রহিল—এই অচেনা লোহার পথের শেষ কোথায়, কোন দূর দেশে এই গাড়ি মানুষজনকে লইয়া যায়!',
          'ফেরার পথে চিনু ময়রার দোকানের সামনে দিয়া আসিবার সময় মিষ্টির গন্ধে তাহাদের পা আর চলে না। পয়সা না থাকিলেও দুই ভাইবোনের চোখেমুখে তখন অদেখা পৃথিবীর অপার আনন্দ।',
        ],
        paragraphsEn: [
          'On a bright autumn noon, slipping past their mother’s watchful gaze, Durga and Apu stole out through the back postern gate. Beyond the village stretched an open meadow where white plumes of kash grass rippled like silver waves in the breeze.',
          'Apu ran breathless behind his sister, asking, "Didi, shall we truly see the railway train today?" Durga pointed across the plain where telegraph poles and iron wires marched in a straight line atop a raised embankment.',
          'Suddenly the earth trembled, and with a thunderous roar of iron wheels and billowing dark smoke, the locomotive hurtled past. Apu stood transfixed in wonder—where did that gleaming road end, and to what unseen cities did the iron carriage carry its travelers?',
          'Walking home at twilight past Chinu the confectioner’s stall, though their pockets held not a single coin, the eyes of brother and sister shone with the boundless riches of an newly discovered world.',
        ],
      },
      {
        id: 'pp-ch-4',
        number: 4,
        titleBn: 'চতুর্থ অধ্যায় — শ্রাবণের বর্ষণ ও দুর্গার বিদায়',
        titleEn: 'Chapter IV · The Monsoon Storm & Durga’s Departure',
        durationSeconds: 460,
        durationFormatted: '07:40',
        narratorNote: 'Deeply moving, hushed elegiac tone.',
        paragraphsBn: [
          'সেবার শ্রাবণ মাসে ভীষণ বর্ষা নামিল। দিনরাত অবিশ্রান্ত বৃষ্টির ধারায় বাঁশবন ও আমবাগান অন্ধকার হইয়া রহিল। ভিজে বাতাসে জলের ছাঁট আসিয়া ভাঙা জানলা দিয়া ঘরের ভিতর লুটাইয়া পড়ে।',
          'একদিন দুপুরে প্রবল বৃষ্টির মধ্যে দুর্গা ও অপু কুলতলার বাগানে ভিজিয়া ভিজিয়া খেলা করিবার পর হইতেই দুর্গার গায়ে প্রবল জ্বর আসিল। হরিহর তখন কাজের সন্ধানে বিদেশে, সর্বজয়া একা ভাঙা ঘরে মেয়ের শিয়রে বসিয়া রাত জাগেন।',
          'ঝড়-বৃষ্টির সেই কালরাত্রিতে পুরানো কোঠাবাড়ির প্রদীপ নিভিয়া গেল—অপুর খেলার সঙ্গী, বনের ফল কুড়ানোর সাথী দুর্গা চিরকালের মতো ঘুমাইয়া পড়িল। আকাশ পরিষ্কার হইলে দেখা গেল উঠানের বাঁশগাছগুলো ঝড়ে নুয়ে পড়িয়াছে।',
          'অপু একা একা নদীর ঘাটে ও বাঁশবনের পথে ঘুরিয়া বেড়ায়। পুঁতির মালার বাক্সটা খুলিয়া সে দিদির কথা ভাবে, আর বাতাসে পাতার মর্মর ধ্বনিতে যেন দিদির ডাক শুনিতে পায়।',
        ],
        paragraphsEn: [
          'That year in the month of Shravan broke a relentless monsoon. Day and night the rain poured down in unbroken sheets, shrouding the bamboo groves and orchards in gloom while gusts of wet wind beat through the broken shutters.',
          'After dancing soaked in the orchard rain with her brother, Durga was struck by a fierce marsh fever. With Harihar away in a distant town seeking work, Sarbajaya kept solitary vigil beside her daughter’s mat through the howling storm.',
          'Before the tempestuous night yielded to dawn, the oil lamp flickered in the draft and Durga—the wild spirit of the village woods and Apu’s dearest companion—passed quietly into eternal sleep.',
          'In the clear sunlight that followed the storm, Apu wandered alone along the river ghat and bamboo path, holding his sister’s small box of glass beads and hearing her voice in every rustle of the leaves.',
        ],
      },
      {
        id: 'pp-ch-5',
        number: 5,
        titleBn: 'পঞ্চম অধ্যায় — অক্রূর সংবাদ ও নিশ্চিন্দিপুর ত্যাগ',
        titleEn: 'Chapter V · Akrur Sambad: Farewell to Nishchindipur & The Road Ahead',
        durationSeconds: 430,
        durationFormatted: '07:10',
        narratorNote: 'Philosophical, bittersweet, and hopeful finale.',
        paragraphsBn: [
          'দুর্গার মৃত্যুর পর নিশ্চিন্দিপুরের শূন্য ভিটায় থাকা আর হরিহর ও সর্বজয়ার পক্ষে সম্ভব হইল না। হরিহর স্থির করিলেন পৈতৃক ভিটা ছাড়িয়া সপরিবারে কাশীবাসে যাত্রা করিবেন, সেখানে নতুন করিয়া অন্নসংস্থানের চেষ্টা করিবেন।',
          'যাত্রার আগের দিন অপু বাড়ির কোণের ঝোপের মধ্যে লুকানো দুর্গার সেই রাঙা ফলের বীজ ও তেলের ভাঁড়টি দেখিতে পাইল। দিদির স্মৃতিচিহ্নটুকু সে নিঃশব্দে বনের ফুলের মধ্যে রাখিয়া আসিল।',
          'ভোরবেলা গরুর গাড়িতে মালপত্র তোলা হইল। বাঁশবন, ইছামতী নদী, সোনাডাঙার মাঠ আর দুর্গার কবর পিছনে ফেলিয়া চাকা ঘুরিতে শুরু করিল। সর্বজয়া আঁচলে মুখ ঢাকিয়া কাঁদিতে লাগিলেন।',
          'রেলগাড়ির কামরায় বসিয়া অপু জানলা দিয়া বাহিরের ছুটিতে থাকা মাঠ-ঘাটের পানে চাহিয়া রহিল। নিশ্চিন্দিপুরের গণ্ডি ছাড়াইয়া পথের দেবতা তাহাকে এক বৃহত্তর, অজানা জীবনের পথে ডাক দিয়াছেন—যে পথের কোনো শেষ নাই।',
        ],
        paragraphsEn: [
          'After Durga’s passing, the silence of the ancestral house became too heavy for Harihar and Sarbajaya to bear. Harihar resolved to leave Nishchindipur behind and journey west to the holy city of Benares in search of a new livelihood.',
          'While packing their few belongings on the eve of departure, Apu discovered a small earthen jar hidden on the high ledge where Durga had once concealed a stolen string of beads. Tears brimming in his eyes, he cast the keepsake into the wild thicket where nobody would ever scold her memory.',
          'At dawn the bullock cart creaked down the village lane, leaving behind the bamboo groves, the Ichamati river, the open meadows of Sonadanga, and the soil where Durga rested.',
          'As the train carried them westward across vast unfamiliar plains, Apu looked out the window into the widening world. The Deity of the Road was leading him forward from childhood’s threshold into an unending journey of life.',
        ],
      },
    ],
  },
  {
    id: 'gitanjali',
    accessionNumber: 'BG-1910-KAB-002',
    titleBn: 'গীতাঞ্জলি (পূর্ণাঙ্গ সংকলন)',
    titleEn: 'Gitanjali (Complete Song Offerings)',
    authorBn: 'রবীন্দ্রনাথ ঠাকুর',
    authorEn: 'Rabindranath Tagore',
    authorLifespan: '1861–1941',
    publishedYear: 1910,
    genre: 'kabita',
    genreLabelEn: 'Kabita · Poetry & Songs',
    genreLabelBn: 'কবিতা ও গীতি',
    sourceId: 'bichitra-tagore',
    sourceName: 'Bichitra Variorum · Indian Press Unabridged Edition',
    totalDurationFormatted: '3h 15m',
    totalDurationSeconds: 11700,
    narratorVoice: 'Orus',
    narratorNameBn: 'দেবব্রত বিশ্বাসী (শান্ত গভীর ব্যারিটোন)',
    narratorNameEn: 'Debabrata Biswasi · Soothing Velvet Baritone',
    coverMotif: 'gitanjali',
    palette: {
      bg: '#1E3A8A',
      ink: '#FBF9F5',
      accent: '#F59E0B',
      border: '#1D4ED8',
    },
    synopsisEn:
      'Complete five-part cycle of Rabindranath Tagore’s Nobel Prize-winning Song Offerings, from devotional humility and monsoon longing to the awakening of a fearless nation and serene communion with the Infinite.',
    synopsisBn:
      'শান্তিনিকেতনে রচিত গীতাঞ্জলির পাঁচটি পূর্ণাঙ্গ পর্ব—বিনয় ও আত্মসমর্পণ, বর্ষার প্রতীক্ষা, নির্ভীক চিত্তের প্রার্থনা, আলোর আহ্বান এবং অনন্তের পথে যাত্রা।',
    provenance: 'Published Bhadra 1317 BS (August 1910) by Indian Press, Allahabad; Nobel Prize in Literature 1913.',
    firstEditionPress: 'Indian Press & Adi Brahmo Samaj Press, Calcutta',
    chapters: [
      {
        id: 'git-ch-1',
        number: 1,
        titleBn: 'প্রথম পর্ব — আমার মাথা নত করে দাও হে ও অনন্ত জীবন',
        titleEn: 'Part I · Humility & The Infinite Reed Flute',
        durationSeconds: 360,
        durationFormatted: '06:00',
        narratorNote: 'Meditative, unhurried poetic cadence with resonant pauses.',
        paragraphsBn: [
          'আমার মাথা নত করে দাও হে তোমার চরণধুলার তলে। ডুবিয়ে দাও হে আমার সকল অহংকার চোখের জলে। নিজেরে করিতে গৌরব দান নিজেরে কেবলই করি অপমান, নিজেরে শুধুই ঘেরিয়া ঘেরিয়া ঘুরে মরি পলে পলে।',
          'আমারে না যেন করি প্রচার আমার আপন কাজে, তোমারি ইচ্ছা করো হে পূর্ণ আমার জীবনমাঝে। যাচি হে তোমার চরম শান্তি, পরানে তোমার পরম কান্তি, আমারে আড়াল করিয়া দাঁড়াও হৃদয়পদ্মদলে।',
          'তুমি আমারে কী করেছ এতই অধীর, আমার হৃদয়-পাত্র ছাপিয়ে ওঠে নবীন প্রাণের সুর। এই ক্ষুদ্র নলের বাঁশিটি তুমি পাহাড়ে-প্রান্তরে বয়ে নিয়ে চলেছ এবং এরই রন্ধ্রে রন্ধ্রে বাজিয়ে চলেছ চিরনূতন রাগিণী।',
          'তোমার অমৃতসাগরের এক বিন্দু স্পর্শে আমার দেহ ও মন পুলকিত হয়ে ওঠে। ভাষায় যা প্রকাশ করা যায় না, আমার নীরব গানের মধ্য দিয়ে আজ তাই তোমার চরণে নিবেদন করি।',
        ],
        paragraphsEn: [
          'Bow down my head before the dust of thy feet; drown all my pride in the quiet flood of tears. Seeking ever to exalt myself, I only diminish my own spirit, circling endlessly around the narrow prison of the self from moment to moment.',
          'Let me not proclaim my own name in the labor of my hands; fulfill thy sovereign will within the sanctuary of my life. I ask only for thy supreme peace and the radiance of thy presence—stand thou before me upon the lotus petals of my heart.',
          'Thou hast made me endless, such is thy pleasure. This frail vessel thou emptiest again and again, and fillest it ever with fresh life. This little flute of a reed thou hast carried over hills and dales, and hast breathed through it melodies eternally new.',
          'At the immortal touch of thy hands my little heart loses its limits in joy and gives birth to utterance ineffable. Thy infinite gifts come to me only on these very small hands of mine; ages pass, and still thou pourest, and still there is room to fill.',
        ],
      },
      {
        id: 'git-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় পর্ব — মেঘের পরে মেঘ জমেছে ও শ্রাবণধারা',
        titleEn: 'Part II · Clouds Heap Upon Clouds & The Monsoon Vigil',
        durationSeconds: 350,
        durationFormatted: '05:50',
        narratorNote: 'Lyrical, rain-swept musicality.',
        paragraphsBn: [
          'মেঘের পরে মেঘ জমেছে, আঁধার করে আসে। আমায় কেন বসিয়ে রাখো একা দ্বারের পাশে। কাজের দিনে নানা কাজে থাকি নানা লোকের মাঝে, আজ আমি যে বসে আছি তোমারি আশ্বাসে।',
          'তুমি যদি না দেখা দাও, করো আমায় হেলা, কেমন করে কাটে আমার এমন বাদল-বেলা। দূরের পানে মেলে আঁখি কেবল আমি চেয়ে থাকি, পরান আমার কেঁদে বেড়ায় দুরন্ত বাতাসে।',
          'আজি শ্রাবণ-ঘন-গহন-মোহে গোপন তব চরণ ফেলে নিশার মতো নীরব ওহে সবার দিঠি এড়ায়ে গেলে। প্রভাত আজি মুদেছে আঁখি, বাতাস বৃথা যেতেছে ডাকি, নিলাজ নীল আকাশ ঢাকি নিবিড় মেঘ কে দিল মেলে।',
          'কদম্বেরই কানন ঘেরি আষাঢ়মেঘের ছায়া খেলে, পিয়াসী প্রাণ চাতকসম তোমারই পথ চেয়ে রয়। এই বর্ষণমুখর প্রহরে আমার বীণার তারে তোমারই আগমনী সুর বেজে ওঠে।',
        ],
        paragraphsEn: [
          'Clouds heap upon clouds and it darkens. Ah, love, why dost thou let me wait outside at the door all alone? In the busy moments of the noontide work I am with the crowd, but on this dark lonely day it is only for thee that I hope.',
          'If thou showest me not thy face, if thou leavest me wholly aside, I know not how I am to pass these long, rainy hours. I keep gazing on the far-away gloom of the sky, and my heart wanders wailing with the restless wind.',
          'In the deep shadows of the rainy July, with secret steps, thou walkest, silent as night, eluding all watchers. Today the morning has closed its eyes, heedless of the insistent calls of the loud east wind, and a thick veil has been drawn over the ever-wakeful blue sky.',
          'The woodlands have hushed their songs, and doors are all shut at every house. Thou art the solitary wayfarer in this deserted street. Oh my only friend, my best beloved, the gates are open in my house—do not pass by like a dream.',
        ],
      },
      {
        id: 'git-ch-3',
        number: 3,
        titleBn: 'তৃতীয় পর্ব — চিত্ত যেথা ভয়শূন্য ও কর্মযোগ',
        titleEn: 'Part III · Where the Mind is Without Fear & The Path of Action',
        durationSeconds: 340,
        durationFormatted: '05:40',
        narratorNote: 'Clear, elevated classical invocation.',
        paragraphsBn: [
          'চিত্ত যেথা ভয়শূন্য, উচ্চ যেথা শির, জ্ঞান যেথা মুক্ত, যেথা গৃহের প্রাচীর আপন প্রাঙ্গণতলে দিবসশর্বরী বসুধারে রাখে নাই খণ্ড ক্ষুদ্র করি।',
          'যেথা বাক্য হৃদয়ের উৎসমুখ হতে উচ্ছ্বাসিয়া উঠে, যেথা নির্বারিত স্রোতে দেশে দেশে দিশে দিশে কর্মধারা ধায় অজস্র সহস্রবিধ চরিতার্থতায়।',
          'যেথা তুচ্ছ আচারের মরুবালুরাশি বিচারের স্রোতপথ ফেলে নাই গ্রাসি—পৌরুষেরে করে নি শতধা, নিত্য যেথা তুমি সর্ব কর্ম চিন্তা আনন্দের নেতা, নিজ হস্তে নির্দয় আঘাত করি, পিতঃ, ভারতেরে সেই স্বর্গে করো জাগরিত।',
          'ভজন পূজন সাধন আরাধনা সমস্ত থাক পড়ে। রুদ্ধ দ্বারে দেবালয়ের কোণে কেন আছিস ওরে? তিনি গেছেন যেথায় মাটি ভেঙে করছে চাষা চাষ, পাথর ভেঙে কাটছে যেথায় পথ, খাটছে বারো মাস—রৌদ্রে জলে আছেন সবার সাথে, ধুলা তাঁর লেগেছে দুই হাতে।',
        ],
        paragraphsEn: [
          'Where the mind is without fear and the head is held high; where knowledge is free; where the world has not been broken up into fragments by narrow domestic walls;',
          'Where words come out from the depth of truth; where tireless striving stretches its arms towards perfection; where the clear stream of reason has not lost its way into the dreary desert sand of dead habit;',
          'Where the mind is led forward by thee into ever-widening thought and action—into that heaven of freedom, my Father, let my country awake.',
          'Leave this chanting and singing and telling of beads! Whom dost thou worship in this lonely dark corner of a temple with doors all shut? Open thine eyes and see thy God is not before thee! He is there where the tiller is tilling the hard ground and where the pathmaker is breaking stones in sun and shower.',
        ],
      },
      {
        id: 'git-ch-4',
        number: 4,
        titleBn: 'চতুর্থ পর্ব — আলো আমার, আলো ওগো, আলোয় ভুবন ভরা',
        titleEn: 'Part IV · Light, My Light, The World-Filling Light',
        durationSeconds: 330,
        durationFormatted: '05:30',
        narratorNote: 'Radiant, celebratory tone.',
        paragraphsBn: [
          'আলো আমার, আলো ওগো, আলোয় ভুবন ভরা, আলো নয়ন-ধোওয়া আমার, আলো হৃদয়-হরা। নাচে আলো নাচে ও ভাই, আমার প্রাণের কাছে—বাজে আলো বাজে ও ভাই, হৃদয়বীণার মাঝে।',
          'জাগে আকাশ, ছোটে বাতাস, হাসে সকল ধরা—আলোয় আলোকময় করে হে এলে আলোর নাথ। সোনার রোদে মেঘের পালক রঙিন হয়ে ওঠে, আর প্রতি পাতায় পাতায় ছড়ায় হিরের কণা।',
          'জগৎ জুড়ে উদার সুরে আনন্দগান বাজে, সেই সুরেরই প্লাবনে আজ আমার সকল সংশয় ধুয়ে মুছে যায়। আকাশ ও পৃথিবীর মিলনমেলায় প্রাণের উৎসব জেগেছে।',
        ],
        paragraphsEn: [
          'Light, my light, the world-filling light, the eye-kissing light, heart-sweetening light! Ah, the light dances, my darling, at the center of my life; the light strikes, my darling, the chords of my love; the sky opens, the wind runs wild, laughter passes over the earth.',
          'The butterflies spread their sails on the sea of light. Lilies and jasmines surge up on the crest of the waves of light. The light is shattered into gold on every cloud, my darling, and it scatters gems in profusion.',
          'Mirth spreads from leaf to leaf, my darling, and gladness without measure. The heaven’s river has drowned its banks and the flood of joy is abroad.',
        ],
      },
      {
        id: 'git-ch-5',
        number: 5,
        titleBn: 'পঞ্চম পর্ব — সম্মুখে শান্তিপারাবার ও শেষ নিবেদন',
        titleEn: 'Part V · The Ocean of Peace & Final Offering',
        durationSeconds: 350,
        durationFormatted: '05:50',
        narratorNote: 'Serene, transcendent conclusion.',
        paragraphsBn: [
          'যাবার দিনে এই কথাটি বলে যেন যাই—যা দেখেছি, যা পেয়েছি, তুলনা তার নাই। এই জ্যোতিসমুদ্রের মাঝে যে শতদল পদ্মটি ফুটেছে, তারই মধু পান করে আমি ধন্য হয়েছি।',
          'বিশ্বের এই নাট্যশালায় আমারও যে ডাক পড়েছিল, আমারও যে রূপ দেখার সৌভাগ্য হয়েছিল—সেই পরম বিস্ময়টিই আমার জীবনের শ্রেষ্ঠ সঞ্চয়।',
          'এখন আমার ছুটি ফুরিয়ে এসেছে। যেমন করে পাখি তার নীড় ছেড়ে নীল আকাশে ডানা মেলে দেয়, তেমনই করে আমার সমস্ত গান আজ এক অখণ্ড নীরবতার মোহানায় গিয়ে মিলিত হোক।',
        ],
        paragraphsEn: [
          'When I go from hence let this be my parting word, that what I have seen is unsurpassable. I have tasted of the hidden honey of this lotus that expands on the ocean of light, and thus am I blessed—let this be my parting word.',
          'In this playhouse of infinite forms I have had my play and here have I caught sight of him that is formless. My whole body and my limbs have thrilled with his touch who is beyond touch; and if the end comes here, let it come—let this be my parting word.',
          'In one salutation to thee, my God, let all my senses spread out and touch this world at thy feet. Like a flock of homesick cranes flying night and day back to their mountain nests, let all my life take its voyage to its eternal home in one salutation to thee.',
        ],
      },
    ],
  },
  {
    id: 'sonar-kella',
    accessionNumber: 'BG-1971-RAH-003',
    titleBn: 'সোনার কেল্লা (সম্পূর্ণ রহস্য উপন্যাস)',
    titleEn: 'Sonar Kella (The Golden Fortress · Unabridged)',
    authorBn: 'সত্যজিৎ রায়',
    authorEn: 'Satyajit Ray',
    authorLifespan: '1921–1992',
    publishedYear: 1971,
    genre: 'rahasya',
    genreLabelEn: 'Rahasya · Mystery & Sleuth',
    genreLabelBn: 'রহস্য উপন্যাস',
    sourceId: 'openlibrary-ben',
    sourceName: 'Open Library · Ananda Publishers Desh Archive',
    totalDurationFormatted: '4h 18m',
    totalDurationSeconds: 15480,
    narratorVoice: 'Fenrir',
    narratorNameBn: 'সব্যসাচী সেন (গম্ভীর নাটকীয় ব্যারিটোন)',
    narratorNameEn: 'Sabyasachi Sen · Resonant Male Baritone',
    coverMotif: 'sonar_kella',
    palette: {
      bg: '#78350F',
      ink: '#FEF3C7',
      accent: '#F59E0B',
      border: '#92400E',
    },
    synopsisEn:
      'Complete five-part mystery adventure of Feluda, Topshe, and Lalmohan Ganguly (Jatayu) across Calcutta, Jaipur, Bikaner, and the golden sandstone fortress of Jaisalmer to protect young Mukul Dhar.',
    synopsisBn:
      'কলকাতার রজনী সেন রোড থেকে জয়পুর, বিকানীর ও জয়সলমীরের মরুভূমি পর্যন্ত ফেলুদা, তোপসে ও জটায়ুর সম্পূর্ণ রুদ্ধশ্বাস রহস্য অভিযান।',
    provenance: 'First published in Desh Puja Annual (1971); Ananda Publishers, Calcutta.',
    firstEditionPress: 'Ananda Publishers, 45 Beniatola Lane, Calcutta',
    chapters: [
      {
        id: 'sk-ch-1',
        number: 1,
        titleBn: 'প্রথম অধ্যায় — রজনী সেন রোডে আগন্তুক ও জাতিস্মর বালক',
        titleEn: 'Chapter I · The Visitor at Rajani Sen Road & The Boy Who Remembered',
        durationSeconds: 380,
        durationFormatted: '06:20',
        narratorNote: 'Brisk, observant detective narrative with sharp dialogue.',
        paragraphsBn: [
          'রবিবার সকালে ২১ নম্বর রজনী সেন রোডের বৈঠকখানায় বসে ফেলুদা তার নীল খাতায় কী যেন লিখছিল, এমন সময় দরজায় কলিং বেলটা বেজে উঠল। আগন্তুক ভদ্রলোকের নাম সুধীর ধর। তাঁর ছ-বছরের ছেলে মুকুল নাকি পূর্বজন্মের কথা মনে করতে পারে।',
          'মুকুল বারবার আঁকার খাতায় উটের ছবি, ময়ূর, যুদ্ধ এবং পাহাড়ের মাথায় এক সোনার দুর্গের ছবি আঁকে। সে বলে—সেখানে অনেক দামি রত্ন পোঁতা আছে। প্যারাসাইকোলজিস্ট ডক্টর হেমাঙ্গ হাজরা মুকুলকে পরীক্ষা করে তাকে রাজস্থানে নিয়ে গেছেন।',
          'কিন্তু খবরের কাগজে জাতিস্মর বালকের গুপ্তধনের খবর বেরোতেই দুজন অচেনা সন্দেহজনক লোক মুকুলের বাড়ির চারপাশে ঘোরাঘুরি শুরু করে। এমনকি সুধীরবাবুর পাড়ার এক অন্য ছেলেকে ভুল করে অপহরণ করারও চেষ্টা হয়।',
          'ফেলুদা চারমিনার সিগারেটে একটা লম্বা টান দিয়ে বলল, "তোপসে, রাজস্থানের ম্যাপটা আর টাইমটেবিলটা বার কর তো। মুকুলের বিপদটা খুবই আসন্ন, আমাদের কালই যোধপুর রওনা হতে হচ্ছে।"',
        ],
        paragraphsEn: [
          'On Sunday morning in the sitting room of 21 Rajani Sen Road, Feluda was jotting notes in his blue leather-bound notebook when the doorbell rang. Our visitor introduced himself as Sudhir Dhar, father of six-year-old Mukul, a boy whose waking hours were haunted by vivid memories of a previous life.',
          'Day after day, Mukul sketched camels, peacocks, horsemen in battle, and a towering fortress built of golden stone crowning a desert hill. Parapsychologist Dr. Hemanga Hajra had already escorted the boy toward Rajasthan to test the authenticity of his recollections.',
          'Yet ever since a newspaper feature mentioned Mukul’s memories of buried ancestral gems, unscrupulous men had begun stalking the lane—culminating in the brazen kidnapping attempt of a neighbor’s child mistaken for Mukul.',
          'Feluda drew thoughtfully on his Charminar cigarette, his eyes gleaming with quiet resolve. "Topshe," he said, "bring out the railway timetable and the map of Rajasthan. Mukul is in grave danger, and we leave for Jodhpur tomorrow."',
        ],
      },
      {
        id: 'sk-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় অধ্যায় — ট্রেনে জটায়ুর আবির্ভাব ও মান্দার বোসের ছায়া',
        titleEn: 'Chapter II · Enter Lalmohan Ganguly (Jatayu) on the Jodhpur Mail',
        durationSeconds: 390,
        durationFormatted: '06:30',
        narratorNote: 'Warm humor mingled with mounting suspense.',
        paragraphsBn: [
          'রাজস্থানগামী ট্রেনের কামরায় আমাদের সঙ্গে আলাপ হল লালমোহন গাঙ্গুলী মশাইয়ের সঙ্গে—যাঁর ছদ্মনাম জটায়ু। তাঁর লেখা রহস্য উপন্যাস "সাহারায় শিহরণ" পড়ে ফেলুদা মৃদু হেসে উটের জলের থলি ও ভূগোলের ভুলগুলো ধরিয়ে দিতেই লালমোহনবাবু একেবারে মুগ্ধ হয়ে গেলেন।',
          'জয়পুরে পৌঁছে আমরা যখন সার্কিট হাউসে ডক্টর হাজরার খোঁজ নিলাম, দেখা গেল যে ব্যক্তি নিজেকে ডক্টর হাজরা বলে পরিচয় দিচ্ছেন তাঁর হাবভাব অত্যন্ত রহস্যজনক। আর মুকুল যেন ভয়ে কাঠ হয়ে আছে।',
          'সেই সাথে গ্লোব ট্রাভেলার্সের মালিক মান্দার বোসের সঙ্গেও আমাদের দেখা হল। ফেলুদার মগজাস্ত্র তৎক্ষণাৎ বুঝতে পারল—আসল ডক্টর হাজরাকে সরিয়ে দিয়ে ভবানী ও মান্দার বোস মুকুলকে হাতের মুঠোয় নিয়ে গুপ্তধনের খোঁজে ঘুরছে।',
        ],
        paragraphsEn: [
          'Aboard the express train hurtling toward Rajasthan, a genial gentleman in a checks wrapper climbed into our compartment—Lalmohan Ganguly, celebrated author of pulp thrillers under the nom de plume Jatayu. When Feluda gently pointed out the geographical impossibilities in his latest Sahara novel, Lalmohan-babu became our most devoted companion.',
          'Upon reaching Jaipur and tracking down the party at the Circuit House, Feluda’s sharp eyes immediately detected something amiss. The man posing as Dr. Hemanga Hajra lacked all scholarly bearing, and little Mukul seemed terrified beneath his watchful stare.',
          'Soon we also crossed paths with the suave globe-trotter Mandar Bose. Feluda’s analytical mind pieced the puzzle together: the real Dr. Hajra had been waylaid, and a pair of ruthless impostors now held Mukul captive in their hunt for the hidden treasure.',
        ],
      },
      {
        id: 'sk-ch-3',
        number: 3,
        titleBn: 'তৃতীয় অধ্যায় — বিকানীরের দুর্গ ও সম্মোহনের ফাঁদ',
        titleEn: 'Chapter III · The Fortress of Bikaner & The Hypnotist’s Trap',
        durationSeconds: 375,
        durationFormatted: '06:15',
        narratorNote: 'Tense, atmospheric investigation.',
        paragraphsBn: [
          'যোধপুর ও বিকানীরের কেল্লা দেখেও মুকুল বারবার মাথা নেড়ে বলল—"এটা আমার সোনার কেল্লা নয়।" নকল ডক্টর হাজরা ওরফে ভবানী তখন অধৈর্য হয়ে পেন্ডুলাম দুলিয়ে মুকুলকে সম্মোহন করার চেষ্টা করল।',
          'সম্মোহিত অবস্থায় মুকুলের মুখ থেকে বেরিয়ে এল মরুভূমির এক শহরের নাম—জয়সলমীর! ভবানী ও মান্দার বোস রাতারাতি মুকুলকে নিয়ে জয়সলমীরের দিকে রওনা দিল, আর আমাদের ঘরের দরজায় বাইরে থেকে তালা লাগিয়ে দিয়ে গেল।',
          'ফেলুদা অসীম সাহসে জানলার কার্নিশ বেয়ে নেমে তালা খুলে ফেলল। জটায়ুকে সঙ্গে নিয়ে আমরা জিপ ভাড়া করে মরুভূমির বুক চিরে জয়সলমীরের উদ্দেশ্যে ছুটলাম।',
        ],
        paragraphsEn: [
          'Both at Jodhpur’s Mehrangarh and the red sandstone fort of Bikaner, Mukul shook his head stubbornly: "This is not my Golden Fortress." Growing impatient, the impostor Bhavani swung a gleaming crystal pendulum before the boy’s eyes to place him under hypnosis.',
          'In his trance, Mukul murmured the name of the true desert citadel—Jaisalmer! That very night the conspirators bolted our hotel door from the outside and sped off toward the western dunes with the child.',
          'Scaling the narrow window ledge in the moonlight, Feluda freed us from the locked room. Hiring a rugged desert jeep at dawn, Feluda, Topshe, and Jatayu set off in hot pursuit across the Thar Desert.',
        ],
      },
      {
        id: 'sk-ch-4',
        number: 4,
        titleBn: 'চতুর্থ অধ্যায় — মরুভূমির পথে বিপদ ও রামদেওরা স্টেশন',
        titleEn: 'Chapter IV · Sabotage in the Desert & Night Train from Pokhran',
        durationSeconds: 400,
        durationFormatted: '06:40',
        narratorNote: 'High-stakes desert chase and train sequence.',
        paragraphsBn: [
          'মরুভূমির নির্জন রাস্তায় মান্দার বোসের কৌশলে আমাদের জিপের টায়ার পাংচার হয়ে গেল। তপ্ত বালির সমুদ্র পেরিয়ে আমরা শেষমেশ পোখরান ও রামদেওরা স্টেশনে পৌঁছে জয়সলমীরগামী রাতের ট্রেন ধরলাম।',
          'মাঝরাতে চলন্ত ট্রেনের কামরায় মান্দার বোস ছুরি হাতে ফেলুদার ওপর ঝাঁপিয়ে পড়ল। ধস্তাধস্তির মধ্যে ফেলুদার ক্ষিপ্র ঘুষিতে মান্দার বোস কাবু হলেও অন্ধকারে সে ট্রেনের চেন টেনে মরুভূমির মধ্যে লাফিয়ে পালিয়ে গেল।',
          'ভোরের আলো ফুটতেই দিগন্তের প্রান্তে দেখা দিল সূর্যের আলোয় ঝলমল করা হলুদ পাথরের সেই অপরূপ দুর্গ—জয়সলমীরের সোনার কেল্লা! কেল্লার ভেতরে ঢুকতেই আমরা শুনলাম এক অদ্ভুত খবর—আসল ডক্টর হেমাঙ্গ হাজরাও বেঁচে আছেন এবং তিনি জয়সলমীরেই পৌঁছেছেন!',
        ],
        paragraphsEn: [
          'Halfway across the desolate desert highway, shattered glass strewn deliberately by Mandar Bose punctured our jeep’s tires. Trekking across the burning sands, we reached the railway outpost just in time to board the night train to Jaisalmer.',
          'At midnight inside our rattling compartment, Mandar Bose lunged out of the shadows with a drawn blade. Feluda disarmed him with lightning reflexes, though the villain managed to leap from the slowing train into the dark scrubland.',
          'As sunrise gilded the western horizon, the honey-colored sandstone battlements of Jaisalmer rose before us like a living mirage—the true Sonar Kella! And within its gates awaited a joyous surprise: the real Dr. Hemanga Hajra had survived his fall and reached the fortress ahead of us.',
        ],
      },
      {
        id: 'sk-ch-5',
        number: 5,
        titleBn: 'পঞ্চম অধ্যায় — সোনার কেল্লায় যবনিকা পতন ও মুকুলের মুক্তি',
        titleEn: 'Chapter V · Showdown in the Golden Fortress & Mukul’s Awakening',
        durationSeconds: 410,
        durationFormatted: '06:50',
        narratorNote: 'Triumphant, satisfying detective resolution.',
        paragraphsBn: [
          'সোনার কেল্লার প্রাচীন ধ্বংসস্তূপ ও ময়ূর-ডাকা প্রাসাদের অলিগলি মুকুল চোখ বুজে চিনিয়ে দিতে লাগল। তার পূর্বজন্মের ভিটার ধ্বংসাবশেষের কাছে পৌঁছাতেই ভবানী ও মান্দার বোস রিভলভার হাতে আমাদের পথ রোধ করল।',
          'ফেলুদা শান্ত গলায় মান্দার বোসকে তার পুরানো অপরাধের কথা মনে করিয়ে দিয়ে চকিতে নিজের কোল্ট রিভলভার বার করে নিখুঁত নিশানায় ভবানীর হাতের অস্ত্র ছিটকে দিল। রাজস্থান পুলিশ এসে দুই অপরাধীকে গ্রেপ্তার করল।',
          'কেল্লার সেই প্রাচীন পাথরের কক্ষে নিজের পূর্বজন্মের স্মৃতিচিহ্ন স্পর্শ করার সাথে সাথেই মুকুলের মনের সমস্ত ভয় ও অস্বস্তি চিরতরে কেটে গেল। সে আবার এক সাধারণ, হাসিখুশি ছ-বছরের বালকে পরিণত হল।',
          'জয়সলমীরের প্রাসাদের ছাদে দাঁড়িয়ে সূর্যাস্তের সোনালি আলোয় ফেলুদা, তোপসে, জটায়ু ও ডক্টর হাজরা মরুভূমির দিগন্তের দিকে তাকিয়ে রইলেন—সোনার কেল্লার রহস্যের যবনিকা পতন ঘটল।',
        ],
        paragraphsEn: [
          'Walking through the labyrinthine cobblestone alleys of Jaisalmer Fort where wild peacocks cried from carved balconies, Mukul unerringly led the way to the ruined courtyard of his past life—where Bhavani and Mandar Bose emerged from hiding with drawn revolvers.',
          'With nerves of steel, Feluda distracted the gunmen for a fraction of a second before drawing his own Colt .32 and firing a single shot that sent Bhavani’s weapon clattering across the stone floor as the Rajasthan Police closed in.',
          'Standing at last amidst the familiar ruins of the ancient fortress, the haunting weight of past-life terror lifted from Mukul’s young mind forever, restoring him to carefree childhood.',
          'As the desert sun sank in a blaze of gold behind the ramparts of Jaisalmer, Feluda, Topshe, Jatayu, and Dr. Hajra stood together atop the battlements—bringing the chronicle of the Golden Fortress to its triumphant close.',
        ],
      },
    ],
  },
  {
    id: 'kapalkundala',
    accessionNumber: 'BG-1866-UPN-004',
    titleBn: 'কপালকুণ্ডলা (সম্পূর্ণ উপন্যাস)',
    titleEn: 'Kapalkundala (Complete Novel)',
    authorBn: 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়',
    authorEn: 'Bankim Chandra Chattopadhyay',
    authorLifespan: '1838–1894',
    publishedYear: 1866,
    genre: 'upanyas',
    genreLabelEn: 'Upanyas · Classical Romance',
    genreLabelBn: 'ধ্রুপদী উপন্যাস',
    sourceId: 'internet-archive-dli',
    sourceName: 'Digital Library of India · Kanthalpara Unabridged Archive',
    totalDurationFormatted: '4h 55m',
    totalDurationSeconds: 17700,
    narratorVoice: 'Charon',
    narratorNameBn: 'রুদ্রপ্রসাদ মিত্র (ধ্রুপদী গম্ভীর ব্যারিটোন)',
    narratorNameEn: 'Rudraprasad Mitra · Deep Classical Baritone',
    coverMotif: 'kapalkundala',
    palette: {
      bg: '#14532D',
      ink: '#F7F4EE',
      accent: '#D97706',
      border: '#166534',
    },
    synopsisEn:
      'Complete five-part edition of Bankim Chandra Chattopadhyay’s landmark 1866 romance: from the desolate dunes of Rasulpur and "Pathik, tumi ki path haraiyachha?" to Saptagram, Lutfunnisa’s intrigue, and the final tempest over the Ganges.',
    synopsisBn:
      'রসুলপুরের সমুদ্রতীর থেকে সপ্তগ্রাম ও গঙ্গার প্রবল ঝঞ্ঝা পর্যন্ত বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের অমর উপন্যাস কপালকুণ্ডলার সম্পূর্ণ পাঁচ-পর্বের শ্রুতি-সংস্করণ।',
    provenance: 'Published 1866 in Calcutta; milestone of the nineteenth-century Bengal Literary Renaissance.',
    firstEditionPress: 'J. C. Chatterjee & Co., Calcutta',
    chapters: [
      {
        id: 'kk-ch-1',
        number: 1,
        titleBn: 'প্রথম পর্ব — সমুদ্রতটে: পথিক, তুমি কি পথ হারাইয়াছ?',
        titleEn: 'Part I · On the Sea-Coast: Traveler, Have You Lost Your Way?',
        durationSeconds: 360,
        durationFormatted: '06:00',
        narratorNote: 'Majestic Sadhu-bhasha cadence with ocean-like rhythm.',
        paragraphsBn: [
          'প্রায় আড়াই শত বৎসর পূর্বে একদা মাঘ মাসের রাত্রিশেষে একখানি যাত্রীবাহী নৌকা গঙ্গাসাগর হইতে প্রত্যাগমন করিতেছিল। কুয়াশার অন্ধকারে মাঝিরা দিকভ্রান্ত হইয়া রসুলপুর নদীর মোহানায় তীরের কাছে নৌকা ভিড়াইল।',
          'নবকুমার জ্বালানি কাঠের সন্ধানে নির্জন বালুকাময় তীরে নামিয়াছিলেন; কিন্তু জোয়ার আসিয়া পড়ায় সঙ্গীরা তাঁহাকে ফেলিয়াই নৌকা ছাড়িয়া দিল। সম্মুখে কেবল ফেনিল সমুদ্র আর পশ্চাতে জনমানবহীন বনভূমি।',
          'সন্ধ্যার অন্ধকারে এক অপূর্ব রমণীমূর্তি তাঁহার সম্মুখে আসিয়া দাঁড়াইল। তাঁহার সুদীর্ঘ কুঞ্চিত কেশরাশি স্কন্ধদেশ ঢাকিয়া পড়িয়াছে। রমণী স্থির স্বরে জিজ্ঞাসা করিলেন—"পথিক, তুমি কি পথ হারাইয়াছ?"',
          'সেই স্বর শুনিয়া নবকুমারের হৃদয় কম্পিত হইল। কাপালিকের আশ্রমে পালিতা সেই বনদেবী কপালকুণ্ডলা নিঃশব্দে নবকুমারকে অনুসরণ করিবার ইঙ্গিত করিলেন।',
        ],
        paragraphsEn: [
          'Nearly two hundred and fifty years ago, at the close of a winter night in the month of Magh, a pilgrim vessel was returning from Gangasagar. Blinded by dense river fog, the boatmen lost their bearings and anchored near the desolate mouth of the Rasulpur river.',
          'Young Nabakumar stepped ashore onto the sandy dunes to gather firewood; while he wandered inland, the rising tide forced his companions to set sail without him. Before him roared the foaming Bay of Bengal; behind him lay untamed coastal forest.',
          'In the gathering twilight, a figure of unearthly grace appeared upon the ridge. Dark untamed locks cascaded over her shoulders as she fixed her tranquil eyes upon him and spoke the immortal words: "Traveler, have you lost your way?"',
          'At the sound of that voice, Nabakumar’s heart stood still. Raised in the wild sandhills by a tantric Kapalik, the maiden Kapalkundala beckoned him silently to follow her away from impending peril.',
        ],
      },
      {
        id: 'kk-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় পর্ব — কাপালিকের হাত হইতে মুক্তি ও পরিণয়',
        titleEn: 'Part II · Escape from the Sandhills & The Marriage at the Temple',
        durationSeconds: 350,
        durationFormatted: '05:50',
        narratorNote: 'Dramatic escape and tender solemnity.',
        paragraphsBn: [
          'কাপালিকের হাত হইতে নবকুমারের প্রাণ রক্ষা করিবার জন্য কপালকুণ্ডলা তাঁহাকে গোপন পথে অধিকারীর দেবমন্দিরে লইয়া গেলেন। অধিকারী কপালকুণ্ডলাকে কন্যার ন্যায় স্নেহ করিতেন।',
          'কাপালিকের ক্রোধ হইতে কন্যাকে রক্ষা করিবার একমাত্র উপায় দেখিয়া অধিকারী নবকুমারের সহিত কপালকুণ্ডলার বিবাহ সম্পন্ন করিলেন। বিবাহের পর কপালকুণ্ডলা দেবীর চরণে একটি বিল্বপত্র নিক্ষেপ করিলে উহা উল্টাইয়া পড়িল—কপালকুণ্ডলার মুখ ম্লান হইল।',
          'নবকুমার নববধূকে লইয়া স্বগ্রাম সপ্তগ্রামের পথে যাত্রা করিলেন। অরণ্য ও সমুদ্রের মুক্ত প্রকৃতিতে পালিতা কপালকুণ্ডলা গৃহস্থের ঘেরাটোপের দিকে পা বাড়াইলেন।',
        ],
        paragraphsEn: [
          'To save Nabakumar from the Kapalik’s sacrificial altar, Kapalkundala guided him through secret dune paths to the shrine of the gentle priest Adhikari, who loved her as a daughter.',
          'Knowing that she could never safely return to the sandhills, the Adhikari united Nabakumar and Kapalkundala in marriage before the goddess. Yet when Kapalkundala placed a sacred bel leaf at the deity’s feet to divine her fate, the leaf fell trembling to the floor.',
          'With a quiet, unfathomable gaze, the child of the ocean and forest set forth beside Nabakumar toward his ancestral home in Saptagram.',
        ],
      },
      {
        id: 'kk-ch-3',
        number: 3,
        titleBn: 'তৃতীয় পর্ব — মেদিনীপুরের পথে মতিবিবি (লুৎফুন্নিসা)',
        titleEn: 'Part III · Encounter on the Road to Saptagram: Motibibi (Lutfunnisa)',
        durationSeconds: 365,
        durationFormatted: '06:05',
        narratorNote: 'Regal, complex psychological drama.',
        paragraphsBn: [
          'সপ্তগ্রামে ফিরিবার পথে এক পান্থশালায় দস্যুদের হাত হইতে নবকুমার এক অভিজাত মোগল রমণীকে রক্ষা করিলেন। এই রমণী আর কেহ নহেন—নবকুমারের পূর্বপরিণীতা পত্নী পদ্মাবতী, যিনি আগ্রার রাজদরবারে লুৎফুন্নিসা বা মতিবিবি নামে পরিচিতা।',
          'পালকির ভিতর অপূর্ব রূপসী কপালকুণ্ডলাকে দেখিয়া মতিবিবির চিত্তে বিস্ময় ও ঈর্ষার উদয় হইল। তিনি নিজের বহুমূল্য রত্নহার কপালকুণ্ডলার গলায় পরাইয়া দিলেন, আর কপালকুণ্ডলাও সরল মনে কোনো দ্বিধা না করিয়াই তাহা গ্রহণ করিলেন।',
          'নবকুমারের হৃদয় পুনরায় জয় করিবার তীব্র আকাঙ্ক্ষা লইয়া মতিবিবি ছদ্মবেশে সপ্তগ্রামের উপকণ্ঠে আসিয়া বাস করিতে লাগিলেন।',
        ],
        paragraphsEn: [
          'Along the highway past Medinipur, Nabakumar rescued a noblewoman in Mughal attire from highwaymen. Unknown to Kapalkundala, this lady was Padmavati—Nabakumar’s estranged first wife, now celebrated in the imperial court of Agra as Lutfunnisa, or Motibibi.',
          'Beholding the artless, radiant beauty of Kapalkundala inside the palanquin, Motibibi was struck at once by wonder and a fierce, awakened longing. She clasped her own priceless jewel necklace around Kapalkundala’s neck.',
          'Determined to reclaim Nabakumar’s heart from the forest maiden, Lutfunnisa traveled secretly to the outskirts of Saptagram.',
        ],
      },
      {
        id: 'kk-ch-4',
        number: 4,
        titleBn: 'চতুর্থ পর্ব — সপ্তগ্রামের সংসার ও অরণ্যে অভিসার',
        titleEn: 'Part IV · Life as Mrinmayi in Saptagram & The Nocturnal Forest',
        durationSeconds: 370,
        durationFormatted: '06:10',
        narratorNote: 'Poetic introspection and rising tragic tension.',
        paragraphsBn: [
          'সপ্তগ্রামে কপালকুণ্ডলার নাম রাখা হইল মৃন্ময়ী। কিন্তু খাঁচার পাখির ন্যায় গৃহের ক্ষুদ্র গণ্ডিতে তাঁহার মুক্ত প্রাণ হাঁপাইয়া উঠিত। রাত্রিকালে তিনি একাকী নিবিড় বনে ও নদীর তীরে ভ্রমণ করিতেন।',
          'ননদিনী শ্যামাসুন্দরীর স্নেহ সত্ত্বেও মৃন্ময়ী বলিলেন—"যদি জানিতাম স্ত্রীলোকের বিবাহ দাসীত্ব, তবে কদাপি বিবাহ করিতাম না।"',
          'ইতিমধ্যে প্রতিশোধপরায়ণ কাপালিক ও লুৎফুন্নিসা মিলিত হইয়া নবকুমারের মনে সন্দেহের বিষ ছড়াইয়া দিল। ব্রাহ্মণবেশী লুৎফুন্নিসার সহিত রাত্রিকালে বনে কথা বলিতে দেখিয়া নবকুমার কপালকুণ্ডলাকে ভুল বুঝিলেন।',
        ],
        paragraphsEn: [
          'In the household of Saptagram they renamed her Mrinmayi. Yet like a sea-bird confined within a gilded cage, her free spirit yearned for the open sky and nocturnal woods.',
          'To her affectionate sister-in-law Shyamasundari she confessed with disarming candor: "Had I known that marriage for a woman meant the surrender of the open forest and sky, I would never have wed."',
          'Meanwhile, the vengeful Kapalik arrived in Saptagram and forged an alliance with Lutfunnisa. Seeing Kapalkundala walk into the midnight woods to meet a figure disguised in Brahmin robes, Nabakumar’s heart was poisoned by tragic misunderstanding.',
        ],
      },
      {
        id: 'kk-ch-5',
        number: 5,
        titleBn: 'পঞ্চম পর্ব — গঙ্গার তীরে প্রলয়ঝঞ্ঝা ও মহাপ্রস্থান',
        titleEn: 'Part V · The Tempest on the Bank of the Bhagirathi',
        durationSeconds: 380,
        durationFormatted: '06:20',
        narratorNote: 'Sublime, tragic crescendo over the roaring river.',
        paragraphsBn: [
          'বৈশাখ মাসের এক মেঘাচ্ছন্ন সন্ধ্যায় গঙ্গাতীরের শ্মশানে প্রবল ঝঞ্ঝা ও কালবৈশাখী নামিয়া আসিল। গঙ্গার উন্মত্ত তরঙ্গমালা তীরের উচ্চ মৃত্তিকাস্তূপ ভাঙিয়া ফেলিতেছিল।',
          'নবকুমার কাতর স্বরে কপালকুণ্ডলাকে জিজ্ঞাসা করিলেন—"মৃন্ময়ী, আমাকে সত্য বলো, তুমি নিষ্কলুষ?" কপালকুণ্ডলা শান্ত স্বরে প্রকৃত সত্য খুলিয়া বলিলেন—তিনি কেবল পরোপকারার্থেই বনে গিয়াছিলেন, কিন্তু ভৈরবী তাঁহাকে আত্মবিসর্জনের আদেশ দিয়াছেন।',
          'নবকুমার অনুতপ্ত হইয়া তাঁহার হাত ধরিতে গেলেন, কিন্তু সহসা গঙ্গার প্রবল জলোচ্ছ্বাসে তীরের মাটি ধসিয়া পড়িল। কপালকুণ্ডলা তরঙ্গমধ্যে মিলাইয়া গেলেন, আর নবকুমারও "মৃন্ময়ী!" বলিয়া সেই অনন্ত জলরাশিতে ঝাঁপ দিলেন।',
        ],
        paragraphsEn: [
          'On a storm-darkened evening in Baishakh, a mighty tempest swept across the crematorium ghat beside the roaring Bhagirathi river. Towering waves battered the high earthen cliff.',
          'Weeping in anguish, Nabakumar implored her: "Mrinmayi, tell me but one word that you are blameless, and I shall carry you home upon my breast!" Tranquil amidst the howling gale, Kapalkundala revealed the whole truth of her innocence, yet bowed to the call of destiny.',
          'Before Nabakumar could clasp her hand, a giant surge of the river undermined the cliff beneath her feet. As Kapalkundala vanished into the swirling waters of the Ganges, Nabakumar cried out her name and leaped after her into the eternal current.',
        ],
      },
    ],
  },
  {
    id: 'sultanas-dream',
    accessionNumber: 'BG-1905-RAH-005',
    titleBn: 'সুলতানার স্বপ্ন ও পদ্মরাগ (পূর্ণাঙ্গ সংস্করণ)',
    titleEn: "Sultana's Dream & Padmarag (Complete Edition)",
    authorBn: 'বেগম রোকেয়া সাখাওয়াত হোসেন',
    authorEn: 'Begum Rokeya Sakhawat Hossain',
    authorLifespan: '1880–1932',
    publishedYear: 1905,
    genre: 'rahasya',
    genreLabelEn: 'Kalpabigyan · Feminist Sci-Fi',
    genreLabelBn: 'কল্পবিজ্ঞান ও সমাজচিন্তা',
    sourceId: 'gutendex-sa',
    sourceName: 'Project Gutenberg & Bengal Women’s Archive',
    totalDurationFormatted: '2h 50m',
    totalDurationSeconds: 10200,
    narratorVoice: 'Orus',
    narratorNameBn: 'অনির্বাণ চট্টোপাধ্যায় (শান্ত ও স্নিগ্ধ ব্যারিটোন)',
    narratorNameEn: 'Anirban Chattopadhyay · Warm Soothing Baritone',
    coverMotif: 'sultanas_dream',
    palette: {
      bg: '#312E81',
      ink: '#F8FAFC',
      accent: '#38BDF8',
      border: '#4338CA',
    },
    synopsisEn:
      'Complete five-chapter edition of Begum Rokeya’s pioneering 1905 feminist science-fiction utopia: walking through the gardens of Ladyland, visiting the solar and cloud-condensing universities, the bloodless victory of solar science, and the interview with the Queen.',
    synopsisBn:
      'সুলতানার স্বপ্নের সম্পূর্ণ পাঁচটি অধ্যায়—নারীস্থানে প্রবেশ, সৌরশক্তি ও মেঘ-নিয়ন্ত্রণ বিশ্ববিদ্যালয়, রক্তপাতহীন বিজয় এবং মহারানীর সাথে সাক্ষাৎ।',
    provenance: 'First published in The Indian Ladies’ Magazine, Madras (1905), and expanded in Bengali editions in Calcutta.',
    firstEditionPress: 'Sakhawat Memorial Press, Calcutta',
    chapters: [
      {
        id: 'sd-ch-1',
        number: 1,
        titleBn: 'প্রথম অধ্যায় — জাগরণ ও ভগিনী সারার সাথে নারীস্থানে প্রবেশ',
        titleEn: 'Chapter I · Awakening & Entering the Gardens of Ladyland',
        durationSeconds: 310,
        durationFormatted: '05:10',
        narratorNote: 'Lucid, visionary, and gently ironic tone.',
        paragraphsBn: [
          'একদিন সন্ধ্যায় আয়েশ করিয়া ইজিচেয়ারে বসিয়া আমি ভারতের নারীসমাজের অবস্থা সম্পর্কে ভাবিতেছিলাম। কখন যে নিদ্রা আসিল জানি না, হঠাৎ দেখিলাম আকাশে উজ্জ্বল চাঁদের আলো আর আমার পাশে দাঁড়াইয়া আছেন ভগিনী সারা।',
          'সারা আমাকে হাত ধরিয়া বাহিরে লইয়া গেলেন। পথঘাট নরম ঘাস ও পুষ্পোদ্যানে ঢাকা, যেন সারা শহরটাই এক সুসজ্জিত বাগান। আমি অবাক হইয়া দেখিলাম পথে কোনো পুরুষ মানুষ নাই, কেবল হাস্যমুখী নারীরা স্বাধীনভাবে চলাফেরা করিতেছেন।',
          'ভগিনী সারা হাসিয়া বলিলেন, "আপনি এই দেশকে নারীস্থান বা লেডিল্যান্ড বলিতে পারেন। এখানে পুণ্য ও সত্যেরই রাজত্ব চলে, এবং পুরুষদের আমরা অন্তঃপুরে বা মর্দানায় নিরাপদে রাখিয়াছি।"',
        ],
        paragraphsEn: [
          'One evening I was lounging in an easy chair in my bedroom and thinking lazily of the condition of Indian womanhood. Before I knew whether I was awake or dreaming, the moonlit sky opened and Sister Sara stood smiling beside me.',
          'She took me by the hand and led me out into streets carpeted with soft moss and flowering shrubs, as though the entire city were a botanical garden. Every passerby was a woman walking with cheerful confidence.',
          'Sister Sara laughed gently at my shyness. "You are now in Ladyland," she explained, "where virtue herself reigns, and where the turbulent menfolk have been safely secluded indoors in the Mardana while women govern the commonwealth through science."',
        ],
      },
      {
        id: 'sd-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় অধ্যায় — মর্দানার ইতিহাস ও দুই মহান বিশ্ববিদ্যালয়',
        titleEn: 'Chapter II · How Men Entered the Mardana & The Two Universities',
        durationSeconds: 320,
        durationFormatted: '05:20',
        narratorNote: 'Crisp, witty philosophical dialogue.',
        paragraphsBn: [
          'আমি জিজ্ঞাসা করিলাম—"শক্তিশালী পুরুষেরা কীভাবে আপনাদের আধিপত্য মানিয়া লইল?" ভগিনী সারা উত্তর দিলেন, "হাতির শরীর বিরাট হইলেও মানুষ যেমন বুদ্ধির জোরে তাহাকে বশ করে, তেমনই মস্তিষ্কের শক্তির কাছে পেশিশক্তি পরাজিত হইয়াছে।"',
          'অতীতে যখন পুরুষরা সামরিক অস্ত্র তৈরিতে ব্যস্ত ছিল, তখন নারীস্থানের দুই মহান বিশ্ববিদ্যালয়ের বিজ্ঞানীরা প্রকৃতির রহস্য উদ্ঘাটনে ব্রতী হইয়াছিলেন।',
          'একটি বিশ্ববিদ্যালয় আবিষ্কার করিল মেঘ হইতে সরাসরি জল সংগ্রহের "ওয়াটার-বেলুন", আর অপর বিশ্ববিদ্যালয় আবিষ্কার করিল সূর্যরশ্মি একত্রিত করিয়া অসীম তাপ ও শক্তি উৎপাদনের যন্ত্র।',
        ],
        paragraphsEn: [
          'When I asked how men of greater physical strength had ever consented to such an arrangement, Sister Sara replied, "An elephant is far larger and stronger than a man, yet intellect masters brute force. In Ladyland, brain power triumphed over muscle."',
          'Decades earlier, while men busied themselves with military drills, the women scholars of the nation’s two great universities devoted their laboratories to mastering the forces of nature.',
          'One university invented captive sky-balloons connected with pipes to draw pure water directly from the atmosphere above the clouds, stopping droughts and storms alike; the second university perfected instruments to concentrate solar rays into limitless clean energy.',
        ],
      },
      {
        id: 'sd-ch-3',
        number: 3,
        titleBn: 'তৃতীয় অধ্যায় — সৌরশক্তির বিজয় ও রক্তপাতহীন সংগ্রাম',
        titleEn: 'Chapter III · The Bloodless Victory of Solar Concentrators',
        durationSeconds: 330,
        durationFormatted: '05:30',
        narratorNote: 'Dramatic scientific triumph.',
        paragraphsBn: [
          'একদা প্রতিবেশী দেশের রাজা আমাদের দেশ আক্রমণ করিলে পুরুষ সৈন্যরা যুদ্ধে পরাজিত হইয়া ফিরিয়া আসিল। তখন মহারানীর আহ্বানে বিশ্ববিদ্যালয়ের অধ্যক্ষা ও ছাত্রীরা দেশরক্ষার ভার গ্রহণ করিলেন।',
          'যুদ্ধক্ষেত্রে একটিও গুলি বা তলোয়ার ব্যবহার করা হইল না। বিজ্ঞানীরা সূর্যকিরণ ও উত্তাপ প্রতিফলিত করিবার যন্ত্রগুলো শত্রুসেনার দিকে ফিরাইয়া দিলেন। প্রচণ্ড তাপে শত্রুপক্ষের কামান-বন্দুক অকেজো হইয়া গেল এবং তাহারা অস্ত্র ফেলিয়া পলায়ন করিল।',
          'সেই দিন হইতেই নারীস্থানে কোনো যুদ্ধ বা রক্তপাত নাই, কোনো পুলিশ বা কারাগারেরও প্রয়োজন হয় না।',
        ],
        paragraphsEn: [
          'When a neighboring kingdom marched against our borders and the male generals retreated in defeat, the Lady Principal of the second university stepped forward at the Queen’s call.',
          'Not a single bullet was fired nor a drop of blood shed. Positioning giant solar reflectors along the ridge, the women scientists directed concentrated beams of heat and light toward the invading army until they fled across the frontier leaving their artillery behind.',
          'Since that bloodless victory, no foreign power has dared invade Ladyland, and neither prisons nor magistrates are needed within its borders.',
        ],
      },
      {
        id: 'sd-ch-4',
        number: 4,
        titleBn: 'চতুর্থ অধ্যায় — সৌর রন্ধনশালা ও বৈদ্যুতিক কৃষি',
        titleEn: 'Chapter IV · Solar Kitchens, Two-Hour Workdays & Electric Ploughs',
        durationSeconds: 315,
        durationFormatted: '05:15',
        narratorNote: 'Bright, descriptive tour of sustainable technology.',
        paragraphsBn: [
          'ভগিনী সারা আমাকে তাঁহার রন্ধনশালা দেখাইলেন। সেখানে কয়লা, কাঠ বা ধোঁয়ার কোনো চিহ্ন নাই—লতাপাতা ও ফুলে ঘেরা পরিচ্ছন্ন কক্ষে সৌরশক্তির নলের সাহায্যে নিমেষে সুস্বাদু আহার প্রস্তুত হইতেছে।',
          'সারাদিনে কেবল দুই ঘণ্টা কাজ করিলেই সমস্ত দাপ্তরিক ও বৈজ্ঞানিক কাজ শেষ হইয়া যায়, কারণ কেহই অযথা গল্পগুজবে বা ধূমপানে সময় নষ্ট করে না।',
          'মাঠের কৃষিকাজও সম্পন্ন হয় বিদ্যুতের সাহায্যে। ঝড়-বৃষ্টি বা বন্যার ভয় নাই, কারণ আকাশের মেঘও বিজ্ঞানীদের নিয়ন্ত্রণে।',
        ],
        paragraphsEn: [
          'Inside Sister Sara’s kitchen I marveled at the absence of soot, smoke, or coal fires; bright brass conduits channeled concentrated solar heat to cook meals amidst trellises of climbing flowers.',
          'Because laboratories and offices operated with scientific precision free from idle gossip, two hours of daily labor sufficed for every citizen, leaving the remaining hours for art, botany, and philosophy.',
          'Across the countryside, fields were tilled by electricity while atmospheric balloons regulated rainfall so neither flood nor famine ever touched the land.',
        ],
      },
      {
        id: 'sd-ch-5',
        number: 5,
        titleBn: 'পঞ্চম অধ্যায় — উড়ন্ত বায়ুযান ও মহারানীর দরবার',
        titleEn: 'Chapter V · The Hydrogen Air-Car & Audience with the Queen',
        durationSeconds: 340,
        durationFormatted: '05:40',
        narratorNote: 'Soaring conclusion.',
        paragraphsBn: [
          'অতঃপর ভগিনী সারা তাঁহার "এয়ার-কার" বা উড়ন্ত বায়ুযানটি প্রস্তুত করিলেন। দুটি হাইড্রোজেন গোলক ও পাখার সাহায্যে যানটি নিঃশব্দে আকাশে ডানা মেলিল। মেঘের উপর দিয়া আমরা রাজপ্রাসাদে গিয়া নামিলাম।',
          'নারীস্থানের মহারানী তাঁর চার বছরের কন্যাকে লইয়া বাগানে ভ্রমণ করিতেছিলেন। তিনি সাদরে আমাকে অভ্যর্থনা জানাইয়া বলিলেন—"আমরা অন্যের ভূমি কাড়িয়া লইতে চাহি না, এমনকি কোহিনূর হীরার চাইতেও আমরা জ্ঞান ও সত্যের রত্নকেই অধিক মূল্য দিই।"',
          'মহারানীর প্রাসাদ ও বিশ্ববিদ্যালয় পরিদর্শন করিয়া আবার বায়ুযানে উঠিতেই হঠাৎ আমার তন্দ্রা ভাঙিয়া গেল—দেখিলাম আমি আমার সেই ইজিচেয়ারেই বসিয়া আছি, কিন্তু হৃদয়ে জাগিয়া রহিল এক মুক্ত ভবিষ্যতের স্বপ্ন।',
        ],
        paragraphsEn: [
          'Mounting Sister Sara’s hydrogen-buoyed air-car, we rose smoothly above the treetops as twin propellers carried us through the clear morning sky toward the royal conservatory.',
          'The Queen of Ladyland received us cordially beside her young daughter, declaring: "We do not covet a single inch of foreign soil nor the Koh-i-Noor diamond; our sole ambition is to dive ever deeper into the ocean of knowledge that nature holds across the universe."',
          'As I stepped back aboard the air-car at the close of our tour, the craft tilted slightly and I awoke with a start in my easy chair—carrying forever in my heart the luminous vision of Ladyland.',
        ],
      },
    ],
  },
  {
    id: 'abol-tabol',
    accessionNumber: 'BG-1923-SHI-006',
    titleBn: 'আবোল তাবোল (সম্পূর্ণ ছড়া সংকলন)',
    titleEn: 'Abol Tabol (Complete Literary Nonsense)',
    authorBn: 'সুকুমার রায়',
    authorEn: 'Sukumar Ray',
    authorLifespan: '1887–1923',
    publishedYear: 1923,
    genre: 'shishu',
    genreLabelEn: 'Shishu · Literary Nonsense',
    genreLabelBn: 'ছড়া ও শিশুসাহিত্য',
    sourceId: 'wikisource-bn',
    sourceName: 'U. Ray & Sons Press · Centenary Unabridged Archive',
    totalDurationFormatted: '1h 45m',
    totalDurationSeconds: 6300,
    narratorVoice: 'Charon',
    narratorNameBn: 'পরান বন্দ্যোপাধ্যায় (উষ্ণ ব্যারিটোন ছন্দ)',
    narratorNameEn: 'Paran Bandyopadhyay · Warm Storyteller Baritone',
    coverMotif: 'abol_tabol',
    palette: {
      bg: '#9A3412',
      ink: '#FFFBEB',
      accent: '#FBBF24',
      border: '#B45309',
    },
    synopsisEn:
      'Complete five-part collection of Sukumar Ray’s immortal nonsense verse: Khichuri, Baburam Sapure, Satpatra, Kumropatash, Ramgarurer Chhana, and the dreamlike epilogue of Abol Tabol.',
    synopsisBn:
      'খিচুড়ি, বাবুরাম সাপুড়ে, সৎপাত্র, কুমড়োপটাশ, রামগরুড়ের ছানা এবং আবোল তাবোলের শেষ স্বপ্ন—পাঁচটি পূর্ণাঙ্গ পর্বে সুকুমার রায়ের অমর সৃষ্টি।',
    provenance: 'Published September 1923 by U. Ray & Sons, 100 Garpar Road, Calcutta.',
    firstEditionPress: 'U. Ray & Sons, Garpar Road, Calcutta',
    chapters: [
      {
        id: 'at-ch-1',
        number: 1,
        titleBn: 'প্রথম পর্ব — আবোল তাবোল ও খিচুড়ি',
        titleEn: 'Part I · Abol Tabol Invocation & Khichuri (Hotch-Potch)',
        durationSeconds: 300,
        durationFormatted: '05:00',
        narratorNote: 'Playful, buoyant meter with crisp consonantal rhythm.',
        paragraphsBn: [
          'মেঘ মুলুকের ঝাপসা রাতে, রামধনুকের আবছা ছাতে, তালবেতালে খেয়াল সুরে, তান ধরেছি কণ্ঠ পুরে। হেথায় নিষেধ নাইরে দাদা, নাইরে বাঁধন নাইরে বাঁধা—যা খুশি তাই বলুক লোকে, আবোল তাবোল চলছে ঝোঁকে!',
          'হাঁস ছিল, সজারু, (ব্যাকরণ মানি না), হয়ে গেল "হাঁসজারু" কেমনে তা জানি না! বক কহে কচ্ছপে—"বাহবা কি ফুর্তি! অতি খাসা আমাদের বকচ্ছপ মূর্তি!"',
          'টিয়াটুকু চড়ে বসে হাতিটার কান-এ, হাতিমিটা তাল দেয় তবলার তানে। মোরগের আরামটি ভেঙে দিল কে রে? গিরগিটিয়া ডাকে তারে ছাগলমুখো ভেড়ে!',
        ],
        paragraphsEn: [
          'In the misty realm of cloud-land, beneath the rainbow’s arch, we sing out of tune and out of measure at the top of our lungs! Here there are no rules or fetters—let the solemn scholars say what they will as Abol Tabol marches on!',
          'A duck once met a porcupine; disregarding rules of grammar, they fused into a Duck-cupine before anyone knew how! The heron cried to the tortoise, "What splendid merriment is our new Hertoise form!"',
          'While the parakeet perched atop the whale-ephant’s ear and the lion-deer bounded across the glade, every creature in nature rejoiced in topsy-turvy harmony.',
        ],
      },
      {
        id: 'at-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় পর্ব — বাবুরাম সাপুড়ে ও সৎপাত্র',
        titleEn: 'Part II · Baburam the Snake Charmer & The Eligible Groom (Satpatra)',
        durationSeconds: 310,
        durationFormatted: '05:10',
        narratorNote: 'Satirical, witty theatrical cadence.',
        paragraphsBn: [
          'বাবুরাম সাপুড়ে, কোথা যাস বাপুরে? আয় বাবা দেখে যা, দুটো সাপ রেখে যা! যে সাপের চোখ নেই, শিং নেই, নখ নেই, ছোটে না কি হাঁটে না, কাউকে যে কাটে না—সেই সাপ জ্যান্ত গোটা দুই আন তো!',
          'শুনতে পেলাম পোস্তা গিয়ে—তোমার নাকি মেয়ের বিয়ে? গঙ্গারামকে পাত্র পেলে? জানতে চাও সে কেমন ছেলে? মন্দ নয়, সে পাত্র ভালো—রঙ যদিও বেজায় কালো; তার ওপরের মুখের গঠন অনেকটা ঠিক প্যাঁচার মতন।',
          'বিদ্যেবোঝাই বাবুমশাই চড়ছেন নৌকায়, উনিশটি বার পরীক্ষাতে ফেল করেছেন তবু তাঁর জ্ঞানের গর্ব কম নয়—গঙ্গারাম তো পাত্র খাসা!',
        ],
        paragraphsEn: [
          'O Baburam the snake-charmer, where do you hurry so fast? Come leave me two gentle serpents that have neither fangs nor claws, that neither hiss nor bite nor slither out of their basket, and subsist solely on milk and mashed rice!',
          'Down in Posta market I heard the news—you have arranged your daughter’s wedding to Gangaram! You ask what sort of youth he is? Why, he is an exemplary match, even if his countenance closely resembles a solemn barn owl!',
          'Though he failed his school examinations nineteen times running and his brothers languish in debtors’ court, his lineage goes back to King Kansaraj—surely no finer bridegroom walks the streets of Calcutta!',
        ],
      },
      {
        id: 'at-ch-3',
        number: 3,
        titleBn: 'তৃতীয় পর্ব — কুমড়োপটাশ ও হুঁকোমুখো হ্যাংলা',
        titleEn: 'Part III · The Kumropatash & Huko-Mukho Hangla',
        durationSeconds: 305,
        durationFormatted: '05:05',
        narratorNote: 'Comical mock-serious urgency.',
        paragraphsBn: [
          'যদি কুমড়োপটাশ নাচে—খবরদার এসো না কেউ আস্তাবলের কাছে; চাইবে নাকো ডাইনে বাঁয়ে, চাইবে নাকো পাছে; চার পা তুলে থাকবে ঝুলে হত্তমুলার গাছে!',
          'যদি কুমড়োপটাশ কাঁদে—খবরদার! বসো না কেউ ছাদে; উবু হয়ে শুয়ে পড়বে কম্বলেরই ফাঁদে, রাধাকৃষ্ণ নাম জপবে ডাকাত-কালীর নামে!',
          'হুঁকোমুখো হ্যাংলা, বাড়ি তার বাংলা, মুখে তার হাসি নাই দেখেছ? দুটি লেজ থাকা সত্ত্বেও সে কোন দিকে মাছি তাড়াবে ভেবে ভেবে সারাদিন কেবল মনমরা হয়ে বসে থাকে!',
        ],
        paragraphsEn: [
          'If ever the Pumpkin-Puff begins to dance—beware! Do not come near the stable yard, look neither right nor left, but hang by all fours from the topmost branch of the radish tree!',
          'And if the Pumpkin-Puff begins to weep—take heed! Lie flat beneath a heavy blanket and chant incantations until the sky clears!',
          'Meanwhile in rural Bengal sits the Hookah-Faced Hangla with two tails: possessed of double the means to swat flies, he remains perpetually gloomy because he can never decide which tail to swing first!',
        ],
      },
      {
        id: 'at-ch-4',
        number: 4,
        titleBn: 'চতুর্থ পর্ব — রামগরুড়ের ছানা ও গোঁফ চুরি',
        titleEn: 'Part IV · The Offspring of Ramgarur & The Stolen Mustache',
        durationSeconds: 320,
        durationFormatted: '05:20',
        narratorNote: 'Hilarious dramatic crescendo.',
        paragraphsBn: [
          'রামগরুড়ের ছানা হাসতে তাদের মানা, হাসির কথা শুনলে বলে, "হাসব না-না, না-না!" সদাই মরে ত্রাসে—ঐ বুঝি কেউ হাসে! এক চোখে তাই মিটমিটিয়ে তাকায় আশেপাশে।',
          'হেড অফিসের বড়বাবু লোকটি বড় শান্ত, তার যে এমন মাথার ব্যামো কেউ কখনো জানত? দিব্যি ছিলেন খোশমেজাজে চেয়ারখানি চেপে, হঠাৎ কীসব ছাইপাঁশ ভেবে উঠলেন ক্ষেপে—"আমার গোঁফটা চুরি গেছে!"',
          'গোঁফকে বলে তোমার আমার—গোঁফ কি কারো কেনা? গোঁফের আমি গোঁফের তুমি, তাই দিয়ে যায় চেনা!',
        ],
        paragraphsEn: [
          'The offspring of the Ramgarur are strictly forbidden to laugh! Whenever a jest is uttered, they shudder in terror and whisper, "No, no, we must never smile!" dwelling in dark burrows where neither breeze nor merriment enters.',
          'The Chief Clerk of the Head Office was the mildest of gentlemen—until one afternoon he leaped from his armchair in a frenzy crying that someone had stolen his prized mustache while he dozed!',
          '"Do you think a mustache is mere private property?" he thundered at his trembling staff. "We do not own the mustache—the mustache owns us, and by our whiskers alone is a gentleman known!"',
        ],
      },
      {
        id: 'at-ch-5',
        number: 5,
        titleBn: 'পঞ্চম পর্ব — কাঠবুড়ো ও মেঘের দেশে স্বপ্নসমাপ্তি',
        titleEn: 'Part V · The Wood-Old Man & Farewell Dream Song',
        durationSeconds: 300,
        durationFormatted: '05:00',
        narratorNote: 'Gentle, wistful closing cadence.',
        paragraphsBn: [
          'রোদে রাঙা ইটের পাঁজা তারই পরে বসল রাজা—ঠোঙা ভরা বাদাম ভাজা খাচ্ছে কিন্তু গিলছে না। গায়ে আঁটা গরম জামা পুড়ে পিঠ হচ্ছে ঝামা, রাজা বলে, "বৃষ্টি নামা—নইলে কিচ্ছু মিলছে না!"',
          'আদিম কালের চাঁদিম হিম, তোড়ায় বাঁধা ঘোড়ার ডিম! ঘনিয়ে এল ঘুমের ঘোর, গানের পালা সাঙ্গ মোর।',
        ],
        paragraphsEn: [
          'Atop a stack of sun-baked bricks sits the eccentric King munching roasted peanuts in a heavy woolen coat, commanding the clouds to bring rain before he swallows a single bite!',
          'Ancient frost of primeval moons, a bundle of mares’ nests tied with string—drowsiness gathers across the eyelids now, and my carnival of nonsense songs comes softly to its close.',
        ],
      },
    ],
  },
  {
    id: 'bidrohi-agnibina',
    accessionNumber: 'BG-1922-KAB-007',
    titleBn: 'অগ্নিবীণা ও বিদ্রোহী (সম্পূর্ণ কাব্যগ্রন্থ)',
    titleEn: 'Agnibina (The Fiery Lute · Complete)',
    authorBn: 'কাজী নজরুল ইসলাম',
    authorEn: 'Kazi Nazrul Islam',
    authorLifespan: '1899–1976',
    publishedYear: 1922,
    genre: 'kabita',
    genreLabelEn: 'Kabita · Revolutionary Poetry',
    genreLabelBn: 'বিদ্রোহী ও সাম্যের কবিতা',
    sourceId: 'openlibrary-ben',
    sourceName: 'Open Library · Arya Publishing House Calcutta',
    totalDurationFormatted: '2h 30m',
    totalDurationSeconds: 9000,
    narratorVoice: 'Fenrir',
    narratorNameBn: 'কাজী আরিফ (গভীর ওজস্বী ব্যারিটোন)',
    narratorNameEn: 'Kazi Arif · Deep Resonant Bass-Baritone',
    coverMotif: 'bidrohi',
    palette: {
      bg: '#7F1D1D',
      ink: '#FEF2F2',
      accent: '#F59E0B',
      border: '#991B1B',
    },
    synopsisEn:
      'Complete five-part declamation of Kazi Nazrul Islam’s Agnibina and Samyabadi: Pratham Khando (Pralayollas), Bidrohi (The Rebel), Dhumketu, Kandari Hushiar, and Manush (The Song of Equality).',
    synopsisBn:
      'প্রলয়োল্লাস, বিদ্রোহী, ধূমকেতু, কাণ্ডারী হুঁশিয়ার এবং সাম্যের গান "মানুষ"—পাঁচটি পূর্ণাঙ্গ পর্বে কাজী নজরুল ইসলামের অগ্নিঝরা কবিতাসমগ্র।',
    provenance: 'Published Kartik 1329 BS (October 1922), Calcutta; cover design by Abanindranath Tagore.',
    firstEditionPress: 'Arya Publishing House, College Street, Calcutta',
    chapters: [
      {
        id: 'ab-ch-1',
        number: 1,
        titleBn: 'প্রথম পর্ব — প্রলয়োল্লাস: তোরা সব জয়ধ্বনি কর',
        titleEn: 'Part I · Pralayollas: Raise the Cry of Victory',
        durationSeconds: 320,
        durationFormatted: '05:20',
        narratorNote: 'Thunderous, rhythmic opening invocation.',
        paragraphsBn: [
          'তোরা সব জয়ধ্বনি কর! তোরা সব জয়ধ্বনি কর!! ঐ নূতনের কেতন ওড়ে কালবোশেখীর ঝড়! তোরা সব জয়ধ্বনি কর! আসচে এবার অনাগত প্রলয়-নেশার নৃত্য-পাগল, সিন্ধু-পারের সিংহ-দ্বারে ধমক হেনে ভাঙল আগল!',
          'মৃত্যু-গহন অন্ধকূপে মহাকালের চণ্ড-রূপে ধূম্র-ধূপে বজ্র-শিখার মশাল জ্বেলে আসছে ভয়ঙ্কর! ওরে ওই হাসছে ভয়ঙ্কর! তোরা সব জয়ধ্বনি কর!',
          'ভেঙে আবার গড়তে জানে সে চির-সুন্দর! কাল-ভয়ঙ্করের বেশে এবার ওই আসে সুন্দর!',
        ],
        paragraphsEn: [
          'Raise the cry of victory, all of you—raise the cry of victory! Like a nor’wester tempest flies the banner of the New Age! Across the ocean gates the iron bolts are shattered as the whirlwind of renewal approaches!',
          'Through the dark abyss of stagnation, bearing a torch of lightning flames, comes the Awakener! Do not tremble before the storm—for out of the ashes of the old world, the Eternal Beautiful builds the dawn anew!',
          'Dressed in the terrible majesty of Time, behold the Beautiful arrives—raise the cry of victory!',
        ],
      },
      {
        id: 'ab-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় পর্ব — বিদ্রোহী: বল বীর, চির-উন্নত মম শির',
        titleEn: 'Part II · Bidrohi (The Rebel): Proclaim, O Hero, My Head Is Ever High',
        durationSeconds: 360,
        durationFormatted: '06:00',
        narratorNote: 'Powerful, percussive cadence with soaring dynamics.',
        paragraphsBn: [
          'বল বীর—বল উন্নত মম শির! শির নেহারি আমারি নতশির ওই শিখর হিমাদ্রির! বল বীর—বল মহাবিশ্বের মহাকাশ ফাড়ি চন্দ্র সূর্য গ্রহ তারা ছাড়ি ভূলোক দ্যুলোক গোলক ভেদিয়া খোদার আসন "আরশ" ছেদিয়া উঠিয়াছি চির-বিস্ময় আমি বিশ্ববিধাতৃর!',
          'আমি চিরদুরন্ত দুর্মদ, আমি দুর্দম, মম প্রাণের পেয়ালা হর্দম হ্যাঁয় হর্দম ভরপুর মদ। আমি সাইক্লোন, আমি ধ্বংস, আমি মহাভয়, আমি অভিশাপ পৃথ্বীর! আবার আমিই রাখালের বাঁশির সুর ও প্রিয়ার চকিত চাহনি।',
          'মহা-বিদ্রোহী রণ-ক্লান্ত আমি সেই দিন হব শান্ত, যবে উৎপীড়িতের ক্রন্দন-রোল আকাশে বাতাসে ধ্বনিবে না, অত্যাচারীর খড়্গ কৃপাণ ভীম রণ-ভূমে রণিবে না—বিদ্রোহী রণ-ক্লান্ত আমি সেই দিন হব শান্ত!',
        ],
        paragraphsEn: [
          'Proclaim, O hero—proclaim that my head is ever held high! Looking upon my brow, the mighty peaks of the Himalayas bow their crests in awe! Tearing through the firmament of the cosmos, surpassing moon, sun, planets, and constellations, I rise as the eternal wonder of creation!',
          'I am the untamed cyclone and the gentle flute of the shepherd on the riverbank; I am the song that shatters iron chains, and the unspoken sorrow gathered in the hearts of the dispossessed.',
          'Weary of battle, I, the Great Rebel, shall rest only on that day when the cry of the oppressed no longer echoes through sky and wind, and the tyrant’s sword no longer clashes upon the field of war!',
        ],
      },
      {
        id: 'ab-ch-3',
        number: 3,
        titleBn: 'তৃতীয় পর্ব — ধূমকেতু ও আগমনী',
        titleEn: 'Part III · Dhumketu (The Blazing Comet) & Agamani',
        durationSeconds: 310,
        durationFormatted: '05:10',
        narratorNote: 'Fiery, prophetic intensity.',
        paragraphsBn: [
          'আমি যুগে যুগে আসি, আসিয়াছি পুনঃ মহাবিপ্লব হেতু—এই স্রষ্টার শনি মহাকাল ধূমকেতু! অন্ধকারের বুক চিরে আমি আলোর পুচ্ছ ছড়িয়ে ছুটে চলি।',
          'যেখানে ভণ্ডামি ও অবিচার মানুষের কণ্ঠ রোধ করে, সেখানেই আমার অগ্নিবীণার ঝংকার বেজে ওঠে। ভয়ের শৃঙ্খল ভেঙে জাগো রে তরুণ দল!',
        ],
        paragraphsEn: [
          'From age to age I return, and I have returned once more to herald the great awakening—I am the blazing Comet of Time! Across the dark firmament I trail my tail of fire to sweep away falsehood and fear.',
          'Wherever hypocrisy and injustice silence the human voice, the chords of my Fiery Lute ring out to summon the youth to fearless liberty.',
        ],
      },
      {
        id: 'ab-ch-4',
        number: 4,
        titleBn: 'চতুর্থ পর্ব — কাণ্ডারী হুঁশিয়ার',
        titleEn: 'Part IV · Kandari Hushiar (Helmsman, Beware!)',
        durationSeconds: 330,
        durationFormatted: '05:30',
        narratorNote: 'Stirring maritime anthem of unity.',
        paragraphsBn: [
          'দুর্গম গিরি, কান্তার-মরু, দুস্তর পারাবার হে—লঙ্ঘিতে হবে রাত্রি নিশীথে, যাত্রীরা হুঁশিয়ার! দুলিতেছে তরী, ফুলিতেছে জল, ভুলিতেছে মাঝি পথ, ছিঁড়িয়াছে পাল, কে ধরিবে হাল, আছে কার হিম্মৎ?',
          'অসহায় জাতি মরিছে ডুবিয়া, জানে না সন্তরণ—কাণ্ডারী! আজ দেখিব তোমার মাতৃমুক্তি-পণ! "হিন্দু না ওরা মুসলিম?" ওই জিজ্ঞাসে কোন জন? কাণ্ডারী! বল, ডুবিছে মানুষ, সন্তান মোর মার!',
        ],
        paragraphsEn: [
          'Steep mountains, trackless deserts, and perilous oceans must be crossed in the dead of night—travelers, stay awake! The vessel pitches, the waters swell, the sail is torn—who has the courage now to seize the helm?',
          'When someone asks amidst the storm, "Are those drowning souls Hindu or Muslim?"—answer them, O Helmsman: "It is humanity that drowns, all of them children of my Motherland!"',
        ],
      },
      {
        id: 'ab-ch-5',
        number: 5,
        titleBn: 'পঞ্চম পর্ব — সাম্যবাদী ও মানুষ',
        titleEn: 'Part V · Samyabadi: Nothing Is Higher Than Humanity',
        durationSeconds: 340,
        durationFormatted: '05:40',
        narratorNote: 'Universal humanist finale.',
        paragraphsBn: [
          'গাহি সাম্যের গান—মানুষের চেয়ে বড় কিছু নাই, নহে কিছু মহীয়ান! নাই দেশ-কাল-পাত্রের ভেদ, অভেদ ধর্মজাতি, সব দেশে সব কালে ঘরে-ঘরে তিনি মানুষের জ্ঞাতি।',
          'যেখানেই মানুষের হৃদয় আছে, সেখানেই মন্দির, মসজিদ ও গির্জার মিলনভূমি। মানুষের চোখের জল মুছিয়ে দেওয়ার মধ্যেই জীবনের শ্রেষ্ঠ উপাসনা নিহিত।',
        ],
        paragraphsEn: [
          'I sing the song of equality—there is nothing greater than a human being, nothing more noble! Transcending boundaries of land, era, and creed, in every home and every age humanity belongs to one indivisible family.',
          'Within the living human heart stand all temples, mosques, and sanctuaries united; to wipe away the tears of a suffering fellow human is the highest worship on earth.',
        ],
      },
    ],
  },
  {
    id: 'banalata-sen',
    accessionNumber: 'BG-1942-KAB-008',
    titleBn: 'বনলতা সেন ও রূপসী বাংলা (সম্পূর্ণ কাব্য)',
    titleEn: 'Banalata Sen & Rupasi Bangla (Complete Poems)',
    authorBn: 'জীবনানন্দ দাশ',
    authorEn: 'Jibanananda Das',
    authorLifespan: '1899–1954',
    publishedYear: 1942,
    genre: 'kabita',
    genreLabelEn: 'Kabita · Modernist Lyric Poetry',
    genreLabelBn: 'আধুনিক কবিতা',
    sourceId: 'wikisource-bn',
    sourceName: 'Kabita Bhavan Press · Signet Press Unabridged Archive',
    totalDurationFormatted: '2h 12m',
    totalDurationSeconds: 7920,
    narratorVoice: 'Orus',
    narratorNameBn: 'শমীক মুখোপাধ্যায় (স্বপ্নময় গভীর ব্যারিটোন)',
    narratorNameEn: 'Shamik Mukhopadhyay · Soothing Twilight Baritone',
    coverMotif: 'banalata_sen',
    palette: {
      bg: '#1F2937',
      ink: '#F3F4F6',
      accent: '#10B981',
      border: '#374151',
    },
    synopsisEn:
      'Complete five-part collection of Jibanananda Das’s modernist masterpieces: Banalata Sen, Banglar Mukh Ami Dekhiyachhi, Abar Asibo Phire on the banks of the Dhansiri, Hay Chil, and Atharo Bachhar Bayas.',
    synopsisBn:
      'বনলতা সেন, বাংলার মুখ আমি দেখিয়াছি, আবার আসিব ফিরে, হায় চিল এবং কুয়াশার গান—পাঁচটি পূর্ণাঙ্গ পর্বে জীবনানন্দ দাশের শ্রেষ্ঠ কবিতাসমগ্র।',
    provenance: 'First published Poush 1349 BS (December 1942) by Buddhadeva Bose’s Kabita Bhavan; Signet Press edition 1952.',
    firstEditionPress: 'Kabita Bhavan & Signet Press, Calcutta',
    chapters: [
      {
        id: 'bs-ch-1',
        number: 1,
        titleBn: 'প্রথম পর্ব — নাটোরের বনলতা সেন',
        titleEn: 'Part I · Banalata Sen of Natore',
        durationSeconds: 300,
        durationFormatted: '05:00',
        narratorNote: 'Hushed, twilight cadence with rich sensory imagery.',
        paragraphsBn: [
          'হাজার বছর ধরে আমি পথ হাঁটিতেছি পৃথিবীর পথে, সিংহল সমুদ্র থেকে নিশীথের অন্ধকারে মালয় সাগরে অনেক ঘুরেছি আমি; বিম্বিসার অশোকের ধূসর জগতে সেখানে ছিলাম আমি; আরও দূর অন্ধকারে বিদর্ভ নগরে; আমি ক্লান্ত প্রাণ এক, চারিদিকে জীবনের সমুদ্র সফেন, আমারে দুদণ্ড শান্তি দিয়েছিল নাটোরের বনলতা সেন।',
          'চুল তার কবেকার অন্ধকার বিদিশার নিশা, মুখ তার শ্রাবস্তীর কারুকার্য; অতি দূর সমুদ্রের পর হাল ভেঙে যে-নাবিক হারায়েছে দিশা সবুজ ঘাসের দেশ যখন সে চোখে দেখে দারুচিনি-দ্বীপের ভিতর, তেমনি দেখেছি তারে অন্ধকারে; বলেছে সে, "এতদিন কোথায় ছিলেন?" পাখির নীড়ের মতো চোখ তুলে নাটোরের বনলতা সেন।',
          'সমস্ত দিনের শেষে শিশিরের শব্দের মতন সন্ধ্যা আসে; ডানার রৌদ্রের গন্ধ মুছে ফেলে চিল; পৃথিবীর সব রঙ নিভে গেলে পাণ্ডুলিপি করে আয়োজন তখন গল্পের তরে জোনাকির রঙে ঝিলমিল; সব পাখি ঘরে আসে—সব নদী—ফুরায় এ-জীবনের সব লেনদেন; থাকে শুধু অন্ধকার, মুখোমুখি বসিবার বনলতা সেন।',
        ],
        paragraphsEn: [
          'For a thousand years I have walked the ways of the earth, from the sea of Ceylon in the dead of night to the waters of the Malay Archipelago; I was there in the grey world of Bimbisara and Ashoka, and further still in the dim city of Vidarbha; a weary soul surrounded by the foaming sea of life, I found two moments of peace with Banalata Sen of Natore.',
          'Her hair was the ancient dark night of Vidisha, her face the sculpture of Shravasti; as a helmsman whose rudder has snapped upon a distant ocean catches sight of green grass on a cinnamon island, so I saw her in the dusk when she raised eyes like bird’s nests and asked, "Where were you so long?"—Banalata Sen of Natore.',
          'At the close of day, evening descends like the soft sound of falling dew; the kite wipes the scent of sunlight from its wings; when all earthly colors fade, the manuscript prepares its tales in the glimmer of fireflies; all birds return home, all rivers, all transactions of this life end; only darkness remains, to sit face to face with Banalata Sen.',
        ],
      },
      {
        id: 'bs-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় পর্ব — বাংলার মুখ আমি দেখিয়াছি',
        titleEn: 'Part II · I Have Seen the Face of Bengal (Rupasi Bangla)',
        durationSeconds: 310,
        durationFormatted: '05:10',
        narratorNote: 'Deeply lyrical reverence for Bengal’s flora and rivers.',
        paragraphsBn: [
          'বাংলার মুখ আমি দেখিয়াছি, তাই আমি পৃথিবীর রূপ খুঁজিতে যাই না আর: অন্ধকারে জেগে উঠে ডুমুরের গাছে চেয়ে দেখি ছাতার মতন বড়ো পাতাটির নিচে বসে আছে ভোরের দোয়েলপাখি—চারিদিকে চেয়ে দেখি পল্লবের স্তূপ জাম—বট—কাঁঠালের—হিজলের—অশ্বত্থের করে আছে চুপ।',
          'ফণীমনসার ঝোপে শটিবনে তাহাদের ছায়া পড়িয়াছে; মধুকর ডিঙা থেকে না জানি সে কবে চাঁদ চম্পার কাছে এমনই হিজল—বট—তমালের নীল ছায়া বাংলার অপরূপ রূপ দেখেছিল।',
          'বেহুলাও একদিন গাঙুড়ের জলে ভেলা নিয়ে—কৃষ্ণা দ্বাদশীর জোৎস্নায় যখন মরিয়া গেছে নদীর চড়ায়—সোনালি ধানের পাশে অসংখ্য অশ্বত্থ বট দেখেছিল, হায়, শ্যামার নরম গান শুনেছিল।',
        ],
        paragraphsEn: [
          'I have seen the face of Bengal, and so I seek no more the beauty of the wider world: waking in the predawn hush beneath the fig tree’s broad umbrella leaf, I watch the morning magpie-robin amidst silent groves of banyan, jackfruit, hijal, and peepul.',
          'Their cool shadows fall across the prickly-pear and wild turmeric thickets; long ago from his merchant barge Madhukar, Chand Sadagar too gazed upon these same blue shadows of hijal, banyan, and tamal along the riverbanks of Bengal.',
          'And Behula, drifting on her raft down the Gangur river under the waning moon of the twelfth night, saw the golden paddy fields beside countless banyans and heard the soft song of the shama bird.',
        ],
      },
      {
        id: 'bs-ch-3',
        number: 3,
        titleBn: 'তৃতীয় পর্ব — আবার আসিব ফিরে ধানসিঁড়িটির তীরে',
        titleEn: 'Part III · Again I Shall Return to the Banks of the Dhansiri',
        durationSeconds: 300,
        durationFormatted: '05:00',
        narratorNote: 'Wistful, eternal love for the Bengal delta.',
        paragraphsBn: [
          'আবার আসিব ফিরে ধানসিঁড়িটির তীরে—এই বাংলায় হয়তো মানুষ নয়—হয়তো বা শঙ্খচিল শালিখের বেশে; হয়তো ভোরের কাক হয়ে এই কার্তিকের নবান্নের দেশে কুয়াশার বুকে ভেসে একদিন আসিব এ কাঁঠাল-ছায়ায়।',
          'হয়তো বা হাঁস হব—কিশোরীর—ঘুঙুর রহিবে লাল পায়, সারাদিন কেটে যাবে কলমির গন্ধভরা জলে ভেসে ভেসে; আবার আসিব আমি বাংলার নদী মাঠ ক্ষেত ভালোবেসে জলাঙ্গীর ঢেউয়ে ভেজা বাংলার এ সবুজ করুণ ডাঙায়।',
          'হয়তো দেখিবে চেয়ে সুদর্শন উড়িতেছে সন্ধ্যার বাতাসে; হয়তো শুনিবে এক লক্ষ্মীপেঁচা ডাকিতেছে শিমুলের ডালে; রূপসার ঘোলা জলে হয়তো কিশোর এক সাদা ছেঁড়া পালে ডিঙা বায়—রাঙা মেঘ সাঁতরায়ে অন্ধকারে আসিতেছে নীড়ে দেখিবেন ধবল বকের দল—তাদেরই ভিড়ে আমাকে পাবে তুমি।',
        ],
        paragraphsEn: [
          'Again I shall return to the banks of the Dhansiri—to this Bengal: perhaps not as a man, but in the guise of a Brahminy kite or a mynah; perhaps as a dawn crow floating on the mist in the harvest month of Kartik to rest in the shade of these jackfruit trees.',
          'Or perhaps I shall be a swan with red ankle-bells cherished by a village girl, drifting all day upon waters fragrant with kalmi reeds; out of love for Bengal’s rivers and fields I shall return to these green shores washed by the Jalangi’s waves.',
          'Perhaps you will watch a scarab beetle flying in the evening breeze, or hear a barn owl calling from the silk-cotton bough; as a boy steers his skiff with a torn white sail across the turbid waters of the Rupsa and white egrets swim through crimson clouds toward their nests in the dark—amidst that flock you will find me.',
        ],
      },
      {
        id: 'bs-ch-4',
        number: 4,
        titleBn: 'চতুর্থ পর্ব — হায় চিল, সোনালি ডানার চিল',
        titleEn: 'Part IV · O Kite of Golden Wings (Hay Chil)',
        durationSeconds: 290,
        durationFormatted: '04:50',
        narratorNote: 'Melancholic, crystalline lyricism.',
        paragraphsBn: [
          'হায় চিল, সোনালি ডানার চিল, এই ভিজে মেঘের দুপুরে তুমি আর কেঁদো নাকো উড়ে-উড়ে ধানসিঁড়ি নদীটির পাশে! তোমার কান্নার সুরে বেতের ফলের মতো তার ম্লান চোখ মনে আসে!',
          'পৃথিবীর রাঙা রাজকন্যাদের মতো সে যে চলে গেছে রূপ নিয়ে দূরে; আবার তাহারে কেন ডেকে আনো? কে হায় হৃদয় খুঁড়ে বেদনা জাগাতে ভালোবাসে!',
        ],
        paragraphsEn: [
          'O kite, golden-winged kite, in this wet cloudy noon cry no more as you soar beside the Dhansiri river! At the plaintive note of your cry, I remember her pale eyes dark as wild cane-berries.',
          'Like the fair princesses of the earth she has gone far away with her beauty; why call her back again? Who wishes to excavate the heart only to awaken old sorrow?',
        ],
      },
      {
        id: 'bs-ch-5',
        number: 5,
        titleBn: 'পঞ্চম পর্ব — অদ্ভুত আঁধার এক ও ভোরের নাবিক',
        titleEn: 'Part V · A Strange Darkness & The Mariner of Dawn',
        durationSeconds: 310,
        durationFormatted: '05:10',
        narratorNote: 'Reflective modernist conclusion.',
        paragraphsBn: [
          'শীতের রাতের শেষে কুয়াশার পাণ্ডুলিপি খুলে যখন ভোরের রোদ এসে দাঁড়ায়, তখন ইতিহাসের দীর্ঘ পথ পেরিয়ে মানুষ আবার নতুন সময়ের মুখোমুখি হয়।',
          'সময়ের স্রোতে সব ক্লান্তি ধুয়ে গেলে মানুষের হৃদয়ে জেগে থাকে কেবল ভালোবাসা, ধানের ক্ষেতের ঘ্রাণ এবং নক্ষত্রের নিচে শান্ত প্রজ্ঞার আলো।',
        ],
        paragraphsEn: [
          'When winter’s mist parts at daybreak and morning sunlight touches the dew-drenched fields, the long pilgrimage of human history arrives once more at the threshold of renewal.',
          'Washed clean of weariness by the river of time, the heart preserves what is most enduring: human tenderness, the scent of ripening grain, and the quiet wisdom of the stars.',
        ],
      },
    ],
  },
  {
    id: 'kabuliwala-galpaguchha',
    accessionNumber: 'BG-1892-CHG-009',
    titleBn: 'গল্পগুচ্ছ — কাবুলিওয়ালা ও পোস্টমাস্টার (সম্পূর্ণ পাঠ)',
    titleEn: 'Galpaguchha · Kabuliwala & The Postmaster (Complete)',
    authorBn: 'রবীন্দ্রনাথ ঠাকুর',
    authorEn: 'Rabindranath Tagore',
    authorLifespan: '1861–1941',
    publishedYear: 1892,
    genre: 'chhotogolpo',
    genreLabelEn: 'Chhotogolpo · Short Stories',
    genreLabelBn: 'ছোটগল্প',
    sourceId: 'bichitra-tagore',
    sourceName: 'Bichitra Variorum · Sadhana Unabridged Archive',
    totalDurationFormatted: '5h 10m',
    totalDurationSeconds: 18600,
    narratorVoice: 'Charon',
    narratorNameBn: 'দেবেশ রায়চৌধুরী (অন্তরঙ্গ গভীর ব্যারিটোন)',
    narratorNameEn: 'Debesh Raychaudhuri · Deep Intimate Baritone',
    coverMotif: 'kabuliwala',
    palette: {
      bg: '#44403C',
      ink: '#FAFAF9',
      accent: '#EA580C',
      border: '#57534E',
    },
    synopsisEn:
      'Complete five-part unabridged audio edition of Rabindranath Tagore’s most beloved short stories from Galpaguchha: Kabuliwala (Parts I–III, from Mini’s childhood friendship with Rahmat to her wedding day) and The Postmaster of Ulapur (Parts IV–V).',
    synopsisBn:
      'গল্পগুচ্ছের দুটি অমর সৃষ্টি "কাবুলিওয়ালা" (মিনি ও রহমতের সম্পূর্ণ আখ্যান) এবং "পোস্টমাস্টার" (উলাপুরের পোস্টমাস্টার ও অনাথ বালিকা রতন)—পাঁচটি পূর্ণাঙ্গ অধ্যায়ে।',
    provenance: 'First published in Sadhana magazine (1892); collected in Galpaguchha (1900).',
    firstEditionPress: 'Majumdar Library & Visva-Bharati, Calcutta',
    chapters: [
      {
        id: 'kw-ch-1',
        number: 1,
        titleBn: 'প্রথম অধ্যায় — কাবুলিওয়ালা: বাচাল মিনি ও রহমতের প্রথম সাক্ষাৎ',
        titleEn: 'Chapter I · Kabuliwala: Little Mini & Rahmat of Kabul',
        durationSeconds: 340,
        durationFormatted: '05:40',
        narratorNote: 'Tender, conversational storytelling with emotional depth.',
        paragraphsBn: [
          'আমার পাঁচ বছর বয়সের ছোটো মেয়ে মিনি এক দণ্ড কথা না কহিয়া থাকিতে পারে না। সকালবেলা আমি আমার উপন্যাসের সপ্তদশ পরিচ্ছেদে হাত দিয়াছি, এমন সময় মিনি আসিয়াই আরম্ভ করিল—"বাবা, রামদয়াল দারোয়ান কাককে কৌয়া বলে, সে কিচ্ছু জানে না, না?"',
          'জানালার নিচে রাজপথে এক কাবুলিওয়ালা ঢিলা কাপড় পরিয়া, মাথায় পাগড়ি বাঁধিয়া, কাঁধে ঝুলি লইয়া ধীরে ধীরে যাইতেছিল। মিনি উচ্চৈঃস্বরে ডাকিল, "কাবুলিওয়ালা, ও কাবুলিওয়ালা!" দীর্ঘদেহী রহমত হাসিমুখে ফিরিয়া আসিতেই মিনির মনে ভয় হইল যে ঝুলির ভিতর বুঝি তাহারই মতো দু-চারটে জীবিত মানবসন্তান আছে।',
          'কিন্তু কিছুদিন পরেই দেখিলাম, দুই অসমবয়সী বন্ধুর মধ্যে বেশ জমে উঠিয়াছে। পেস্তা-বাদাম ও কিশমিশের ঘুষ দিয়া রহমত মিনির ক্ষুদ্র হৃদয়টি জয় করিয়া লইয়াছে। তাহাদের মধ্যে রোজ বাঁধা ঠাট্টা চলিত—"খোঁখী, তোমি শ্বশুরবাড়ি কখুনু যাবে না!"',
        ],
        paragraphsEn: [
          'My five-year-old daughter Mini cannot live a single minute without chattering. In the morning, just as I had set foot in the seventeenth chapter of my novel, Mini burst into my study and declared, "Father! Ramdayal the doorkeeper calls a crow a kauwa! He doesn’t know anything, does he?"',
          'Through the window overlooking the street walked a Kabuliwala in loose robes and a tall turban, carrying a heavy canvas bag slung across his shoulder. At Mini’s eager cry, the tall peddler Rahmat turned with a warm smile—whereupon Mini fled behind my desk, convinced his sack held two or three little children like herself.',
          'Yet within a few days I found them sitting side by side on the front bench, laughing over almonds and raisins. Every morning they exchanged their customary jest: "Little one, never go to your father-in-law’s house!"',
        ],
      },
      {
        id: 'kw-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় অধ্যায় — রক্তাক্ত রাজপথ ও রহমতের কারাদণ্ড',
        titleEn: 'Chapter II · The Quarrel in the Street & Years of Imprisonment',
        durationSeconds: 330,
        durationFormatted: '05:30',
        narratorNote: 'Somber, dramatic turn.',
        paragraphsBn: [
          'প্রতি বৎসর মাঘ মাসের মাঝামাঝি রহমত নিজের দেশে ফিরিয়া যাইবার আগে পাড়ায় পাড়ায় ধার আদায় করিতে ব্যস্ত থাকিত। একদিন সকালে বাহিরে তুমুল গোলমাল শুনিয়া চাহিয়া দেখিলাম—দুইজন পাহারাওয়ালা রহমতকে বাঁধিয়া লইয়া আসিতেছে, তাহার জামায় রক্তের দাগ।',
          'এক প্রতিবেশী রামপুরী চাদরের ধার অস্বীকার করায় বচসার মধ্যে রহমত তাহাকে ছুরি মারিয়া বসিয়াছে। মিনি বারান্দা হইতে ছুটিয়া গিয়া জিজ্ঞাসা করিল, "কাবুলিওয়ালা, তুমি কি শ্বশুরবাড়ি যাইতেছ?" রহমত ম্লান হাসিয়া বলিল, "হাঁ খোঁখী, আমি সেখানেই যাইতেছি।"',
          'সাংঘাতিক আঘাতের অপরাধে রহমতের কয়েক বৎসর কারাদণ্ড হইল। দেখতে দেখতে বছরগুলি কাটিয়া গেল, মিনির মন হইতেও তাহার বৃদ্ধ বন্ধুর স্মৃতি ক্রমে মুছিয়া গেল।',
        ],
        paragraphsEn: [
          'Every year in the middle of Magh, before returning to the mountains of Afghanistan, Rahmat went from door to door collecting small debts. One morning a commotion broke out in the lane, and I looked out to see two policemen leading Rahmat away in chains, his tunic stained with blood.',
          'A dishonest customer had denied owing money for a Rampuri shawl, provoking a violent quarrel. Running out to the veranda, little Mini asked innocently, "Kabuliwala, are you going to the father-in-law’s house?" Forcefully smiling to hide his handcuffs, Rahmat answered, "Yes, little one, that is just where I am going."',
          'Sentenced to long years in prison, Rahmat vanished from our lane. As seasons passed and Mini grew older with new companions, the memory of her tall friend from Kabul faded from her thoughts.',
        ],
      },
      {
        id: 'kw-ch-3',
        number: 3,
        titleBn: 'তৃতীয় অধ্যায় — মিনির বিবাহ ও ভুসোকালি মাখানো হাতের ছাপ',
        titleEn: 'Chapter III · Mini’s Wedding Day & The Ink-Print of a Tiny Hand',
        durationSeconds: 360,
        durationFormatted: '06:00',
        narratorNote: 'Profoundly moving climax.',
        paragraphsBn: [
          'বহু বৎসর পর শরৎকালের এক সকালে আমার ঘরে সানাই বাজিতেছে—আজ মিনির বিবাহ। এমন সময় জেল হইতে সদ্যমুক্ত বৃদ্ধ রহমত আসিয়া উপস্থিত হইল। তাহার হাতে আর ঝুলি নাই, তবু সে ফলের এক ঠোঙা আনিয়া বলিল, "খোঁখীকে একনজর দেখিব বাবু।"',
          'আমি যখন বধূবেশে সজ্জিতা লজ্জানত মিনিকে ডাকিলাম, রহমত চমকিয়া উঠিল—তাহার সেই ছোট্ট খোঁখী আজ বড় হইয়া শ্বশুরবাড়ি যাইতেছে! সে মাটিতে বসিয়া পড়িয়া বুঝিল, কাবুলে ফেলে আসা তাহার নিজের মেয়েরও নিশ্চয়ই এতদিনে এমনি বিবাহের বয়স হইয়াছে।',
          'বুকের ঢিলা জামার পকেট হইতে সে একখানি মলিন কাগজ বাহির করিল—তাহাতে তাহার কন্যার ছোট্ট হাতের ভুসোকালি মাখানো ছাপ। আমার চোখে জল আসিল। বিবাহের উৎসবের খরচ কমাইয়া আমি রহমতের হাতে কিছু টাকা দিয়া বলিলাম—"রহমত, তুমি দেশে তোমার মেয়ের কাছে ফিরিয়া যাও; তোমাদের মিলনসুখে আমার মিনির কল্যাণ হউক।"',
        ],
        paragraphsEn: [
          'Years later, on a bright autumn morning filled with the music of wedding pipes, Mini was to be married. Into my study stepped Rahmat, released from prison the previous evening, his beard greyed and his shoulders stooped, holding a small box of grapes and almonds for the child he remembered.',
          'When Mini entered shyly in her crimson bridal silk and sandalwood paste, Rahmat stood stunned—his little chatterbox was now a grown bride! Sinking to the floor, a sudden realization pierced him: his own daughter Parbati in faraway Kabul must also have grown up in these eight long years.',
          'From the inner pocket of his coat he drew out a worn, folded piece of paper bearing the smudged charcoal impression of a tiny hand—not a photograph, only the touch of his child’s palm carried next to his heart through years of exile and prison. Tears blurred my sight; cutting short the wedding illuminations, I pressed bank notes into his hand and said, "Go back to your own daughter in your mountain home, Rahmat, and may the happiness of your reunion bless my Mini!"',
        ],
      },
      {
        id: 'kw-ch-4',
        number: 4,
        titleBn: 'চতুর্থ অধ্যায় — পোস্টমাস্টার: উলাপুরের নিস্তব্ধ অফিসঘর ও রতন',
        titleEn: 'Chapter IV · The Postmaster: The Quiet Village of Ulapur & Little Ratan',
        durationSeconds: 340,
        durationFormatted: '05:40',
        narratorNote: 'Gentle, rain-washed rural intimacy.',
        paragraphsBn: [
          'কলকাতার ছেলে উলাপুরের নীলকুঠির কাছে এক ক্ষুদ্র গ্রামে প্রথম পোস্টমাস্টারের কাজে আসিয়া যেন জলের মাছ ডাঙায় উঠিল। চারিদিকে কেবল বাঁশবন, পুকুর আর নীলকুঠির গোমস্তাদের ব্যস্ততা।',
          'অফিসঘরের কাজ সারিবার পর বারো-তেরো বছরের অনাথ বালিকা রতন পোস্টমাস্টারের ফাইফরমাশ খাটিত। সন্ধ্যায় বাঁশবনে ঝিঁঝিঁ ডাকিলে পোস্টমাস্টার রতনকে কাছে ডাকিয়া নিজের মা, দিদি ও ছোট ভাইয়ের গল্প করিতেন এবং রতনকে বর্ণপরিচয় পড়াইতে শুরু করিলেন।',
          'বর্ষায় পোস্টমাস্টার পীড়িত হইয়া পড়িলে বালিকা রতন যেন মায়ের মতোই নিদ্রাহীন চোখে তাঁহার সেবাযত্ন করিয়া তাঁহাকে সুস্থ করিয়া তুলিল।',
        ],
        paragraphsEn: [
          'Fresh from the bustle of Calcutta, the young Postmaster felt like a fish out of water in the tiny indigo-factory village of Ulapur, where a thatched shed beside a green pond served as his office.',
          'An orphan village girl named Ratan, twelve or thirteen years old, swept the floor and lit his evening pipe. In the lonely twilight when crickets chirped in the bamboo thicket, the Postmaster called Ratan inside to talk of his mother and sister at home, and began teaching her to read the Bengali alphabet.',
          'When monsoon fever laid the young man low on his cot, little Ratan stepped immediately into the role of a mother, brewing herbal decoctions andpressing her cool hand to his burning brow through the long rainy nights.',
        ],
      },
      {
        id: 'kw-ch-5',
        number: 5,
        titleBn: 'পঞ্চম অধ্যায় — রতনের প্রার্থনা ও নদীপথে বিদায়',
        titleEn: 'Chapter V · Ratan’s Plea & The Swollen River of Parting',
        durationSeconds: 350,
        durationFormatted: '05:50',
        narratorNote: 'Poignant, philosophical conclusion.',
        paragraphsBn: [
          'সুস্থ হইয়াই পোস্টমাস্টার উলাপুর ছাড়িয়া যাইবার জন্য পদত্যাগপত্র পাঠাইলেন। বিদায়ের দিন রতন কাঁদিয়া তাঁহার পায়ে জড়াইয়া ধরিয়া বলিল, "দাদাবাবু, আমাকে তোমাদের বাড়ি লইয়া যাইবে?" পোস্টমাস্টার মৃদু হাসিয়া বলিলেন, "সে কি কখনো হয়!"',
          'যাত্রার সময় পোস্টমাস্টার নিজের বেতনের প্রায় সব টাকাই রতনকে দিতে চাহিলেন, কিন্তু বালিকা ধুলায় লুটাইয়া পড়িয়া কহিল—"দাদাবাবু, তোমার দুটি পায়ে পড়ি, আমাকে কিছু দিতে হইবে না, আমার জন্য কাউকে ভাবিতে হইবে না"—বলিয়া সে দৌড়াইয়া পলাইয়া গেল।',
          'নৌকায় উঠিয়া বর্ষার স্ফীত নদীর স্রোতে ভাসিতে ভাসিতে পোস্টমাস্টারের মনে ব্যথা জাগিল—ইচ্ছা হইল ফিরিয়া গিয়া জগতের ক্রোড়বিচ্যুত সেই অনাথিনীকে সঙ্গে লইয়া আসেন। কিন্তু পালে তখন বাতাস লাগিয়াছে, আর রতন একাকী পোস্টাপিস ঘরের চারিপাশে অশ্রুজলে ঘুরিয়া বেড়াইতেছিল।',
        ],
        paragraphsEn: [
          'Once recovered, the Postmaster resigned his rural post to return to Calcutta. When he told Ratan he was leaving forever, the girl fell silent and finally whispered through trembling lips, "Dadababu, will you take me home with you?" Looking at her in surprise, he replied lightly, "What an idea—how could that ever be?"',
          'At parting he offered her nearly his entire month’s salary, construct of kindness, yet Ratan sank to the dust clasping his feet: "Dadababu, I beg of you, do not give me anything and do not trouble anyone to look after me!"—and she fled weeping behind the shed.',
          'As his boat pushed out into the rain-swollen river, a sudden ache rose in the Postmaster’s breast to turn back and bring the parentless child with him; but the wind had already filled the sail, and he consoled himself with philosophies of life’s countless partings—while poor Ratan wandered round the old post office clinging to the vain hope that her Dadababu might yet return.',
        ],
      },
    ],
  },
  {
    id: 'padma-nadir-majhi',
    accessionNumber: 'BG-1936-UPN-010',
    titleBn: 'পদ্মা নদীর মাঝি (সম্পূর্ণ উপন্যাস)',
    titleEn: 'Padma Nadir Majhi (The Boatman of the Padma · Complete)',
    authorBn: 'মানিক বন্দ্যোপাধ্যায়',
    authorEn: 'Manik Bandyopadhyay',
    authorLifespan: '1908–1956',
    publishedYear: 1936,
    genre: 'upanyas',
    genreLabelEn: 'Upanyas · Riverine Realism',
    genreLabelBn: 'উপন্যাস',
    sourceId: 'internet-archive-dli',
    sourceName: 'Digital Library of India · Purbasha Unabridged Archive',
    totalDurationFormatted: '5h 30m',
    totalDurationSeconds: 19800,
    narratorVoice: 'Fenrir',
    narratorNameBn: 'কৌশিক সেন (গম্ভীর ব্যারিটোন পাঠ)',
    narratorNameEn: 'Kaushik Sen · Deep Grounded Baritone',
    coverMotif: 'padma_nadir_majhi',
    palette: {
      bg: '#0F172A',
      ink: '#F1F5F9',
      accent: '#0284C7',
      border: '#1E293B',
    },
    synopsisEn:
      'Complete five-part edition of Manik Bandyopadhyay’s riverine classic: Hilsa season on the Padma, life in Ketupur village with Mala and Kapila, the enigma of Hossain Miya, and the final night voyage toward Moynadwip.',
    synopsisBn:
      'পদ্মায় ইলিশের মরশুম, কেতুপুরের জেলেপাড়া, মালা ও কপিলা, রহস্যময় হোসেন মিয়া এবং ময়নাদ্বীপের পথে শেষ যাত্রা—পাঁচটি পূর্ণাঙ্গ পর্বে পদ্মা নদীর মাঝি।',
    provenance: 'First serialized in Purbasha magazine (1934–1935); published as a book in 1936.',
    firstEditionPress: 'Gurudas Chattopadhyay & Sons, Calcutta',
    chapters: [
      {
        id: 'pnm-ch-1',
        number: 1,
        titleBn: 'প্রথম পর্ব — পদ্মায় ইলিশের মরশুম ও কুবেরের নৌকা',
        titleEn: 'Part I · Hilsa Season on the Padma & Kuber’s Boat',
        durationSeconds: 350,
        durationFormatted: '05:50',
        narratorNote: 'Steady, atmospheric cadence like the sweep of river oars.',
        paragraphsBn: [
          'বর্ষার মাঝামাঝি পদ্মায় ইলিশ মাছ ধরার মরশুম চলিয়াছে। দিবারাত্রি কোনো বিরাম নাই। সন্ধ্যার সময় জাহাজঘাটে দাঁড়াইলে দেখা যায় নদীর বুকে শত শত জেলের নৌকার ছোট ছোট আলো জোনাকির মতো মিটমিট করিয়া জ্বলিতেছে।',
          'কুবেরের নৌকাখানি ধনঞ্জয়ের। সারারাত জাল টানিয়া ভোরের আলো ফুটিলে রুপালি ইলিশের স্তূপ লইয়া নৌকা ঘাটে ভিড়ে। জলের ছলছল শব্দ আর মাঝিদের ক্লান্ত হাঁকডাকে পদ্মার তীর মুখর হইয়া ওঠে।',
          'সারারাত হাড়ভাঙা খাটুনির পরও কুবেরের ভাগে সামান্যই জোটে। তবু পরিবারের মুখে অন্ন জোগাইতে সে লুকাইয়া দু-একটি মাছ সরাইয়া রাখে।',
        ],
        paragraphsEn: [
          'In the heart of the monsoon, the hilsa-fishing season was in full swing upon the mighty Padma. Neither day nor night brought rest. Standing at the steamer ghat after dusk, one could see hundreds of tiny oil lamps flickering across the black current like a constellation of fireflies.',
          'All night Kuber strained at the nets aboard Dhananjay’s boat; as grey dawn broke over the water, the hull gleamed with mounds of silver hilsa. The slap of waves against weathered timber mingled with the hoarse cries of boatmen bargaining at the market landing.',
          'Even after a night of bone-weary labor, only a tiny share fell to Kuber, driving him to conceal a fish or two beneath the floorboards for his hungry household in Ketupur.',
        ],
      },
      {
        id: 'pnm-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় পর্ব — কেতুপুরের জেলেপাড়া, মালা ও কপিলা',
        titleEn: 'Part II · Ketupur Fishermen’s Quarter, Mala & Kapila',
        durationSeconds: 360,
        durationFormatted: '06:00',
        narratorNote: 'Earthy, intimate portrayal of village life.',
        paragraphsBn: [
          'কেতুপুর গ্রামের এক প্রান্তে জেলেরা গাদাগাদি করিয়া বাস করে। কুবেরের স্ত্রী মালা জন্ম হইতেই এক পায়ে খোঁড়া, সে সারাজীবন ঘরের দাওয়ায় বসিয়াই সংসার সামলায়।',
          'বন্যার সময় মালার ছোট বোন কপিলা শ্বশুরবাড়ি হইতে কেতুপুরে দিদির ঘরে আশ্রয় লইতে আসে। কপিলার চঞ্চল হাসি ও প্রাণোচ্ছল স্বভাব কুবেরের একঘেয়ে দারিদ্র্যক্লিষ্ট জীবনে এক অদ্ভুত আলোড়ন তোলে।',
          'পদ্মার ভাঙা-গড়ার মতোই কেতুপুরের মানুষগুলোর জীবনেও সুখ আর অভাব পাশাপাশি বয়ে চলে।',
        ],
        paragraphsEn: [
          'At the edge of Ketupur village huddled the thatched huts of the fishing community. Kuber’s wife Mala, lame in one leg since birth, managed their humble hearth without ever stepping beyond the earthen courtyard.',
          'When monsoon floods inundated the low-lying villages, Mala’s younger sister Kapila arrived to stay with them. Spirited, teasing, and restless as the river wind, Kapila stirred an unspoken longing inside Kuber’s weary heart.',
          'Like the Padma endlessly eroding one bank while building up another, joy and deprivation flowed side by side through the lives of Ketupur’s boatmen.',
        ],
      },
      {
        id: 'pnm-ch-3',
        number: 3,
        titleBn: 'তৃতীয় পর্ব — হোসেন মিয়া ও ময়নাদ্বীপের রহস্য',
        titleEn: 'Part III · The Enigma of Hossain Miya & The Island of Moynadwip',
        durationSeconds: 355,
        durationFormatted: '05:55',
        narratorNote: 'Mysterious, magnetic characterization.',
        paragraphsBn: [
          'কেতুপুরের ঘাটে সদা দেখা যায় হোসেন মিয়াকে। এককালে দরিদ্র মাঝি থাকিলেও আজ সে সমুদ্রের মোহানায় ময়নাদ্বীপ নামে এক জনহীন দ্বীপের মালিক।',
          'কেতুপুরে যে-ই নিঃস্ব হয়, ঘর হারায় কিংবা সমাজে ঠাঁই পায় না, হোসেন মিয়া তাহাকেই মিষ্টি কথায় নিজের পানসি নৌকায় তুলিয়া লইয়া যায় ময়নাদ্বীপে বসতি গড়িবার জন্য।',
          'কিন্তু ময়নাদ্বীপ হইতে যাঁহারা ফিরিয়া আসে, তাঁহারা বলে সেখানে ঘন জঙ্গল, সাপ-খোপ আর হাড়ভাঙা পরিশ্রম। তবু হোসেন মিয়ার ডাকে মানুষ ছুটে যায়।',
        ],
        paragraphsEn: [
          'Hovering ever near the landing ghat of Ketupur was Hossain Miya. Once a penniless boatman himself, he had acquired a remote island at the sea’s estuary known as Moynadwip.',
          'Whenever a family in Ketupur lost their hut to floods, debt, or social ostracism, Hossain Miya stepped forward with soft words and provisions, offering them land and a fresh start on his island settlement.',
          'Yet the few who ever returned from Moynadwip whispered of dense jungle, malaria, and relentless toil clearing the wilderness at the edge of the sea.',
        ],
      },
      {
        id: 'pnm-ch-4',
        number: 4,
        titleBn: 'চতুর্থ পর্ব — ঝড়ের রাত্রি ও মিথ্যা চুরির অপবাদ',
        titleEn: 'Part IV · The Storm, Gopi’s Marriage & The False Accusation',
        durationSeconds: 365,
        durationFormatted: '06:05',
        narratorNote: 'Tense dramatic crisis.',
        paragraphsBn: [
          'কুবেরের মেয়ে গোপীর বিবাহ ও সংসারের চরম অভাবের মধ্যে কুবের হোসেন মিয়ার বড় নৌকায় মাঝির কাজ লইতে বাধ্য হয়। ময়নাদ্বীপে একবার যাতায়াত করিয়া সে সেই রহস্যময় দ্বীপটি নিজের চোখে দেখিয়া আসে।',
          'ইতিমধ্যে গ্রামে এক চুরির ঘটনায় ষড়যন্ত্র করিয়া কুবেরের ঘাড়ে দোষ চাপানো হয়। পুলিশের গ্রেপ্তারি পরোয়ানা মাথায় লইয়া কুবের বুঝিতে পারে—কেতুপুরে তাহার ফেরার পথ চিরতরে বন্ধ হইয়া গিয়াছে।',
        ],
        paragraphsEn: [
          'Pressed by the expense of his daughter Gopi’s marriage and mounting poverty, Kuber signed on to crew Hossain Miya’s sea-going vessel, witnessing firsthand the harsh frontier of Moynadwip.',
          'Soon after his return to Ketupur, a stolen brass pot and money were planted in Kuber’s courtyard by a vindictive rival. Facing imminent arrest by the police with no means to prove his innocence, Kuber realized his life in Ketupur had reached its end.',
        ],
      },
      {
        id: 'pnm-ch-5',
        number: 5,
        titleBn: 'পঞ্চম পর্ব — মাঝরাতে ময়নাদ্বীপের পথে: আমারে নিবা মাঝি লগে?',
        titleEn: 'Part V · Midnight Voyage to Moynadwip: Will You Take Me With You, Boatman?',
        durationSeconds: 380,
        durationFormatted: '06:20',
        narratorNote: 'Haunting, unforgettable literary finale.',
        paragraphsBn: [
          'জেলখানার হাত হইতে বাঁচিতে কুবের স্থির করিল সেই রাতেই হোসেন মিয়ার নৌকায় চড়িয়া ময়নাদ্বীপে চলিয়া যাইবে। অন্ধকারে নদীর ঘাটে আসিয়া সে দেখিল—নৌকার কাছে একা দাঁড়াইয়া আছে কপিলা।',
          'কপিলা মৃদু অথচ স্থির কণ্ঠে কুবেরকে বলিল—"আমারে নিবা মাঝি লগে?" একা অজানা দ্বীপে নির্বাসনের ভয়ে কাতর কুবের আর দ্বিধা করিতে পারিল না।',
          'রাত্রির অন্ধকারে পদ্মার বুক চিরে হোসেন মিয়ার পানসি নৌকা পাল তুলিয়া ভাসিয়া পড়িল—পিছনে পড়িয়া রহিল কেতুপুর, আর সম্মুখে রহিল সুদূর ময়নাদ্বীপের অজানা ভবিষ্যৎ।',
        ],
        paragraphsEn: [
          'To escape prison, Kuber resolved to board Hossain Miya’s boat at midnight and surrender himself to exile on Moynadwip. Stepping down to the dark river landing, he found a solitary figure waiting beside the water—Kapila.',
          'Looking into his eyes in the starlight, Kapila spoke the immortal words: "Will you take me with you, boatman?" Overcome by the terror of facing that distant wilderness alone, Kuber took her hand.',
          'In the dead of night Hossain Miya’s vessel hoisted its sail and glided out onto the black waters of the Padma—leaving Ketupur behind forever as it steered toward the uncharted horizon of Moynadwip.',
        ],
      },
    ],
  },
  {
    id: 'satyanweshi-byomkesh',
    accessionNumber: 'BG-1932-RAH-011',
    titleBn: 'সত্যান্বেষী — ব্যোমকেশ বক্সী (সম্পূর্ণ রহস্য)',
    titleEn: 'Satyanweshi (The Truth-Seeker · Complete Mystery)',
    authorBn: 'শরদিন্দু বন্দ্যোপাধ্যায়',
    authorEn: 'Sharadindu Bandyopadhyay',
    authorLifespan: '1899–1970',
    publishedYear: 1932,
    genre: 'rahasya',
    genreLabelEn: 'Rahasya · Classical Detective',
    genreLabelBn: 'রহস্য ও গোয়েন্দা আখ্যান',
    sourceId: 'wikisource-bn',
    sourceName: 'Basumati Sahitya Mandir · Harrison Road Unabridged Archive',
    totalDurationFormatted: '3h 40m',
    totalDurationSeconds: 13200,
    narratorVoice: 'Charon',
    narratorNameBn: 'অরিন্দম শীল (রহস্যময় গভীর ব্যারিটোন)',
    narratorNameEn: 'Arindam Sil · Noir Baritone Narrator',
    coverMotif: 'byomkesh',
    palette: {
      bg: '#27272A',
      ink: '#F4F4F5',
      accent: '#E11D48',
      border: '#3F3F46',
    },
    synopsisEn:
      'Complete five-part inaugural chronicle of Byomkesh Bakshi and Ajit Bandyopadhyay: the boarding house in Chinatown, the midnight murder in Room 7, the cocaine syndicate trap, and the unmasking of the killer.',
    synopsisBn:
      'চীনাবাজারের মেসবাড়ি, মধ্যরাতের হত্যাকাণ্ড, কোকেনের কারবার এবং অপরাধীর মুখোশ উন্মোচন—পাঁচটি পূর্ণাঙ্গ পর্বে ব্যোমকেশ বক্সীর প্রথম কাহিনী "সত্যান্বেষী"।',
    provenance: 'First published in Basumati periodical (1932); collected in Byomkesher Diary (1933).',
    firstEditionPress: 'P. C. Sarkar & Sons, College Street, Calcutta',
    chapters: [
      {
        id: 'bb-ch-1',
        number: 1,
        titleBn: 'প্রথম পর্ব — চীনাবাজারের মেসবাড়ি ও অতুলচন্দ্র মিত্র',
        titleEn: 'Part I · The Boarding House near Tiretta Bazaar & Enter Atulchandra',
        durationSeconds: 330,
        durationFormatted: '05:30',
        narratorNote: 'Measured, atmospheric 1930s Calcutta mystery tone.',
        paragraphsBn: [
          'কলকাতার চীনাবাজার অঞ্চলে পরপর কয়েকটি রহস্যজনক হত্যাকাণ্ড ঘটিয়াছে, অথচ পুলিশ কোনো কূলকিনারা করিতে পারে নাই। সেই সময় আমি অনুকূলবাবুর মেসবাড়িতে একাকী বাস করিতাম।',
          'একদিন সন্ধ্যায় অতুলচন্দ্র মিত্র নামে এক তীক্ষ্ণদৃষ্টি যুবক মেসে ঘর ভাড়া লইতে আসিল। মেসে ঘর খালি না থাকায় আমি তাহাকে আমার ঘরেরই অর্ধেক ভাগ ছাড়িয়া দিলাম। যুবকটির কথা ও চোখের দৃষ্টিতে এক অদ্ভুত তীক্ষ্ণতা ছিল।',
          'মেসের মালিক হোমিওপ্যাথিক ডাক্তার অনুকূলবাবু এবং অন্য বোর্ডার অশ্বিনীবাবুর গতিবিধি সে নিঃশব্দে লক্ষ্য করিতে লাগিল।',
        ],
        paragraphsEn: [
          'Around Calcutta’s Chinatown and Tiretta Bazaar, a string of baffling murders had left the police commissioner’s office at its wits’ end. At that time I occupied a solitary room on the top floor of Dr. Anukul’s boarding house.',
          'One rainy evening a keen-eyed young man introducing himself as Atulchandra Mitra arrived seeking lodgings. Since no other room was vacant, I invited him to share mine—little suspecting the true purpose behind his arrival.',
          'With quiet intensity, my new roommate began observing our genial homoeopathic landlord Dr. Anukul and our fellow boarder Ashwini-babu.',
        ],
      },
      {
        id: 'bb-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় পর্ব — মধ্যরাতের আর্তনাদ ও অশ্বিনীবাবুর মৃত্যু',
        titleEn: 'Part II · The Cry at Midnight & Murder in the Boarding House',
        durationSeconds: 340,
        durationFormatted: '05:40',
        narratorNote: 'Suspenseful noir investigation.',
        paragraphsBn: [
          'কয়েক রাত্রি পর হঠাৎ পাশের ঘর হইতে এক মর্মভেদী আর্তনাদ শুনিয়া আমাদের ঘুম ভাঙিয়া গেল। ছুটিয়া গিয়া দেখা গেল অশ্বিনীবাবু মেঝেতে রক্তাক্ত অবস্থায় পড়িয়া আছেন, তাঁহার পিঠে ছুরির আঘাত।',
          'পুলিশ আসিয়া আমাদের ঘর তল্লাশি করিতেই অতুলচন্দ্রের বিছানার নিচে এক পুরিয়া অবৈধ কোকেন পাওয়া গেল! পুলিশ অতুলচন্দ্রকে সন্দেহভাজন হিসাবে গ্রেপ্তার করিয়া লইয়া গেল।',
        ],
        paragraphsEn: [
          'Several nights later a piercing scream shattered the silence of the corridor. Rushing to the adjoining room, we found Ashwini-babu lying dead upon the floor with a dagger wound between his shoulders.',
          'When police inspectors searched the premises at dawn, they discovered a packet of illicit cocaine concealed beneath Atulchandra’s mattress and promptly arrested my roommate as the prime suspect!',
        ],
      },
      {
        id: 'bb-ch-3',
        number: 3,
        titleBn: 'তৃতীয় পর্ব — জানলার খড়খড়ি ও কার্বলিক অ্যাসিডের রহস্য',
        titleEn: 'Part III · The Louvered Shutter & The Clue of Carbolic Acid',
        durationSeconds: 335,
        durationFormatted: '05:35',
        narratorNote: 'Sharp deductive reasoning.',
        paragraphsBn: [
          'কিন্তু পরদিনই জামিনে মুক্ত হইয়া অতুলচন্দ্র ফিরিয়া আসিল এবং আমাকে গোপনে জানাইল—পুলিশের কাছে ধরা দেওয়াটা তাহার নিজেরই কৌশল ছিল, যাতে আসল খুনি নিশ্চিন্ত হইয়া নিজের ফাঁদে পা দেয়।',
          'সে আমাকে দেখাইল কীভাবে আমার ঘরের জানলার খড়খড়িতে কার্বলিক অ্যাসিড মাখানো ছিল এবং অন্ধকারে যে ব্যক্তি আমাদের ঘরে কোকেন লুকাইতে আসিয়াছিল, তাহার আঙুলে সেই অ্যাসিডের দাগ লাগিয়া গিয়াছে।',
        ],
        paragraphsEn: [
          'Yet the very next afternoon Atulchandra returned on bail and confided to me in a whisper that his arrest had been a calculated ruse to lull the real murderer into a false sense of security.',
          'Pointing to the louvered wooden shutter of our window, he demonstrated how he had coated the latch with carbolic acid—leaving an unmistakable chemical burn upon the fingers of whoever had crept into our room in the dark to plant the cocaine.',
        ],
      },
      {
        id: 'bb-ch-4',
        number: 4,
        titleBn: 'চতুর্থ পর্ব — অন্ধকারে ফাঁদ ও আসল খুনির মুখোশ উন্মোচন',
        titleEn: 'Part IV · The Midnight Ambush & Unmasking Dr. Anukul',
        durationSeconds: 350,
        durationFormatted: '05:50',
        narratorNote: 'Climactic confrontation.',
        paragraphsBn: [
          'সেই রাত্রে আমরা অন্ধকারে ওত পাতিয়া রহিলাম। গভীর রাত্রে নিঃশব্দে আমাদের ঘরের দরজা খুলিয়া এক ছায়ামূর্তি ছুরি হাতে প্রবেশ করিল। অতুলচন্দ্র বিদ্যুতের বেগে ঝাঁপাইয়া পড়িয়া তাহার হাত চাপিয়া ধরিল।',
          'আলো জ্বালাইতেই দেখা গেল—সেই ছায়ামূর্তি আর কেহ নহেন, মেসের নিরীহ দর্শন মালিক হোমিওপ্যাথিক ডাক্তার অনুকূলবাবু! তাঁহার হোমিওপ্যাথিক ওষুধের শিশিতে করিয়াই চীনাবাজারে লক্ষ লক্ষ টাকার অবৈধ কোকেন পাচার হইত।',
        ],
        paragraphsEn: [
          'That night we waited in pitch darkness with a concealed electric torch. Past midnight, the door latch clicked softly and a shadowy figure crept inside brandishing a knife. Like a coiled spring, my companion leaped forward and pinned the intruder’s wrist.',
          'When I switched on the light, the face staring back at us was none other than our mild-mannered landlord, Dr. Anukul! Behind the facade of his homoeopathic dispensary, he had been running Chinatown’s deadly cocaine syndicate in sugar-globule vials.',
        ],
      },
      {
        id: 'bb-ch-5',
        number: 5,
        titleBn: 'পঞ্চম পর্ব — ৬৬ নম্বর হ্যারিসন রোড ও সত্যান্বেষীর পরিচয়',
        titleEn: 'Part V · 66 Harrison Road: I Prefer the Title Satyanweshi',
        durationSeconds: 320,
        durationFormatted: '05:20',
        narratorNote: 'Warm, iconic conclusion.',
        paragraphsBn: [
          'পুলিশ অনুকূলবাবুকে লইয়া গেলে যুবকটি মৃদু হাসিয়া আমাকে বলিল, "অজিতবাবু, আমার আসল নাম অতুলচন্দ্র নয়—ব্যোমকেশ বক্সী। পুলিশ কমিশনারের অনুরোধেই আমি এই মেসে ছদ্মবেশে আসিয়াছিলাম।"',
          'সে আরও বলিল, "ডিটেকটিভ বা গোয়েন্দা কথাটা শুনতে বড় উগ্র লাগে, তাই আমি নিজেকে বলি সত্যান্বেষী—সত্যের অন্বেষণই আমার ব্রত। চলুন, এবার আমার ৬৬ নম্বর হ্যারিসন রোডের বাসায় গিয়া দুজনে একসঙ্গে থাকা যাক।"',
          'সেই দিন হইতেই হ্যারিসন রোডের তেতলার বাড়িতে আমাদের দুই বন্ধুর একত্র বাস এবং ব্যোমকেশের সত্যান্বেষণের কাহিনী লিখিবার সূত্রপাত হইল।',
        ],
        paragraphsEn: [
          'Once the police had taken Dr. Anukul away, the young man turned to me with a warm smile. "Ajit-babu," he confessed, "my real name is not Atulchandra—it is Byomkesh Bakshi. I came to this boarding house undercover at the Police Commissioner’s request."',
          'Lighting a cigarette, he added, "The word ‘detective’ sounds terribly mechanical to my ears, so I prefer to call myself a Satyanweshi—a Seeker of Truth. Come, pack your trunk and move into my flat at 66 Harrison Road."',
          'From that morning on Harrison Road began our lifelong companionship and my chronicles of Byomkesh Bakshi.',
        ],
      },
    ],
  },
  {
    id: 'sabhyatar-sankat',
    accessionNumber: 'BG-1941-PRA-012',
    titleBn: 'সভ্যতার সংকট ও কালান্তর (সম্পূর্ণ প্রবন্ধ)',
    titleEn: 'Crisis in Civilization & Kalantar Essays (Complete)',
    authorBn: 'রবীন্দ্রনাথ ঠাকুর',
    authorEn: 'Rabindranath Tagore',
    authorLifespan: '1861–1941',
    publishedYear: 1941,
    genre: 'prabandha',
    genreLabelEn: 'Prabandha · Philosophical Essay',
    genreLabelBn: 'প্রবন্ধ ও চিন্তা',
    sourceId: 'bichitra-tagore',
    sourceName: 'Visva-Bharati Santiniketan · 1941 Unabridged Archive',
    totalDurationFormatted: '2h 05m',
    totalDurationSeconds: 7500,
    narratorVoice: 'Orus',
    narratorNameBn: 'শঙ্খ ঘোষাল (মননশীল গভীর ব্যারিটোন)',
    narratorNameEn: 'Shankha Ghoshal · Reflective Deep Baritone',
    coverMotif: 'devdas',
    palette: {
      bg: '#292524',
      ink: '#F5F5F4',
      accent: '#9A3412',
      border: '#44403C',
    },
    synopsisEn:
      'Complete five-part edition of Rabindranath Tagore’s final philosophical testament delivered at Santiniketan in April 1941: reflections on the nineteenth-century Bengal Renaissance, the disillusionment of imperial politics, and his undying faith in humanity.',
    synopsisBn:
      'রবীন্দ্রনাথ ঠাকুরের জীবনের শেষ মহৎ প্রবন্ধ "সভ্যতার সংকট"-এর সম্পূর্ণ পাঁচটি পর্ব—উনিশ শতকের আশাবাদ, সাম্রাজ্যবাদের মুখোশ উন্মোচন এবং মানুষের প্রতি অবিচল বিশ্বাস।',
    provenance: 'First read at Uttarayan, Santiniketan on 1st Baishakh 1348 BS (14 April 1941).',
    firstEditionPress: 'Visva-Bharati Press, Santiniketan',
    chapters: [
      {
        id: 'ss-ch-1',
        number: 1,
        titleBn: 'প্রথম পর্ব — আশি বৎসরের দিগন্ত ও উনিশ শতকের সূচনা',
        titleEn: 'Part I · Looking Back Across Eighty Years & Early Faith in Europe',
        durationSeconds: 310,
        durationFormatted: '05:10',
        narratorNote: 'Grave, dignified, philosophical delivery.',
        paragraphsBn: [
          'আজ আমার বয়স আশি বৎসর পূর্ণ হইল, আমার জীবনক্ষেত্রের বিস্তীর্ণতা আজ আমার সম্মুখে প্রসারিত। পূর্বতম দিগন্তে যে জীবন আরম্ভ হইয়াছিল তাহার দৃশ্য পশ্চিমপ্রান্ত হইতে দেখিতেছি এবং অনুভব করিতেছি যে, একালের ইতিহাস ও সেকালের ইতিহাসের মধ্যে কী সুস্পষ্ট ব্যবধান।',
          'আমাদের যৌবনের প্রারম্ভে ইংরেজি সাহিত্যের উদার মানবিকতার বাণী আমাদের চিত্তকে গভীরভাবে স্পর্শ করিয়াছিল। শেক্সপিয়ার, মিল্টন ও বায়রনের কাব্যে আমরা মানবহৃদয়ের মুক্তির আকাঙ্ক্ষা দেখিয়াছিলাম।',
        ],
        paragraphsEn: [
          'Today I complete eighty years of my life. As I look back across the vast stretch of years that lie behind me, I see in clear perspective the distance between the dawn of my youth and the darkened horizon of our present world.',
          'When we were young, the noble voices of European literature—Shakespeare, Milton, and Byron—inspired in our minds a deep faith in universal human liberty and justice.',
        ],
      },
      {
        id: 'ss-ch-2',
        number: 2,
        titleBn: 'দ্বিতীয় পর্ব — সিভিলিজেশন ও ধর্মের আদর্শ',
        titleEn: 'Part II · The Concept of Civilization vs. Indian Dharma',
        durationSeconds: 320,
        durationFormatted: '05:20',
        narratorNote: 'Clear analytical cadence.',
        paragraphsBn: [
          'ইংরেজি "সিভিলিজেশন" শব্দের যথার্থ প্রতিশব্দ আমাদের ভাষায় পাওয়া সহজ নহে। আমাদের দেশে যাঁহারা মহামতি ছিলেন তাঁহারা "ধর্ম" শব্দের দ্বারা মানুষের সমাজ ও আচরণকে এক উচ্চতর নৈতিক সূত্রের সহিত যুক্ত করিয়াছিলেন।',
          'কিন্তু যন্ত্রশক্তির মত্ততায় যখন কেবল বাহ্যিক আধিপত্যকেই সভ্যতার মাপকাঠি ধরা হইল, তখন মানুষের অন্তরের শুভবুদ্ধি ক্রমশ কোণঠাসা হইয়া পড়িল।',
        ],
        paragraphsEn: [
          'It is no easy task to find an exact equivalent in our language for the modern European word "Civilization." In ancient India, the sages invoked the concept of Dharma—that ethical harmony which holds human society together in mutual duty and grace.',
          'Yet when mechanical power and imperial dominion came to be worshiped above moral conscience, the inner spirit of civilization began to wither.',
        ],
      },
      {
        id: 'ss-ch-3',
        number: 3,
        titleBn: 'তৃতীয় পর্ব — সাম্রাজ্যবাদের রূঢ় বাস্তব ও মোহভঙ্গ',
        titleEn: 'Part III · The Harsh Reality of Colonial Rule & Disillusionment',
        durationSeconds: 330,
        durationFormatted: '05:30',
        narratorNote: 'Somber, unflinching critique.',
        paragraphsBn: [
          'তখনো আমি ভারতবর্ষের সাধারণ মানুষের নিদারুণ দারিদ্র্য ও অশিক্ষার চিত্র সম্পূর্ণভাবে দেখিয়া উঠিতে পারি নাই। কিন্তু ক্রমে ক্রমে দেখিলাম—যাঁহারা নিজেদের সভ্য বলেন, তাঁহাদের শাসনে কোটি কোটি মানুষের অন্ন, বস্ত্র, স্বাস্থ্য ও শিক্ষার ন্যূনতম দাবিও উপেক্ষিত রহিয়াছে।',
          'মানুষে মানুষে যে সৌহার্দ্য ও সম্মানের সম্পর্ক থাকিবার কথা, শাসকের অহংকারে তাহা বিষাক্ত হইয়া উঠিল।',
        ],
        paragraphsEn: [
          'As I stepped out from literary seclusion into the villages of Bengal, the stark destitution of my countrymen broke upon my sight. Under a rule that boasted of modern enlightenment, hundreds of millions lacked the barest necessities of food, water, health, and education.',
          'Where fellowship should have flourished between East and West, the arrogance of imperial mastery erected walls of humiliation.',
        ],
      },
      {
        id: 'ss-ch-4',
        number: 4,
        titleBn: 'চতুর্থ পর্ব — ভাগ্যচক্রের পরিবর্তন ও বিশ্বযুদ্ধের ছায়া',
        titleEn: 'Part IV · The Turning Wheel of Fate',
        durationSeconds: 315,
        durationFormatted: '05:15',
        narratorNote: 'Prophetic gravity.',
        paragraphsBn: [
          'ভাগ্যচক্রের পরিবর্তনের দ্বারা একদিন না একদিন ইংরেজকে এই ভারতসাম্রাজ্য ত্যাগ করিয়া যাইতে হইবে। কিন্তু কোন ভারতবর্ষকে সে পিছনে ত্যাগ করিয়া যাইবে? কী লক্ষ্মীছাড়া দীনতার আবর্জনা!',
          'ইউরোপের প্রান্তে প্রান্তে আজ যে মহাযুদ্ধের ধ্বংসলীলা শুরু হইয়াছে, তাহা লোভ ও ক্ষমতার উন্মত্ততারই চরম পরিণতি।',
        ],
        paragraphsEn: [
          'The wheels of Fate will some day compel the British Empire to give up its Indian domain. Reference to history will then ask what legacy of poverty and division was left behind after centuries of rule.',
          'Across Europe and Asia today, the conflagration of war reveals the tragic bankruptcy of politics divorced from human compassion.',
        ],
      },
      {
        id: 'ss-ch-5',
        number: 5,
        titleBn: 'পঞ্চম পর্ব — মানুষের প্রতি বিশ্বাস হারানো পাপ',
        titleEn: 'Part V · To Lose Faith in Humanity Is a Sin: Dawn from the East',
        durationSeconds: 350,
        durationFormatted: '05:50',
        narratorNote: 'Resonant, immortal closing affirmation.',
        paragraphsBn: [
          'আজ বিদায়ের দিনে তবু আমি মানুষের প্রতি বিশ্বাস হারানো পাপ মনে করি। আমি আশাপথ চাহিয়া থাকিব—মহাপ্রলয়ের পরে বৈরাগ্যের মেঘমুক্ত আকাশে ইতিহাসের একটি নির্মল আত্মপ্রকাশ হয়ত আরম্ভ হইবে এই পূর্বাচলের সূর্যোদয়ের দিগন্ত থেকে।',
          'আর-একদিন অপরাজিত মানুষ নিজের জয়যাত্রার অভিযানে সকল বাধা অতিক্রম করিয়া অগ্রসর হইবে তার মহৎ মর্যাদা ফিরে পাবার পথে। মনুষ্যত্বের অন্তহীন প্রতীক্ষার কেহ বিনাশ করিতে পারিবে না।',
        ],
        paragraphsEn: [
          'Even so, as I prepare to take my leave of this world, I shall not commit the grievous sin of losing faith in Man. I would rather look forward to the opening of a new chapter in human history after the cataclysm is over and the atmosphere rendered clean with the spirit of service and sacrifice.',
          'Perhaps that dawn will come from this horizon, from the East where the sun rises. A day will come when unvanquished Man will retrace his path of conquest, sweeping away all barriers to win back his lost human heritage.',
        ],
      },
    ],
  },
];
