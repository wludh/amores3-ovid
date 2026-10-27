/* Vocabulary help reuses the companion glossary and the selected reviewed witness.
 * It does not normalize a manuscript into another witness or infer missing words. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Vocabulary = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  const TEI_NS = 'http://www.tei-c.org/ns/1.0';
  const elementChildren = node => Array.from(node?.childNodes || []).filter(child => child.nodeType === 1);
  const descendants = function* (node) {
    for (const child of elementChildren(node)) {
      yield child;
      yield* descendants(child);
    }
  };
  const attribute = (node, name) => node.getAttribute(name) || '';
  const isTei = node => node.namespaceURI === TEI_NS;
  const rawText = node => node.nodeType === 3 || node.nodeType === 4
    ? node.nodeValue || ''
    : Array.from(node.childNodes || [], rawText).join('');

  function isUnparsedHeadword(headword) {
    return /^(?:(?:pl|sg)(?=\s*(?:,|$))|(?:From|Cognate|Martirosyan|The feminine|Unknown)\b)/i.test(headword.trim());
  }

  function parseEntries(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
    return Object.entries(data)
      .filter(([lineRange, value]) => /^\d+(?:[-–]\d+)?$/.test(lineRange) && typeof value === 'string')
      .map(([lineRange, value]) => ({
        lineRange,
        entries: value.split(/\r?\n/).map(raw => raw.trim()).filter(Boolean).map(raw => {
          const colon = raw.indexOf(':');
          const headword = colon < 0 ? raw : raw.slice(0, colon).trim();
          const definition = colon < 0 ? '' : raw.slice(colon + 1).trim();
          return { headword, definition, raw, ...(isUnparsedHeadword(headword) ? { unparsed: true } : {}) };
        })
      }))
      .filter(group => group.entries.length)
      .sort((a, b) => Number.parseInt(a.lineRange, 10) - Number.parseInt(b.lineRange, 10));
  }

  function toFlashcardTsv(entries) {
    const rows = new Set();
    const field = value => value.replace(/\s+/gu, ' ').trim();
    for (const entry of Array.isArray(entries) ? entries : []) {
      if (entry?.unparsed || typeof entry?.headword !== 'string' || typeof entry?.definition !== 'string') continue;
      const headword = field(entry.headword);
      const definition = field(entry.definition);
      if (headword && definition) rows.add(`${headword}\t${definition}`);
    }
    return { text: Array.from(rows).join('\n'), count: rows.size };
  }

  const normalizeKey = value => String(value || '').normalize('NFD').replace(/\p{M}/gu, '')
    .toLowerCase().trim().replace(/\s+/g, ' ');

  // Prefer a dictionary identity supplied by the conservative morphology lookup.
  // Legacy forms remain distinct unless they have exactly the same first form.
  function entryIdentity(entry) {
    if (entry.identity) return entry.identity;
    if (entry.dccId) return entry.dccId;
    const first = entry.headword.split(',')[0];
    // Malformed legacy "pl, ..." / "sg, ..." headings and prose notes must not
    // collapse several unrelated entries into one supposed Latin headword.
    return normalizeKey(isUnparsedHeadword(entry.headword) ? entry.headword : first);
  }

  const frequencyIndexes = new WeakMap();
  function frequencyIndex(dataset) {
    if (!dataset || !Array.isArray(dataset.entries)) return { byId: new Map(), byKey: new Map() };
    if (frequencyIndexes.has(dataset)) return frequencyIndexes.get(dataset);
    const byId = new Map();
    const byKey = new Map();
    for (const entry of dataset.entries) {
      if (!Number.isInteger(entry.rank) || entry.rank < 1) continue;
      byId.set(entry.id, entry);
      for (const key of entry.keys || [entry.lemma]) {
        const normalized = normalizeKey(key);
        if (!byKey.has(normalized)) byKey.set(normalized, []);
        byKey.get(normalized).push(entry);
      }
    }
    const index = { byId, byKey };
    frequencyIndexes.set(dataset, index);
    return index;
  }

  // Frequency matching never supplies a definition. A homographic heading can
  // safely be recognized as core while its dictionary sense remains unresolved.
  function frequencyForEntry(entry, dataset) {
    if (entry.nonCore) return null;
    const { byId, byKey } = frequencyIndex(dataset);
    const explicitIds = [...new Set(Array.isArray(entry.dccIds) ? entry.dccIds : entry.dccId ? [entry.dccId] : [])];
    if (explicitIds.length) {
      const listed = explicitIds.map(id => byId.get(id));
      if (listed.some(item => !item)) return null;
      return { rank: Math.min(...listed.map(item => item.rank)), dccIds: explicitIds, ambiguous: listed.length > 1 };
    }
    const headword = normalizeKey(entry.headword);
    if (entry.unparsed || isUnparsedHeadword(headword)) return null;
    const firstWord = value => normalizeKey(value).match(/^[a-zæœ]+/)?.[0];
    const candidates = [entry.lemma, firstWord(headword)];
    // An explicit form < lemma or form = equivalent preserves the author's
    // identification; no stemming or guessed lemmatization is performed here.
    for (const part of headword.split(/[<=]/).slice(1)) candidates.push(firstWord(part.trim()));
    let matches = Array.from(new Map(candidates.filter(Boolean).flatMap(key => byKey.get(normalizeKey(key)) || [])
      .map(listed => [listed.id, listed])).values());
    if (!matches.length) return null;
    // These legacy principal parts distinguish the noun/adjective or
    // adjective/preposition that share a DCC key. Other homographs stay marked.
    const legacySense = /^adversus,\s*adversa,\s*adversum$/.test(headword) ? 'dcc-adversus-657'
      : /^latus,\s*lateris,?\s*n\.?$/.test(headword) ? 'dcc-latus-382' : null;
    if (legacySense && byId.has(legacySense)) matches = [byId.get(legacySense)];
    // For unresolved core homographs, order at the most common possible rank
    // rather than asserting the rarer sense. The ambiguity remains explicit.
    return { rank: Math.min(...matches.map(listed => listed.rank)), dccIds: matches.map(listed => listed.id), ambiguous: matches.length > 1 };
  }

  /**
   * A nested quantity scale: 0 = none; 50 = all eligible non-DCC entries;
   * 100 = all eligible words. Above 50, DCC core entries enter from least to
   * most common according to the published ranks. Unlisted words have no
   * measured frequency here and keep source order within the first half.
   * Obvious unparsed glossary prose is not counted as vocabulary; it is
   * preserved verbatim only at full help as an original glossary note.
   * Callers restrict groups to readable lines in the chosen witness first.
   */
  function selectEntries(groups, percentage, frequencyDataset) {
    const amount = Number.isFinite(Number(percentage)) ? Math.min(100, Math.max(0, Number(percentage))) : 0;
    const local = new Map();
    for (const group of groups) for (const entry of group.entries) {
      if (entry.unparsed) continue;
      const identity = entryIdentity(entry);
      const frequency = frequencyForEntry(entry, frequencyDataset);
      if (!local.has(identity)) local.set(identity, { identity, order: local.size, rank: frequency?.rank ?? null });
      else if (frequency) {
        const word = local.get(identity);
        word.rank = word.rank === null ? frequency.rank : Math.min(word.rank, frequency.rank);
      }
    }
    const words = Array.from(local.values());
    const nonCore = words.filter(word => word.rank === null);
    const core = words.filter(word => word.rank !== null).sort((a, b) => b.rank - a.rank || a.order - b.order);
    const nonCoreCount = Math.ceil(nonCore.length * Math.min(amount, 50) / 50);
    const coreCount = Math.ceil(core.length * Math.max(amount - 50, 0) / 50);
    const selected = new Set([...nonCore.slice(0, nonCoreCount), ...core.slice(0, coreCount)].map(word => word.identity));
    return {
      groups: groups.map(group => ({
        ...group,
        entries: group.entries.filter(entry => entry.unparsed ? amount === 100 : selected.has(entryIdentity(entry)))
      })).filter(group => group.entries.length),
      shownWords: selected.size,
      totalWords: words.length,
      coreWords: core.length,
      nonCoreWords: nonCore.length
    };
  }

  function reviewedWitnesses(corpus, poem) {
    return (corpus?.records || []).filter(record => record.poem === poem && record.status === 'reviewed' && record.path);
  }

  function extractWitnessLines(xmlDoc, poem) {
    const root = xmlDoc?.documentElement;
    if (!root || !isTei(root)) return [];
    const elements = [root, ...descendants(root)];
    const division = elements.find(node => isTei(node) && node.localName === 'div' && attribute(node, 'type') === 'poem' && attribute(node, 'n') === poem);
    if (!division) return [];

    const glyphs = new Map();
    for (const declaration of elements.filter(node => isTei(node) && node.localName === 'char')) {
      const display = elementChildren(declaration).find(node => node.localName === 'mapping' && attribute(node, 'type') === 'display');
      if (display) glyphs.set(attribute(declaration, 'xml:id'), rawText(display));
    }

    function sourceSegments(node, kinds = []) {
      if (node.nodeType === 3 || node.nodeType === 4) return [{ text: node.nodeValue || '', kinds }];
      if (node.nodeType !== 1 || !isTei(node)) return [];
      const name = node.localName;
      // Marginal annotations and explanatory prose are not verse text.
      if (['note', 'desc', 'pb', 'fw'].includes(name)) return [];
      if (['low', 'medium'].includes(attribute(node, 'cert')) && !kinds.includes('uncertain')) kinds = [...kinds, 'uncertain'];
      if (name === 'choice') {
        const children = elementChildren(node);
        const selected = ['abbr', 'orig', 'sic'].map(preferred => children.find(child => child.localName === preferred)).find(Boolean) || children[0];
        return selected ? sourceSegments(selected, kinds) : [];
      }
      if (name === 'g') return [{ text: glyphs.get(attribute(node, 'ref').replace(/^#/, '')) || rawText(node) || '�', kinds: [...kinds, 'glyph'] }];
      if (name === 'space' || (name === 'gap' && ['notInscribed', 'not-inscribed'].includes(attribute(node, 'reason')))) {
        const fallback = attribute(node, 'extent') === 'large' ? 4 : 1;
        const quantity = Math.max(1, Math.min(Number(attribute(node, 'quantity')) || fallback, 20));
        return [{ text: ' '.repeat(quantity), kinds: [...kinds, 'space'] }];
      }
      if (name === 'gap') return [{ text: '[…]', kinds: [...kinds, 'gap'], reason: attribute(node, 'reason') }];
      if (name === 'lb') return attribute(node, 'break') === 'no' ? [] : [{ text: ' ', kinds }];
      const kind = { unclear: 'unclear', del: 'deleted', add: 'added', metamark: 'mark', abbr: 'abbreviation' }[name];
      const nextKinds = kind ? [...kinds, kind] : kinds;
      return Array.from(node.childNodes || []).flatMap(child => sourceSegments(child, nextKinds));
    }

    function displayText(segments) {
      // Plain-text consumers retain the distinction between cancellation,
      // addition and uncertain writing. Rich consumers may style `kinds` instead.
      let output = '';
      let active = [];
      const wrappers = { deleted: ['⟦', '⟧'], added: ['⟨', '⟩'], unclear: ['[', '?]'], mark: ['{', '}'] };
      for (const segment of segments) {
        const next = segment.kinds.filter(kind => wrappers[kind]);
        let shared = 0;
        while (shared < active.length && active[shared] === next[shared]) shared += 1;
        for (let index = active.length - 1; index >= shared; index -= 1) output += wrappers[active[index]][1];
        for (let index = shared; index < next.length; index += 1) output += wrappers[next[index]][0];
        output += segment.text;
        active = next;
      }
      for (let index = active.length - 1; index >= 0; index -= 1) output += wrappers[active[index]][1];
      return output;
    }

    return Array.from(descendants(division))
      .filter(node => isTei(node) && node.localName === 'l')
      .map(line => {
        const segments = sourceSegments(line);
        return {
          number: attribute(line, 'n'),
          text: displayText(segments),
          segments,
          readable: segments.some(segment => !segment.kinds.some(kind => ['gap', 'deleted', 'mark'].includes(kind)) && /\p{L}/u.test(segment.text)),
          hasGap: segments.some(segment => segment.kinds.includes('gap')),
          hasUncertainty: segments.some(segment => segment.kinds.includes('unclear') || segment.kinds.includes('uncertain'))
        };
      });
  }

  return { parseEntries, toFlashcardTsv, selectEntries, entryIdentity, frequencyForEntry, reviewedWitnesses, extractWitnessLines };
});
