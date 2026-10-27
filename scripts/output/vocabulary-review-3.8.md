# Contextual vocabulary review: Amores 3.8

Reviewed 26 October 2026 by OpenAI Codex. This is a lexical review of the existing TEI transcriptions, not a new transcription or manuscript-image review.

Every extant line and every proposed inherited glossary or dictionary entry was inspected in P, Y, O, and LL. S does not transmit this poem. The JSON overlay records 1,189 witness-specific decisions: 1,040 confirm, 123 replace, and 26 suppress. Each decision quotes its own witness, and the review binds the exact XML, original glossary, DCC list, and morphology artifact by SHA-256.

Corrections include acquired wealth (*parto censu*), arms rather than shoulders (*lacertis*), singing rather than incantation (*canto*), third-conjugation *sapere*, payment rather than merchandise (*merces* with singular *aberat*), the noun *adulter*, and complete definitions for truncated entries. *Primum pilum deducite* concerns military command: *pīlus* is the company and *primum* its adjective. The generic javelin entry was replaced. P's *findebat* receives its own verb, rather than importing *scindebat*; Y's *factus* does not receive the *pastus* gloss. O and Y have adverbial *avide*. Homographs such as *latus*, *ferri*, *sine*, *modo*, and *me* are resolved from their clauses.

Uncertain or absent P readings are withheld. Y's *merces aberant* does not securely decide the merchandise/payment distinction, and its *Hic … dari* does not securely resolve the generated alternatives. Y's glyph before *equet* is expressly unexpanded in the TEI note, so it receives no inferred *exaequo* gloss. Its corrected *mersor* is not silently restored to *mensor*. The apparent *ad* in marked *ad{—}dere* is suppressed as a word fragment. These are documented limitations, not requests to normalize the transcription.

Lexical evidence uses Lewis and Short, *A Latin Dictionary*, Perseus Digital Library edition; individual dictionary URLs accompany corrections. The military construction is also supported by Henry T. Riley's 1885 translation and note on verse 27, available from [Project Gutenberg](https://www.gutenberg.org/files/47676/47676-h/47676-h.htm). DCC identities remain attached to corrected core lemmas; distinct homographs do not inherit unrelated frequency ranks.

The original glossary, XML, annotation rectangles, and TEI review seals were not edited. Coverage, literal quotations, source bindings, and default DCC exclusion pass `test/vocabulary-review.test.mjs`.

Independent agent `vocab_review` spot-checked all resolved dictionary homograph sets and the military, payment, variant-verb, and unexpanded-glyph decisions; no actionable lexical defect was found.
