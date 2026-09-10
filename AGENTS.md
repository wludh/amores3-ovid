# TEI transcription workflow

For every new poem–witness transcription, complete both source passes before presenting it as ready to review.

1. Read the actual manuscript/edition images (or the source web text for LL), the applicable official TEI P5 guidance, and the project's encoding policy in `docs/encoding-workflow.md`. Record source links and page/line coverage. Never fill a witness from another witness or a familiar edition.
2. Encode the first pass and create a working note queue with precise line targets and evidence. Preserve uncertainty locally with `unclear`/`gap`; do not infer earlier erased letters or hands from ink colour alone.
3. Delegate an independent second pass to a different agent. That reviewer must inspect every extant line against the source, investigate every note, correct supported errors, and record each note as `resolved`, `documented-uncertainty`, or `escalate`. Reviewing XML or an author's summary alone is insufficient. Keep unresolved readings conservative; do not close notes by inventing certainty.
4. Only consequential editorial decisions belong in the user review queue. Ordinary observations and irrecoverable image uncertainty remain documentation. There is no artificial target or cap for unresolved questions.
5. Integrate the reviewed XML, record its canonical SHA-256 and the review report SHA-256 in the review ledger, and run `npm run validate:tei` plus appropriate site tests. Later XML edits invalidate that review seal and require another review of the changed evidence before resealing.
6. Check the actual rendered witness, source-image navigation, notes, TEI download and Back to poem link. Use the single source-oriented transcription display and minimal TEI toolbar.
7. Check indentation against actual full-page line starts. Do not assign an indent solely because a verse number is even. Retain source-specific opening spaces and other exceptional insets, and use a readable approximation of their size.

Keep existing annotation rectangles and unrelated poems intact unless the task explicitly requires their correction. Do not publish or commit merely because a local trial is ready.
