# Corpus browser audit — 9 September 2026, batch 3

Reviewer: primary agent `/root`. These are actual runtime/browser checks, separate from the two manuscript source passes. The browser was available again during this batch.

| Witness | Poem | Rendered verses | Clicked verse | Viewer page |
|---|---|---:|---:|---:|
| S | 3.5 | 46 | 46 | 392 / 417 |
| S | 3.6 | 106 | 106 | 395 |
| P | 3.9 | 68 | 68 | 95 |
| P | 3.10 | 48 | 48 | 96 |
| Y | 3.6 | 106 | 106 | 129 |
| O | 3.6 | 106 | 106 | 104 |
| O | 3.8 | 66 | 66 | 108 / 342 |
| O | 3.9 | 68 | 68 | 110 |
| O | 3.10 | 48 | 48 | 111 |
| O | 3.11 | 52 | 52 | 113 |
| Y | 3.8 | 66 | 42 | 132 / 151 |

For S3.5 and the next nine listed records, an actual note button opened and focused its corresponding transcription note; the return link focused the source verse. Their TEI links opened the correct poem/witness heading, Download XML exposed the matching Amores-poem-witness.xml filename, and Back to poem returned the correct transcription. Download-link configuration was checked; this batch does not claim independent verification of saved download bytes.

O3.8 initially returned an empty page input during image loading. A targeted follow-up confirmed page108 and an actual screenshot showed verse66 spotlighted on the correct printed line. The issue was resolved by observing the loaded source, not by treating the early empty field as a pass.

Y3.8 additionally received an actual screenshot after its source tiles loaded: verse42 and the above-line correction were visible beside the manuscript. Its correction note opened/focused and Return to line42 restored focus. The rendered TEI retained expunction of n and an above-line r within a substitution. One locator evaluation timed out; a fresh DOM read and semantic note-button check succeeded. TEI route verification for this last addition is recorded below when completed.

## Indentation and source-specific spacing

S3.5 has padding44.16px on regular lines3–6; its exceptional opening line2 is68.16px. The actual screenshot confirmed aligned regular rows. S3.6 lines1–4 each have44.16px line padding; its separately encoded opening spaces remain in the TEI. P3.9 andP3.10 alternate44.16/56.64px. Y3.6 alternates44.16/68.16px. These browser measurements agree with the separate full-source layout inspections. They do not substitute for reading unread pages.

O3.11 preserves an extra26.88px vertical separation before33. Its XIb. subdivision and four secondary right-margin numbers are retained in the XML and hidden in the continuous reading view. No duplicate numbering is shown.

## Whole-poem source absence

All eight S records3.8–3.15 were opened in the actual browser. Each rendered zero invented verses and the concise message “This poem is not transmitted in this witness.” The toolbar contained only TEI. Every TEI route showed the matching heading/download filename and returned to its poem. For S3.8, opening the source-coverage note and using Return to source coverage focused the actual gap element. A screenshot confirmed the concise message and collapsed evidence notes. The comparison viewer has its own poem selector; changing only the transcription selection does not assert that its independently selected page belongs to the absent poem.

The renderer was corrected to give wholly absent poems a meaningful message instead of a bare canonical range, label their evidence as Source coverage, provide a working return target, and omit the alteration finder when there are no verses. It preserves the full evidence in notes and XML.

## Validation

The full corpus validator passed at58/75 integrated records, including all eight independent S absence records. Y3.8 was then promoted with the same schema/provenance/disposition/hash checks. All27 site tests passed after the renderer changes; git diff --check passed. The first-pass O builder now requires an explicit observed-indentation inventory instead of assigning insets from verse parity; Python compilation passed. Corpus work remains active and incomplete.

Y3.8 TEI route check completed: heading Amores3.8 · Y · TEI, download filename Amores-3.8-Y.xml and successful Back to poem return. The browser was restored to the original O3.5 comparison and its rendered transcription confirmed. A full59-record validation run was started after that final promotion.
