/**
 * wedding-invitation / js/config.js
 * ─────────────────────────────────
 * Single source of truth for all client-specific wedding information.
 * To reuse this template for a new client, duplicate the project folder,
 * update ONLY this file, swap the photos in /assets/images/, and redeploy.
 */

const weddingConfig = {

  /* ── PREVIEW PROTECTION ──────────────────────────────────────────────── */
  preview: {
    enabled: true,
    expiresAt: '2026-12-05T23:59:59+05:30',
    contactWhatsApp: '919876543210',
  },

  /* ── COUPLE ─────────────────────────────────────────────────────────── */
  couple: {
    bride:     'Ritika',
    groom:     'Kartavya',
    monogram:  'R & K',
    hashtag:   '#RitikaAndKartavya',
    tagline:   'Two souls, seven promises, a lifetime of love.',
  },

  /* ── FAMILY ──────────────────────────────────────────────────────────── */
  family: {
    brideParents:  ['Mr Rajesh Mathur', 'Mrs Pramila Mathur'],
    groomParents:  ['Mr Sunil Kumar Loonia', 'Lt. Kanta Devi Loonia'],
  },

  /* ── WEDDING DATES ───────────────────────────────────────────────────── */
  wedding: {
    // ISO 8601 strings — always include the IST (+05:30) offset
    startDate:          '2026-12-19T11:00:00+05:30',
    endDate:            '2026-12-20T23:59:00+05:30',
    // Countdown target — the main ceremony (Anant Saath / Phere at midnight)
    countdownTarget:    '2026-12-20T00:00:00+05:30',
    countdownLabel:     'Countdown to always and forever',
    postWeddingMessage: 'Our forever has begun ♡',
    timezone:           'Asia/Kolkata',
    displayDates:       '19 & 20 December 2026',
    displayLocation:    'Ridhi Resorts, Near Patrakar Colony, Mansarovar Extension',
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
      chapter:    'I / KESARI RANG & MUSIC',
      eyebrow:    'DAY ONE · THE FESTIVITIES',
      heading:    'Painted in joy',
      mood:       'A little haldi. A little music. A whole lot of love.',
      date:       '2026-12-19',
      displayDate:'19',
      month:      'December 2026',
      weekday:    'Saturday',
      theme:      'day-one',
      canopyImage:'assets/decorations/marigold-canopy.webp',
      illustration:'assets/decorations/haldi-sangeet.webp',
      illustrationClass: 'haldi-illustration',
      venueNote:  'Ridhi Resorts, Near Patrakar Colony, Mansarovar Extension',
      venueSmall: 'All functions · Indian Standard Time',
      functions: [
        { time: '11:00 AM', datetime: '2026-12-19T11:00:00+05:30', name: 'Kesari Rang',          desc: 'A golden beginning' },
        { time:  '7:00 PM', datetime: '2026-12-19T19:00:00+05:30', name: 'Ring Ceremony',         desc: 'Blessings & togetherness' },
        { time:  '7:30 PM', datetime: '2026-12-19T19:30:00+05:30', name: 'Shaam Shaandaar',       desc: 'Sangeet · An evening of music & joy' },
      ],
    },
    {
      day:        2,
      chapter:    'II / TWO HEARTS, ONE FOREVER',
      eyebrow:    'DAY TWO · THE WEDDING',
      heading:    'Written in forever',
      mood:       'Ritika & Kartavya · A beautiful new beginning',
      date:       '2026-12-20',
      displayDate:'20',
      month:      'December 2026',
      weekday:    'Sunday',
      theme:      'day-two',
      canopyImage: null,
      illustration:'assets/decorations/wedding-pavilion.webp',
      illustrationClass: 'pavilion-illustration',
      venueNote:  'Ridhi Resorts, Near Patrakar Colony, Mansarovar Extension',
      venueSmall: 'All functions · Indian Standard Time',
      functions: [
        { time: '11:00 AM', datetime: '2026-12-20T11:00:00+05:30', name: 'Mamera - ri - chunari', desc: 'Followed by lunch · Family, love & tradition' },
        { time:  '7:00 PM', datetime: '2026-12-20T19:00:00+05:30', name: 'Baarat Aagman',         desc: 'A joyful arrival' },
        { time: 'Midnight', datetime: '2026-12-20T23:59:00+05:30', name: 'Anant Saath',           desc: 'Phere · Our forever begins' },
      ],
    },
  ],

  /* ── VENUE ───────────────────────────────────────────────────────────── */
  venue: {
    name:       'Ridhi Resorts',
    address:    'Near Patrakar Colony, Mansarovar Extension, Muhana, Jaipur, Rajasthan 302026',
    tagline:    'All wedding functions',
    dates:      '19 & 20 December 2026',
    timeNote:   'All times in Indian Standard Time',
    googleMapsUrl: 'https://maps.google.com/?cid=1623322179639550080',
  },

  /* ── GALLERY ─────────────────────────────────────────────────────────── */
  gallery: [
    {
      thumb:   'assets/images/couple-image.webp',
      full:    'assets/images/couple-image.webp',
      alt:     'Ritika and Kartavya — a beautiful beginning',
      caption: 'A beautiful beginning',
    },
    // Add more photos here — each object follows the same shape
  ],

  /* ── SCRATCH DATE ────────────────────────────────────────────────────── */
  scratchDate: {
    day:   '19–20',
    month: 'December',
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
    siteUrl:      'https://your-deployment-url.pages.dev/',
    title:        'Ritika & Kartavya — A Little Invitation to Forever',
    description:  'Celebrate Ritika & Kartavya: two days of wedding celebrations on 19 & 20 December 2026 at Ridhi Resorts, Mansarovar Extension.',
    ogDescription:'Join us for two days of wedding celebrations on 19 & 20 December 2026 at Ridhi Resorts, Mansarovar Extension.',
    ogImageAlt:   "Ritika and Kartavya's wedding invitation: 19 and 20 December 2026 at Ridhi Resorts, Mansarovar Extension, framed by a floral palace arch.",
  },

  /* ── RSVP (WhatsApp-based) ───────────────────────────────────────────── */
  rsvp: {
    enabled: false,              // set true once phone is confirmed
    whatsappNumber: '',          // e.g. '919876543210'
    messageTemplate: (groom, bride, date) =>
      `Hi! I confirm my attendance at ${bride} & ${groom}'s wedding on ${date}. Please count me in!`,
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
