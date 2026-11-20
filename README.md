# Vishal & Shruti — Wedding Invitation

A premium, interactive Indian wedding invitation website.

Built with vanilla HTML5, CSS3 and JavaScript — no framework, no build step, no backend.

---

## Quick start

Open `index.html` in any modern browser. No server required for local preview.
For local development with correct font loading, serve from a local HTTP server:

```bash
# Python
python -m http.server 8080

# Node (if available)
npx serve .
```

Then open: http://localhost:8080

---

## Project structure

```
wedding-invitation/
  index.html          Main page
  css/
    base.css          Reset, variables, typography, common UI
    opening.css       Envelope scene and animations
    hero.css          Hero section, petal shower
    sections.css      Date, letter, venue, closing
    events.css        Celebration chapters (day one / day two)
    gallery.css       Photo gallery and lightbox dialog
    animations.css    Scroll reveals, petal burst, music toggle
    responsive.css    Breakpoints and reduced-motion
  js/
    config.js         ★ ALL client information lives here
    utils.js          Shared helper functions
    opening.js        InvitationOpening class (Web Animations API)
    countdown.js      Scratch cards, countdown timer, .ics export
    animations.js     Scroll reveals, letter scroll, hero petals
    gallery.js        Gallery lightbox with swipe + keyboard nav
    music.js          Background music toggle
    main.js           Lifecycle coordinator
  assets/
    images/           Couple photographs
    decorations/      Event illustrations and canopy images
    stationery/       Wax seal and envelope artwork
    fonts/            Self-hosted fonts (optional — CDN used by default)
    audio/            Background music (wedding-music.mp3)
    social/           WhatsApp preview image (1200×1200 JPG)
```

---

## Customising for a new client

**All client information is in one place: `js/config.js`.**

### 1. Update couple information

```js
couple: {
  groom:    'Rahul',
  bride:    'Priya',
  monogram: 'R & P',
  hashtag:  '#RahulAndPriya',
  tagline:  'Two hearts, one beautiful journey.',
},
```

### 2. Update family information

```js
family: {
  groomParents: ['Mr Suresh Sharma', 'Mrs Meena Sharma'],
  brideParents:  ['Mr Arvind Gupta',  'Mrs Sunita Gupta'],
},
```

### 3. Update wedding dates

```js
wedding: {
  startDate:       '2027-02-14T10:00:00+05:30',
  endDate:         '2027-02-15T22:00:00+05:30',
  countdownTarget: '2027-02-15T19:00:00+05:30',
  displayDates:    '14 & 15 February 2027',
  displayLocation: 'The Grand Pavilion',
},
```

### 4. Update events

Add, remove or reorder functions inside `config.events`. Each day is an object in the array; each function is an item inside `day.functions`.

### 5. Update the venue

```js
venue: {
  name:          'The Grand Pavilion',
  googleMapsUrl: 'https://maps.app.goo.gl/YOUR_LINK_HERE',
},
```

### 6. Replace couple photographs

Drop images into `assets/images/` and update `config.gallery`:

```js
gallery: [
  { thumb: 'assets/images/photo-1.webp', full: 'assets/images/photo-1-full.webp',
    alt: 'Rahul and Priya', caption: 'Our first photograph together' },
  { thumb: 'assets/images/photo-2.webp', full: 'assets/images/photo-2-full.webp',
    alt: 'At the engagement', caption: 'A day to remember' },
],
```

Then update the matching `<li class="gallery-slide">` entries in `index.html`.

**Image recommendations:**
- Thumbs: 960×1280 px, WebP format, < 400 KB
- Full-size: 1920×2560 px, WebP format, < 1.5 MB

### 7. Add background music

Place an MP3 at `assets/audio/wedding-music.mp3`.
Update the path in config if different:
```js
media: { backgroundMusic: 'assets/audio/your-song.mp3' }
```

### 8. Change colours

Edit the CSS custom properties in `css/base.css` `:root` block:

```css
:root {
  --burgundy:      #6c2e31;   /* primary brand colour */
  --gold:          #a47b41;   /* accents, monogram */
  --paper:         #fcf5ec;   /* invitation background */
  --muted:         #775052;   /* body text */
}
```

### 9. Enable/disable features

```js
features: {
  countdown:        true,
  scratchReveal:    true,
  gallery:          true,
  backgroundMusic:  true,
  fallingPetals:    true,
  calendarDownload: true,
  whatsappShare:    true,
  rsvp:             false,   // enable when client provides WhatsApp number
}
```

### 10. Add the hero background image

