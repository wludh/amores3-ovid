# Source encoding and review

The XML is the source of readings, editorial decisions and notes. The browser renders one source-oriented view; expansions remain available in the TEI and abbreviation tooltips. Layout is a readable approximation of the document, not a typographic facsimile. Line numbers and couplet grouping are editorial. Manuscript and printed/web witnesses retain their own spellings and punctuation.

## Two source passes

The first reader transcribes from each source and records evidence. A different agent reads every extant verse from the source and investigates the notes before handoff. It makes supported corrections directly and records a disposition for every note:

- **Resolved:** a source reading or physical feature is supported; no user action.
- **Documented uncertainty:** the image cannot securely establish letters, an earlier state or a feature's function. Preserve the uncertainty without making it a user task.
- **Escalate:** a consequential interpretation or editorial choice remains open. Keep conservative markup and make that specific question visible.

Review reports and JSON ledgers live in `scripts/output/`. The ledger records actual inspected coverage, evidence and dispositions. `npm run validate:tei` checks schema conformance, coverage, identifiers, references, note dispositions and the hash tying review to the current XML. It generates `scripts/output/corpus-review-status.md`. It does not perform a new visual reading or confer human scholarly approval. An XML change invalidates the recorded review hash; a reviewer must check it before the ledger is updated.

The corpus index, `docs/data/tei-corpus.json`, tracks all 75 poem–witness slots. Unintegrated candidates remain in `scripts/output/`; only records marked `reviewed` load their new XML in the site. After independent review, run `python3 scripts/promote-tei.py WITNESS POEM` to validate the candidate and its review bindings before integration. Review ledgers may express source order as verse numbers or complete XML verse IDs. Run promotions sequentially because each updates the shared index. `npm run audit:tei` additionally requires all 75 slots to be reviewed and fails while corpus work remains incomplete. Missing annotations alone never establish source absence.

## TEI conventions

The trial validates against the pinned official TEI P5 4.12.0 `tei_all` Relax NG schema. This is a full TEI schema, not a project ODD customization. Read the applicable sections and element definitions when adding a feature:

- [Header](https://tei-c.org/release/doc/tei-p5-doc/en/html/HD.html): source identification, responsibility, editorial policy and revisions.
- [Verse](https://tei-c.org/release/doc/tei-p5-doc/en/html/VE.html): `lg`/`l`; distinguish a verse from a physical page break.
- [Manuscript description](https://tei-c.org/release/doc/tei-p5-doc/en/html/MS.html): repository, shelfmark, locus and source links.
- [Primary sources](https://tei-c.org/release/doc/tei-p5-doc/en/html/PH.html): `facsimile`/`surface`/`zone`, `pb`, `add`, `del`, `subst`, `metamark`, `unclear`, `gap` and `space`. A dark overwritten area is not proof of a recoverable deleted word; different ink is not by itself an identified hand.
- [Characters and glyphs](https://tei-c.org/release/doc/tei-p5-doc/en/html/WD.html): explicit `charDecl` and `g` mappings for schematic signs. Use `choice`/`abbr`/`expan` only where an expansion is defensible; the display shows the source form.
- [Critical apparatus](https://tei-c.org/release/doc/tei-p5-doc/en/html/TC.html): use when collating readings; do not turn witness transcriptions into a silently reconstructed critical text.
- [Customization and conformance](https://tei-c.org/release/doc/tei-p5-doc/en/html/USE.html): schema validity is necessary but does not prove a reading.

Source-image coordinates reproduce the existing annotation rectangles. Each extant verse has a stable XML ID and, for image witnesses, a facsimile zone. Missing text is explicitly described with `gap`, never supplied from LL. Local editorial notes target the relevant verse or manuscript inscription. Full source links remain in the XML even when metadata is hidden in the reading panel.

For 3.7, S transmits only positions 1–74 on pp. 395–396; the following page is blank. The absence of 75–84 is represented explicitly, without assigning an unverified physical cause. LL is a modern web text and has no invented manuscript facsimile zones.

## Finding interventions

The collapsed **Find alterations** control reads the TEI semantics directly. Its categories cover substitutions, erasures, other cancellations, additions above/below the line, marginal additions/annotations, darker ink, disturbed surfaces, marks, uncertain readings, gaps and abbreviations. The interface omits occurrence counts and folio labels for a continuous reading view. Categories can overlap: a substitution can contain both a cancellation and an addition. Hidden expansions are excluded. A category without encoded matches is disabled; absence of markup is not proof that the source never had that feature.

Selecting a type highlights its occurrences and navigates through them with their verse context and source image. This is currently a finder for the displayed poem and witness. The underlying semantic markup can support a future corpus-wide index without retagging the sources. Add new categories from actual TEI evidence, not guessed labels.
