# LL 3.7 — independent second source collation

Completed 8 September 2026 by the independent encode_s agent, a different agent from the first-pass encoder.

**All 84 verses exactly match the live Latin Library source after HTML entity decoding and whitespace normalization.** There were no textual corrections, documented uncertainties or human review actions.

Source: https://www.thelatinlibrary.com/ovid/ovid.amor3.shtml, sectionVII, bounded by sectionVIII. Verified live through the web tool and retrieved fresh HTML independently using curl. The second reader extracted the84 verse segments directly from the fresh HTML, rather than treating the supplied first-reader source extract as authoritative. Retained all source capitalization and punctuation, including the source dashes at47–48,66,81–82, and distinct wording such as `cupida ... lingua`9, `inpatiens fit`36 and `non blanda`55.

Evidence: `/tmp/amores-ll37-review/source-live.html`, `independent-extract.txt`, `comparison.json`. The SHA-256 of the independently retrieved HTML is recorded in `scripts/output/LL-3.7-review.json`.

Candidate metadata now records independent second-reader responsibility, the completed review in revisionDesc, Latin text language and English header language. Draft status remains because machine review is not human scholarly approval. There are no manuscript facsimile claims or invented manuscript phenomena for this web witness.

The TEI4.12 RelaxNG schema passes; numbering and distinct IDs cover1–84. Machine-readable ledger: `scripts/output/LL-3.7-review.json`.
