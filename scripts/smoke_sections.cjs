// Focused regression checks for wheel persistence and Reading Words migration.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const max = {
  maxSpeakingWheel: {used:[],lastAt:0,selected:null},
  maxSpeakingBank: {topics:Array.from({length:30},(_,i)=>({title:`Topic ${i+1}`}))},
  maxSpeakingScreen:'library', state:{view:'testing'},
  root:{querySelector:()=>null}, document:{getElementById:()=>null},
  localStorage:{setItem(){}}, storageKey:key=>key,
  window:{VocabCloud:{queue(){}}},
  crypto:{getRandomValues(array){array[0]=7;return array}},
  setInterval(){}, clearTimeout(){}, setTimeout(fn){fn();return 1},
  esc:x=>x, Date, console,
};
vm.createContext(max);
vm.runInContext(fs.readFileSync('scripts/max-speaking-ui-snippet.js','utf8'), max);
vm.runInContext('maxSpeakingSpin()',max);
assert.equal(max.maxSpeakingWheel.used.length,1);
vm.runInContext('maxSpeakingSpin()',max);
assert.equal(max.maxSpeakingWheel.used.length,1,'12-hour cooldown must block a second spin');
for(let i=1;i<30;i++){
  max.maxSpeakingWheel.lastAt=Date.now()-12*60*60*1000-1;
  vm.runInContext('maxSpeakingSpin()',max);
}
assert.equal(new Set(max.maxSpeakingWheel.used).size,30,'No topic should repeat');
max.maxSpeakingWheel.lastAt=0;
vm.runInContext('maxSpeakingSpin()',max);
assert.equal(max.maxSpeakingWheel.used.length,30,'Wheel stops after all topics');
assert.match(vm.runInContext('maxSpeakingWheelPanel(maxSpeakingBank.topics)',max),/30 mavzu tugadi/);

const passage = {id:'d01',paragraphs:['These demands and a space filled with water.']};
const reading = {
  readingBoosterBank:{passages:[passage]},
  readingBoosterProgress:{d01:{words:[
    {id:'rb:d01:aaaaaaaa',w:'se demands and',u:'talablar va',source:'passage'},
    {id:'rb:d01:bbbbbbbb',w:'filled',u:'to&amp;#39;ldirilgan',d:'UzWordnet',source:'passage'},
  ]}},
  progress:{'rb:d01:aaaaaaaa':{level:1}},mistakes:{},sessions:{},
  saveProgress(){},saveExtra(){},saveSessions(){},
  localStorage:{setItem(){}},storageKey:key=>key,window:{VocabCloud:{queue(){}}},
  rbTranslationData:null,crypto:{randomUUID:()=> 'cccccccc'},
  norm:s=>String(s||'').toLowerCase().replace(/[^a-z]+/g,' ').trim(),
  console,
};
vm.createContext(reading);
vm.runInContext(fs.readFileSync('scripts/reading-booster-ui-snippet.js','utf8'),reading);
vm.runInContext(`rbTranslationData={words:{filled:"to'ldirilgan",demands:'talablar'}}`,reading);
vm.runInContext('rbRepairSavedWords()',reading);
assert.equal(reading.readingBoosterProgress.d01.words.length,1,'Invalid partial selection removed');
assert.equal(reading.readingBoosterProgress.d01.words[0].u,"to'ldirilgan",'HTML entities decoded');
assert.equal(reading.progress['rb:d01:aaaaaaaa'],undefined);
const term=vm.runInContext("rbSelectedWholeWords({toString:()=> 'se demands and',startContainer:{nodeType:3,textContent:'these demands and'},startOffset:3,endContainer:{nodeType:3,textContent:'these demands and'},endOffset:17})",reading);
assert.equal(term,'these demands and');
const app=fs.readFileSync('dist/app.js','utf8');
const match=app.match(/const readingBoosterBank=(.*?);\n\/\/ READING_BOOSTER_DATA_END/s);
assert.ok(match,'Reading Booster bank embedded');
const passages=JSON.parse(match[1]).passages;
const translations=JSON.parse(fs.readFileSync('dist/reading-translations.json','utf8'));
assert.equal(passages.length,30);
assert.equal(Object.keys(translations.passages).length,30);
for(const p of passages){
  const result=translations.passages[p.id];
  assert.equal(result.paragraphs.length,p.paragraphs.length);
  assert.equal(result.sentences.length,p.sentences.length);
  assert.ok(result.paragraphs.every(Boolean),`${p.id}: missing paragraph translation`);
  for(const word of p.paragraphs.join(' ').match(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g)||[]){
    assert.ok(translations.words[word.toLowerCase().replaceAll('’',"'")],`${p.id}: missing word ${word}`);
  }
}
console.log('Reading Words and MAX SPEAKING wheel checks passed.');
