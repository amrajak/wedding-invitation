# Akanksha & Vikash — Bilingual wedding invitation

A compact four-theme wedding invitation with a separate Bollywood Night lookbook, now in **English and Hindi**.

## One-tap language switch

The **English / हिन्दी** switch in the top header works on both `index.html` and `bollywood.html`. Guests can change languages without a page reload. The site remembers their preference where browser storage is available and passes the selected language in links to the Bollywood page. It defaults to English.

Content translated: headings, 4 cards, dates, descriptions, colour themes, expanded details, wedding venue, buttons, RSVP form, WhatsApp message wording, Bollywood page, costume inspiration categories, Pinterest captions and fallback instructions. Image artwork that contains baked-in lettering is not translated automatically.

## Edit text without touching HTML

- **`content-config.js`** — English text, including event times and RSVP interface labels.
- **`hindi-config.js`** — Hindi text, in the same structure. You can edit Hindi event descriptions and text here.
- **`theme-config.js`** — colours, gradients and swatches for the four themes.
- **`image-config.js`** — image filenames, Pinterest board URL, and optional local image gallery.

Make sure both English and Hindi event descriptions are updated if you change any date or time. Keep the `events` keys `mata`, `haldi`, `sangeet`, `wedding` in both language files.

## Change your existing card images

Copy your PNG, JPEG, WebP or SVG into `assets/`, then change ONLY the relevant filename in `image-config.js`.

**Important:** If you have already replaced artwork in your existing GitHub Pages website, use the `Bilingual_Update_Only.zip` rather than the full website ZIP. This preserves your existing `assets/`, `image-config.js`, and `theme-config.js`. The update does replace `content-config.js`, so copy over any custom wording you've edited into the new English config. Add or edit the Hindi equivalents in `hindi-config.js`.

## Wedding image decision

The combined **Varmala & Pheras** card now uses `imageKey: 'pheras'`, showing the Pheras artwork on both the card and its detail popup. There is no second image in the popup. To use a different image, change `pheras` in `image-config.js`.

## Dress code

The four cards retain their requested **visual colour themes**, but the wedding card's suggested attire is *any colour of traditional Indian wear*, not a prescribed red/gold dress code.

## Publish with GitHub Pages

Upload `index.html`, `bollywood.html`, `styles.css`, `script.js`, `image-config.js`, `theme-config.js`, `content-config.js`, `hindi-config.js`, and your `assets/` directory to the site root. GitHub → Settings → Pages → Deploy from main branch, root. Confirm the new `hindi-config.js` has been uploaded; otherwise Hindi text won't appear.

## RSVP / Pinterest

RSVP opens a WhatsApp draft that guests send themselves. No guest responses are stored on this website. The Pinterest board preview may be blocked by browsers or privacy tools; the direct board link remains available.

## Before sharing

Confirm the still-unknown Haldi, Mehendi/Sangeet and wedding ceremony timings. Also confirm the proposed Vidai date of 13 December 2026. Dates are not inferred in this website.
