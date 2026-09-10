# Live corpus integration checks, batch 2

Observed directly in the in-app browser at http://127.0.0.1:4173 on9September2026, after the reviewed XML files were integrated. These checks cover the entries below; they do not establish that all75 transcriptions are complete.

| Witness | Poem | Rendered verses | Source navigation verse | Displayed viewer page | TEI and return navigation |
| --- | --- | --- | --- | --- | --- |
| S | 3.4 | 48 | 39 | 391/417 | pass |
| P | 3.6 | 106 | 106 | 91/101 | pass |
| Y | 3.4 | 48 | 47 | 125/151 | pass |
| O | 3.4 | 48 | 48 | 100/342 | pass |
| Y | 3.5 | 46 | 40 | 126/151 | pass |
| P | 3.8 | 66 | 66 | 94/101 | pass |
| O | 3.5 | 46 | 46 | 101/342 | pass |

For each row, selected the poem and witness through the visible controls, waited for its transcription article, verified the rendered verse count, selected the same image witness, activated the listed verse with Enter, and observed the target page indicator. Opened its TEI page, verified the matching heading and Download XML filename, then used the visible Back to poem link and verified the original transcription returned. The download link filenames were Amores-POEM-WITNESS.xml. The O3.5 Download XML link was also activated. This records browser interaction and link metadata, not an independently captured download-byte comparison.

For all seven rows, opened the first editorial-note button, observed the expanded notes and focused note body, used Return to line1, and verified focus returned to the corresponding verse. All seven note bodies were populated (102–267characters). A first attempt at the TEI return selector omitted the visible arrow and matched no element; the observed full accessible label “← Back to poem” worked. No product change was necessary.

S3.4 additionally displayed the corrected n̄ s̄t at39, four-character blank at41, raised abbreviation letters, and local uncertainty. Source-image page selection at39 reached viewer391/417 (actual manuscript390). After the tiles finished loading, a second actual screenshot confirmed the manuscript line beginning In qua martigenę in the spotlight, aligned with the selected verse39. The same screenshot shows the four-character blank and raised abbreviation at41 in the transcription.

Node tests:27passed. Provenance tests:4passed. Full TEI validation is recorded by corpus-review-status.md after its separate run. The saved review ledgers establish source-reading scope; UI checks are not substitute manuscript readings.

## Source indentation follow-up

After the layout change, live browser DOM checks observed normal-line padding44.16px for the selected text size. S3.4 andS3.7 regular verses3/4 both used44.16px, with only opening verse2 carrying an inset. P3.6 used44.16px on odd lines and56.64px on the checked even line, a12.48px inset. Y3.4 andO3.4 used44.16px and68.16px, a24px inset. These were actual runtime checks before the Mac locked. A later attempt at a fresh screenshot was unavailable because the Mac was locked; no new screenshot is claimed. New browser checks for subsequently integrated entries remain pending. The27 Node tests and whitespace check passed again after the CSS/layout changes.

Full TEI validation subsequently passed for all44 integrated entries, including the adjusted S layouts and newly reviewed S3.5/O3.6/O3.8/P3.9. An initial run caught namespace propagation onto the legacy S wrapper; the wrapper was repaired, its unrelated poem elements verified unchanged, and its embedded reviewed TEI hash verified before the passing rerun. The4 provenance tests also passed. Browser checks for S3.5/O3.6/O3.8/P3.9 remain pending because the Mac is locked.
