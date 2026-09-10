# Source encoding and review

The XML is the source of readings, editorial decisions and notes. The browser renders one source-oriented view; expansions remain available in the TEI and abbreviation tooltips. Layout is a readable approximation of the document, not a typographic facsimile. Line numbers and couplet grouping are editorial. Manuscript and printed/web witnesses retain their own spellings and punctuation.

Verse indentation follows the source, not verse parity. Add `rend="indent"` only after inspecting the actual line starts in full-page context; enlarged crops with different origins can misleadingly suggest an inset. S generally aligns its initials, with exceptional opening-line spacing retained separately. P has a modest inset, rendered narrower than the printed edition's indentation; Y and O have visible alternating insets. These observed patterns are starting evidence, not permission to assign indentation automatically to unread pages. Record local exceptions during both source passes.

## Two source passes

The first reader transcribes from each source and records evidence. A different agent reads every extant verse from the source and investigates the notes before handoff. It makes supported corrections directly and records a disposition for every note:

- **Resolved:** a source reading or physical feature is supported; no user action.
- **Documented uncertainty:** the image cannot securely establish letters, an earlier state or a feature's function. Preserve the uncertainty without making it a user task.
- **Escalate:** a consequential interpretation or editorial choice remains open. Keep conservative markup and make that specific question visible.

Review reports and JSON ledgers live in `scripts/output/`. The ledger records actual inspected coverage, evidence and dispositions. `npm run validate:tei` checks schema conformance, coverage, identifiers, references, note dispositions and the hash tying review to the current XML. It generates `scripts/output/corpus-review-status.md`. It does not perform a new visual reading or confer human scholarly approval. An XML change invalidates the recorded review hash; a reviewer must check it before the ledger is updated.

The corpus index, `docs/data/tei-corpus.json`, tracks all 75 poem–witness slots. Unintegrated candidates remain in `scripts/output/`; only records marked `reviewed` load their new XML in the site. After independent review, run `python3 scripts/promote-tei.py WITNESS POEM` to validate the candidate and its review bindings before integration. Review ledgers may express source order as verse numbers or complete XML verse IDs. Run promotions sequentially because each updates the shared index. `npm run audit:tei` additionally requires all 75 slots to be reviewed and fails while corpus work remains incomplete. Missing annotations alone never establish source absence.

## TEI conventions

Every slot, including the original 3.7 trial, must carry distinct first-reader and second-reader identities and the exact candidate and report hashes. The audit also checks source images on gap-only evidence pages, preserves original zones even when no verse uses them, and binds each not-transmitted gap to its precise canonical span. A matching total alone is insufficient. Formatting newlines are forbidden inside verse mixed content; preserve intended word boundaries when formatting XML.

The trial validates against the pinned official TEI P5 4.12.0 `tei_all` Relax NG schema. This is a full TEI schema, not a project ODD customization. Read the applicable sections and element definitions when adding a feature:

- [Header](https://tei-c.org/release/doc/tei-p5-doc/en/html/HD.html): source identification, responsibility, editorial policy and revisions.
- [Verse](https://tei-c.org/release/doc/tei-p5-doc/en/html/VE.html): `lg`/`l`; distinguish a verse from a physical page break.
- [Manuscript description](https://tei-c.org/release/doc/tei-p5-doc/en/html/MS.html): repository, shelfmark, locus and source links.
- [Primary sources](https://tei-c.org/release/doc/tei-p5-doc/en/html/PH.html): `facsimile`/`surface`/`zone`, `pb`, `add`, `del`, `subst`, `metamark`, `unclear`, `gap` and `space`. A dark overwritten area is not proof of a recoverable deleted word; different ink is not by itself an identified hand.
- [Characters and glyphs](https://tei-c.org/release/doc/tei-p5-doc/en/html/WD.html): explicit `charDecl` and `g` mappings for schematic signs. Use `choice`/`abbr`/`expan` only where an expansion is defensible; the display shows the source form.
- [Critical apparatus](https://tei-c.org/release/doc/tei-p5-doc/en/html/TC.html): use when collating readings; do not turn witness transcriptions into a silently reconstructed critical text.
- [Customization and conformance](https://tei-c.org/release/doc/tei-p5-doc/en/html/USE.html): schema validity is necessary but does not prove a reading.

Source-image coordinates reproduce the existing annotation rectangles. Each extant verse has a stable XML ID and, for image witnesses, a facsimile zone. Missing text is explicitly described with `gap`, never supplied from LL. Local editorial notes target the relevant verse or manuscript inscription. Full source links remain in the XML even when metadata is hidden in the reading panel.

If source inspection establishes that an original rectangle targets the wrong text, preserve that original zone and add a separate corrected zone. The independent reviewer must record both sets of bounds, the correct image, and the reason and visual evidence in `zone_corrections`. Promotion verifies the original annotation provenance and exports only the reviewed navigation correction. The browser applies it only to the exact original rectangle, preserving subsequent scholar edits. `python3 scripts/test-tei-provenance.py` checks this preservation and rejection of unreviewed changes.

If a canonical position is wholly illegible and has no original rectangle, its numbered `l` may serve as an alignment container linked to the supporting full-page `surface`. It must contain only an explicit one-line illegibility gap and an explanation; this does not claim that the individual verse has been physically located. A different source reader must record each position in `unlocated_lines`, with its target, surface link, source image, one-based manifest page, targeted uncertainty note and independent evidence. The validator rejects unsupported surface links, invented readable text and any attempt to bypass an existing original rectangle. Page-only navigation opens the whole supporting page and identifies the location as unverified. A later scholar-created rectangle takes precedence. Missing annotations never establish that a verse is absent from the witness.

Uninscribed space is displayed as blank space; illegible writing retains an ellipsis. Explicit large spaces and smaller script receive a readable layout approximation. Qualified expansions remain identified as tentative in tooltips, while the written abbreviation is displayed.

For 3.7, S transmits only positions 1–74 on pp. 395–396; the following page is blank. The absence of 75–84 is represented explicitly, without assigning an unverified physical cause. LL is a modern web text and has no invented manuscript facsimile zones.

## Finding interventions

Machine-generated editorial transcription notes are omitted from the reading interface, including the line-level note buttons. They remain in the reviewed TEI archive and are exported separately to a Word document with explicit OpenAI Codex attribution. Manuscript inscriptions and semantic alteration tags still render as source content; they are distinct from editorial notes and from Professor Dance's commentary.

The collapsed **Find alterations** control reads the TEI semantics directly. Its categories cover substitutions, erasures, other cancellations, additions above/below the line, marginal additions/annotations, darker ink, disturbed surfaces, marks, uncertain readings, gaps and abbreviations. The interface omits occurrence counts and folio labels for a continuous reading view. Categories can overlap: a substitution can contain both a cancellation and an addition. Hidden expansions are excluded. A category without encoded matches is disabled; absence of markup is not proof that the source never had that feature.

Selecting a type highlights its occurrences and navigates through them with their verse context and source image. This is currently a finder for the displayed poem and witness. The underlying semantic markup can support a future corpus-wide index without retagging the sources. Add new categories from actual TEI evidence, not guessed labels.