When you have the palace/venue photograph:
1. Place it at `assets/images/palace-hero.webp`
2. In `css/hero.css`, uncomment the `.hero-art` background rule with the image URL
3. In `css/opening.css`, update `.opening-destination` similarly

---

## Deployment

### Cloudflare Pages (recommended)

1. Push the `wedding-invitation/` folder to a GitHub repository
2. Log in to Cloudflare Pages → Create a project
3. Connect the repository
4. Set build command: *(leave empty — no build)*
5. Set output directory: `/` or `wedding-invitation/`
6. Deploy

### Netlify

1. Drag and drop the `wedding-invitation/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop)
2. Or connect a GitHub repo with no build command and publish directory `/`

### GitHub Pages

Enable Pages for the repository and select the `main` branch root.

---

## Build & Preview Protection System

This project includes a built-in build system (`build.js`) that allows you to show prospective clients a protected, watermarked sample without compromising the final paid design.

### Commands

| Command | Output Folder | Description |
|---|---|---|
| `node build.js preview` | `dist-preview/` | Generates a watermarked sample with degraded images, preview audio, closed shadow DOM overlay, and tamper resistance |
| `node build.js final` | `dist/` | Generates a clean, pristine paid client release with full-resolution assets and zero watermarks |

### Preview Mode Features (`dist-preview/`)
- **Closed Shadow DOM Overlay:** Renders a diagonal repeating watermark pattern ("SAMPLE - ShubhInvite") and centered badge. With `pointer-events: none`, the guest experience remains smooth, interactive, and scrollable.
- **Tamper Resistance:** MutationObserver and 2-second heartbeat checks verify the host element and computed styles. Deleting or hiding the overlay restores it immediately; 3 tamper attempts triggers a royal theme lock screen with a WhatsApp inquiry link.
- **Degraded & Stamped Assets:** Images are downscaled to $\le 800\text{px}$, quality reduced to 58, and permanently stamped with a diagonal tiled "SAMPLE" watermark into the pixel data.
- **Audio Clip:** Background music is trimmed to a 25-second, 48kbps preview clip.
- **Light Deterrents:** Disables context menu, image dragging, text selection, and common inspection keyboard shortcuts; adds a sample footer attribution line.
- **Expiry & No-Index:** Replaces preview with an expiry notice when past `preview.expiresAt` in `config.js`; injects `<meta name="robots" content="noindex, nofollow">` and `robots.txt` (`Disallow: /`).

### Final Mode Features (`dist/`)
- **Completely Unwatermarked:** `preview-guard.js`, watermark overlay, and deterrent CSS are completely omitted.
- **Full Resolution:** All original couple photographs, illustrations, and complete 3.29 MB audio are preserved at 100% quality.
- **Minified:** Minifies all CSS and JS files for fast static deployment.

---

## Assets Status

| File | Status | Notes |
|------|--------|-------|
| `assets/stationery/embossed-envelope.webp` | ✅ Active | Real photographed embossed envelope folds (opening & letter) |
| `assets/stationery/blank-wax-seal.webp` | ✅ Active | Real 3D wax seal with gold monogram |
| `assets/images/palace-hero.webp` | ✅ Active | High-res palace courtyard hero background & venue art |
| `assets/stationery/embossed-paper.webp` | ✅ Active | Luxury textured paper background overlay (Date & Closing) |
| `assets/stationery/ivory-lace-trim.webp` | ✅ Active | Delicate lace trim overlay on letter envelope |
| `assets/audio/wedding-music.mp3` | ✅ Active | High-quality background soundtrack with gesture autoplay & toggle |
| `assets/decorations/haldi-sangeet.webp` | ✅ Active | Day One Haldi & Sangeet illustration |
| `assets/decorations/marigold-canopy.webp` | ✅ Active | Day One canopy floral artwork |
| `assets/decorations/wedding-pavilion.webp` | ✅ Active | Day Two royal mandap / pavilion illustration |
| `assets/images/celebration-card.webp` | ✅ Active | Couple celebration portrait |
| `assets/florals/ivory-rose-petal.webp` | ⚪ Optional | CSS petal particle shower active |
| `assets/social/whatsapp-preview-v1.jpg` | ⚪ Optional | 1200×1200 JPG for WhatsApp / social preview |

---

## Browser support

Chrome 90+, Safari 14+, Firefox 88+, Edge 90+.
All interactions degrade gracefully with JavaScript disabled (noscript fallback visible).
Reduced motion respected everywhere.

---

## Reusing for future clients

1. Duplicate the entire `wedding-invitation/` folder
2. Rename it (e.g. `rahul-priya-invitation/`)
3. Update `js/config.js` only
4. Swap photographs in `assets/images/`
5. Deploy the new folder

The core code never needs to change between clients.
