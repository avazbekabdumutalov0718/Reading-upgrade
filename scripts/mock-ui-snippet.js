// Speaking Mock: one Part 1 topic, one Part 2 cue card and related Part 3.
const mockDraftKey='vocab-atlas-mock-draft-v2';

function mockPersist(){
 const s=state.mockSession;if(!s)return;
 try{localStorage.setItem(storageKey(mockDraftKey),JSON.stringify({savedAt:Date.now(),questions:s.questions,answers:s.answers.map(x=>({text:x.text,audioPath:x.audioPath||null,transcript:x.transcript||''})),current:s.current,topics:s.topics}))}catch{}
 window.VocabCloud?.queue();
}
function mockRestore(){
 if(state.mockSession)return;
 const d=load(mockDraftKey,null);
 if(!d||!Number.isFinite(d.savedAt)||(!window.VocabCloud?.enabled&&Date.now()-d.savedAt>7*86400000)||!Array.isArray(d.questions)||!Array.isArray(d.answers)||d.questions.length<7||d.questions.length>9||d.questions.length!==d.answers.length||!d.questions.every(x=>[1,2,3].includes(x?.part)&&typeof x.q==='string'&&typeof x.topic==='string')||!d.answers.every(x=>typeof x==='string'||x&&typeof x.text==='string')||!d.topics)return;
 state.mockSession={questions:d.questions,answers:d.answers.map(x=>({text:(typeof x==='string'?x:x.text).slice(0,4000),audioPath:typeof x==='object'&&typeof x.audioPath==='string'?x.audioPath:null,transcript:typeof x==='object'&&typeof x.transcript==='string'?x.transcript:'',blob:null,url:null,mime:''})),current:Math.max(0,Math.min(d.questions.length-1,Number(d.current)||0)),topics:d.topics};
}

function mockNew(){
 if(!speakingBank)return;
 const old=state.mockSession;
 if(old)for(const answer of old.answers)if(answer.url)URL.revokeObjectURL(answer.url);
 const p1=pick(speakingBank.part1.filter(g=>g.questions.length>=3),1)[0];
 const p2Index=Math.floor(Math.random()*speakingBank.part2.length),p2=speakingBank.part2[p2Index];
 const p3=speakingBank.part3[p2.relatedPart3]||speakingBank.part3[0];
 const questions=[
  ...pick(p1.questions,Math.min(4,p1.questions.length)).map(q=>({part:1,topic:p1.title,q:q.q})),
  {part:2,topic:p2.title,q:p2.questions[0].q},
  ...pick(p3.questions,Math.min(4,p3.questions.length)).map(q=>({part:3,topic:p3.title,q:q.q})),
 ];
 state.mockSession={questions,answers:questions.map(()=>({text:'',blob:null,url:null,mime:''})),current:0,topics:{part1:p1.title,part2:p2.title,part3:p3.title}};
 state.mockFeedback=null;state.mockLocalResult=null;state.mockLocalError='';state.mockLocalProgress='';mockPersist();renderMock();
}

