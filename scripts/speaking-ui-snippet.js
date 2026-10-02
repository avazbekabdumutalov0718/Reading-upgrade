function loadSpeakingBank(){
 if(speakingBank||speakingBankLoading)return;
 speakingBankLoading=true;
 fetch('speaking-content.json?v=20260928').then(r=>{if(!r.ok)throw Error('Speaking savollari yuklanmadi');return r.json()}).then(bank=>{
  if(![1,2,3].every(n=>Array.isArray(bank['part'+n])&&bank['part'+n].length))throw Error('Savollar formati noto‘g‘ri');
  speakingBank=bank;speakingBankLoading=false;if(state.view==='speakingpractice')renderSpeakingPractice();
 }).catch(()=>{speakingBankLoading=false;if(state.view==='speakingpractice')root.innerHTML=heading('Speaking mashqi','Savollarni yuklashda xatolik yuz berdi.')+'<button type="button" class="secondary-btn" data-action="speaking-retry">Qayta urinish</button>'});
}
function currentSpeaking(){
 const groups=speakingBank?.['part'+state.speakingPart]||[];
 state.speakingTopic=Math.max(0,Math.min(state.speakingTopic,groups.length-1));
 const group=groups[state.speakingTopic],list=group?.questions||[];
 state.speakingQuestion=Math.max(0,Math.min(state.speakingQuestion,list.length-1));
 return {groups,group,question:list[state.speakingQuestion]};
}
function speakingTarget(){return state.speakingPart===1?'20–25 soniya':state.speakingPart===2?'2 daqiqa 15 soniya':'35–40 soniya'}
function speakingCount(){return speakingBank?.['part'+state.speakingPart].reduce((n,g)=>n+g.questions.length,0)||0}
function practiceCards(){return state.view==='speakingtopics'?currentTopicPractice()?.cards:currentSpeaking().question?.cards}
function speakingCardMarkup(cards,backSet){
 return '<div class="speaking-card-grid">'+cards.map((ref,i)=>{const w=Number.isInteger(ref)?words[ref]:ref;if(!w)return '';const back=backSet.has(i),source=Number.isInteger(ref)?'4 396 lug‘atdan':'Javobdagi ibora';return '<div class="speaking-mini-card"><button type="button" class="speaking-card-face '+(back?'turned':'')+'" data-action="speaking-flip" data-index="'+i+'" aria-label="'+esc(w.w)+' kartasini aylantirish">'+(back?'<small>O‘ZBEKCHA · JAVOBDAGI MISOL</small><strong>'+esc(w.u)+'</strong>'+(w.d?'<span>'+esc(w.d)+'</span>':'')+'<em>'+esc(w.e)+'</em>':'<small>'+source+' · '+(i+1)+' / '+cards.length+'</small><strong>'+esc(w.w)+'</strong><span>'+esc(w.p||'🔊 Talaffuz tugmasi')+'</span><em>Tarjimani ko‘rish ↗</em>')+'</button><button type="button" class="speaking-card-audio" data-action="speaking-speak" data-index="'+i+'" aria-label="'+esc(w.w)+' talaffuzini eshittirish">🔊 Talaffuz</button></div>'}).join('')+'</div>';
}
const speakingAudioPending=new Map(),speakingAudioUrls=new Map(),speakingAudioUploading=new Set();
function speakingHistoryRow(s){
 let media='';
 if(s.type==='audio'){
  const url=s.audioPath&&speakingAudioUrls.get(s.audioPath);
  media=url?'<audio controls preload="metadata" src="'+esc(url)+'" aria-label="Oldingi javob"></audio>':s.audioPath?'<button type="button" class="secondary-btn" data-action="history-audio" data-path="'+esc(s.audioPath)+'">▶ Audioni eshitish</button>':speakingAudioPending.has(s.id)?'<button type="button" class="secondary-btn" data-action="retry-audio" data-id="'+esc(s.id)+'">Bulutga qayta saqlash</button>':'<small>Bu eski audio saqlanmagan.</small>';
 }
 return '<div class="speaking-history-row"><strong>'+esc(s.date)+'</strong><span>'+(s.type==='audio'?'🎙 '+(s.seconds||0)+' soniya':'✎ Yozma javob')+'</span>'+(s.type==='text'?'<details><summary>Javobni ko‘rish</summary><p>'+esc(s.text||'')+'</p></details>':media)+'</div>';
}
async function uploadSpeakingAudio(entry){
 const blob=speakingAudioPending.get(entry.id);if(!blob||speakingAudioUploading.has(entry.id)||!window.VocabCloud?.enabled)return;
 speakingAudioUploading.add(entry.id);
 try{entry.audioPath=await window.VocabCloud.uploadAudio(blob);speakingAudioPending.delete(entry.id);saveExtra();toast('Audio hisobingizga saqlandi.');}
 catch(error){toast('Audio saqlanmadi: '+(error.message||'Qayta urinib ko‘ring.'))}
 finally{speakingAudioUploading.delete(entry.id)}
 if(state.view==='speakingtopics')renderTopicLab();else if(state.view==='speakingpractice')renderSpeakingPractice();
}
async function openSpeakingAudio(path){
 try{const blob=await window.VocabCloud.downloadAudio(path);speakingAudioUrls.set(path,URL.createObjectURL(blob));if(state.view==='speakingtopics')renderTopicLab();else if(state.view==='speakingpractice')renderSpeakingPractice();}
 catch(error){toast('Audio ochilmadi: '+(error.message||'Qayta urinib ko‘ring.'))}
}
function renderSpeakingPractice(){
 if(!speakingBank){root.innerHTML=heading('Speaking mashqi','Part 1, Part 2 va Part 3 savollari yuklanmoqda…')+'<div class="loading"><span class="spinner"></span> Savollar yuklanmoqda…</div>';loadSpeakingBank();return}
 const {groups,group,question}=currentSpeaking();if(!group||!question)return;
 const query=norm(state.speakingFilter),results=[];
 if(query){groups.forEach((t,ti)=>t.questions.forEach((q,qi)=>{if(norm(t.title+' '+(q.topic||'')+' '+q.q).includes(query))results.push({ti,qi,q,title:q.topic||t.title})}))}
 else group.questions.forEach((q,qi)=>results.push({ti:state.speakingTopic,qi,q,title:q.topic||group.title}));
 const pages=Math.max(1,Math.ceil(results.length/12));state.speakingPage=Math.min(state.speakingPage,pages-1);
 const page=results.slice(state.speakingPage*12,state.speakingPage*12+12);
 const part=state.speakingPart,cardCount=question.cards.length;
 const timeSeconds=part===1?25:part===2?135:40;
 const own=speakingHistory.filter(s=>s.qid===question.id).slice(0,4);
 let html=heading('Speaking mashqi','Savolni tanlang, g‘oya oling, namunani oching va o‘z javobingizni mashq qiling.',fmt(speakingCount())+' ta savol');
 html+='<div class="page-back-row"><button type="button" class="page-back" data-action="speaking-back">← Ortga</button><span class="speaking-count">Jami '+fmt([1,2,3].reduce((n,p)=>n+speakingBank['part'+p].reduce((s,t)=>s+t.questions.length,0),0))+' ta savol</span></div>';
 html+='<div class="speaking-tabs" role="tablist" aria-label="Speaking qismlari">'+[1,2,3].map(n=>'<button type="button" role="tab" aria-selected="'+(n===part)+'" class="speaking-tab '+(n===part?'active':'')+'" data-action="speaking-part" data-part="'+n+'"><b>Part '+n+'</b><small>'+(n===1?'Qisqa javob':n===2?'Cue card':'Muhokama')+'</small></button>').join('')+'</div>';
 html+='<div class="speaking-browser"><aside class="panel speaking-index"><div class="section-heading"><h2>Topiclar</h2><small>'+groups.length+' ta</small></div><div class="speaking-topic-list">'+groups.map((t,i)=>'<button type="button" class="speaking-topic-option '+(i===state.speakingTopic?'active':'')+'" data-action="speaking-topic" data-index="'+i+'"><span>'+esc(t.title)+'</span><b>'+t.questions.length+'</b></button>').join('')+'</div></aside>';
 html+='<div class="speaking-work"><section class="panel speaking-list"><div class="section-heading"><h2>Savollar</h2><small>'+fmt(results.length)+' ta</small></div><label class="speaking-search-label" for="speakingSearch">Savol yoki topicni qidiring</label><input id="speakingSearch" type="search" autocomplete="off" placeholder="Masalan: city, film, technology..." value="'+esc(state.speakingFilter)+'"><div class="speaking-question-list">'+(page.length?page.map(item=>'<button type="button" class="speaking-question-option '+(item.q.id===question.id?'active':'')+'" data-action="speaking-question" data-topic="'+item.ti+'" data-index="'+item.qi+'"><small>'+esc(item.title)+' · '+esc(item.q.source||'Ro‘yxat')+'</small><span>'+esc(item.q.q)+'</span></button>').join(''):'<p class="note">Savol topilmadi. Boshqa so‘z bilan qidiring.</p>')+'</div><div class="pager"><button type="button" data-action="speaking-page-prev" '+(state.speakingPage===0?'disabled':'')+'>← Oldingi</button><span>'+Math.min(state.speakingPage+1,pages)+' / '+pages+'</span><button type="button" data-action="speaking-page-next" '+(state.speakingPage>=pages-1?'disabled':'')+'>Keyingi →</button></div></section>';
 html+='<section class="panel speaking-detail"><div class="speaking-meta"><span>PART '+part+'</span><span>'+esc(question.topic||group.title)+'</span><span>⏱ '+speakingTarget()+'</span></div><h2>'+esc(question.q)+'</h2><div class="speaking-nav"><button type="button" data-action="speaking-previous" '+(state.speakingQuestion===0?'disabled':'')+'>← Oldingi savol</button><span>'+(state.speakingQuestion+1)+' / '+group.questions.length+'</span><button type="button" data-action="speaking-next" '+(state.speakingQuestion===group.questions.length-1?'disabled':'')+'>Keyingi savol →</button></div><div class="speaking-ideas"><h3>Javob uchun 2 ta g‘oya</h3><ol>'+question.ideas.map(idea=>'<li>'+esc(idea)+'</li>').join('')+'</ol></div><button type="button" class="speaking-sample-toggle" data-action="speaking-sample" aria-expanded="'+state.speakingSampleOpen+'">'+(state.speakingSampleOpen?'Namunani yashirish ↑':'Sample answerni ko‘rish ↓')+'</button>';
 if(state.speakingSampleOpen){
  html+='<div class="speaking-sample"><div class="section-heading"><h3>Sample answer</h3><small>'+question.words+' so‘z · Taxminiy '+speakingTarget()+'</small></div><p>'+esc(question.answer).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')+'</p><small>Bu mashq namunasi. O‘z tajribangizga moslab gapiring; aniq band bahosi kafolatlanmaydi.</small></div>';
  html+='<div class="speaking-cards-heading"><h3>Javobdagi '+cardCount+' ta collocation</h3><small>Har bir iboraning tarjimasi va javobdagi misoli.</small></div>'+speakingCardMarkup(question.cards,state.speakingCardBack);
 }
 html+='<div class="speaking-practice"><h3>Endi siz javob bering</h3><p>Namuna g‘oyalaridan foydalaning, lekin jumlalarni o‘zingiz tuzing.</p><div class="speaking-timer-controls"><button type="button" data-action="speaking-timer" data-seconds="'+timeSeconds+'">⏱ Javob taymeri · '+speakingTarget()+'</button>'+(part===2?'<button type="button" data-action="speaking-timer" data-seconds="60">1 daqiqa tayyorgarlik</button>':'')+'<strong id="speakingTimerDisplay">'+(state.speakingTimerEnd?Math.max(0,Math.ceil((state.speakingTimerEnd-Date.now())/1000))+' s':'')+'</strong></div><div class="speaking-record"><div><strong>🎙 Ovozli javob</strong><p>'+(window.VocabCloud?.enabled?'Audio hisobingizga saqlanadi; eski yozuvlarni shu yerdan eshitasiz.':'Bulutga ulanish yo‘q: audio faqat shu sahifada turadi.')+'</p></div><div class="record-actions">'+(state.recording?'<span class="record-time" id="recordTime">● '+state.recordSeconds+' s</span><button type="button" class="record-btn stop" data-action="stop-record">■ To‘xtatish</button>':'<button type="button" class="record-btn" data-action="start-record">● Yozish</button>')+'</div></div>'+(state.recordUrl&&state.recordQuestionId===question.id?'<div class="audio-playback"><strong>Yozuvingizni eshiting</strong><audio controls src="'+esc(state.recordUrl)+'"></audio></div>':'')+'<div class="speaking-written"><label for="speakingText">Yozma javobingiz</label><textarea id="speakingText" maxlength="4000" rows="6" placeholder="I would say...">'+esc(state.speakingDraft)+'</textarea><button type="button" class="secondary-btn" data-action="save-speaking-text">Javobni saqlash</button></div></div>';
 html+='<div class="speaking-own-history"><h3>Shu savoldagi mashqlarim</h3>'+(own.length?own.map(speakingHistoryRow).join(''):'<p class="note">Hozircha saqlangan javob yo‘q.</p>')+'</div></section></div></div>';
 root.innerHTML=html;
}
function speakingNavigate(part,topic,question){
 if(state.recording)stopRecording();
 if(state.speakingTimer){clearInterval(state.speakingTimer);state.speakingTimer=null;state.speakingTimerEnd=0}
 pushPage('speakingpractice');
 state.speakingPart=part;state.speakingTopic=topic;state.speakingQuestion=question;state.speakingPage=Math.floor(question/12);state.speakingFilter='';state.speakingSampleOpen=false;state.speakingCardBack=new Set();state.speakingDraft='';
 renderSpeakingPractice();
}
function startSpeakingTimer(seconds){
 clearInterval(state.speakingTimer);state.speakingTimerEnd=Date.now()+seconds*1000;
 const update=()=>{const left=Math.max(0,Math.ceil((state.speakingTimerEnd-Date.now())/1000)),el=$('#speakingTimerDisplay');if(el)el.textContent=left?Math.floor(left/60)+':'+String(left%60).padStart(2,'0'):'Vaqt tugadi';if(!left){clearInterval(state.speakingTimer);state.speakingTimer=null;state.speakingTimerEnd=0}};
 update();state.speakingTimer=setInterval(update,250);
}
function loadTopicBank(){
 if(topicBank||topicBankLoading)return;
 topicBankLoading=true;
 fetch('topic-lab.json').then(r=>{if(!r.ok)throw Error('Topiclar yuklanmadi');return r.json()}).then(bank=>{
  if(!Array.isArray(bank)||bank.length!==100||!bank.every(t=>t.answers?.past&&t.answers?.present&&t.answers?.future))throw Error('Topiclar formati noto‘g‘ri');
  topicBank=bank;topicBankLoading=false;if(state.view==='speakingtopics')renderTopicLab();
 }).catch(()=>{topicBankLoading=false;if(state.view==='speakingtopics')root.innerHTML=heading('100 topic · 3 zamon','Ma’lumotlar yuklanmadi.')+'<button type="button" class="secondary-btn" data-action="topic-retry">Qayta urinish</button>'});
}
function currentTopicPractice(){
 const topic=topicBank?.[state.topicFocus],entry=topic?.answers?.[state.topicTense];
 return entry?{...entry,id:topic.id+'-'+state.topicTense,title:topic.title,number:topic.number,tense:state.topicTense}:null;
}
function practiceContext(){
 if(state.view==='speakingtopics'){
  const a=currentTopicPractice();return a?{qid:a.id,part:0,topic:a.title,question:state.topicFocus,selected:a.cards.filter(Number.isInteger)}:null;
 }
 const {group,question}=currentSpeaking();return question?{qid:question.id,part:state.speakingPart,topic:question.topic||group.title,question:state.speakingQuestion,selected:question.cards.filter(Number.isInteger)}:null;
}
function topicNavigate(index,tense){
 if(state.recording)stopRecording();
 clearInterval(state.speakingTimer);state.speakingTimer=null;state.speakingTimerEnd=0;
 pushPage('speakingtopics');state.topicFocus=index;state.topicTense=tense;state.topicSampleOpen=false;state.topicCardBack=new Set();state.topicDraft='';renderTopicLab();
}
function renderTopicLab(){
 if(!topicBank){root.innerHTML=heading('100 topic · 3 zamon','Past, Present va Future javoblari yuklanmoqda…')+'<div class="loading"><span class="spinner"></span> Topiclar yuklanmoqda…</div>';loadTopicBank();return}
 state.topicFocus=Math.max(0,Math.min(99,state.topicFocus));
 const a=currentTopicPractice(),query=norm(state.topicSearch),matches=topicBank.filter(t=>norm(t.title).includes(query)),pages=Math.max(1,Math.ceil(matches.length/15));state.topicPage=Math.max(0,Math.min(state.topicPage,pages-1));
 const shown=matches.slice(state.topicPage*15,state.topicPage*15+15),own=speakingHistory.filter(s=>s.qid===a.id).slice(0,4),tenseName={past:'Past',present:'Present',future:'Future'}[state.topicTense];
 let html=heading('100 topic · 3 zamon','Har bir topic uchun uchta taxminan 3 daqiqalik namuna va har bir javobdagi 10 ta collocation.', '300 ta javob');
 html+='<div class="page-back-row"><button type="button" class="page-back" data-action="speaking-back">← Ortga</button><span class="speaking-count">Past · Present · Future</span></div>';
 html+='<div class="topic-lab-layout"><aside class="panel speaking-index topic-lab-index"><div class="section-heading"><h2>100 ta mavzu</h2><small>'+matches.length+' ta</small></div><label class="speaking-search-label" for="topicLabSearch">Topicni qidiring</label><input id="topicLabSearch" type="search" autocomplete="off" value="'+esc(state.topicSearch)+'" placeholder="Masalan: family, music, day..."><div class="speaking-topic-list">'+shown.map(t=>'<button type="button" class="speaking-topic-option '+(t.number===a.number?'active':'')+'" data-action="topic-lab-topic" data-index="'+(t.number-1)+'"><span>'+t.number+'. '+esc(t.title)+'</span></button>').join('')+(matches.length?'':'<p class="note">Topic topilmadi.</p>')+'</div><div class="pager"><button type="button" data-action="topic-lab-prev" '+(state.topicPage===0?'disabled':'')+'>←</button><span>'+(state.topicPage+1)+' / '+pages+'</span><button type="button" data-action="topic-lab-next" '+(state.topicPage>=pages-1?'disabled':'')+'>→</button></div></aside>';
 html+='<section class="panel speaking-detail topic-lab-detail"><div class="speaking-meta"><span>TOPIC '+a.number+' / 100</span><span>'+esc(a.title)+'</span><span>⏱ ~3 daqiqa</span></div><h2>'+esc(a.title)+'</h2><div class="speaking-tabs topic-tense-tabs" role="tablist" aria-label="Zamonni tanlang">'+['past','present','future'].map(t=>'<button type="button" role="tab" aria-selected="'+(t===state.topicTense)+'" class="speaking-tab '+(t===state.topicTense?'active':'')+'" data-action="topic-lab-tense" data-tense="'+t+'"><b>'+t[0].toUpperCase()+t.slice(1)+'</b><small>'+(t==='past'?'O‘tmish tajribasi':t==='present'?'Hozirgi hayot': 'Kelajak rejasi')+'</small></button>').join('')+'</div>';
 html+='<button type="button" class="speaking-sample-toggle" data-action="topic-lab-sample" aria-expanded="'+state.topicSampleOpen+'">'+(state.topicSampleOpen?'Namunani yashirish ↑':tenseName+' sample answerni ko‘rish ↓')+'</button>';
 if(state.topicSampleOpen){html+='<div class="speaking-sample"><div class="section-heading"><h3>'+tenseName+' · sample answer</h3><small>'+a.words+' so‘z · taxminan 3 daqiqa</small></div><p>'+esc(a.answer)+'</p><small>Bu o‘zingizning hikoyangiz emas, mashq uchun yozilgan namuna. IELTS band bahosi kafolatlanmaydi.</small></div><div class="speaking-cards-heading"><h3>Shu javobdagi 10 ta collocation</h3><small>5 tasi asl lug‘atdan, 5 tasi yangi ibora.</small></div>'+speakingCardMarkup(a.cards,state.topicCardBack)}
 html+='<div class="speaking-practice"><h3>O‘zingiz javob bering</h3><p>Namunadan tuzilma va iboralarni oling, voqealarni o‘z hayotingizga moslang.</p><div class="speaking-timer-controls"><button type="button" data-action="speaking-timer" data-seconds="180">⏱ 3 daqiqalik taymer</button><strong id="speakingTimerDisplay">'+(state.speakingTimerEnd?Math.max(0,Math.ceil((state.speakingTimerEnd-Date.now())/1000))+' s':'')+'</strong></div><div class="speaking-record"><div><strong>🎙 Ovozli javob</strong><p>'+(window.VocabCloud?.enabled?'Audio hisobingizga saqlanadi; eski yozuvlarni shu yerdan eshitasiz.':'Bulutga ulanish yo‘q: audio faqat shu sahifada turadi.')+'</p></div><div class="record-actions">'+(state.recording?'<span class="record-time" id="recordTime">● '+state.recordSeconds+' s</span><button type="button" class="record-btn stop" data-action="stop-record">■ To‘xtatish</button>':'<button type="button" class="record-btn" data-action="start-record">● Yozish</button>')+'</div></div>'+(state.recordUrl&&state.recordQuestionId===a.id?'<div class="audio-playback"><strong>Yozuvingizni eshiting</strong><audio controls src="'+esc(state.recordUrl)+'"></audio></div>':'')+'<div class="speaking-written"><label for="topicLabText">Yozma javobingiz</label><textarea id="topicLabText" maxlength="4000" rows="6" placeholder="I would say...">'+esc(state.topicDraft)+'</textarea><button type="button" class="secondary-btn" data-action="save-speaking-text">Javobni saqlash</button></div></div>';
 html+='<div class="speaking-own-history"><h3>Shu mavzu va zamondagi mashqlarim</h3>'+(own.length?own.map(speakingHistoryRow).join(''):'<p class="note">Hozircha saqlangan javob yo‘q.</p>')+'</div></section></div>';
 root.innerHTML=html;
}
async function startRecording(){
 if(state.recording)return;
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast('Bu brauzerda mikrofon mavjud emas. Yozma javobdan foydalaning.');return}
 let stream;
 try{
  const pendingView=state.view,pendingId=practiceContext()?.qid;
  if(!pendingId)return;
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  if(state.view!==pendingView||practiceContext()?.qid!==pendingId){stream.getTracks().forEach(t=>t.stop());return}
  const recorder=new MediaRecorder(stream),chunks=[],startedAt=Date.now(),meta=practiceContext();
  if(state.recordUrl){URL.revokeObjectURL(state.recordUrl);state.recordUrl=null}
  state.recording={recorder,stream,startedAt};
  state.recordSeconds=0;
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());clearInterval(state.recordTimer);state.recordTimer=null;const seconds=Math.max(1,Math.round((Date.now()-startedAt)/1000)),blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});if(state.recordUrl)URL.revokeObjectURL(state.recordUrl);if(chunks.length){state.recordUrl=URL.createObjectURL(blob);state.recordQuestionId=meta.qid}else state.recordUrl=null;state.recording=null;if(chunks.length){const entry={...meta,id:crypto.randomUUID(),date:today(),type:'audio',seconds};speakingHistory.unshift(entry);speakingHistory=speakingHistory.slice(0,100);if(window.VocabCloud?.enabled){speakingAudioPending.set(entry.id,blob);uploadSpeakingAudio(entry)}else toast('Audio faqat shu ochiq sahifada qoladi.');recordActivity();saveExtra()}if(state.view===pendingView)(pendingView==='speakingtopics'?renderTopicLab():renderSpeakingPractice())};
  recorder.start();state.recordTimer=setInterval(()=>{state.recordSeconds=Math.floor((Date.now()-startedAt)/1000);const el=$('#recordTime');if(el)el.textContent='● '+state.recordSeconds+' s'},1000);(pendingView==='speakingtopics'?renderTopicLab():renderSpeakingPractice());
 }catch{stream?.getTracks().forEach(t=>t.stop());state.recording=null;toast('Mikrofonga ruxsat berilmadi. Yozma javobdan foydalaning.')}
}
function stopRecording(){const r=state.recording;if(r&&r.recorder.state!=='inactive')r.recorder.stop()}
function saveSpeakingText(){
 const inLab=state.view==='speakingtopics',value=(inLab?state.topicDraft:state.speakingDraft).trim();if(!value){toast('Avval javobingizni yozing.');return}
 speakingHistory.unshift({...practiceContext(),date:today(),type:'text',text:value.slice(0,4000)});
 speakingHistory=speakingHistory.slice(0,100);if(inLab)state.topicDraft='';else state.speakingDraft='';recordActivity();saveExtra();(inLab?renderTopicLab():renderSpeakingPractice());toast('Javob saqlandi.');
}
