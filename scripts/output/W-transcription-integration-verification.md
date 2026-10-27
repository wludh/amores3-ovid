# W transcription integration — 26 October 2026

W is the Wetstein 1751 printed edition held by Washington and Lee University.
This phase adds its source-based transcriptions for all fifteen poems of
Amores III to the image witness published in commit `6f80458`.

## Source and review

- [Volume record](https://digitalarchive.wlu.edu/islandora/p-ovidii-nasonis-operum-tomus-primus-volume-1)
  and [native IIIF manifest](https://digitalarchive.wlu.edu/node/72383/manifest).
- All 870 verses come from viewer images 172–192, printed pages 128–148.
  The source-page index and the earlier reviewed line regions remain unchanged.
- Three first-pass agents read the source in groups 3.1–3.4, 3.5–3.8 and
  3.9–3.15. Three different agents independently read every extant verse against
  full pages and enlarged image bands, checked source headings and line starts,
  investigated the note queue and corrected supported errors. The first-pass
  text and notes remain as audit evidence, not as a second published text.
- Each poem has a second-pass report and review ledger in `scripts/output/`.
  Each ledger binds the candidate bytes, canonical XML and report by SHA-256.
  Human scholarly approval is not implied by the independent agent review.
- Source accents, spelling, capitalization, punctuation and ampersands are
  retained. Long s and typographic ligatures follow the declared standard-letter
  policy. Indentation comes from actual full-page line starts, including the
  exceptional space beside opening capitals.
- A final opening-word check distinguishes genuine uppercase second letters
  after drop capitals from ordinary title case. Reviewers inspected those source
  crops again and bound the corrected files to updated review seals before
  integration; no parent edit bypasses the source review.
- The displaced `(est.` at 3.9.65 is associated with its verse in reading order
  and marked as printed above its right end. The reading view raises the token
  as a readable approximation; the image records its exact position.
- Ordinary image uncertainty remains locally encoded and documented. Editorial
  prose stays in the TEI archive, while the reading view retains the minimal
  toolbar and feature finder used by other witnesses.

## Integration and preservation

- The corpus expands from 75 to 90 records. Every original record retains its
  exact values; all prior TEI files and review seals are unchanged.
- All 4,399 image annotations, including W's 870, retain their exact bytes.
  `python3 scripts/annotate-w.py` verifies and rebuilds the reviewed W fragment
  without rewriting the published annotation dataset.
- W has no legacy transcription fallback. Only its reviewed poem files load;
  another witness's readings are never presented as W.
- The W selector is available in fixed and dynamically created transcription
  panels. TEI viewing, XML download and Back to poem retain the W selection.
- Work began from the current production branch in a separate worktree.
  The ten production commits missing from the older local checkout, including
  Y's fallback and recent essay, introduction and commentary-display changes,
  remain in the branch's ancestry. The older dirty checkout was not deployed.

## Rendered checks

- Local browser checks confirmed W's source text in both Single Witness Viewer
  and Line-by-line Viewer. Selecting 3.6.46 opened image 180; selecting 3.8.40
  focused its corresponding source line.
- All fifteen final poem files were selected in the browser. Their rendered
  verse counts total 870, and all source-specific opening capitals are present.
  The extra opening inset is rendered, including the three-character space at
  3.1.2. The hidden catchword uncertainty is excluded from visible feature hits.
- The feature finder located the uncertain punctuation at 3.6.46 and displayed
  the uncertainty treatment and tooltip. Its documentation remains in the XML.
  Hidden page furniture is excluded from feature-finder matches, so the
  catchword uncertainty retained only in XML is not offered as a visible verse
  feature.
- The actual browser download `Amores-3.6-W.xml` parsed successfully with all
  106 verses, the uncertainty element and targeted notes. Back to poem returned
  to the W 3.6 transcription.
- The displaced token at 3.9.65 renders above the right end of its verse and
  selects source image 186. The final verse 3.15.20 selects image 192.
- No W image-load failure was observed. Rapid page changes can produce harmless
  OpenSeadragon messages about discarding tiles requested before a viewer reset.

## Validation and known pre-existing issues

- The twenty provenance regression tests pass.
- `npm test`: **46 passed, 0 failed**, including complete W verse coverage,
  candidate/report hashes, all line-region bindings, source-page navigation,
  and the existing Y fallback and site regressions.
- `python3 scripts/validate-tei.py --witness W --require-complete`:
  **15/15 passed, 0 incomplete**, covering schema, 870 verse positions,
  identifiers, references, annotation provenance, all note dispositions and
  canonical/exact-file/report review seals. There are 17 resolved notes,
  two documented uncertainties and no escalations.
- `git diff --check` passes. A final fetch found production unchanged at
  `6f80458`; the worktree contains every preceding production commit.
- `npm run validate:tei` was run and still stops on the old P 3.1 review seal.
- The full-corpus TEI command has pre-existing review-seal mismatches in P 3.1,
  Y 3.1 and P 3.7. A canonical-hash audit of the unchanged original 75 records
  confirms these same three mismatches. Their source files and seals are not
  rewritten as part of adding W.

Production publication is explicitly authorized in this task. No external
correspondence was sent.
