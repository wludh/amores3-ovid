# Witness Y image fallback verification

Date: 2026-09-30

## Failure reproduced

Production rendered the Y transcription but left the facsimile blank. A Berlin
image request returned HTTP 429 without Retry-After; another request returned
504. The original viewer had no tile retries or alternate image source.

## Source and coverage

The backup uses unmodified full-resolution JPEGs from the library's checked-in
IIIF manifest, in its original 151-canvas order. The manifest records Public
Domain Mark 1.0. The generated image index retains provider, shelfmark, source
record, source URLs, dimensions, sizes, and SHA-256 digests. No TEI or annotation
coordinates are changed.

## Browser checks before deployment

- A local test server replaced Berlin image URLs with an endpoint returning
  HTTP 429. Amores 3.7 Y switched automatically to local image 0129.jpg.
- Clicking line 4 zoomed to the matching manuscript line, with the spotlight
  aligned, in both Single Witness Viewer and Line-by-line Viewer.
- A second server stalled the upstream response for 20 seconds. The viewer
  reported its 10,000 ms image timeout and loaded the backup before the delayed
  error arrived. The late upstream failure did not disturb the backup.
- Reloading after failover fetched the backup directly. Server logs contained
  one upstream request and two backup requests across the initial load/reload.

## Existing unrelated validation failure

`npm run validate:tei` fails on the existing production corpus with
`XML changed since independent review; re-review required`. The failure also
occurs in the release checkout based on origin/main, whose TEI files and review
ledger are unchanged by this fix. This release does not reseal or alter them.

## Complete-release checks

- All 151 images downloaded; total JPEG size 141,037,037 bytes.
- A second offline pass decoded every JPEG with Pillow and checked the original
  canvas dimensions. All passed.
- `npm test`: 40/40 passed in the release checkout, including every image hash,
  JPEG dimensions, complete canvas mapping, and fallback lifecycle tests.
- `git diff --check`: passed.
- Backup navigation from page 129 to the opening pages 1 and 2 worked; clicking
  3.7 line 25 loaded page 130 and aligned the highlight with the new folio.