function mockAnswered(answer){return !!(answer.text.trim()||answer.blob||answer.audioPath)}
function mockSaveDraft(){const s=state.mockSession,field=$('#mockAnswer');if(s&&field){s.answers[s.current].text=field.value.slice(0,4000);mockPersist()}}
function mockMove(delta){
 const s=state.mockSession;if(!s)return;
 if(state.mockRecording){toast('Avval audio yozishni to‘xtating.');return}
 mockSaveDraft();
 if(delta>0&&!mockAnswered(s.answers[s.current])){toast('Savolga yozma yoki audio javob kiriting.');return}
 s.current=Math.max(0,Math.min(s.questions.length-1,s.current+delta));mockPersist();renderMock();
}
function mockStopRecording(){
 const active=state.mockRecording;if(active&&active.recorder.state!=='inactive')active.recorder.stop();
}
async function mockUploadAudio(answer){
 if(!answer.blob||answer.uploading||!window.VocabCloud?.enabled)return;
 const blob=answer.blob;
 answer.uploading=true;answer.audioError='';
 try{const path=await window.VocabCloud.uploadAudio(blob);if(answer.blob===blob){answer.audioPath=path;mockPersist();toast('Audio hisobingizga saqlandi.')}}
 catch(error){answer.audioError=error.message||'Audio saqlanmadi.';toast(answer.audioError)}
 finally{answer.uploading=false;if(answer.blob!==blob&&!answer.audioPath)mockUploadAudio(answer);if(state.view==='speakingmock')renderMock()}
}
async function mockLoadAudio(answer){
 if(!answer.audioPath||answer.blob||answer.loading||!window.VocabCloud?.enabled)return;
 const path=answer.audioPath;
 answer.loading=true;answer.audioError='';
 try{const blob=await window.VocabCloud.downloadAudio(path);if(answer.audioPath===path&&!answer.blob){answer.blob=blob;answer.url=URL.createObjectURL(blob)}}
 catch(error){answer.audioError=error.message||'Audio yuklanmadi.'}
 finally{answer.loading=false;if(state.view==='speakingmock')renderMock()}
}
async function mockRecord(){
 if(state.mockRecording){mockStopRecording();return}
 if(!state.mockSession||!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){toast('Bu brauzerda mikrofon orqali yozib bo‘lmadi. Yozma javobdan foydalaning.');return}
 mockSaveDraft();
 let stream;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  if(state.view!=='speakingmock'||!state.mockSession){stream.getTracks().forEach(t=>t.stop());return}
  const mime=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4'].find(type=>MediaRecorder.isTypeSupported?.(type));
  const recorder=new MediaRecorder(stream,{...(mime?{mimeType:mime}:{}),audioBitsPerSecond:48_000});
  const session=state.mockSession,index=session.current,chunks=[];
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  recorder.onstop=()=>{
   stream.getTracks().forEach(t=>t.stop());
   const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});
   if(state.mockRecording?.recorder===recorder)state.mockRecording=null;
   const answer=session.answers[index];
   if(answer&&blob.size){
    if(blob.size>3_000_000)toast('Audio hajmi 3 MB dan oshdi. Qisqaroq yozib ko‘ring.');
    else{
     if(answer.url)URL.revokeObjectURL(answer.url);
     answer.blob=blob;answer.mime=blob.type.split(';')[0];answer.url=URL.createObjectURL(blob);answer.transcript='';answer.audioPath=null;answer.audioError='';mockPersist();mockUploadAudio(answer);
    }
   }
   if(state.view==='speakingmock')renderMock();
  };
  recorder.start();
  state.mockRecording={recorder,index};
  renderMock();
 }catch{
  stream?.getTracks().forEach(t=>t.stop());
  toast('Mikrofonga ruxsat berilmadi. Yozma javobdan foydalaning.');
 }
}
function mockFinish(){
 const s=state.mockSession;if(!s)return;
 if(state.mockRecording){toast('Avval audio yozishni to‘xtating.');return}
 mockSaveDraft();
 if(s.answers.some(x=>!mockAnswered(x))){toast('Barcha savollarga javob bering.');return}
 if(window.VocabCloud?.enabled&&s.answers.some(x=>x.blob&&!x.audioPath)){toast('Audio hali hisobga saqlanmadi. Qayta yuborib ko‘ring.');return}
 state.mockFeedback={local:true};mockPersist();renderMock();
}
async function mockAnalyze(){
 const s=state.mockSession;
 if(!s||state.mockLocalBusy)return;
 state.mockLocalBusy=true;state.mockLocalResult=null;state.mockLocalError='';
 state.mockLocalProgress='Qurilmangizdagi tahlil tayyorlanmoqda…';renderMockFeedback();
 let lastRender=0;
 const progress=message=>{
  if(state.mockSession!==s)return;
  state.mockLocalProgress=message;
  if(Date.now()-lastRender>450&&state.view==='speakingmock'){renderMockFeedback();lastRender=Date.now()}
 };
 try{
  for(const answer of s.answers)if(answer.audioPath&&!answer.blob&&!answer.text.trim())await mockLoadAudio(answer);
  if(s.answers.some(answer=>answer.audioPath&&!answer.blob&&!answer.text.trim()))throw Error('Audio yuklanmadi. Sahifani yangilab qayta urinib ko‘ring.');
  const {evaluateLocal}=await import('./mock-local.mjs');
  const result=await evaluateLocal(s.questions,s.answers,progress);
  if(state.mockSession===s){state.mockLocalResult=result;mockPersist()}
 }catch(error){
  if(state.mockSession===s)state.mockLocalError=error?.message||'Mahalliy tahlil ishlamadi. Sahifani yangilab qayta urinib ko‘ring.';
 }finally{
  if(state.mockSession===s){state.mockLocalBusy=false;state.mockLocalProgress='';if(state.view==='speakingmock')renderMockFeedback()}
 }
}
function renderMockFeedback(){
 const s=state.mockSession;
 let html=heading('Speaking Mock · javoblar','Mock tugadi. Javoblaringizni shu yerda ko‘rib chiqing.',s.questions.length+' / '+s.questions.length);
 html+='<div class="page-back-row"><button type="button" class="page-back" data-action="mock-revise" '+(state.mockLocalBusy?'disabled':'')+'>← Javoblarga qaytish</button><button type="button" class="primary-btn" data-action="mock-new" '+(state.mockLocalBusy?'disabled':'')+'>Yangi mock ↻</button></div>';
 html+='<section class="panel mock-summary"><strong>Kalitsiz mashq tahlili</strong><p>Yozma javob va audio shu qurilmada tahlil qilinadi. Bir savolga matn ham, audio ham kiritilsa, yozma javob asos olinadi. Birinchi safar katta model fayllari internetdan yuklanadi; javobingiz va ovozingiz AI xizmatiga yuborilmaydi. Bu rasmiy IELTS bahosi emas.</p><button type="button" class="primary-btn" data-action="mock-analyze" '+(state.mockLocalBusy?'disabled':'')+'>'+(state.mockLocalBusy?'Tahlil qilinmoqda…':'Qurilmada tahlil qilish →')+'</button>'+(state.mockLocalProgress?'<p class="mock-progress" role="status">'+esc(state.mockLocalProgress)+'</p>':'')+(state.mockLocalError?'<p class="mock-error" role="alert">'+esc(state.mockLocalError)+'</p>':'')+'</section>';
 if(state.mockLocalResult){
  const r=state.mockLocalResult;
  html+='<div class="mock-criteria">'+[['lexical','Lexical resource'],['grammar','Grammatical range & accuracy']].map(([key,label])=>{const c=r[key]||{};return '<section class="panel mock-criterion"><div><h2>'+label+'</h2><b>'+(c.score==null?'Yetarli dalil yo‘q':esc(c.score)+' / 9*')+'</b></div>'+(c.quote?'<p><strong>Javobdan:</strong> “'+esc(c.quote)+'”</p>':'')+(c.reason?'<p>'+esc(c.reason)+'</p>':'')+(c.tip?'<small>Keyingi qadam: '+esc(c.tip)+'</small>':'')+'</section>'}).join('')+'<section class="panel mock-criterion"><div><h2>Fluency & coherence</h2><b>Band yo‘q</b></div><p>'+esc(r.coherence||'Matndagi fikr bog‘lanishini kuzatishingiz mumkin. Og‘zaki ravonlikka ishonchli ball uchun audio tahlili yetarli emas.')+'</p></section><section class="panel mock-criterion"><div><h2>Pronunciation</h2><b>Band yo‘q</b></div><p>Ovozdan talaffuz, urg‘u va intonatsiyaga ishonchli band chiqarmaymiz.</p></section></div>';
  html+='<section class="panel mock-detail"><p class="mock-limit">* So‘z boyligi va grammatika ballari faqat mashq uchun taxmin. Umumiy Speaking band hisoblanmaydi.'+(r.tooShort?' Inglizcha javoblar qisqa bo‘lgani uchun ball berilmadi.':'')+'</p></section>';
 }
 html+='<section class="panel mock-detail"><h2>Savollar va javoblar</h2>'+s.questions.map((q,i)=>'<div class="mock-fix"><small>PART '+q.part+' · '+esc(q.topic)+'</small><p><strong>'+esc(q.q)+'</strong></p>'+(s.answers[i].text?'<p>'+esc(s.answers[i].text)+'</p>':'')+(s.answers[i].transcript?'<p class="mock-transcript"><b>Audio matni (avtomatik):</b> '+esc(s.answers[i].transcript)+'</p>':'')+(s.answers[i].url?'<audio controls preload="metadata" src="'+esc(s.answers[i].url)+'" aria-label="'+(i+1)+'-savol javobi"></audio>':'')+'</div>').join('')+'</section>';
 root.innerHTML=html;
}
function renderMock(){
 if(!speakingBank){
  root.innerHTML=heading('Speaking Mock','Savollar yuklanmoqda…')+'<div class="loading"><span class="spinner"></span> Yuklanmoqda…</div>';
  loadSpeakingBank();return;
 }
 mockRestore();
 const s=state.mockSession;
 if(s&&window.VocabCloud?.enabled)for(const answer of s.answers)if(answer.audioPath&&!answer.blob&&!answer.loading&&!answer.audioError)mockLoadAudio(answer);
 if(!s){
  root.innerHTML=heading('Speaking Mock','Part 1 mavzusi, Part 2 cue card va unga bog‘liq Part 3 savollari tasodifiy tanlanadi.')+
   '<div class="page-back-row"><button type="button" class="page-back" data-action="back-one">← Ortga</button></div>'+
   '<section class="panel mock-start"><div class="mock-path"><span>PART 1<br><b>Bir mavzu</b></span><span>PART 2<br><b>Cue card</b></span><span>PART 3<br><b>Bog‘liq savollar</b></span></div><h2>O‘z tezligingizda javob bering</h2><p>Taymer yo‘q. Matn yozing yoki audio yozib oling. Yakunda qurilmangizning o‘zida so‘z boyligi va grammatikaga taxminiy tahlil olishingiz mumkin. Talaffuz va umumiy Speaking band chiqarilmaydi. '+(window.VocabCloud?.enabled?'Javoblar va audio hisobingizga saqlanadi.':'Bulutga ulanish yo‘q: audio sahifa yopilguncha qoladi.')+'</p><div class="mock-launch"><button type="button" class="primary-btn" data-action="mock-new">Mockni boshlash →</button></div></section>';
  return;
 }
 if(state.mockFeedback){renderMockFeedback();return}
 const q=s.questions[s.current],answer=s.answers[s.current],part=q.part,filled=s.answers.filter(mockAnswered).length;
 let html=heading('Speaking Mock','Taymer yo‘q — javobingiz tayyor bo‘lganda keyingi savolga o‘ting.',(s.current+1)+' / '+s.questions.length);
 html+='<div class="page-back-row"><button type="button" class="page-back" data-action="back-one">← Mockdan chiqish</button><span class="speaking-count">'+filled+' / '+s.questions.length+' javob</span></div>';
 html+='<div class="mock-stepper">'+[1,2,3].map(n=>'<span class="'+(n===part?'active':'')+'">Part '+n+'</span>').join('')+'</div>';
 html+='<section class="panel mock-question"><div class="mock-topic">PART '+part+' · '+esc(q.topic)+'</div><h2>'+esc(q.q)+'</h2>'+(part===2?'<p class="note">Bitta mavzu haqida izchil gapiring. Tayyor bo‘lgach javobni yozib oling.</p>':'')+'</section>';
 html+='<section class="panel mock-answer"><label for="mockAnswer">Javobingiz (yozma)</label><textarea id="mockAnswer" maxlength="4000" placeholder="Inglizcha javobingizni yozing...">'+esc(answer.text)+'</textarea><div class="mock-audio-row"><button type="button" class="'+(state.mockRecording?'mock-recording':'secondary-btn')+'" data-action="mock-record">'+(state.mockRecording?'■ Yozishni to‘xtatish':'🎙 Mikrofon orqali javob')+'</button>'+(answer.url?'<audio controls preload="metadata" src="'+esc(answer.url)+'" aria-label="Yozilgan javob"></audio>':'')+(answer.uploading?'<span>Bulutga saqlanmoqda…</span>':answer.audioPath?'<span>Hisobga saqlandi ✓</span>':answer.loading?'<span>Audio yuklanmoqda…</span>':answer.blob&&window.VocabCloud?.enabled?'<button type="button" class="secondary-btn" data-action="mock-upload">Bulutga qayta saqlash</button>':'')+'</div>'+(answer.audioError?'<p class="mock-error">'+esc(answer.audioError)+'</p>':'')+'<small>Taymer va avtomatik to‘xtash yo‘q. Hisobga kirgan bo‘lsangiz, audio bulutga saqlanadi.</small></section>';
 html+='<div class="mock-controls"><button type="button" class="secondary-btn" data-action="mock-prev" '+(s.current===0?'disabled':'')+'>← Oldingi savol</button>'+(s.current===s.questions.length-1?'<button type="button" class="primary-btn" data-action="mock-finish">Javoblarni ko‘rish →</button>':'<button type="button" class="primary-btn" data-action="mock-next">Keyingi savol →</button>')+'</div>';
 root.innerHTML=html;
}
function mockHandleAction(action){
 if(action==='mock-new'){if(state.mockLocalBusy)return true;if(state.mockRecording)mockStopRecording();mockNew();return true}
 if(action==='mock-prev'){mockMove(-1);return true}
 if(action==='mock-next'){mockMove(1);return true}
 if(action==='mock-record'){mockRecord();return true}
 if(action==='mock-upload'){const a=state.mockSession?.answers[state.mockSession.current];if(a)mockUploadAudio(a);return true}
 if(action==='mock-finish'){mockFinish();return true}
 if(action==='mock-revise'){if(state.mockLocalBusy)return true;state.mockFeedback=null;state.mockLocalResult=null;mockPersist();renderMock();return true}
 if(action==='mock-analyze'){mockAnalyze();return true}
 return false;
}
