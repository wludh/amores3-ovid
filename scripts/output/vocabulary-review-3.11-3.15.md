# Contextual vocabulary review: Amores 3.11–3.15

Reviewed 2026-10-26 by the vocabulary data agent. This is a lexical review of the existing reviewed witness transcriptions, not a new transcription or an image-based reseal. All candidate output was inspected against the complete verse context in each available witness, including divergent, abbreviated, marked and uncertain readings. The XML, original glossary files and review seals remain unchanged.

## Coverage and method

The five JSON overlays in `docs/data/vocabulary-review/` record every proposed legacy glossary entry and every generated dictionary source-form candidate for each witness in the frozen audit bundles. Coverage includes every numbered source line, including gap-only lines; P and S absences remain absences. Repeated occurrences of an identical candidate within one verse share one disposition. Every disposition quotes its own witness line and is tied to the exact TEI, glossary, DCC and morphology SHA-256 values.

| Poem | Legacy witness candidates | Dictionary witness candidates | Confirmed | Replaced | Suppressed |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3.11 | 384 | 601 | 655 | 276 | 54 |
| 3.12 | 245 | 364 | 405 | 174 | 30 |
| 3.13 | 237 | 263 | 335 | 155 | 10 |
| 3.14 | 338 | 583 | 657 | 219 | 45 |
| 3.15 | 105 | 159 | 160 | 94 | 10 |

Totals: 3279 witness-specific candidate dispositions: 2212 confirmed, 918 replaced and 149 suppressed. “Replaced” includes contextual resolution of dictionary homographs as well as repairs to the imported glossary. Counts are candidate dispositions, not distinct Latin lemmas.

Legacy entries were paired to the actual inflected word or attested phrase, not merely to a line number. Readable source spellings are preserved, with explicit reasoning for spelling variants such as Y *adesi* or *timideque*. A missing, different, abbreviated or uncertain relevant word does not receive the expected reading’s gloss. Compound spacing is recognized only where the actual construction supports it, for example Y *per erratis*; the separate automatic preposition *per* is suppressed there. Unsupported word fragments created around TEI marks do not receive an independent lemma.

Full supplied dictionary definitions are retained when the lemma fits. Where an imported definition is corrupt, blank, the wrong part of speech or the wrong contextual sense, the overlay supplies a complete concise lexical gloss. These corrections are lexical interpretations of the quoted verse, not changes to the transcription. A replacement outside the DCC core has explicit `dccId: null`; a core replacement uses the precise DCC identity so the default excludes it correctly.

## Consequential corrections

- **3.11:** *multa* means many things, not a monetary fine; *adserui* uses the legal freeing verb, not planting; *sera* is late, not a door-bolt; *humo* is ground, not bury; *emeritum latus* is the worn-out side; *rivali* is a rival lover, not “of a brook”; *alium* is another person, not garlic; *potentia* is an adjective modifying words; *morum* is character, not mulberry; *voti* is a wish; *eris* is “you will be”; *lintea* are sails and *potius* means rather. *Iam* and the manuscript spelling *condam* receive the correct adverbs, rather than *eo* and *condo*. Y’s uncertain *ui<s> elige* does not receive the automatic noun *vis*.
- **3.12:** possessives *meo/meum* and *nostras* replace unrelated lemmas; *furata* has active deponent meaning; *pube* is the pubic-region noun; *lacertis* are arms, not lizards; *ales* is a bird; *maris* is sea, not male; *mensis* are tables/feasts, not months; *fide* is credibility, not an adverb. Y’s separated *-ve* is the DCC enclitic “or”, not *vis*. Different Y readings such as *stetit*, *genus* and *iucunda* do not inherit *sitio*, *gena* or *fecundus* glosses.
- **3.13:** *victa* is conquered, *festa* festivals, *ludos* public games, *densa* an adjective, *cantu* music and *Falisca* Faliscan. *Tempora* are the bull’s temples; the anatomical gloss replaces “time”, while DCC membership remains the same *tempus* lemma (rank 89), as Lewis–Short treats both senses in one entry. *Latas* means broad, *pedes* feet rather than an infantryman, *ora/ore* mouth rather than shore or bone, and *amica* friendly rather than girlfriend. O/LL *praeverrunt* is not transferred to Y *praebuerant*.
- **3.14:** *sis/eris* are forms of *sum*; *famosam* is notorious; *ignoto* means unknown; *Quiriti* is a Roman citizen; *deliciis* pleasure rather than a roof beam; *lecto* a bed rather than “read”; *populo* people rather than devastate; *sine* is the imperative allow; *artus* are limbs; *prona palma* is an easy victory. P’s literal *terra* remains its own reading and receives no borrowed *meretrix* gloss. Unsupported etymological prose for *ne* is suppressed in all witnesses.
- **3.15:** *elegis* receives the missing elegy headword; *ultima* is the superlative adjective; *alumnus* a native son; *quantulacumque* includes its concessive force; *culte* is adorned/refined; *aurea* golden; *signa* standards rather than a verb; *graviore* heavier/more serious rather than pregnant; *superstes* surviving rather than *supersto*. Y *Traditur* and *arca* do not inherit the *rado* and *area* glosses from other witnesses.

