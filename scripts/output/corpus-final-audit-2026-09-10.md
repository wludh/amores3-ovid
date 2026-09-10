# Amores III — final integration and browser audit

Completed 10 September 2026 by `/root`, after the independent source passes and `/root/encode_s`'s cross-corpus audit. Scope: all 15 poems, 3.1–3.15, across P, Y, S, O and LL. All 75 slots are integrated and independently reviewed. This is an integration and rendering audit, not a third visual transcription or human scholarly approval.

## Coverage and evidence

The complete validator passed all 75 records with no incomplete slots and no escalated editorial questions. The corpus represents 3,888 canonical positions and explicitly records 462 absent positions. Twenty-seven P containers preserve whole-line illegibility, including the three individually unlocated P 3.12.23–25 positions. Represented positions do not imply fully recovered wording.

Each record retains source identification, review coverage, separate author/reviewer accountability, note dispositions, exact candidate and report hashes, and linked manuscript evidence where applicable. The applicable TEI guidance is recorded in the encoding policy and individual dossiers. Original annotation JSON remains unchanged. Source-specific indentation is encoded explicitly: S has five exceptional opening insets, not a general alternating pattern; P's selective insets remain narrower than the printed layout.

## Resolution of the independent audit

The earlier [independent audit](corpus-independent-audit-2026-09-10.md) remains an unchanged historical snapshot. Its findings were addressed as follows:

1. All five 3.7 trial records were migrated to standalone reviewed XML. Historical author/reviewer identities were checked against actual assignments and reports. The validator's trial exceptions were removed; all 75 now use the same identity, raw candidate, report and absence-evidence checks.
2. S 3.7 mixed-content formatting was normalized after the independent reviewer identified the intended boundaries. Root verified all 74 verses in source and expanded reading, with unchanged tags, attributes and non-whitespace content. The before-copy and [boundary comparison](S-3.7-whitespace-boundaries.json) preserve the scoped evidence. All verse mixed content is now checked for formatting newlines.
3. The original independent P/Y trial reviewer reread the five open questions against their actual images. All five preserve documented uncertainty; none requires an editorial decision. The source text was not reconstructed to manufacture a complete reading. Current ledgers and standalone XML supersede the historical trial status report.
4. Validation now covers unused original zones and every evidence surface, including gap-only poems. It rejects altered or dropped original rectangle identities and foreign source images.
5. Each not-transmitted gap is bound to its precise canonical span and document position. Overlaps, unlisted gaps and mislabeled spans fail even if their total quantity appears plausible.
6. Y 3.15 was integrated after its independent review. A note-type mismatch correctly blocked its first promotion; root checked the affected image, aligned only the disposition metadata with the independent review, retained the before-copy and resealed it.

## Actual browser checks

The final browser pass visited every one of the 75 unique poem–witness combinations through the reader controls. [Recorded observations](corpus-browser-observations-2026-09-10.json) include rendered verse and note counts, the final represented verse and its opened source page. These observations were separately compared with the integrated XML and original annotation inventory: all counts and all 51 image-bearing final-verse page destinations matched.

For every slot, the TEI link opened the correct heading and download filename, the displayed XML contained the same verse inventory as the reader, and Back to poem restored the exact poem and witness. Every record containing notes passed a note-to-text focus round trip; absence-only records returned to the absence statement. The download implementation uses the same serialized XML for the source display and download Blob. This audit checked that binding and link configuration, not independently saved browser download bytes.

Representative image-loaded screenshots and targeted interactions additionally checked:

- P 3.11's corrected rectangles and late verses; P 3.12's located verse 22 and individually unlocated 23–25; P 3.13's wholly absent text; and P 3.14/3.15's opening and terminal absence boundaries.
- P 3.12.23 in the line-by-line viewer: the P image opens the whole supporting page with “Verse location unverified” while Y shows its located verse 23. Switching to P 22 restores its located view; switching to 24 restores the whole page and clears the focus rectangle.
- Y 3.9's expunged letter and Y 3.10's reviewed additions, darkened letters and source navigation. The alteration finder selected marks, advanced from verse 19 to 20, returned with Previous, selected abbreviations at verse 5, and cleared its highlights. Counts and folio labels remain absent from the reading toolbar.
- Actual rendered first-four-line insets across all 75 routes: S retains only its recorded exceptional opening insets; P 3.12/3.14 do not acquire unsupported alternating insets. Other witnesses retain their reviewed patterns.
- Narrow comparison panels keep witness buttons reachable by wrapping. The P 3.14 opening-gap display was corrected from a misleading terminal range to “Lines 1–2”; P 3.15 correctly displays “Lines 9–20.”

Earlier image inspections and detailed browser batches remain in the individual dossiers and [batch 2](corpus-ui-audit-2026-09-09-batch2.md)/[batch 3](corpus-ui-audit-2026-09-09-batch3.md) reports. Source image certainty is not inferred from UI success. The reader was restored to O 3.5 in comparison mode.

## Verification

- `npm run audit:tei`: 75/75 passed the pinned TEI P5 4.12.0 schema, exact corpus scope, canonical coverage, IDs/references, note dispositions, review hashes, original annotations, image provenance, corrected navigation, unlocated containers and absent spans.
- `npm test`: 33 passed, 0 failed.
- `python3 scripts/test-tei-provenance.py`: 20 passed, including unused-zone preservation, gap-only evidence and exact absence-span regressions.
- All 75 actual reader/TEI/back routes and all applicable note/source navigation checks passed.

The completed corpus is ready for scholarly inspection locally. Documented uncertainty remains explicit. These later corpus changes have not been committed or published.
