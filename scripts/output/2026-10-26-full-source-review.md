# Fresh source review of all 90 Amores III transcriptions

All 15 poems across P, Y, S, O, LL and W received a fresh source reading. The review covered **4,758 represented verse positions**, including damaged and illegible positions, and checked the source evidence for **462 absent positions**. Every existing evidence note was reconsidered: **855 resolved observations, 638 documented uncertainties and no consequential editorial questions requiring escalation**. Agent review does not imply human scholarly approval.

## Source and review handling

The requested W witness is complete across all 870 verses, with its existing page and line mappings retained. Its first source opening is viewer page 172 (printed 128). Fresh readings corrected eight source-specific spellings or letters, including caussa and fine tuo, with separate crop corroboration recorded in the ledgers.

P 3.1, Y 3.1 and P 3.7 were reviewed from current production XML. Their stale review bindings were replaced only after new source readings; older candidates were not copied over recent production changes. Local uncertainty was retained where the source could not support an assured reading. Every updated candidate is bound to its canonical XML and review report SHA-256, and prior independent reports and ledgers remain as history.

For LL and O 3.13–3.15, the fresh reader was also the original first encoder. Their text required no changes. Separate, explicitly labelled third-reading reports record the new source inspection while preserving the unchanged independent second-pass XML/report seals. Those audits do not claim a new independent reviewer identity.

Gallica blocked direct access to P. Verified archival copies of BnF Latin 8242 images 84–101 are now included in the site's Book III viewer. Their original source identifiers, image dimensions, byte hashes and archival provenance are recorded in `docs/data/facsimiles/P/index.json`. Both single and parallel viewers use those copies; the original source manifest and annotation coordinates are preserved.

S's surviving text ends at 3.7.74. The final text page, following leaves and covers were inspected, and the current primary catalogue agrees. Chatelain's older catalogue prints a different endpoint; that discrepancy is documented without inventing an explanation or adding absent text.

## Coverage

| Witness | Poem records | Represented verse positions | Source-confirmed absent positions | Reviewed evidence notes |
| --- | ---: | ---: | ---: | ---: |
| P | 15 | 802 | 68 | 404 |
| Y | 15 | 870 | 0 | 599 |
| S | 15 | 476 | 394 | 257 |
| O | 15 | 870 | 0 | 214 |
| LL | 15 | 870 | 0 | 0 |
| W | 15 | 870 | 0 | 19 |

The associated `2026-10-26-full-source-review.json` records all 90 source-review states and exact report/XML bindings. `2026-10-26-source-line-changes.json` records each changed verse element against the production baseline; its 166 changed elements include source text, uncertainty, marks, punctuation and indentation, not 166 lexical corrections.

## Production preservation

The review began at 81eeef4 and was integrated on top of production **48a5c97d34c5797a0f2219908bef3fadeb8a94c7**, retaining the intervening vocabulary tools, reading view, flashcard export and verse-click scrolling fix. All unrelated upstream files were checked for byte equality. The only additional UI change is the narrow P image-source helper and its script cache key.

All original annotation bytes and all original TEI zone attributes are unchanged. Annotation SHA-256 remains `69011ef14071756f4a235e3b9c99b4455d4fd7b2d60bb41cb69487761d9503a0`.

The new vocabulary feature was reconciled against the completed source review, with the pinned morphology generator rerun. Existing 75-record enrollment remains unchanged. W has no automatic vocabulary enrollment. The differential review preserved 16,156 unchanged-context decisions exactly, reassessed 553 retained decisions in changed contexts, reviewed 8 new candidates, retired 28 into history, and renewed 5 existing decisions. See `vocabulary-source-renewal.md` and its detailed JSON. Original glossaries, dictionary definitions and frequency data remain unchanged.

## Verification

Actual browser checks rendered all 90 records with the expected 4,758 verse elements and correct TEI links. Single and parallel P navigation opened the correct cached source page and highlight; W's corrected source text and image navigation were checked. The P 3.1 XML download preserves the complete XML content and attributes, with harmless serializer whitespace differences, and Back to poem restores the selected poem/witness. See `2026-10-26-rendered-corpus-check.json`.

The site suite passes 101/101 tests, including all morphology/contextual vocabulary and image-provenance checks. The separate TEI provenance suite passes 20/20 tests. `npm run validate:tei` passed all 90 records with no incomplete slots. Independent read-only checks by `/root/w_review_c` and `/root/w_review_a` found no actionable code, source-provenance, binding, count or production-preservation issues. `npm run audit:tei` also passed all 90 records with no incomplete slots. All required pre-publication checks passed. Deployment is authorized and will use a normal fast-forward push after a final production-head check.