## References and validation

The original DCC dataset remains the authority for membership and frequency rank: [DCC Latin Core Vocabulary](https://dcc.dickinson.edu/latin-core-list1). Corrected lexical senses were checked against Lewis and Short, *A Latin Dictionary* (1879), using the [Perseus digital source](https://github.com/PerseusDL/lexica/blob/master/CTS_XML_TEI/perseus/pdllex/lat/ls/lat.ls.perseus-eng1.xml); individual replacement records link the relevant [Logeion](https://logeion.uchicago.edu/) lemma. Homograph references were checked against the actual dictionary entries, including *assero* (free vs plant), *furor* (steal vs fury), *artus* (limbs vs narrow), *os* (mouth vs bone), *latus* (side vs broad), *ignotus* (unknown vs forgiven), and *Musa* (Muse vs personal surname). These reference links support lexical senses; the quoted witness context supports their application.

`node --test --test-name-pattern='3\.1[1-5]:' test/vocabulary-review.test.mjs` passed all five tests. This checks exact current source/data hashes, complete candidate dispositions per witness, no duplicate dispositions, exact line coverage, literal quote evidence, valid DCC IDs, fail-closed runtime filtering, and DCC exclusion at the default amount. It does not replace the contextual reading documented here.

Conservative omissions are intentional, particularly for damaged P text and marked/abbreviated Y forms. The Y 3.11.49 division *ui<s> elige* remains lexically unresolved and suppressed. No unsupported reconstruction is presented as certain. A future transcription or dictionary-data change invalidates the affected overlays and requires renewed lexical review.

## Independent spot-review

A second agent (`vocabulary_expansion`) inspected all source-form replacements with explicit definitions, 29 nontrivial homograph resolutions and selected consequential legacy corrections against their quoted witness clauses. This covered *adserui*, *potentia*, *rivalis*, *furata*, *pube*, *mare/mensa*, *lacertus*, anatomical *tempora*, adjectival *amica*, imperative *sine*, *artus*, *ignotus*, *prona palma*, *cultus*, *gravior* and *superstes*. No blocking lexical error was found. The wording for deponent *furor* was improved to “steal; furata: having stolen” following that review. This spot-review is additional scrutiny, not a claim of a second full manuscript-image transcription pass.

## Cross-review of the 3.1–3.5 overlays

The vocabulary data agent independently spot-checked the other reviewer’s quoted evidence and corrections for *tenere/tenerae*, relative *que*, *incisa* (cutting, noncore), interjection *a*, *vis* (volo), *frondibus/fronde* (foliage), *parce* (parco), *plausus*, *signa*, *inseruisse* (insert rather than sow), *vota*, *verum*, *intus*, *labes*, and the noun phrase *fulminis modo*. The lexical decisions in that sample are supported by the displayed clauses.

Two observations were sent back to the owning reviewer: P/Y 3.3.21 *nostrum* cannot confidently be described as agreeing with feminine *poenam*, and the unusual written construction should be treated conservatively; 3.1.24 *cessatum est* is an impersonal passive perfect with a participle, not a supine construction. These observations concern the other reviewer’s overlays; no files owned by that reviewer were changed here.

Follow-up: the owning reviewer fixed both cross-review observations: P/Y 3.3.21 *nostrum* is now suppressed as unresolved, and 3.1.24 *cessatum* is correctly described as the neuter passive participle in an impersonal perfect. A consistency check of 3.13.17 *tempora* against the full Lewis–Short entry confirmed a single lemma encompassing temporal and anatomical senses; its anatomical definition remains, but DCC identity is now `dcc-tempus-89` to keep default exclusion consistent across poems.
