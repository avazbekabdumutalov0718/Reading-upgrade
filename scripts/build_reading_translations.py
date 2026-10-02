"""Pretranslate the 30 reading passages and their distinct words entirely offline.

Requires the CC BY 4.0 HPLT English–Uzbek Marian model converted to
CTranslate2, plus ctranslate2 and sentencepiece. Download/model conversion is
an authoring step; the published site only needs the generated JSON asset.
"""
import argparse
import html
import json
import re
from collections import Counter
from pathlib import Path

import ctranslate2
import sentencepiece as spm

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--model', required=True, type=Path, help='Converted CTranslate2 model directory')
parser.add_argument('--spm', required=True, type=Path, help='HPLT model.en-uz.spm tokenizer')
args = parser.parse_args()

source = (ROOT / 'dist/app.js').read_text(encoding='utf-8')
match = re.search(r'const readingBoosterBank=(.*?);\n// READING_BOOSTER_DATA_END', source, re.S)
assert match, 'Reading Booster data missing'
passages = json.loads(match.group(1))['passages']
assert len(passages) == 30

sp = spm.SentencePieceProcessor(model_file=str(args.spm))
translator = ctranslate2.Translator(str(args.model), device='cpu', intra_threads=7, inter_threads=1)

def translate_many(texts, size=32):
    results = []
    for offset in range(0, len(texts), size):
        batch = texts[offset:offset+size]
        tokens = [sp.encode(value, out_type=str) for value in batch]
        translated = translator.translate_batch(tokens, beam_size=4, max_decoding_length=220, batch_type='tokens', max_batch_size=2048)
        results.extend(html.unescape(sp.decode(item.hypotheses[0])).strip() for item in translated)
        if offset % 320 == 0:
            print(f'{offset+len(batch)}/{len(texts)}', flush=True)
    return results

def split_paragraph(text, limit=390):
    """Split long paragraphs for the model without skipping source words."""
    parts, current = [], []
    for item in re.findall(r'\S+', text):
        if current and len(' '.join(current)) + len(item) + 1 > limit:
            parts.append(' '.join(current))
            current = []
        current.append(item)
    if current:
        parts.append(' '.join(current))
    assert ' '.join(parts).split() == text.split()
    return parts

# The challenge sentence extractor misses some headings and quoted sentences.
# Translate the actual paragraph text independently to cover every passage.
paragraph_records = [(p['id'], index, split_paragraph(paragraph)) for p in passages
                     for index, paragraph in enumerate(p['paragraphs'])]
all_chunks = [chunk for _, _, chunks in paragraph_records for chunk in chunks]
print(f'Translating {len(all_chunks)} full-passage chunks', flush=True)
translated_chunks = translate_many(all_chunks)
results, cursor = {p['id']: {'paragraphs': [''] * len(p['paragraphs']), 'sentences': []} for p in passages}, 0
for pid, index, chunks in paragraph_records:
    results[pid]['paragraphs'][index] = ' '.join(translated_chunks[cursor:cursor + len(chunks)])
    cursor += len(chunks)
assert cursor == len(all_chunks) and all(all(x['paragraphs']) for x in results.values())

all_sentences = [s['text'] for p in passages for s in p['sentences']]
sentences_uz = translate_many(all_sentences)
cursor = 0
for p in passages:
    end = cursor + len(p['sentences'])
    results[p['id']]['sentences'] = sentences_uz[cursor:end]
    cursor = end
assert cursor == len(all_sentences)

lexicon = json.loads((ROOT / 'dist/reading-lexicon.json').read_text(encoding='utf-8'))
verified = {key: html.unescape(html.unescape(value)) for key, value in lexicon['verified'].items()}
frequency = Counter(word.casefold().replace('’', "'") for p in passages for paragraph in p['paragraphs']
                    for word in re.findall(r"[^\W\d_]+(?:[’'-][^\W\d_]+)*", paragraph))
frequency.update(word.casefold().replace('’', "'") for p in passages
                 for word in re.findall(r"[^\W\d_]+(?:[’'-][^\W\d_]+)*",
                                        html.unescape(re.sub(r'<[^>]+>', ' ', p['questionHtml']))))
missing = [word for word, _ in frequency.most_common() if word not in verified]
print(f'Passage sentences: {len(all_sentences)}; unique words: {len(frequency)}; model words: {len(missing)}', flush=True)

# Isolated words are translated last and stored for immediate lookup.
word_uz = translate_many(missing, size=64)
translated_words = {word: html.unescape(html.unescape(uz)) for word, uz in zip(missing, word_uz) if uz}
translated_words.update(verified)
payload = {'source': 'HPLT English–Uzbek MT v2.0 (CC BY 4.0); machine translation, review in context',
           'passages': results, 'words': translated_words}
target = ROOT / 'dist/reading-translations.json'
target.write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(f'Wrote {target} ({target.stat().st_size:,} bytes)', flush=True)
