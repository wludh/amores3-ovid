# Amores Website Documentation

Welcome to the documentation for the Amores website. This guide is intended for content editors and explains how to update the text and data on the site.

## Project Structure Overview

The most important directory for content editing is `docs/data/`. This is where all the text for the website is stored.

## How the Website Works: A Brief Overview

This section provides a simplified overview of how the website is built for those who are curious. You do not need to edit any of these files to change the content of the companion texts.

*   `docs/`: This is the main folder for the website. All the files that the website uses are in here.
*   `index.html`: This is the main file for the homepage of the website. It's the first page that loads. Other HTML files like `about.html` and `editions.html` are for those specific pages.
*   `docs/css/styles.css`: This is the stylesheet. It controls the colors, fonts, and layout of the website.
*   `docs/js/`: This folder contains the JavaScript files, which add interactivity to the site.
    *   `script.js`: This is the main script that runs the interactive features on the pages.
    *   `data.js`: This script is responsible for loading all the companion text data (the JSON files) and the witness text data (the XML files).
    *   `CETEI.js`: This is a special library used to make the XML manuscript files display correctly in a web browser.

Again, for editing content, you will only need to work in the `docs/data/` directory.

## Editing Companion Text

The "companion text" for each poem is located in the `docs/data/Companion/` directory. This directory contains three subdirectories for different types of companion text:

*   `docs/data/Companion/Commentary/`: Contains commentary for each poem.
*   `docs/data/Companion/TextCommentary/`: Contains commentary on the Latin text itself.
*   `docs/data/Companion/Vocab/`: Contains vocabulary lists for each poem.

Each of these directories contains a set of JSON files, one for each poem (e.g., `3.1.json`, `3.2.json`, etc.).

The Companion's vocabulary slider controls **how many words receive help**, always with full definitions. The default, **DCC 1000 excluded**, shows the available noncore glossary words. Move left for fewer noncore words, or right to add core words from less common to most common using Dickinson College Commentaries' published frequency ranks. Repeated headwords are selected together. DCC provides no ranks for noncore words, which enter in their order of appearance below the default.

Companion shows the vocabulary and commentary by line number, without repeating the transcription. Choose **Text & notes** from any panel's type dropdown for the separate reading view: the selected witness's text appears line by line with vocabulary and commentary beneath it. Both note types start enabled in that view and can be toggled independently; turning both off leaves the witness text. Each view remembers its own note selection.

The selected witness's TEI supplies the lexical context, including spellings, abbreviations and uncertainty. Existing poem glosses and added DCC matches pass through a contextual review for that witness and verse. The review corrects wrong lemmas and definitions, resolves supported homographs, and suppresses unsupported matches. Original glossary files remain unchanged; the corrections and quoted evidence live in `docs/data/vocabulary-review/`. Absent lines, damaged or abbreviated words, and unmatched forms receive no automatic dictionary definition. “All words” means all supported, reviewed entries, not every word in the poems.

