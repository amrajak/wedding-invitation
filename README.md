# Akanksha & Vikash — Four-Theme Wedding Invitation

A compact two-by-two wedding invitation focused on ceremony **colours, symbolism and aesthetic**. Bollywood Night has its own page, accessible from an unmistakable button inside the green Mehendi & Sangeet card (and from the top menu).

## To edit the website, change ONLY these three files

| File | What you can edit |
| --- | --- |
| **image-config.js** | Image filenames and Pinterest board URL. Use PNG, JPG/JPEG, WebP, SVG. Put images in `assets/`. |
| **theme-config.js** | Every card's background gradient, text colour, heading colour, accent and colour swatches. |
| **content-config.js** | Couple's names, dates, all four card headings, stories, dress code, function description, Bollywood page text, venue, directions link, RSVP message and labels. |

No HTML or CSS edits required for regular changes.

### Example: make the Mata Pujan card more coral pink

Open `theme-config.js`, then edit:

```js
mata: {
  background: '#FFDDE5',
  background2: '#F9B9C6',
  heading: '#852F49',
  text: '#633C4A',
  accent: '#C34E72',
  palette: ['#EF96B7', '#E86D61', '#F5A243']
}
```

### Example: change the Haldi card's wording

Open `content-config.js` > `events` > `haldi` and edit:

```js
title: 'Haldi',
description: 'A joyful splash of yellow before a beautiful new chapter.',
dress: 'THE COLOUR STORY · YELLOW, WHITE & GOLD',
```

### Example: replace the wedding picture

Copy `new-wedding-photo.jpeg` into `assets/`. In `image-config.js`:

```js
varmala: 'new-wedding-photo.jpeg',
```

The wedding card will show your new image. The expanded popup also has an optional second Pheras picture controlled via `phere-vidai.webp` (key `pheras`).

## Wedding structure

- Mata Pujan — pink / coral / orange (10 Dec, 10:00 AM)
- Haldi — yellow / ivory (11 Dec)
- Mehendi & Sangeet — green / sage (11 Dec); prominent Bollywood Night page link
- Varmala & Pheras — red / gold (12–13 Dec), including Bhoj and Vidai

The exact times of Haldi, Mehendi, Sangeet, Varmala, and Pheras are left unconfirmed in the copy intentionally. Confirm before sending.

## Pinterest

`image-config.js` contains your public Pinterest URL. The Bollywood page loads Pinterest's official board embed automatically. Some browsers and privacy blockers may hide it. To guarantee a visible mini-gallery, add images you own or may republish to `assets/` and list their filenames in `WEDDING_BOLLYWOOD_LOOKBOOK`.

## GitHub Pages publishing

1. Unzip the folder.
2. Upload **all files, including assets/**, to the root of your GitHub repository.
3. Enable Pages from the main branch/root directory.
4. Open the public GitHub Pages URL; test on a phone and a logged-out browser.

## RSVP privacy

The website does not store guest data. It prepares a WhatsApp draft that each guest chooses to send. The calendar button downloads a dates-only `.ics` reminder.

## Note on hosting

Opening local files directly should work for most functions. Internet access is required for the Google fonts, maps, and official Pinterest embed. For the full experience, publish via GitHub Pages.
