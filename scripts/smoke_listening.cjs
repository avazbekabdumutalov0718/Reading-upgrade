const fs=require('fs');
const assert=require('assert');
const E=require('../dist/listening-engine.js');
const data=JSON.parse(fs.readFileSync('dist/listening-data.json','utf8'));
assert.equal(data.days,30);
assert.equal(data.lessons.length,60);
assert(!('notes' in data.shortCounts));
assert(!('notes' in data.longCounts));
assert.equal(data.shortCounts.gap,20);
assert.equal(data.longCounts.gap,40);
assert.equal(new Set(data.lessons.map(x=>x.id)).size,60);
for(let day=1;day<=30;day++){
  const lessons=data.lessons.filter(x=>x.day===day);
  assert.equal(lessons.length,2,`day ${day} lesson count`);
  assert(lessons.some(x=>x.kind==='short'),`day ${day} short`);
  assert(lessons.some(x=>x.kind==='long'),`day ${day} long`);
  const expectedLevel=day<=10?'B2':day<=20?'C1':'C2';
  assert(lessons.every(x=>x.level===expectedLevel),`day ${day} level`);
}
for(const lesson of data.lessons){
  const expected=lesson.kind==='short'?45:95;
  assert.equal(lesson.total,expected,lesson.id);
  assert.equal(Object.values(lesson.counts).reduce((a,b)=>a+b,0),expected,lesson.id+' count sum');
  assert(/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{6,}$/.test(lesson.youtubeUrl),lesson.id+' direct youtube URL');
  assert(E.youtubeId(lesson.youtubeUrl),lesson.id+' youtube id');
  assert(E.playerEmbedUrl(lesson.youtubeUrl,'http://127.0.0.1:5501').includes('enablejsapi=1'),lesson.id+' player embed');
}
const seed=data.lessons.find(x=>x.id==='ted01');
assert.equal(seed.starterMcq.length,5,'ted01 curated MCQ');
assert(seed.starterContent&&seed.starterContent.engineVersion===E.ENGINE_VERSION,'ted01 starter content');
assert(seed.starterMcq.every(q=>!q.prompt.includes('_____')),'MCQ must be comprehension, not cloze');
const content=seed.starterContent;
assert.equal(content.level,'B2');
for(const [mode,count] of Object.entries(seed.counts))assert.equal(content[mode].length,count,`seed ${mode}`);
assert(content.mcq.every(q=>!q.prompt.includes('_____')),'generated MCQ is not cloze');
assert(content.dictation.every(x=>typeof x.answer==='string'&&x.answer.length>10&&x.endTime>x.time));
const lines=[];
const vocabulary=['important','help','improve','change','problem','idea','focus','memory','habit','practice','study','result','reason','effect','increase','reduce','skill','method','example','support'];
for(let i=0;i<120;i++){
  const min=Math.floor(i/60),sec=i%60,w=vocabulary[i%vocabulary.length];
  lines.push(`${min}:${String(sec).padStart(2,'0')} Effective practice can ${w==='practice'?'improve':w} important skills because focused repetition supports memory and helps people achieve better results over time.`);
}
const transcript=lines.join('\n');
for(const level of ['B2','C1','C2']){
  const counts=data.shortCounts;
  const c=E.generate(transcript,counts,'smoke-'+level,level);
  assert.equal(c.level,level);
  for(const [mode,count] of Object.entries(counts))assert.equal(c[mode].length,count,`${level} ${mode}`);
  assert(c.mcq.every(x=>Array.isArray(x.options)&&x.options.length===4&&!x.prompt.includes('_____')));
  assert(c.gap.every(x=>String(x.answer).split(/\s+/).length>=2), level+' multi-word gap');
}
assert.equal(E.levelForDay(1),'B2');
assert.equal(E.levelForDay(11),'C1');
assert.equal(E.levelForDay(21),'C2');
assert.equal(E.videoAt('https://youtu.be/f2O6mQkFiiw',42),'https://www.youtube.com/watch?v=f2O6mQkFiiw&t=42s');
assert(E.scoreText('Hello, world!','hello world'));
const dirty='YouTube\nComments\n0:00\nThis is a complete spoken sentence about effective learning habits.\nLike\n0:12\nAnother useful spoken sentence explains how systems shape behavior over time.\n0:24\nFocused repetition can strengthen memory and improve practical performance.\n0:36\nPeople often underestimate how small changes accumulate into larger outcomes.\n0:48\nA clear environment can make desired actions easier to repeat consistently.\n1:00\nGood systems reduce dependence on motivation and make progress more reliable.\n1:12\nIdentity changes when repeated actions provide evidence about who you are becoming.\n1:24\nLong term results often appear only after a period of invisible improvement.\nComments\nRandom comment text';
assert(E.parseTranscript(dirty).every(x=>!x.text.includes('Random comment')));
console.log('Listening Boost v4 smoke checks passed.');
