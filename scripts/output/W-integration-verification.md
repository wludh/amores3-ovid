# W image-witness integration — 26 October 2026

W is the Wetstein 1751 printed edition at Washington and Lee, volume 1.
This addition supplies source images and 870 independently reviewed line regions
for Amores 3.1–3.15. It does not supply a W transcription or TEI review seal.

## Sources and numbering

- [Volume record](https://digitalarchive.wlu.edu/islandora/p-ovidii-nasonis-operum-tomus-primus-volume-1)
- [Native IIIF manifest](https://digitalarchive.wlu.edu/node/72383/manifest)
- The supplied `ovid-output.csv` matches every one of the 296 volume-1 canvases
  by identifier, archive label, order and page node. Its checksum and public
  node index are retained in `scripts/sources/witness-W-node-index.json`.
- Viewer image 172 is printed page 128, archive label “Page 164”, node 72555.
  Book III spans viewer images 172–192, printed pages 128–148.
- W's nested encoded image-service IDs are preserved verbatim. Both viewers
  request native `info.json`, which advertises 512-pixel tiles and scale factors.
  Direct image requests worked with the archive's CORS configuration; no proxy
  was necessary. The collection landing page occasionally presents a connection
  verification screen, but the manifest and image services worked directly.

## Verification

- Two independent source reviewers inspected all 870 regions against the actual
  page images, corrected the first-pass candidates and documented limitations.
  `W-image-review.json` binds source evidence, both reports, both reviewed region
  fragments and the final annotation set with SHA-256 values.
- All 3,529 prior annotations retain their values and order. Only W's 870 regions
  were appended. The corpus-level annotation checksum was updated after checking
  that removal of W exactly reproduces the prior array. Existing TEI files,
  per-witness review seals and navigation overrides were not changed.
- `python3 scripts/annotate-w.py` verifies the review bindings and rebuilds the
  W annotation fragment successfully.
- `npm test`: **44 passed, 0 failed**. Checks include complete canonical coverage,
  source-page dimensions, node-index agreement, review hashes, preserved existing
  annotations, native IIIF identifiers and page-navigation behavior.
- Local browser checks at `http://127.0.0.1:4173/` confirmed W in both viewer
  modes, line selection across page boundaries (3.1.1, 3.1.30–31), 3.12.42 and
  the final verse 3.15.20. The final verse opens viewer image 192. W is also
  available as an annotation target; no browser annotation edits were made.
- Single-viewer arrows and direct page entry were checked after selecting a
  verse. An existing open-event behavior snapped manual navigation back to the
  selected verse. The fix follows selection on initial load and explicit line
  clicks, clears stale highlights during page changes, and allows other pages
  to remain open. Returning to a verse restores its highlight.
- W image loading produced no W&L warnings or errors in the inspected browser
  log. Earlier canceled requests from other witnesses were not W failures.

## Remaining issues

- `npm run validate:tei` fails on a **pre-existing review-seal mismatch**. A
  separate record-by-record audit passed 72 of 75 records and identified the
  three failures as **P 3.1, Y 3.1 and P 3.7**. Their XML is unchanged from HEAD;
  those seals require a separate source review and were not silently rewritten.
- Rectangular highlights necessarily include some adjacent type for enlarged
  initials and displaced words, notably 3.9.65's `(est.` above its main row.
  See the two source-review reports for exact geometry and dispositions.
- The archive's page labels differ from printed pagination. The interface uses
  image positions; the documentation supplies the printed-page correspondence.
- W is an image witness only. Existing transcriptions provide verse identities
  for navigation; their readings are not presented as W's text.

The initial verification was local and uncommitted. Production publication was
authorized on 26 October 2026. The deployment is based on the latest production
commit, retaining subsequent site updates and excluding unrelated local guide
changes. No external correspondence was sent.
