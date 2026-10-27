/* Optional dictionary help. These lookups never change a witness reading. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./vocabulary.js'));
  else root.VocabularyLookup = factory(root.Vocabulary);
})(typeof globalThis === 'object' ? globalThis : this, function (Vocabulary) {
  'use strict';

  function normalizeForm(value) {
    return String(value).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
      .replace(/v/g, 'u').replace(/j/g, 'i').replace(/æ/g, 'ae').replace(/œ/g, 'oe').replace(/ſ/g, 's');
  }

  // Do not turn the intact part of a damaged or abbreviated word into a lookup.
  // Safety applies to the whole whitespace/punctuation-delimited source token.
  function sourceForms(line) {
    const result = [];
    let token = '';
    let unsafe = false;
    const flush = () => {
      if (token && !unsafe && /^\p{L}[\p{L}\p{M}]*$/u.test(token)) result.push(token);
      token = ''; unsafe = false;
    };
    for (const segment of line.segments || []) {
      const kinds = segment.kinds || [];
      const blocked = kinds.some(kind => ['unclear', 'uncertain', 'abbreviation', 'glyph', 'gap', 'deleted', 'mark'].includes(kind));
      if (kinds.includes('gap')) { token += '\uFFFC'; unsafe = true; continue; }
      for (const char of segment.text) {
        if (/[\s.,;:!?()“”‘’"'«»—–]/u.test(char)) flush();
        else { token += char; unsafe ||= blocked; }
      }
    }
    flush();
    return result;
  }

  function entryForm(entry) {
    const first = entry.headword.split(/[,<=]/)[0].trim();
    return /^\p{L}[\p{L}\p{M}]*$/u.test(first) ? normalizeForm(first) : '';
  }

  const reviewIndexes = new WeakMap();
  function decisionFor(review, witness, id, original) {
    if (!review) return undefined;
    if (!reviewIndexes.has(review)) {
      const index = new Map();
      for (const decision of review.entries || []) for (const name of decision.witnesses || []) {
        const key = `${name}|${decision.id}`;
        // Conflicting dispositions fail closed instead of depending on order.
        index.set(key, index.has(key) ? null : decision);
      }
      reviewIndexes.set(review, index);
    }
    const decision = reviewIndexes.get(review).get(`${witness}|${id}`);
    if (!decision || !['confirm', 'replace'].includes(decision.action)) return null;
    if (original.raw !== undefined && decision.kind === 'legacy-entry' && decision.raw !== original.raw) return null;
    if (original.form !== undefined && decision.form !== original.form) return null;
    return decision;
  }

  function reviewedEntry(original, decision, dictionary) {
    if (decision === null) return null;
    if (!decision) return original;
    const entry = { ...original, contextReviewed: true };
    if (Object.hasOwn(decision, 'dccId')) {
      delete entry.dccIds; delete entry.alternatives; delete entry.frequencyRank; delete entry.identity;
      if (decision.dccId === null) {
        if (original.dictionary && (!decision.headword || !decision.definition)) return null;
        delete entry.dccId;
        entry.nonCore = true;
      } else {
        const target = dictionary.get(decision.dccId);
        if (!target) return null;
        entry.dccId = target.id;
        delete entry.nonCore;
        if (original.dictionary) {
          entry.headword = target.headword;
          entry.definition = target.definition;
        }
      }
    }
    if (decision.headword !== undefined) entry.headword = decision.headword;
    if (decision.definition !== undefined) entry.definition = decision.definition;
    if (decision.action === 'replace') {
      delete entry.unparsed;
      entry.raw = `${entry.headword}: ${entry.definition}`;
      entry.reviewedDefinition = decision.headword !== undefined || decision.definition !== undefined;
    }
    return entry;
  }

  function enrichGroups(groups, lines, frequency, lookup, review, witness) {
    const dictionary = new Map((frequency?.entries || []).map(entry => [entry.id, entry]));
    const forms = lookup?.forms || {};
    const ambiguous = lookup?.ambiguousForms || {};
    const matchesRange = (range, number) => {
      const [start, end = start] = range.split(/[-–]/).map(Number);
      return Number(number) >= start && Number(number) <= end;
    };
    const result = groups.filter(group => lines.some(line => line.readable && matchesRange(group.lineRange, line.number)))
      .map(group => ({ ...group, entries: group.entries.map((original, index) => {
        const direct = Vocabulary.frequencyForEntry(original, frequency);
        const mappedId = forms[entryForm(original)]?.dccId;
        const dccId = !original.unparsed && (direct?.dccIds.length === 1 ? direct.dccIds[0] : !direct && dictionary.has(mappedId) ? mappedId : null);
        const candidate = dccId ? { ...original, dccId } : { ...original };
        return reviewedEntry(candidate, decisionFor(review, witness, `legacy:${group.lineRange}:${index}`, original), dictionary);
      }).filter(Boolean) }));

    for (const line of lines) {
      if (!line.readable) continue;
      const existing = result.filter(group => matchesRange(group.lineRange, line.number)).flatMap(group => group.entries);
      // The poem's reviewed gloss takes precedence over an added dictionary entry.
      const covered = new Set(existing.flatMap(entry => Vocabulary.frequencyForEntry(entry, frequency)?.dccIds || []));
      const additions = new Map();
      for (const surface of sourceForms(line)) {
        const form = normalizeForm(surface);
        const single = forms[form]?.dccId;
        const candidates = single ? [single] : ambiguous[form]?.allCandidatesCore ? ambiguous[form].dccIds : [];
        if (!candidates?.length || candidates.some(id => !dictionary.has(id))) continue;
        const ids = [...new Set(candidates)];
        const entries = ids.map(id => dictionary.get(id));
        const headword = ids.length === 1 ? entries[0].headword : surface;
        const definition = ids.length === 1 ? entries[0].definition : '';
        let candidate = {
          identity: ids.length === 1 ? ids[0] : `dictionary-form:${form}`,
          headword, definition, dictionary: true, sourceForms: [surface],
          ...(ids.length === 1 ? { dccId: ids[0] } : { dccIds: ids, alternatives: entries }),
          raw: entries.map(entry => `${entry.headword}: ${entry.definition}`).join('\n')
        };
        candidate = reviewedEntry(candidate, decisionFor(review, witness, `dictionary:${line.number}:${form}`, { form }), dictionary);
        if (!candidate) continue;
        if (Vocabulary.frequencyForEntry(candidate, frequency)?.dccIds.some(id => covered.has(id))) continue;
        const identity = Vocabulary.entryIdentity(candidate);
        if (additions.has(identity)) {
          const entry = additions.get(identity);
          if (!entry.sourceForms.includes(surface)) entry.sourceForms.push(surface);
        } else additions.set(identity, candidate);
      }
      if (additions.size) {
        let group = result.find(item => item.lineRange === String(line.number));
        if (!group) { group = { lineRange: String(line.number), entries: [] }; result.push(group); }
        group.entries.push(...additions.values());
      }
    }
    return result.filter(group => group.entries.length).sort((a, b) => parseInt(a.lineRange, 10) - parseInt(b.lineRange, 10));
  }

  return { normalizeForm, sourceForms, enrichGroups };
});
