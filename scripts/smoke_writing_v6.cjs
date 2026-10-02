const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..','dist');
const d=JSON.parse(fs.readFileSync(path.join(root,'writing-data.json'),'utf8'));
const js=fs.readFileSync(path.join(root,'writing-engine.js'),'utf8');
const css=fs.readFileSync(path.join(root,'writing-boost.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(d.days.length===50,'50 days missing');
ok(d.samples.length===356,'356 sample answers missing');
ok(d.collocationTopics.length===30,'30 collocation topics missing');
ok(d.bookGrammarTopics.length===59,'59 book grammar topics missing');
ok(d.task2Structures.length===30,'30 Task 2 structures missing');
ok(d.task1Structures.length===20,'20 Task 1 structures missing');
const expectedSkills=['QOIDA / USE','MISOLNI TANISH','GAP FILL','SO‘Z TARTIBI','TRUE / FALSE','TARJIMA','REWRITE','COMBINE','ACADEMIC UPGRADE','O‘ZINGIZ YOZING'];
let total=0;
for(const key of ['bookGrammarTopics','task2Structures','task1Structures']){
 for(const t of d[key]){
  ok(t.exercises.length===30,`30 exercises missing: ${key} ${t.pattern||t.title}`); total+=30;
  const counts=new Map();for(const e of t.exercises)counts.set(e.skill,(counts.get(e.skill)||0)+1);
  for(const s of expectedSkills)ok(counts.get(s)===3,`skill ${s} != 3: ${t.pattern||t.title}`);
  const levels=new Set(t.exercises.map(x=>x.level));ok(levels.has('B2')&&levels.has('C1'),`B2/C1 mix missing: ${t.pattern||t.title}`);
  for(const e of t.exercises.filter(x=>x.type==='mcq')){ok(Array.isArray(e.options)&&e.options.length>=2,'MCQ options missing');ok(e.options.includes(e.answer),'MCQ answer not in options')}
 }
}
ok(total===3270,`grammar drill total ${total} != 3270`);
ok(!JSON.stringify(d).includes('Which grammar focus is demonstrated most clearly?'),'old weird identify prompt remains');
ok(js.includes("data-writing-action=\"grammar-start\""),'30 practice launcher missing');
ok(js.includes("data-writing-action=\"grammar-jump\""),'exercise-family jump missing');
ok(js.includes('10 xil practice turi'),'mixed exercise description missing');
ok(css.includes('.wb-start-30'),'30 exercise button style missing');
ok(html.includes('20261001-writing-v6'),'V6 cache bust missing');
console.log('Writing Booster V6 smoke passed',{total,book:d.bookGrammarTopics.length,task2:d.task2Structures.length,task1:d.task1Structures.length});
