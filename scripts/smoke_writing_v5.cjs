const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..','dist');
const d=JSON.parse(fs.readFileSync(path.join(root,'writing-data.json'),'utf8'));
const js=fs.readFileSync(path.join(root,'writing-engine.js'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(d.days.length===50,'50 days missing');
ok(d.days.reduce((s,x)=>s+Object.values(x.counts).reduce((a,b)=>a+b,0),0)===2200,'50-day total != 2200');
ok(d.samples.length===356,'356 sample answers missing');
ok(d.collocationTopics.length===30,'30 collocation topics missing');
let cards=0;
for(const t of d.collocationTopics){ok(t.cards.length===15,`15 collocations missing: ${t.topic}`); const seen=new Set(); for(const c of t.cards){cards++;ok(c.term.trim().split(/\s+/).length<=2,`not 1-2 words: ${c.term}`);ok(c.uz&&c.example,`translation/example missing: ${c.term}`);ok(!seen.has(c.term.toLowerCase()),`duplicate ${t.topic}: ${c.term}`);seen.add(c.term.toLowerCase())}}
ok(cards===450,'450 collocations missing');
ok(d.bookGrammarTopics.length>=55,'book grammar topics incomplete');
let bookDrills=0;
for(const t of d.bookGrammarTopics){ok(t.meaning&&t.uzMeaning&&t.whenEn&&t.whenUz,`bilingual explanation missing: ${t.title}`);ok(Array.isArray(t.examples)&&t.examples.length>=3,`3 examples missing: ${t.title}`);for(const e of t.examples.slice(0,3))ok(e.en&&e.uz,`example translation missing: ${t.title}`);ok(t.exercises.length===35,`35 exercises missing: ${t.title}`);bookDrills+=t.exercises.length;const levels=new Set(t.exercises.map(x=>x.level));ok(levels.has('B2')&&levels.has('C1'),`B2/C1 mix missing: ${t.title}`)}
ok(js.includes('colloc-games'),'7-game collocation launcher missing');
ok(js.includes("data-task=\"book\""),'Grammar Book tab missing');
ok(js.includes('WHEN / HOW TO USE'),'when/how block missing');
ok(js.includes('O‘ZBEKCHA TUSHUNTIRISH'),'Uzbek explanation missing');
ok(app.includes('window.openWritingGames='),'bridge to existing 7 games missing');
ok(app.includes('writingGameWordsById'),'writing game words bridge missing');
ok(html.includes('20261001-writing-v5'),'cache bust missing');
console.log('Writing Booster V5 smoke passed',{days:d.days.length,samples:d.samples.length,collocationTopics:d.collocationTopics.length,cards,grammarTopics:d.bookGrammarTopics.length,bookDrills});
