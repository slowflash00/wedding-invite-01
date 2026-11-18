/**
 * wedding-invitation / js/config.js
 * ─────────────────────────────────
 * Single source of truth for all client-specific wedding information.
 * To reuse this template for a new client, duplicate the project folder,
 * update ONLY this file, swap the photos in /assets/images/, and redeploy.
 */

const weddingConfig = {

  /* ── COUPLE ─────────────────────────────────────────────────────────── */
  couple: {
    groom:     'Vishal',
    bride:     'Shruti',
    monogram:  'V & S',
    hashtag:   '#VishalAndShruti',
    tagline:   'Two souls, seven promises, a lifetime of love.',
  },

  /* ── FAMILY ──────────────────────────────────────────────────────────── */
  family: {
    groomParents: ['Mr Chaman Agarwal', 'Mrs Kavita Agarwal'],
    brideParents:  ['Mr Vijay Pareek',   'Mrs Sudha Pareek'],
  },

  /* ── WEDDING DATES ───────────────────────────────────────────────────── */
  wedding: {
    // ISO 8601 strings — always include the IST (+05:30) offset
    startDate:          '2026-11-25T11:00:00+05:30',
    endDate:            '2026-11-26T22:00:00+05:30',
    // Countdown target — the main ceremony
    countdownTarget:    '2026-11-26T20:00:00+05:30',
    countdownLabel:     'Counting down to Varmala & Reception',
    postWeddingMessage: 'Our forever has begun ♡',
    timezone:           'Asia/Kolkata',
    displayDates:       '25 & 26 November 2026',
    displayLocation:    'The Heritage Resorts',
  },

  /* ── INVITATION TEXT ─────────────────────────────────────────────────── */
  invitation: {
    blessing:  'With the blessings of Lord Ganesha,',
    prelude:   'and our families, our forever begins.',
    letterBody: [
      'As we prepare to take our seven sacred steps, we\'re filled with gratitude for the love and blessings that have brought us together.',
      'With the blessings of our families, we begin a beautiful new chapter. We would be honoured to have you by our side as we begin our forever together.',
    ],
    closingMessage: [
      'As we step into this beautiful new chapter, having you be a part of our journey would make our happiness even more special.',
      'We look forward to celebrating these special days surrounded by your love, laughter, and blessings. Until then, save us a little space in your hearts as we get ready to begin our forever together.',
    ],
  },

  /* ── EVENTS ──────────────────────────────────────────────────────────── */
  events: [
    {
      day:        1,
      chapter:    'I / COLOUR, BLESSINGS & MUSIC',
      eyebrow:    'DAY ONE · THE FESTIVITIES',
      heading:    'Painted in joy',
      mood:       'A little haldi. A little music. A whole lot of love.',
      date:       '2026-11-25',
      displayDate:'25',
      month:      'November 2026',
      weekday:    'Wednesday',
      theme:      'day-one',           // CSS modifier class
      canopyImage:'assets/decorations/marigold-canopy.webp',
      illustration:'assets/decorations/haldi-sangeet.webp',
      illustrationClass: 'haldi-illustration',
      venueNote:  'The Heritage Resorts',
      venueSmall: 'All functions · Indian Standard Time',
      functions: [
        { time: '11:00 AM', datetime: '2026-11-25T11:00:00+05:30', name: 'Haldi',   desc: 'A golden beginning' },
        { time:  '5:00 PM', datetime: '2026-11-25T17:00:00+05:30', name: 'Tilak',   desc: 'Blessings & togetherness' },
        { time:  '6:00 PM', datetime: '2026-11-25T18:00:00+05:30', name: 'Sangeet', desc: 'An evening of music & joy' },
      ],
    },
    {
      day:        2,
      chapter:    'II / TWO HEARTS, ONE FOREVER',
      eyebrow:    'DAY TWO · THE WEDDING',
      heading:    'Written in forever',
      mood:       'Vishal & Shruti · A beautiful new beginning',
      date:       '2026-11-26',
      displayDate:'26',
      month:      'November 2026',
      weekday:    'Thursday',
      theme:      'day-two',
      canopyImage: null,
      illustration:'assets/decorations/wedding-pavilion.webp',
      illustrationClass: 'pavilion-illustration',
      venueNote:  'The Heritage Resorts',
      venueSmall: 'All functions · Indian Standard Time',
      functions: [
        { time: '11:00 AM', datetime: '2026-11-26T11:00:00+05:30', name: 'Bhaat',              desc: 'Family, love & tradition' },
        { time:  '6:00 PM', datetime: '2026-11-26T18:00:00+05:30', name: 'Baraat',             desc: 'A joyful arrival' },
        { time:  '8:00 PM', datetime: '2026-11-26T20:00:00+05:30', name: 'Varmala / Reception',desc: 'A beautiful new beginning' },
      ],
    },
  ],

  /* ── VENUE ───────────────────────────────────────────────────────────── */
  venue: {
    name:       'The Heritage Resorts',
    tagline:    'All wedding functions',
    dates:      '25 & 26 November 2026',
    timeNote:   'All times in Indian Standard Time',
    googleMapsUrl: 'https://maps.app.goo.gl/bz9tVzKgxBnj9hNn7?g_st=iw',
  },

  /* ── GALLERY ─────────────────────────────────────────────────────────── */
  gallery: [
    {
      thumb:   'assets/images/celebration-card.webp',
      full:    'assets/images/celebration-card.webp',
      alt:     'Vishal and Shruti seated together beneath colourful flowers and umbrellas',
      caption: 'A beautiful beginning',
    },
    // Add more photos here — each object follows the same shape
  ],

  /* ── SCRATCH DATE ────────────────────────────────────────────────────── */
  scratchDate: {
    day:   '25–26',
    month: 'November',
    year:  '2026',
    dayLabel:   'DAYS',
    monthLabel: 'MONTH',
    yearLabel:  'YEAR',
  },

  /* ── THEME ───────────────────────────────────────────────────────────── */
  theme: {
    primary:    '#6c2e31',   // --burgundy
    dark:       '#4e181a',   // --burgundy-dark
    muted:      '#775052',   // --muted
    rose:       '#9a5d58',   // --rose
    gold:       '#a47b41',   // --gold
    paper:      '#fcf5ec',   // --paper
    letterPaper:'#fff9ef',   // --letter-paper
  },

  /* ── MEDIA ───────────────────────────────────────────────────────────── */
  media: {
    waxSeal:          'assets/stationery/blank-wax-seal.webp',
    embossedEnvelope: 'assets/stationery/embossed-envelope.webp',
    palaceHero:       'assets/images/palace-hero.webp',
    embossedPaper:    'assets/stationery/embossed-paper.webp',
    laceTrim:         'assets/stationery/ivory-lace-trim.webp',
    backgroundMusic:  'assets/audio/wedding-music.mp3',
    ogImage:          'assets/social/whatsapp-preview-v1.jpg',
  },

  /* ── SEO / META ──────────────────────────────────────────────────────── */
  seo: {
    siteUrl:      'https://vishalandshruti.pages.dev/',
    title:        'Vishal & Shruti — A Little Invitation to Forever',
    description:  'Celebrate Vishal & Shruti: two days of wedding celebrations on 25 & 26 November 2026 at The Heritage Resorts.',
    ogDescription:'Join us for two days of wedding celebrations on 25 & 26 November 2026 at The Heritage Resorts.',
    ogImageAlt:   "Vishal and Shruti's wedding invitation: 25 and 26 November 2026 at The Heritage Resorts, framed by a floral palace arch.",
  },

  /* ── RSVP (WhatsApp-based) ───────────────────────────────────────────── */
  rsvp: {
    enabled: false,              // set true once phone is confirmed
    whatsappNumber: '',          // e.g. '919876543210'
    messageTemplate: (groom, bride, date) =>
      `Hi! I confirm my attendance at ${groom} & ${bride}'s wedding on ${date}. Please count me in!`,
  },

  /* ── OPTIONAL FEATURES ───────────────────────────────────────────────── */
  features: {
    countdown:        true,
    scratchReveal:    true,
    gallery:          true,
    backgroundMusic:  true,
    fallingPetals:    true,
    heroPetals:       true,
    calendarDownload: true,
    whatsappShare:    true,
    rsvp:             false,
  },

};

// Freeze to prevent accidental mutation
Object.freeze(weddingConfig);
