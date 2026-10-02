from pathlib import Path
import re, json
ROOT = Path(__file__).resolve().parents[1] / 'dist'
idx=(ROOT/'index.html').read_text()
app=(ROOT/'app.js').read_text()
nav=re.search(r'<nav id="primaryNav".*?</nav>',idx,re.S).group(0)
routes=re.findall(r'data-view="([^"]+)"',nav)
required=['readingbooster','listeningboost','writingboost','speakingpractice','readingtests','listeningtests','speakingmock','mockanalysis','speaking','daily','speakingtopics','topics','wheel','review','search','mistakes','favorites','games','tenses','grammar','grammargames','results','premium']
assert routes == required
for f in ['data.json','listening-data.json','grammar-content.json','writing-data.json','speaking-content.json','imported-library.js','tenses.js','writing-engine.js']:
    p=ROOT/f; assert p.exists() and p.stat().st_size > 20, f
words=json.load(open(ROOT/'data.json'))
assert len(words) > 4000 and sum(1 for x in words if x.get('s')) == 850
listening=json.load(open(ROOT/'listening-data.json'))
assert len(listening.get('lessons',[])) == 60
assert "setNav('#navAll'" in app and "const el=$(id);if(el)" in app
cloud=(ROOT/'cloud.js').read_text()
assert 'await showAuth(onReady)' in cloud
assert "start: async onReady => { mode='local'" not in cloud
sw=(ROOT/'service-worker.js').read_text()
assert 'vivid-ielts-v21-readability-thumbnails' in sw
print('V16 all-section static checks passed:', len(required), 'routes;', len(words), 'words')
