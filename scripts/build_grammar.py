"""Deduplicate four supplied grammar inventories and add original practice examples.

The PDF documents themselves are not copied into the site. Short grammar
patterns are indexed; explanations, examples, and exercises are newly written.
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCES = [
    ('advanced', 'Advanced Grammar', 'grammar_advanced.txt'),
    ('c1', '25 C1+ Structures', 'grammar_c1.txt'),
    ('speaking', 'Advanced Grammar for Speaking', 'grammar_speaking.txt'),
    ('powerful', '51 Powerful Structures', 'grammar_powerful.txt'),
]
entries = {}
source_counts = {}
for code, name, file in SOURCES:
    rows = (ROOT / 'scripts' / file).read_text().splitlines()
    seen = set()
    count = 0
    corrections = False
    for line in rows:
        if 'Lesson 35:' in line:
            corrections = True
        if not line or line.startswith('#'):
            continue
        key, pattern, meaning, example, chunk = line.split('|')
        assert key not in seen or code in ('c1', 'speaking'), (code, key)
        seen.add(key)
        count += 1
        assert example.lower().count(chunk.lower()) == 1, (code, key, chunk, example)
        if key not in entries:
            before, after = example.lower().split(chunk.lower(), 1)
            entries[key] = dict(
                id=key, pattern=pattern, meaning=meaning, example=example,
                chunk=example[len(before):len(before) + len(chunk)],
                gap=example[:len(before)] + '_____' + example[len(before) + len(chunk):],
                sources=[], type='correction' if corrections else 'structure',
            )
        else:
            # A shared pattern is one card with multiple source labels.
            assert entries[key]['example'] == example, (key, code)
        if corrections:
            entries[key]['correction'] = True
        if code not in entries[key]['sources']:
            entries[key]['sources'].append(code)
    source_counts[code] = count

# Word-form pairs are short linguistic facts in the nominalisation chapter,
# not copied teaching prose. The PDF's advanced -> advancement pair is
# corrected to advance -> advancement.
NOMINAL_FORMS = [
    ['develop', 'development'], ['analyse', 'analysis'], ['reduce', 'reduction'],
    ['solve', 'solution'], ['create', 'creation'], ['affect', 'effect'],
    ['encourage', 'encouragement'], ['depend', 'dependence'],
    ['maintain', 'maintenance'], ['consider', 'consideration'],
    ['regulate', 'regulation'], ['promote', 'promotion'],
    ['reinforce', 'reinforcement'], ['advocate', 'advocacy'],
    ['important', 'importance'], ['possible', 'possibility'],
    ['effective', 'effectiveness'], ['relevant', 'relevance'],
    ['reliable', 'reliability'], ['flexible', 'flexibility'],
    ['sustainable', 'sustainability'], ['innovative', 'innovation'],
    ['responsible', 'responsibility'], ['advance', 'advancement'],
    ['diverse', 'diversity'], ['complex', 'complexity'],
    ['adaptable', 'adaptability'], ['productive', 'productivity'],
]
assert len(NOMINAL_FORMS) == 28
assert source_counts['c1'] == 25 and source_counts['powerful'] == 51, source_counts
assert sum(1 for e in entries.values() if e.get('correction')) == 25
payload = {
    'sources': [{'id': code, 'name': name, 'listed': source_counts[code]} for code, name, _ in SOURCES],
    'entries': list(entries.values()),
    'nominalForms': NOMINAL_FORMS,
}
(ROOT / 'dist/grammar-content.json').write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')))
print('Grammar:', len(entries), 'unique cards;', source_counts, 'PDF listings; 28 nominal forms')