Search ignores accents and case. **Export** downloads the entries currently shown, respecting the witness, amount, and search, as UTF-8 tab-separated text with a headword and full definition on each row. Identical cards are included once. In [Anki](https://docs.ankiweb.net/importing/text-files.html), import the file with Tab as the separator and the two fields as Front/Back. In [Quizlet](https://help.quizlet.com/hc/en-us/articles/360029977151-Creating-sets-by-importing-content), paste the file contents into Import and choose tabs between terms/definitions and new lines between cards. The Settings button minimizes the controls while leaving the word count and Export available. Help amount, witness, and search are remembered separately for each panel while switching panel modes. Changes to a glossary, witness text, or dictionary input invalidate the vocabulary review for that input; the browser checks its SHA-256 binding before displaying entries. Review the changed evidence before updating the binding. Rebuild the derived form lookup when new forms need recognition; see [vocabulary sources and regeneration](docs/data/vocabulary-sources.md). No external dictionary service runs in the reader's browser.

DCC's current export has 997 entries, retaining the established “DCC 1000” label. Its definitions, ranks, attribution, and CC BY-SA 3.0 license are included in `docs/data/latin-frequency.json`. The witness XML, review seals, and annotation rectangles are unchanged by this feature.

### What is a JSON file?

A JSON file is a simple text file used to store data. It uses a `key: value` format. For this project, the "key" is a line number (as a string in double quotes), and the "value" is the text that should appear for that line.

Here is an example from `docs/data/Companion/Vocab/3.15.json`:

```json
{
  "2": "rādō, rādere, rāsī, rāsum: to scrape, shave, scratch, to rub\\npl, elegōrum: elegiac verses\\nulter, ultra, ultrum: that is beyond\\nmēta, mētae f.: cone, pyramid, turning point, winning post ( pillar at each end of the Circus route",
  "3": "alumnus, alumna, alumnum: nourished, fostered, etc"
}
```

In this example:
*   `"2":` is the key (representing line 2).
*   The long string of text following it is the value associated with line 2.

### How to edit the JSON files

1.  Navigate to the correct directory (e.g., `docs/data/Companion/Commentary/`).
2.  Open the JSON file corresponding to the poem you want to edit (e.g., `3.1.json` for poem 3.1).
3.  Find the line number (the key) you want to change.
4.  Edit the text (the value) inside the double quotes.
5.  Save the file. Commentary changes appear after reloading the page. Vocabulary changes require a renewed contextual review, as described above, before they can appear.

**Important Notes:**
*   Be careful not to delete the double quotes `"` around the line numbers (keys) and the text (values).
*   Each entry is separated by a comma `,`, except for the very last one in the file.
*   The entire file is wrapped in curly braces `{}`.

## Editing Witness XML Files

The witness XML files contain the base texts for the different manuscript witnesses (P, S, and Y). These files are located directly in the `docs/data/` directory.

The files are:
*   `docs/data/witness-P.xml`
*   `docs/data/witness-S.xml`
*   `docs/data/witness-Y.xml`

### What is an XML file?

XML is a markup language that uses tags to describe data. It looks similar to HTML. The text of the poem is contained within these tags.

### How to edit the XML files

1.  Navigate to the `docs/data/` directory.
2.  Open the XML file you want to edit (e.g., `witness-P.xml`).
3.  The text is structured within XML tags like `<l>` (for a line) and `<w>` (for a word). You can edit the text content that appears between these tags.
4.  Save the file. The changes will be reflected on the website.

## Updating IIIF Manifests


### W — Wetstein 1751 (W&L)

W is the 1751 Amsterdam printed edition published by J. Wetstein, held by
Washington and Lee University Special Collections (PA6519 .A2 1751),
[volume 1](https://digitalarchive.wlu.edu/islandora/p-ovidii-nasonis-operum-tomus-primus-volume-1).
It is available in both image viewers with 870 source-reviewed line regions
covering all 15 poems of Book III. W is an image witness only; clicking a verse
in an existing transcription navigates to its corresponding W image.
A W transcription would require the separate two-pass TEI workflow.

The [native manifest](https://digitalarchive.wlu.edu/node/72383/manifest) has
296 images. Book III spans viewer images **172–192**, printed pages **128–148**.
The archive calls these “Page 164” through “Page 184”; those labels are not the
printed pagination. The supplied `ovid-output.csv` confirms all 296 Volume 1
node IDs, identifiers, labels and manifest positions; the extracted index and
its source checksum are in `scripts/sources/witness-W-node-index.json`.

Keep the archive's nested, percent-encoded Cantaloupe service IDs intact.
Both viewers fetch W's native `info.json` (512-pixel tiles and the advertised
scale factors), rather than assuming another library's tile configuration.
The manifest is cached locally; the library serves the images directly with
CORS enabled. No image proxy is required in the tested configuration.

The source hOCR is alignment evidence, **not** a checked transcription. It
misclassifies whole verses, splits some rows, and misses several enlarged
initials and words. Source-reading review corrected these before integration.
Evidence, exact corrections and review bindings live in `scripts/output/W-*`.
Run `python3 scripts/annotate-w.py` to rebuild the sealed annotation fragment;
this does not alter the published array. Existing P/Y/S/O annotations must
remain unchanged when incorporating W. `npm test` checks coverage, preservation,
page mappings, dimensions and the source-review hashes.

A single rectangular highlight can overlap adjacent type where an enlarged
initial extends downwards or the compositor displaces a word. In particular,
3.9.65's final `(est.` is printed above its main row. The review documents this
source-layout limitation. W is outside the existing 75-slot TEI corpus audit.


Witness **O** is the Teubner 1888 printed edition edited by R. Ehwald from
R. Merkel's recension, available in the [supplied Internet Archive scan](https://archive.org/details/operaovid03oviduoft/page/44/mode/2up).
The scanned title page says *Tom. I, Amores*; the archive's volume-3 catalog
metadata is misleading. Its local IIIF manifest uses Presentation/Image API 3.
O is available in both image viewers; it does not have a diplomatic transcription.

The line-by-line viewer provides independent witness checkboxes. P, Y, and S
are selected by default; O can be added or viewed alone. Choices are preserved
when changing a panel's type.

All 870 Book III lines have O image-region annotations, appended after the
original 2,659 records in `docs/data/annotations.json`. Existing manuscript
annotations are preserved. Annotation `page` is **one based**, whereas
`witnessPageData`, IIIF canvas indices, and the OCR audit use **zero based**
indices. Coordinates are full-resolution image pixels, not thumbnail pixels.

The source OCR rectangles and page/scan-leaf mapping are retained in
`scripts/sources/witness-O-ocr.json`. Rebuild the two reviewed O annotation
fragments with `python3 scripts/annotate-o-first.py` and
`python3 scripts/annotate-o-last.py`; the outputs and alignment evidence are
in `scripts/output/`. Preserve the original manuscript records when updating
the published array. The reviews document the transposition in 3.1 and the
XIb division in 3.11. These annotations map image regions, not scholarly notes.

Run `npm test` to verify complete O coverage, rectangles against actual OCR
pages, page/scan correspondence, and preservation of the original dataset.

The website uses IIIF manifests from external libraries to display manuscript images. These are pre-fetched and stored locally in the `docs/data/iiif-manifests/` directory.

If you need to refresh this data (for example, if a library has updated its manifest), you must run the following commands from the project's root directory:

1.  **Install dependencies (only needs to be done once):**
    ```sh
    npm install
    ```
2.  **Run the fetch script:**
    ```sh
    node fetch-manifests.js
    ```
This will download the latest versions of the manifests and update the local files. After running the script, you should commit the updated JSON files to your repository.

## Amores 3.7 TEI trial

Run `npm run dev`, then open [the 3.7 trial](http://localhost:4173/?poem=3.7&witness=Y&layout=compare). P, Y, S, O and LL have independently reviewed transcriptions. S preserves 74 extant verses and explicitly marks its absent ending. The reading panel has one source-oriented display, a collapsed **Find alterations** control, and a **TEI** link with return navigation and XML download.

Run `npm run validate:tei` to check all five trial files against TEI P5 4.12.0, source-line coverage, internal references, note dispositions and review hashes. Run `npm test` for the site's regression checks. The validator is currently scoped to the 3.7 pilot; extend its coverage configuration as additional poems are enrolled in the workflow.

See [the encoding workflow](docs/encoding-workflow.md), [the independent review summary](scripts/output/3.7-review-status.md), and [the browser verification record](scripts/output/3.7-site-verification.md). Project instructions require a separate source-reading agent before future transcription handoffs. Uncertain source evidence remains encoded; only consequential editorial decisions are escalated.

## Quick Reference: Editing and Pushing Changes to GitHub

1. Edit your files locally using your preferred editor.
2. Stage your changes:
   ```sh
   git add .
   ```
3. Commit your changes with a message:
   ```sh
   git commit -m "Describe what you changed"
   ```
4. Push your changes to GitHub:
   ```sh
   git push
   ```

Repeat these steps whenever you want to update your project on GitHub. 

## Witness Y image availability

Berlin remains the primary image provider. If a Y tile fails or takes more than
10 seconds, both viewer modes switch to the full-resolution copies in
`docs/data/facsimiles/Y/`. The current page and zoom are retained. The choice
persists in session storage for the rest of that tab's visit, including reloads;
a new independent visit tries Berlin again. No backup images are prefetched on
a healthy visit. Page navigation downloads only the requested backup image.

These are unmodified library JPEGs of **Ms. Ham. 471**, provided by
**Staatsbibliothek zu Berlin – Preußischer Kulturbesitz**. The library manifest
marks the work **Public Domain Mark 1.0**. Preserve the source credit, public-domain
notice, and provenance when copying the backup:

- [Library record](https://resolver.staatsbibliothek-berlin.de/SBB00034ABB00000000)
- [Source manifest](https://content.staatsbibliothek-berlin.de/dc/1844735508/manifest)
- [Public Domain Mark](https://creativecommons.org/publicdomain/mark/1.0/)
- `docs/data/facsimiles/Y/index.json`: source URL, original dimensions, byte count,
  and SHA-256 for every page, in the original 151-canvas order.

Run `python3 scripts/cache-witness-y.py` (requires Pillow) to resume or recreate
the mirror. It downloads sequentially, pauses between requests, backs off on
failures, and checks JPEG integrity and dimensions before publishing each file.
It writes the complete index only after all pages have passed verification.
Run `npm test` before publishing; it verifies complete backup coverage and hashes
as well as fallback behavior. An incomplete backup must not be deployed.

This removes Berlin as a dependency after failover, but the site's own hosting
limits still apply. The backup consumes storage even when unused; its bandwidth
is consumed only when fallback images are requested.
