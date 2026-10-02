const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..','dist');
const d=JSON.parse(fs.readFileSync(path.join(root,'writing-data.json'),'utf8'));
const js=fs.readFileSync(path.join(root,'writing-engine.js'),'utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(d.days.length===50,'50 days missing');
const total=d.days.reduce((sum,x)=>sum+Object.values(x.counts).reduce((a,b)=>a+b,0),0);
ok(total===2200,'course task total must be 2200');
ok(d.samples.length===356,'sample answers must be 356');
ok(d.task2Structures.length===30,'task2 structures must be 30');
ok(d.task1Structures.length===20,'task1 structures must be 20');
for(const s of [...d.task2Structures,...d.task1Structures]){
  ok(s.uzMeaning&&s.uzMeaning.length>5,`uz meaning missing ${s.id}`);
  ok(Array.isArray(s.examples)&&s.examples.length===3,`3 examples missing ${s.id}`);
  for(const e of s.examples)ok(e.en&&e.uz,`translation pair missing ${s.id}`);
  ok(Array.isArray(s.exercises)&&s.exercises.length===30,`30 drills missing ${s.id}`);
  for(const x of s.exercises){
    ok(x.model,`model missing ${s.id}:${x.n}`);
    if(x.type!=='own')ok(x.answer,`answer missing ${s.id}:${x.n}`);
    if(x.type==='own')ok(x.anchor,`anchor missing ${s.id}:${x.n}`);
  }
}
ok(!js.includes('Bajarildi deb belgilash'),'old Bajarildi button still present');
ok(js.includes("data-writing-action=\"check-course\""),'course check missing');
ok(js.includes("data-writing-action=\"paint-check\""),'sample paint check missing');
ok(js.includes("data-writing-action=\"grammar-check\""),'grammar check missing');
ok(js.includes("data-writing-action=\"expr-check\""),'expression check missing');
ok(js.includes('wb-floating-palette'),'floating selection palette missing');
console.log('Writing Booster V2 smoke passed:',{days:d.days.length,total,samples:d.samples.length,task2:d.task2Structures.length,task1:d.task1Structures.length,grammarDrills:d.task2Structures.length*30+d.task1Structures.length*30});
