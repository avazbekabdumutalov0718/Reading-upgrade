"""Copy the maintained Reading Booster and MAX SPEAKING UI into dist/app.js."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
target = root / 'dist/app.js'
text = target.read_text(encoding='utf-8')

for file, start, end in (
    ('max-speaking-ui-snippet.js', '// Topic-based workbook from the user\'s 1,500-collocation document.', '\n// Thirty passages from ten supplied full mocks.'),
    ('reading-booster-ui-snippet.js', '// Thirty passages from ten supplied full mocks.', '\nfunction renderGames(){'),
):
    source = (root / 'scripts' / file).read_text(encoding='utf-8').rstrip()
    a, b = text.index(start), text.index(end, text.index(start))
    text = text[:a] + source + '\n' + text[b:]

old = 'rbStopTimer();readingBoosterProgress=rbNormalizeProgress(data?.readingBoosterProgress);'
new = old + 'if(rbTranslationData)rbRepairSavedWords();'
text = text.replace(old + 'if(rbTranslationData)rbRepairSavedWords();', old)
assert text.count(old) == 1
text = text.replace(old, new)
target.write_text(text, encoding='utf-8')
