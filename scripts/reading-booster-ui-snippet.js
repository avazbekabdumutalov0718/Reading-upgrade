// Thirty passages from ten supplied full mocks. Day state lives in account sync.
let rbDay=1,rbScreen='list',rbTranslationIndex=0,rbWrongIndex=0,rbWide=false,rbFont=0,rbTimer=null,rbSelection=null,rbWordIndex=0,rbWordFlipped=false,rbWordDraft=null,rbLexiconPromise=null,rbTranslationData=null,rbTranslationDataPromise=null;
const rbTranslationCache=new Map(),rbPendingWords=new Set();
const rbPassages=readingBoosterBank.passages;
function rbPassage(){return rbPassages[rbDay-1]}
function rbState(){return readingBoosterProgress[rbPassage().id]||(readingBoosterProgress[rbPassage().id]={exam:{answers:{}},training:{stage:0,originalAnswers:{},understandingAnswers:{},wrongAnswers:{},translationAnswers:{},translationChecked:{}}})}
function rbTraining(){const s=rbState();return s.training||(s.training={stage:0,originalAnswers:{},understandingAnswers:{},wrongAnswers:{},translationAnswers:{},translationChecked:{}})}
function rbWords(){const s=rbState();return s.words||(s.words=[])}
function rbWordById(id){if(typeof id!=='string'||!id.startsWith('rb:'))return null;const day=id.split(':')[1],entries=readingBoosterProgress[day]?.words;return Array.isArray(entries)?entries.find(w=>w.id===id)||null:null}
function rbCleanTranslation(value){
 const named={amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '};let result=String(value||'').trim();
 for(let i=0;i<3;i++){const decoded=result.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi,(_,part)=>{if(part[0]==='#'){const code=part[1].toLowerCase()==='x'?parseInt(part.slice(2),16):Number(part.slice(1));return code>0&&code<=0x10ffff?String.fromCodePoint(code):''}return named[part.toLowerCase()]||_});if(decoded===result)break;result=decoded}
 return result.replace(/<[^>]*>/g,'').trim().slice(0,240);
}
function rbLoadTranslations(){
 if(!rbTranslationDataPromise)rbTranslationDataPromise=fetch('/reading-translations.json',{headers:{accept:'application/json'}}).then(r=>{if(!r.ok)throw Error('translation asset unavailable');return r.json()}).then(data=>{rbTranslationData=data;rbRepairSavedWords();if(state.view==='readingbooster'&&rbScreen==='training'&&(rbTraining().stage||0)<=3){const open=root.querySelector('.rb-full-translation')?.open;renderReadingBooster();if(open)root.querySelector('.rb-full-translation')?.setAttribute('open','')}return data}).catch(()=>null);
 return rbTranslationDataPromise;
}
function rbRepairSavedWords(){
 if(!rbTranslationData)return;let changed=false;
 for(const p of rbPassages){const list=readingBoosterProgress[p.id]?.words;if(!Array.isArray(list))continue;
  for(let i=list.length-1;i>=0;i--){const w=list[i];if(!w||typeof w.w!=='string')continue;
   if(['passage','questions'].includes(w.source)&&w.w.includes(' ')&&p.paragraphs.some(text=>text.toLowerCase().includes(w.w.toLowerCase()))&&!p.paragraphs.some(text=>new RegExp(`(^|[^a-z])${w.w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}($|[^a-z])`,'i').test(text))){list.splice(i,1);delete progress[w.id];delete mistakes[w.id];for(const key of Object.keys(sessions))if(key.startsWith(`pack:readingbooster:${p.id}:0:`))delete sessions[key];changed=true;continue}
   const clean=rbCleanTranslation(w.u);if(clean!==w.u){w.u=clean;changed=true}
   const better=rbTranslationData.words?.[w.w.toLowerCase().replace(/[’‘]/g,"'")];if(better&&/UzWordnet|asosiy ma'no/i.test(w.d||'')&&rbCleanTranslation(better)!==w.u){w.u=rbCleanTranslation(better);w.d='Passage uchun oldindan tayyorlangan tarjima';changed=true}
  }
 }
 if(changed){saveProgress();saveExtra();saveSessions();rbSave()}
}
function rbSave(){try{localStorage.setItem(storageKey('vocab-atlas-reading-booster-v1'),JSON.stringify(readingBoosterProgress))}catch{}window.VocabCloud?.queue()}
function rbStopTimer(){clearInterval(rbTimer);rbTimer=null}
function rbFormat(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
function rbIsFullscreen(){return !!(document.fullscreenElement||document.webkitFullscreenElement)}
function rbEnterFullscreen(){const el=document.documentElement;try{const r=(el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen)?.call(el,{navigationUI:'hide'});if(r&&r.catch)r.catch(()=>{})}catch{}}
function rbExitFullscreen(){if(!rbIsFullscreen())return;try{const r=(document.exitFullscreen||document.webkitExitFullscreen)?.call(document);if(r&&r.catch)r.catch(()=>{})}catch{}}
function rbToggleFullscreen(){rbIsFullscreen()?rbExitFullscreen():rbEnterFullscreen()}
function rbSyncFullscreenButton(){const b=document.getElementById('rbFullscreenBtn');if(b){b.textContent=rbIsFullscreen()?'⤢ To‘liq ekrandan chiqish':'⛶ To‘liq ekran';b.classList.toggle('rb-fs-off',!rbIsFullscreen())}}
if(typeof document!=='undefined'&&typeof window!=='undefined'&&!window.rbFullscreenBound){window.rbFullscreenBound=true;['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,rbSyncFullscreenButton))}
function rbBack(){rbStopTimer();rbSelection=null;if(rbScreen==='list')return;if(rbScreen==='exam')rbExitFullscreen();rbScreen=rbScreen==='day'?'list':'day';renderReadingBooster();scrollPageTop()}
function rbOpenDay(index){if(!Number.isInteger(index)||index<1||index>30)return;rbStopTimer();rbDay=index;rbScreen='day';renderReadingBooster();scrollPageTop()}
function rbOpenExam(){const exam=rbState().exam;if(!exam.deadline&&!exam.submittedAt)exam.deadline=Date.now()+20*60*1000;rbSave();rbScreen='exam';renderReadingBooster();scrollPageTop();if(!exam.submittedAt)rbEnterFullscreen()}
function rbOpenTraining(){rbTraining();rbScreen='training';renderReadingBooster();scrollPageTop()}
function rbOpenWords(){rbWordIndex=0;rbWordFlipped=false;rbScreen='words';renderReadingBooster();scrollPageTop()}
function rbScoreAnswers(answers,p=rbPassage()){
 const results={};
 for(const [n,variants] of Object.entries(p.answers)){const answer=answers?.[n]||'';results[n]=variants.some(v=>norm(v)===norm(answer))}
 for(const group of p.unordered||[]){const ids=group.map(String),expected=ids.map(n=>norm(p.answers[n][0])).sort().join('|'),given=ids.map(n=>norm(answers?.[n]||'')).sort().join('|');for(const n of ids)results[n]=expected===given&&!!answers?.[n]}
 return {correct:Object.values(results).filter(Boolean).length,total:Object.keys(p.answers).length,results};
}
function rbScoreExam(){return rbScoreAnswers(rbState().exam.answers)}
function rbReview(result,answers,p){const entries=Object.keys(p.answers).map(Number).sort((a,b)=>a-b);return `<div class="rb-result"><strong>${result.correct} / ${result.total}</strong><span>${Math.round(result.correct/result.total*100)}% to‘g‘ri</span></div><div class="rb-review"><div class="rb-review-head"><span>Q</span><span>Sizning javobingiz</span><span>To‘g‘ri javob</span><span>Natija</span></div>${entries.map(n=>`<div class="rb-review-row ${result.results[n]?'right':'wrong'}"><b>${n}</b><span>${esc(answers?.[n]||'—')}</span><span>${esc(p.answers[n].join(' / '))}</span><b>${result.results[n]?'✓':'✕'}</b></div>`).join('')}</div>`}
function rbSubmitExam(){const exam=rbState().exam;if(exam.submittedAt)return;exam.submittedAt=new Date().toISOString();exam.score=rbScoreExam().correct;delete exam.deadline;rbStopTimer();rbExitFullscreen();rbSave();renderReadingBooster();scrollPageTop()}
function rbExamTick(){const exam=rbState().exam;if(rbScreen!=='exam'||exam.submittedAt){rbStopTimer();return}const remaining=Math.max(0,Math.ceil((exam.deadline-Date.now())/1000));const el=document.getElementById('rbClock');if(el)el.textContent=rbFormat(remaining);if(!remaining)rbSubmitExam()}
function rbRenderList(){
 const completed=rbPassages.filter(p=>readingBoosterProgress[p.id]?.training?.completedAt).length;
 root.innerHTML=heading('Reading Booster','10 ta to‘liq mockdan ajratilgan 30 ta passage · Real Exam, Passage Training va shaxsiy Words',`${completed} / 30 kun tugallangan`)+`<div class="rb-plan">${rbPassages.map(p=>{const state=readingBoosterProgress[p.id],exam=state?.exam?.submittedAt,done=state?.training?.completedAt,count=state?.words?.length||0;return `<button type="button" class="rb-day-tile ${done?'done':''}" data-action="rb-day" data-day="${p.day}"><span>Kun ${p.day} · Passage ${p.part} · Mock ${p.mock}</span><strong>${esc(p.title)}</strong><small>${done?'Training tugadi':exam?'Exam topshirildi':'Boshlash'}${count?` · ${count} ta Words`:''}</small></button>`}).join('')}</div>`;
}
function rbRenderDay(){
 const p=rbPassage(),s=rbState();root.innerHTML=`<div class="page-back-row"><button type="button" class="page-back" data-action="rb-back">← 30 kunlik reja</button></div>`+heading(`Kun ${p.day} · Passage ${p.part}`,p.title,`Mock ${p.mock} · ${Object.keys(p.answers).length} ta original savol`)+`<div class="rb-path-grid"><button type="button" class="rb-path-card" data-action="rb-exam"><span>1-BO‘LIM</span><strong>Real Exam</strong><small>20 daqiqa · original matn va savollar · score va javoblar tahlili</small><em>${s.exam?.submittedAt?`Oxirgi natija: ${s.exam.score}/${Object.keys(p.answers).length}`:'Boshlash'}</em></button><button type="button" class="rb-path-card" data-action="rb-training"><span>2-BO‘LIM</span><strong>Passage Training</strong><small>Avval matn, keyin original savollar, summary, 15 tarjima, 5 xatoni isbotlash va 5 MCQ</small><em>${s.training?.completedAt?'Tugallangan':`Bosqich ${(s.training?.stage||0)+1} / 6`}</em></button><button type="button" class="rb-path-card rb-words-path" data-action="rb-words"><span>3-BO‘LIM</span><strong>Words</strong><small>O‘zingiz tanlagan so‘zlar · o‘zbekcha tarjima · flashcard va 7 ta o‘yin</small><em>${s.words?.length||0} ta so‘z saqlangan</em></button></div>`;
}
function rbTools(){return `<div class="rb-tools"><button type="button" data-action="rb-wide" aria-pressed="${rbWide}">${rbWide?'Oddiy kenglik':'Keng o‘qish'}</button><button type="button" data-action="rb-smaller" aria-label="Shriftni kichraytirish">A−</button><button type="button" data-action="rb-larger" aria-label="Shriftni kattalashtirish">A+</button><span>So‘z yoki iborani belgilang — Words yoki Highlight chiqadi.</span></div>`}
function rbSelectionMenu(){return '<div id="rbSelectionMenu" class="rb-selection-menu" role="toolbar" aria-label="Text actions" hidden><button type="button" data-action="rb-add-word">+ Lug‘atga qo‘shish</button><button type="button" data-action="rb-highlight">Highlight</button><button type="button" data-action="rb-unhighlight" hidden>Remove highlight</button></div>'}
function rbRestoreQuestionControls(answers,disabled=false){
 root.querySelectorAll('[data-rb-q]').forEach(el=>{const value=answers?.[el.dataset.rbQ]||'';if(el.type==='radio')el.checked=el.value===value;else if(el.type!=='checkbox')el.value=value;el.disabled=disabled});
 root.querySelectorAll('[data-rb-group]').forEach(el=>{const [a,b]=el.dataset.rbGroup.split('-');el.checked=[answers?.[a],answers?.[b]].includes(el.value);el.disabled=disabled});
}
function rbRenderExam(){
 const p=rbPassage(),exam=rbState().exam;
 if(exam.submittedAt){
  root.innerHTML=`<div class="page-back-row"><button type="button" class="page-back" data-action="rb-back">← Kun ${p.day}</button></div>`+heading(`Real Exam · ${p.title}`,'Natija va har bir savolning to‘g‘ri javobi')+rbReview(rbScoreExam(),exam.answers,p)+`<button type="button" class="secondary-btn" data-action="rb-retry">Qayta ishlash</button>`;return;
 }
 if(!exam.deadline)exam.deadline=Date.now()+20*60*1000;
 root.innerHTML=`<div class="rb-exam-screen"><div class="page-back-row"><button type="button" class="page-back" data-action="rb-back">← Kun ${p.day} · Imtihondan chiqish</button></div>`+heading(`Real Exam · Passage ${p.part}`,p.title,`${Object.keys(p.answers).length} ta savol`)+`<div class="rb-exam-bar"><strong id="rbClock">20:00</strong><span>Matndan belgilab oling va savollarga javob bering.</span><button type="button" class="secondary-btn rb-fs-btn" id="rbFullscreenBtn" data-action="rb-fullscreen">${rbIsFullscreen()?'⤢ To‘liq ekrandan chiqish':'⛶ To‘liq ekran'}</button><button type="button" class="primary-btn" data-action="rb-submit">Submit</button></div>${rbTools()}<div class="rb-exam-layout ${rbWide?'rb-wide':''}" style="--rb-font:${16+rbFont*2}px"><article class="rb-passage rb-reading-paper" lang="en"><h2>${esc(p.title)}</h2>${p.passageHtml}</article><section class="rb-exam-questions rb-question-paper" lang="en"><h2>Questions</h2>${p.questionHtml}</section></div>${rbSelectionMenu()}</div>`;
 rbRestoreQuestionControls(exam.answers);rbAttachHighlights();rbStopTimer();rbTimer=setInterval(rbExamTick,1000);rbExamTick();
}
function rbBeginStage(stage){const t=rbTraining();t.maxStage=Math.max(t.maxStage||0,t.stage||0,stage);t.stage=stage;rbSave();renderReadingBooster();scrollPageTop()}
function rbTrainingHeader(p,stage){const stages=['Passage without questions','Original questions','Summary writing','Translation challenge','Wrong Answer Challenge','Understanding questions'],unlocked=rbTraining().maxStage||stage;return `<div class="page-back-row"><button type="button" class="page-back" data-action="rb-back">← Kun ${p.day}</button></div>`+heading(`Passage Training · ${p.title}`,`Bosqich ${stage+1} / 6 · ${stages[stage]}`)+`<div class="rb-steps" aria-label="Training bosqichlari">${stages.map((label,i)=>i<=unlocked?`<button type="button" class="${i===stage?'active':'done'}" data-action="rb-choose-stage" data-stage="${i}" title="${label}" aria-label="${i+1}. ${label}">${i+1}</button>`:`<span title="${label}">${i+1}</span>`).join('')}</div>`}
function rbMcqCards(items,key,answers,checked){return `<div class="rb-mcq-list">${items.map((q,i)=>`<fieldset class="rb-mcq"><legend><b>${i+1}.</b> ${esc(q.question)}</legend>${q.options.map((option,j)=>`<label class="${checked?(j===q.answer?'correct':Number(answers[i])===j?'incorrect':''):''}"><input type="radio" name="rb-${key}-${i}" data-rb-mcq="${key}" data-index="${i}" value="${j}" ${Number(answers[i])===j?'checked':''} ${checked?'disabled':''}> <span>${'ABCD'[j]}. ${esc(option)}</span></label>`).join('')}${checked?`<p class="rb-answer-note">${Number(answers[i])===q.answer?'To‘g‘ri':'To‘g‘ri javob: '+('ABCD'[q.answer])}</p>`:''}</fieldset>`).join('')}</div>`}
function rbTranslationOrder(t,p){if(!Array.isArray(t.translationOrder)||t.translationOrder.length!==15||t.translationOrder.some(i=>!p.sentences[i])){t.translationOrder=shuffle(p.sentences.map((_,i)=>i)).slice(0,15);rbSave()}return t.translationOrder}
function rbWordHints(sentence){const dictionary=[['however','biroq'],['although','garchi'],['whereas','holbuki'],['therefore','shuning uchun'],['as a result','natijada'],['because','chunki'],['according to','...ga ko‘ra'],['researchers','tadqiqotchilar'],['evidence','dalil'],['study','tadqiqot'],['increase','oshmoq'],['decrease','kamaymoq'],['environment','atrof-muhit'],['population','aholi'],['development','rivojlanish'],['likely','ehtimol'],['despite','...ga qaramay'],['compared with','...bilan solishtirganda'],['suggests','ko‘rsatadi'],['instead','o‘rniga']];return dictionary.filter(([word])=>sentence.toLowerCase().includes(word)).slice(0,4).map(([en,uz])=>`<span>${esc(en)} = ${esc(uz)}</span>`).join('')}
function rbRenderTraining(){
 const p=rbPassage(),t=rbTraining(),stage=Math.min(5,t.stage||0);let content='';
 if(stage===0){content=`<p class="rb-instruction-primary">Avval passage’ni savollarga qaramasdan o‘qing. Har paragrafning asosiy fikrini toping.</p>${rbTools()}<article class="rb-passage rb-reading-paper ${rbWide?'rb-wide':''}" style="--rb-font:${16+rbFont*2}px" lang="en"><h2>${esc(p.title)}</h2>${p.passageHtml}</article><div class="rb-end-actions"><button type="button" class="primary-btn" data-action="rb-next-stage" data-stage="1">I have finished reading</button></div>`}
 if(stage===1){content=`<p class="rb-instruction-primary">Endi shu passage’ning original ${Object.keys(p.answers).length} ta IELTS savoliga javob bering. Bu bosqichda vaqt cheklanmagan.</p>${rbTools()}<div class="rb-exam-layout ${rbWide?'rb-wide':''}" style="--rb-font:${16+rbFont*2}px"><article class="rb-passage rb-reading-paper" lang="en"><h2>${esc(p.title)}</h2>${p.passageHtml}</article><section class="rb-exam-questions rb-question-paper" lang="en"><h2>Original questions</h2>${p.questionHtml}</section></div>${rbFullPassageTranslation(p)}${t.originalChecked?rbReview(rbScoreAnswers(t.originalAnswers||{},p),t.originalAnswers,p):''}<div class="rb-end-actions">${t.originalChecked?'<button type="button" class="secondary-btn" data-action="rb-retry-original">Qayta ishlash</button><button type="button" class="primary-btn" data-action="rb-next-stage" data-stage="2">Summary writing</button>':'<button type="button" class="primary-btn" data-action="rb-check-original">Check answers</button>'}</div>`}
 if(stage===2){const words=(t.summary||'').trim().split(/\s+/).filter(Boolean).length;content=`<p class="rb-instruction-primary">Passage’ning asosiy g‘oyasi va muhim fikrlarini o‘z so‘zlaringiz bilan 70–100 so‘zda yozing.</p><label class="rb-field-label" for="rbSummary">Your summary</label><textarea id="rbSummary" class="rb-textarea" rows="9" maxlength="4000" placeholder="Write a 70–100 word summary...">${esc(t.summary||'')}</textarea><p class="rb-word-count" id="rbSummaryCount">${words} / 70–100 words</p><p class="rb-help">Yozganingiz saqlanadi. Bu bosqichda grammatik band score avtomatik berilmaydi.</p><button type="button" class="primary-btn" data-action="rb-next-stage" data-stage="3">Save and continue</button>`}
 if(stage===3){const order=rbTranslationOrder(t,p),index=Math.min(14,rbTranslationIndex),sentence=p.sentences[order[index]].text,checked=!!t.translationChecked?.[index],saved=t.translationAnswers?.[index]||'',suggestion=rbTranslationData?.passages?.[p.id]?.sentences?.[order[index]];content=`<p class="rb-instruction-primary">Passage’dan tasodifiy tanlangan 15 ta gapni o‘zbekchaga tarjima qiling.</p><div class="rb-translation-counter">Gap ${index+1} / 15</div><blockquote class="rb-source-sentence" lang="en">${esc(sentence)}</blockquote><label class="rb-field-label" for="rbTranslation">Your translation</label><textarea id="rbTranslation" class="rb-textarea" rows="5" maxlength="1500" placeholder="O‘zbekcha tarjimangiz...">${esc(saved)}</textarea><div class="rb-end-actions"><button type="button" class="secondary-btn" data-action="rb-translation-prev" ${index===0?'disabled':''}>← Oldingi</button><button type="button" class="secondary-btn" data-action="rb-translation-check">Check Translation</button><button type="button" class="secondary-btn" data-action="rb-translation-next" ${index===14?'disabled':''}>Keyingi →</button></div>${checked?`<div class="rb-self-check"><strong>Tarjimani tekshirish · namuna</strong>${suggestion?`<p lang="uz">${esc(suggestion)}</p>`:'<p>Namuna tarjima yuklanmoqda…</p>'}<div class="rb-hints">${rbWordHints(sentence)||'<span>Asosiy fikr va zamonni solishtiring.</span>'}</div><small>Namuna avtomatik tarjima qilingan; kontekstga qarab tekshiring.</small></div>`:''}<div class="rb-end-actions"><button type="button" class="secondary-btn" data-action="rb-translation-shuffle">Boshqa 15 ta gap tanlash</button><button type="button" class="primary-btn" data-action="rb-next-stage" data-stage="4">Wrong Answer Challenge</button></div>`}
 if(stage===4){const index=Math.min(4,rbWrongIndex),q=p.training.wrong[index],saved=t.wrongAnswers?.[index]||{},checked=!!saved.checked;content=`<p class="rb-instruction-primary">Noto‘g‘ri fikrni rad eting, sababini yozing va passage’dagi dalilni tanlang.</p><div class="rb-translation-counter">Challenge ${index+1} / 5</div><div class="rb-false-claim"><strong>“This answer is correct.”</strong><p lang="en">${esc(q.statement)}</p></div><label class="rb-field-label" for="rbReason">Why is this wrong?</label><textarea id="rbReason" class="rb-textarea" rows="4" maxlength="1000" placeholder="Explain the error in your own words...">${esc(saved.reason||'')}</textarea><fieldset class="rb-evidence"><legend>Find the evidence</legend>${q.evidenceChoices.map((text,i)=>`<label class="${checked?(i===q.answer?'correct':Number(saved.evidence)===i?'incorrect':''):''}"><input type="radio" name="rbEvidence" data-rb-evidence="${index}" value="${i}" ${Number(saved.evidence)===i?'checked':''} ${checked?'disabled':''}> <span>${'ABCD'[i]}. ${esc(text)}</span></label>`).join('')}</fieldset>${checked?`<div class="rb-self-check"><strong>${Number(saved.evidence)===q.answer?'Dalil to‘g‘ri tanlandi':'Dalil: '+('ABCD'[q.answer])}</strong><p>${esc(q.explanation)}</p><small>Yozma izohingizni namunaga solishtiring.</small></div>`:'<button type="button" class="secondary-btn" data-action="rb-wrong-check">Check challenge</button>'}<div class="rb-end-actions"><button type="button" class="secondary-btn" data-action="rb-wrong-prev" ${index===0?'disabled':''}>← Oldingi</button><button type="button" class="secondary-btn" data-action="rb-wrong-next" ${index===4?'disabled':''}>Keyingi →</button>${index===4?'<button type="button" class="primary-btn" data-action="rb-next-stage" data-stage="5">Understanding questions</button>':''}</div>`}
 if(stage===5){const items=p.training.understanding;content=`<p class="rb-instruction-primary">Passage mazmunini yakuniy 5 savol bilan tekshiring. Bu savollar original exam savollaridan alohida.</p>${rbMcqCards(items,'understandingAnswers',t.understandingAnswers||{},t.understandingChecked)}${t.understandingChecked?`<div class="rb-check-result">Understanding Score: ${t.understandingScore} / 5</div><div class="rb-end-actions"><button type="button" class="primary-btn" data-action="rb-back">Kun ${p.day} sahifasiga qaytish</button></div>`:'<button type="button" class="primary-btn" data-action="rb-check-mcq" data-key="understandingAnswers">Check understanding</button>'}`}
 root.innerHTML=`<div class="rb-training ${rbWide?'rb-wide':''}">${rbTrainingHeader(p,stage)}${content}${stage<=1?rbSelectionMenu():''}</div>`;if(stage<=1){if(stage===1)rbRestoreQuestionControls(t.originalAnswers,t.originalChecked);rbAttachHighlights()}
}
function rbFullPassageTranslation(p){
 const paragraphs=rbTranslationData?.passages?.[p.id]?.paragraphs;
 return `<details class="rb-full-translation"><summary>To‘liq passage tarjimasi · o‘zbekcha</summary>${paragraphs?.length===p.paragraphs.length?`<div class="rb-translation-paragraphs">${paragraphs.map((text,i)=>`<div class="rb-translation-pair"><p lang="en"><b>${i+1}. English</b>${esc(p.paragraphs[i])}</p><p lang="uz"><b>O‘zbekcha</b>${esc(text||'—')}</p></div>`).join('')}</div><small>Tarjima mahalliy model bilan oldindan tayyorlangan; noaniq joyini asl matn bilan solishtiring.</small>`:'<p>Tarjima yuklanmoqda…</p>'}</details>`;
}
function rbGameStatus(mode,p,list){const saved=sessions[sessionKey(mode,'pack',`readingbooster:${p.id}`,0,'readingbooster')];return saved?`Davom ettirish: ${Math.min(saved.idx+1,list.length)} / ${list.length}`:`${list.length} ta so‘z`}
function rbRenderWords(){
 const p=rbPassage(),list=rbWords();rbWordIndex=Math.max(0,Math.min(rbWordIndex,list.length-1));const w=list[rbWordIndex];
 let content=`<div class="rb-words-toolbar"><button type="button" class="primary-btn" data-action="rb-new-word">+ So‘z qo‘shish</button><span>Real Exam yoki Passage Training’da so‘z/iborani belgilab ham qo‘shishingiz mumkin.</span></div>`;
 if(!w)content+=`<div class="rb-words-empty"><strong>Hozircha so‘z saqlanmagan</strong><p>Passage’dan xohlagan so‘z yoki iborani belgilang. O‘zbekcha tarjimasi avtomatik qo‘shiladi.</p><button type="button" class="secondary-btn" data-action="rb-exam">Real Exam’ga o‘tish</button></div>`;
 else content+=`<div class="rb-word-study"><div class="rb-word-focus"><span class="rb-word-counter">Karta ${rbWordIndex+1} / ${list.length}</span><button type="button" class="rb-word-card ${rbWordFlipped?'flipped':''}" data-action="rb-word-flip" aria-pressed="${rbWordFlipped}">${rbWordFlipped?`<small>O‘ZBEKCHA TARJIMA</small><strong>${esc(w.u)}</strong><span>${esc(w.e||'')}</span><em>Inglizchasini ko‘rish</em>`:`<small>ENGLISH · ${w.source==='questions'?'SAVOLLAR':w.source==='manual'?'O‘ZIM QO‘SHDIM':'PASSAGE'}</small><strong>${esc(w.w)}</strong><span>Tarjimani ko‘rish uchun bosing</span>`}</button><div class="rb-word-controls"><button type="button" class="secondary-btn" data-action="rb-word-prev" ${rbWordIndex===0?'disabled':''}>← Oldingi</button><button type="button" class="secondary-btn" data-action="rb-word-speak">🔊 Talaffuz</button><button type="button" class="secondary-btn" data-action="rb-word-next" ${rbWordIndex===list.length-1?'disabled':''}>Keyingi →</button></div></div><div class="rb-word-index"><h2>Saqlangan so‘zlar</h2><div class="rb-word-rows">${list.map((item,i)=>`<div class="rb-word-row ${i===rbWordIndex?'active':''}"><button type="button" data-action="rb-word-select" data-index="${i}"><strong>${esc(item.w)}</strong><span>${esc(item.u)}</span></button><button type="button" class="rb-word-edit" data-action="rb-word-edit" data-id="${esc(item.id)}" aria-label="${esc(item.w)} tarjimasini tahrirlash">✎</button><button type="button" class="rb-word-delete" data-action="rb-word-delete" data-id="${esc(item.id)}" aria-label="${esc(item.w)} so‘zini o‘chirish">×</button></div>`).join('')}</div></div></div><div class="rb-words-games"><h2>Shu ${list.length} ta so‘zni 7 ta o‘yinda o‘rganing</h2><div class="games-grid">${games.map(g=>`<button type="button" class="game-tile ${g[4]}" data-action="rb-start-game" data-mode="${g[0]}"><span class="game-icon" aria-hidden="true">${g[3]}</span><strong>${esc(g[1])}</strong><small>${esc(g[2])}</small><span class="game-count">${rbGameStatus(g[0],p,list)}</span></button>`).join('')}</div></div>`;
 root.innerHTML=`<div class="page-back-row"><button type="button" class="page-back" data-action="rb-back">← Kun ${p.day}</button></div>`+heading(`Words · Kun ${p.day}`,p.title,`${list.length} ta so‘z`)+content+`<p class="rb-lexicon-credit">Tarjima: <a href="https://huggingface.co/HPLT/translate-en-uz-v2.0-hplt" target="_blank" rel="noopener noreferrer">HPLT English–Uzbek MT v2.0</a> (CC BY 4.0, avtomatik). Qo‘shimcha lug‘at manbalari: <a href="https://uzwordnet.ldkr.org/" target="_blank" rel="noopener noreferrer">UzWordnet jamoasi</a> (CC BY-SA 4.0) va <a href="/reading-wordnet-license.txt" target="_blank" rel="noopener noreferrer">Princeton WordNet litsenziyasi</a>. So‘zning ma’nosi kontekstga bog‘liq bo‘lsa, kartadagi tarjimani ✎ orqali tuzating.</p>`;
}
function rbCloseWordModal(){document.getElementById('rbWordModal')?.remove();rbWordDraft=null}
function rbShowWordModal(){
 const d=rbWordDraft;if(!d)return;document.getElementById('rbWordModal')?.remove();const modal=document.createElement('div');modal.id='rbWordModal';modal.className='rb-word-modal';modal.innerHTML=`<div class="rb-word-dialog" role="dialog" aria-modal="true" aria-labelledby="rbWordTitle"><div class="rb-word-dialog-head"><h2 id="rbWordTitle">${d.id?'So‘zni tahrirlash':'Words’ga qo‘shish'}</h2><button type="button" data-action="rb-close-word" aria-label="Yopish">×</button></div><p>O‘zbekcha tarjima avtomatik topilib, shu passage’ning Words bo‘limiga saqlanadi.${d.id?' Kerak bo‘lsa, tarjimani tuzating.':''}</p><label for="rbWordEnglish">English word / phrase</label><input id="rbWordEnglish" maxlength="160" value="${esc(d.w||'')}" autocomplete="off" placeholder="English word or phrase">${d.id?`<label for="rbWordUz">O‘zbekcha tarjima (tahrirlash ixtiyoriy)</label><input id="rbWordUz" maxlength="240" value="${esc(d.u||'')}" autocomplete="off">`:''}<label for="rbWordExample">Passage’dan misol gap</label><textarea id="rbWordExample" rows="3" maxlength="400" placeholder="Misol gap (ixtiyoriy)">${esc(d.e||'')}</textarea><div class="rb-word-dialog-actions"><button type="button" class="secondary-btn" data-action="rb-close-word">Bekor qilish</button><button type="button" class="primary-btn" data-action="rb-save-word">${d.id?'Saqlash':'Tarjima qilib qo‘shish'}</button></div></div>`;document.body.appendChild(modal);modal.addEventListener('click',event=>{if(event.target===modal)rbCloseWordModal()});modal.querySelector('#rbWordEnglish')?.focus();
}
function rbSelectionExample(range,term){
 const node=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement;
 const paragraph=node?.closest('p,.rb-question,.question,.question-row,.passage-para,.letter-para');
 const text=(paragraph?.textContent||'').replace(/\s+/g,' ').trim();
 const sentence=text.split(/(?<=[.!?])\s+/).find(s=>norm(s).includes(norm(term)))||text;
 return sentence.slice(0,400);
}
function rbLocalTranslation(term){
 const key=norm(term),found=words.find(w=>norm(w.w)===key&&w.u)||maxSpeakingBank.topics.flatMap(t=>t.entries).find(w=>norm(w.term)===key&&w.uz);
 return {u:found?.u||found?.uz||'',d:found?.d||''};
}
function rbLoadLexicon(){
 if(!rbLexiconPromise)rbLexiconPromise=fetch('/reading-lexicon.json',{headers:{accept:'application/json'}}).then(response=>{if(!response.ok)throw Error('dictionary unavailable');return response.json()}).catch(()=>({verified:{},words:{}}));
 return rbLexiconPromise;
}
function rbWordForms(term){
 const word=term.toLowerCase();if(!/^[a-z]{4,}$/.test(word))return [];
 if(word.endsWith('ies'))return [word.slice(0,-3)+'y'];
 if(word.endsWith('es'))return [word.slice(0,-2),word.slice(0,-1)];
 if(word.endsWith('s'))return [word.slice(0,-1)];
 return [];
}
function rbOfflineWord(term,lexicon){
 const key=norm(term),verified=lexicon.verified||{},dictionary=lexicon.words||{};
 if(verified[key])return {u:rbCleanTranslation(verified[key]),d:'Tekshirilgan lug‘atdagi ma’no'};
 const pretranslated=rbTranslationData?.words?.[term.toLowerCase().replace(/[’‘]/g,"'")];if(pretranslated)return {u:rbCleanTranslation(pretranslated),d:'Passage uchun oldindan tayyorlangan tarjima; kontekstni tekshiring.'};
 const exact=dictionary[key];if(exact&&/^[a-z]+$/i.test(term))return {u:rbCleanTranslation(exact),d:'Qo‘shimcha lug‘atdagi ma’no; kontekstni tekshiring.'};
 return null;
}
async function rbTranslateWord(term){
 const key=norm(term),local=rbLocalTranslation(term);if(local.u)return local;
 if(rbTranslationCache.has(key))return {u:rbTranslationCache.get(key),d:''};
 await rbLoadTranslations();
 const lexicon=await rbLoadLexicon(),offline=rbOfflineWord(term,lexicon);
 if(offline?.u){rbTranslationCache.set(key,offline.u);return offline}
 throw Error('translation unavailable');
}
function rbStoreWord(dayId,entry){
 const state=readingBoosterProgress[dayId];if(!state)return null;
 const list=state.words||(state.words=[]),existing=list.find(x=>norm(x.w)===norm(entry.w));
 if(existing)return existing;
 if(list.length>=1000)throw Error('word limit');
 const saved={id:`rb:${dayId}:${crypto.randomUUID()}`,w:entry.w,u:rbCleanTranslation(entry.u),e:entry.e||`I encountered “${entry.w}” in this passage.`,d:entry.d||'Reading passage’dan saqlangan ibora',source:entry.source||'manual',createdAt:new Date().toISOString()};
 list.push(saved);rbSave();return saved;
}
async function rbOpenWordFromSelection(){
 if(!rbSelection){toast('Avval so‘z yoki iborani belgilang.');return}
 const term=rbSelectedWholeWords(rbSelection);
 if(!term||term.length>160){toast('1–160 belgili so‘z yoki iborani tanlang.');return}
 const dayId=rbPassage().id,key=norm(term),pendingKey=`${dayId}:${key}`;
 if((readingBoosterProgress[dayId]?.words||[]).some(w=>norm(w.w)===key)){toast('Bu so‘z Words bo‘limida allaqachon bor.');rbHideSelectionMenu();return}
 if(rbPendingWords.has(pendingKey)){toast('Tarjima qilinmoqda…');return}
 const start=rbSelection.startContainer.nodeType===1?rbSelection.startContainer:rbSelection.startContainer.parentElement;
 const entry={w:term,e:rbSelectionExample(rbSelection,term),source:start?.closest('.rb-exam-questions')?'questions':'passage'};
 const menu=root.querySelector('#rbSelectionMenu'),buttons=[...(menu?.querySelectorAll('button')||[])],button=menu?.querySelector('[data-action="rb-add-word"]');
 buttons.forEach(item=>item.disabled=true);if(button)button.textContent='Tarjima qilinmoqda…';
 rbSelection=null;window.getSelection()?.removeAllRanges();rbPendingWords.add(pendingKey);toast('Tarjima qilinmoqda…');
 try{const translated=await rbTranslateWord(term);rbStoreWord(dayId,{...entry,...translated});if(rbScreen==='words'&&rbPassage().id===dayId)renderReadingBooster();toast(`“${term}” tarjimasi bilan Words’ga qo‘shildi.`)}
 catch(error){toast(error.message==='word limit'?'Bitta passage uchun ko‘pi bilan 1000 ta so‘z saqlanadi.':'Bu iboraning tayyor tarjimasi yo‘q. So‘zni alohida belgilang yoki lug‘atdan tekshiring.')}
 finally{rbPendingWords.delete(pendingKey);if(button?.isConnected){buttons.forEach(item=>item.disabled=false);button.textContent='+ Lug‘atga qo‘shish';menu.hidden=true}}
}
async function rbSaveWordDraft(){
 if(!rbWordDraft)return;const draft={...rbWordDraft},dayId=rbPassage().id,w=document.getElementById('rbWordEnglish')?.value.replace(/\s+/g,' ').trim().slice(0,160)||'',manualTranslation=document.getElementById('rbWordUz')?.value.trim().slice(0,240)||'',e=document.getElementById('rbWordExample')?.value.trim().slice(0,400)||'';
 if(!w){toast('Inglizcha so‘zni yozing.');document.getElementById('rbWordEnglish')?.focus();return}
 const list=rbWords(),original=list.find(x=>x.id===draft.id),duplicate=list.find(x=>norm(x.w)===norm(w));if(original&&duplicate&&original!==duplicate){toast('Bu so‘z avval saqlangan. Uning kartasini tahrirlang.');return}
 if(!original&&duplicate){rbCloseWordModal();toast('Bu so‘z Words bo‘limida allaqachon bor.');return}
 const button=document.querySelector('#rbWordModal [data-action="rb-save-word"]');if(button?.disabled)return;if(button){button.disabled=true;button.textContent='Tarjima qilinmoqda…'}
 try{
  const translated=manualTranslation&&norm(w)===norm(draft.w)?{u:manualTranslation,d:draft.d}:await rbTranslateWord(w);
  if(!button?.isConnected)return;
  if(original){Object.assign(original,{w,u:rbCleanTranslation(translated.u),e:e||`I encountered “${w}” in this passage.`,d:translated.d||draft.d,source:draft.source});rbSave()}
  else rbStoreWord(dayId,{w,u:translated.u,e,d:translated.d||draft.d,source:'manual'});
  rbCloseWordModal();if(rbScreen==='words'&&rbPassage().id===dayId){rbWordIndex=(readingBoosterProgress[dayId].words||[]).findIndex(x=>norm(x.w)===norm(w));rbWordFlipped=false;renderReadingBooster()}toast(original?'So‘z yangilandi.':'So‘z tarjimasi bilan Words’ga saqlandi.');
 }catch(error){toast(error.message==='word limit'?'Bitta passage uchun ko‘pi bilan 1000 ta so‘z saqlanadi.':'Tarjima olinmadi. Birozdan so‘ng qayta urinib ko‘ring.');if(button?.isConnected){button.disabled=false;button.textContent=draft.id?'Saqlash':'Tarjima qilib qo‘shish'}}
}
function rbStartWordGame(mode){if(!games.some(g=>g[0]===mode))return;const list=rbWords();if(!list.length){toast('Avval so‘z qo‘shing.');return}startGame(mode,[...list],{section:`readingbooster:${rbPassage().id}`,packIndex:0,origin:'readingbooster',label:`Kun ${rbDay} · ${games.find(g=>g[0]===mode)[1]}`})}
function renderReadingBooster(){rbLoadTranslations();rbLoadLexicon();rbStopTimer();rbSelection=null;rbCloseWordModal();document.body.classList.toggle('rb-exam-mode',rbScreen==='exam'&&!rbState().exam.submittedAt);if(rbPassages.length!==30){root.innerHTML=heading('Reading Booster','Passagelar yuklanmadi.');return}if(rbScreen==='list')rbRenderList();else if(rbScreen==='day')rbRenderDay();else if(rbScreen==='exam')rbRenderExam();else if(rbScreen==='training')rbRenderTraining();else rbRenderWords()}
function rbNormalizeProgress(data){
 const out={};if(!data||typeof data!=='object'||Array.isArray(data))return out;
 for(const p of rbPassages){const entry=data[p.id];if(!entry||typeof entry!=='object')continue;
  const exam=entry.exam||{},training=entry.training||{};
  const answers={};for(const n of Object.keys(p.answers))if(typeof exam.answers?.[n]==='string')answers[n]=exam.answers[n].slice(0,100);
  const textMap=(obj,cap=1500)=>Object.fromEntries(Object.entries(obj||{}).filter(([k,v])=>/^\d{1,2}$/.test(k)&&typeof v==='string').slice(0,30).map(([k,v])=>[k,v.slice(0,cap)]));
  const map=(obj)=>Object.fromEntries(Object.entries(obj||{}).filter(([k])=>/^\d{1,2}$/.test(k)).slice(0,30));
  const seenWords=new Set(),savedWords=[];
  for(const item of Array.isArray(entry.words)?entry.words.slice(0,1000):[]){
   if(!item||typeof item!=='object'||typeof item.id!=='string'||!new RegExp(`^rb:${p.id}:[a-zA-Z0-9-]{8,64}$`).test(item.id))continue;
   const w=String(item.w||'').trim().slice(0,160),u=rbCleanTranslation(item.u),key=norm(w);
   if(!w||!u||seenWords.has(key))continue;seenWords.add(key);
   savedWords.push({id:item.id,w,u,d:String(item.d||'').slice(0,260),e:String(item.e||'').slice(0,400),source:['passage','questions','manual'].includes(item.source)?item.source:'passage',createdAt:typeof item.createdAt==='string'?item.createdAt.slice(0,35):''});
  }
  out[p.id]={exam:{answers,deadline:Number.isFinite(exam.deadline)?exam.deadline:null,submittedAt:typeof exam.submittedAt==='string'?exam.submittedAt.slice(0,35):null,score:Number(exam.score)||0},training:{stage:Math.max(0,Math.min(5,Number(training.stage)||0)),maxStage:Math.max(0,Math.min(5,Number(training.maxStage??training.stage)||0)),originalAnswers:textMap(training.originalAnswers,100),originalChecked:!!training.originalChecked,originalScore:Number(training.originalScore)||0,summary:String(training.summary||'').slice(0,4000),translationOrder:Array.isArray(training.translationOrder)?training.translationOrder.filter(i=>Number.isInteger(i)&&i>=0&&i<p.sentences.length).slice(0,15):[],translationAnswers:textMap(training.translationAnswers),translationChecked:map(training.translationChecked),wrongAnswers:map(training.wrongAnswers),understandingAnswers:map(training.understandingAnswers),understandingChecked:!!training.understandingChecked,understandingScore:Number(training.understandingScore)||0,completedAt:typeof training.completedAt==='string'?training.completedAt.slice(0,35):null},words:savedWords,highlights:Array.isArray(entry.highlights)?entry.highlights.filter(x=>x&&['passage','questions'].includes(x.area)&&Number.isInteger(x.element)&&x.element>=0&&x.element<300&&Number.isInteger(x.start)&&Number.isInteger(x.end)&&x.end>x.start&&x.end<10000).slice(0,150):[]};
 }
 return out;
}
function rbHideSelectionMenu(){const menu=root.querySelector('#rbSelectionMenu');if(menu)menu.hidden=true}
function rbSelectedWholeWords(range){
 let text=range.toString(),start=range.startContainer,end=range.endContainer;
 if(start.nodeType===3&&range.startOffset>0){const prefix=start.textContent.slice(0,range.startOffset),match=prefix.match(/[\p{L}\p{N}'’-]+$/u);if(match)text=match[0]+text}
 if(end.nodeType===3&&range.endOffset<end.textContent.length){const suffix=end.textContent.slice(range.endOffset),match=suffix.match(/^[\p{L}\p{N}'’-]+/u);if(match)text+=match[0]}
 return text.replace(/\s+/g,' ').trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
}
function rbCaptureSelection(event){
 if(event?.target?.closest?.('#rbSelectionMenu'))return;
 const selection=window.getSelection();if(!selection||selection.isCollapsed||!selection.rangeCount){rbSelection=null;rbHideSelectionMenu();return}
 const range=selection.getRangeAt(0),container=range.commonAncestorContainer.nodeType===1?range.commonAncestorContainer:range.commonAncestorContainer.parentElement;
 if(!container?.closest('.rb-passage,.rb-exam-questions')){rbSelection=null;rbHideSelectionMenu();return}
 const menu=root.querySelector('#rbSelectionMenu'),rect=range.getBoundingClientRect();if(!menu||!rect.width&&!rect.height)return;
 rbSelection=range.cloneRange();const mark=(range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement)?.closest('.rb-mark');
 menu.querySelector('[data-action="rb-highlight"]').hidden=!!mark;
 menu.querySelector('[data-action="rb-unhighlight"]').hidden=!mark;
 menu.hidden=false;
 const width=menu.offsetWidth,height=menu.offsetHeight;
 menu.style.left=Math.max(8,Math.min(innerWidth-width-8,rect.left+rect.width/2-width/2))+'px';
 menu.style.top=(rect.top>height+12?rect.top-height-8:Math.min(innerHeight-height-8,rect.bottom+8))+'px';
}
function rbHighlightTargets(area){return [...root.querySelectorAll(area==='passage'?'.rb-passage p,.rb-passage .passage-para,.rb-passage .letter-para':'.rb-exam-questions .rb-question,.rb-exam-questions .question,.rb-exam-questions .question-row')].filter(x=>!x.parentElement?.closest(area==='passage'?'.passage-para,.letter-para':'.rb-question,.question'))}
function rbTextPosition(element,node,offset){const range=document.createRange();range.selectNodeContents(element);range.setEnd(node,offset);return range.toString().length}
function rbRangeAt(element,start,end){const nodes=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),texts=[];let total=0,node;while((node=nodes.nextNode())){texts.push([node,total,total+node.textContent.length]);total+=node.textContent.length}const locate=pos=>{const x=texts.find(([,a,b])=>pos>=a&&pos<=b)||texts.at(-1);return x?[x[0],Math.min(x[0].length,Math.max(0,pos-x[1]))]:null};const a=locate(start),b=locate(end);if(!a||!b)return null;const range=document.createRange();range.setStart(...a);range.setEnd(...b);return range}
function rbWrapRange(range,id){if(!range||range.collapsed)return;const mark=document.createElement('mark');mark.className='rb-mark';mark.dataset.rbMark=id;mark.appendChild(range.extractContents());range.insertNode(mark)}
function rbAttachHighlights(){const highlights=rbState().highlights||[];for(const area of ['passage','questions']){const elements=rbHighlightTargets(area);for(const item of highlights.filter(x=>x.area===area).sort((a,b)=>b.start-a.start)){const target=elements[item.element];if(!target)continue;try{rbWrapRange(rbRangeAt(target,item.start,item.end),item.id||`${area}:${item.element}:${item.start}`)}catch{}}}}
function rbHighlight(){if(!rbSelection){toast('Avval matndan bir qismini belgilang.');return}const range=rbSelection,element=(range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement),area=element?.closest('.rb-passage')?'passage':element?.closest('.rb-exam-questions')?'questions':null;if(!area){toast('Passage yoki savoldagi matnni belgilang.');return}const targets=rbHighlightTargets(area),target=targets.find(x=>x.contains(range.startContainer)&&x.contains(range.endContainer));if(!target){toast('Bitta paragraf ichidagi matnni belgilang.');return}const start=rbTextPosition(target,range.startContainer,range.startOffset),end=rbTextPosition(target,range.endContainer,range.endOffset);if(start===end)return;const item={area,element:targets.indexOf(target),start,end,id:Math.random().toString(36).slice(2,10)};try{rbWrapRange(range,item.id);(rbState().highlights||(rbState().highlights=[])).push(item);rbSave();window.getSelection()?.removeAllRanges();rbSelection=null;rbHideSelectionMenu()}catch{toast('Bitta paragraf ichidagi matnni belgilang.')}}
function rbRemoveHighlight(){const sel=rbSelection,element=sel?.startContainer?.nodeType===1?sel.startContainer:sel?.startContainer?.parentElement,mark=element?.closest?.('.rb-mark');if(!mark){toast('O‘chirish uchun belgilangan sariq matnni tanlang.');return}const id=mark.dataset.rbMark,entry=rbState();entry.highlights=(entry.highlights||[]).filter(x=>x.id!==id);const parent=mark.parentNode;while(mark.firstChild)parent.insertBefore(mark.firstChild,mark);mark.remove();parent.normalize();rbSave();rbSelection=null;rbHideSelectionMenu()}
function rbHandleAction(action,button){
 if(action==='rb-day'){rbOpenDay(Number(button.dataset.day));return true}
 if(action==='rb-back'){rbBack();return true}
 if(action==='rb-exam'){rbOpenExam();return true}
 if(action==='rb-training'){rbOpenTraining();return true}
 if(action==='rb-words'){rbOpenWords();return true}
 if(action==='rb-add-word'){rbOpenWordFromSelection();return true}
 if(action==='rb-new-word'){rbWordDraft={id:null,w:'',u:'',e:'',d:'Reading passage’dan saqlangan ibora',source:'manual'};rbShowWordModal();return true}
 if(action==='rb-close-word'){rbCloseWordModal();return true}
 if(action==='rb-save-word'){rbSaveWordDraft();return true}
 if(action==='rb-word-edit'){const w=rbWords().find(x=>x.id===button.dataset.id);if(w){rbWordDraft={...w};rbShowWordModal()}return true}
 if(action==='rb-word-delete'){const list=rbWords(),i=list.findIndex(x=>x.id===button.dataset.id);if(i<0||!window.confirm(`“${list[i].w}” so‘zini o‘chirasizmi?`))return true;const id=list[i].id;list.splice(i,1);delete progress[id];delete mistakes[id];for(const key of Object.keys(sessions))if(key.startsWith(`pack:readingbooster:${rbPassage().id}:0:`))delete sessions[key];saveProgress();saveExtra();saveSessions();rbSave();rbWordIndex=Math.max(0,Math.min(rbWordIndex,list.length-1));rbWordFlipped=false;renderReadingBooster();return true}
 if(action==='rb-word-select'){rbWordIndex=Number(button.dataset.index)||0;rbWordFlipped=false;renderReadingBooster();return true}
 if(action==='rb-word-prev'||action==='rb-word-next'){rbWordIndex=Math.max(0,Math.min(rbWords().length-1,rbWordIndex+(action.endsWith('next')?1:-1)));rbWordFlipped=false;renderReadingBooster();return true}
 if(action==='rb-word-flip'){rbWordFlipped=!rbWordFlipped;renderReadingBooster();return true}
 if(action==='rb-word-speak'){const w=rbWords()[rbWordIndex];if(w)pronounce(w.w);return true}
 if(action==='rb-start-game'){rbStartWordGame(button.dataset.mode);return true}
 if(action==='rb-submit'){rbSubmitExam();return true}
 if(action==='rb-fullscreen'){rbToggleFullscreen();return true}
 if(action==='rb-retry'){rbState().exam={answers:{},deadline:Date.now()+20*60*1000};rbSave();renderReadingBooster();rbEnterFullscreen();return true}
 if(action==='rb-wide'){rbWide=!rbWide;renderReadingBooster();return true}
 if(action==='rb-larger'||action==='rb-smaller'){rbFont=Math.max(0,Math.min(4,rbFont+(action==='rb-larger'?1:-1)));renderReadingBooster();return true}
 if(action==='rb-highlight'){rbHighlight();return true}
 if(action==='rb-unhighlight'){rbRemoveHighlight();return true}
 const t=rbTraining(),p=rbPassage();
 if(action==='rb-check-original'){
  if(Object.keys(p.answers).some(n=>!String(t.originalAnswers?.[n]||'').trim())){toast(`Avval ${Object.keys(p.answers).length} ta savolning barchasiga javob bering.`);return true}
  t.originalChecked=true;t.originalScore=rbScoreAnswers(t.originalAnswers,p).correct;rbSave();renderReadingBooster();return true;
 }
 if(action==='rb-retry-original'){t.originalAnswers={};t.originalChecked=false;t.originalScore=0;rbSave();renderReadingBooster();return true}
 if(action==='rb-choose-stage'){const index=Number(button.dataset.stage);if(index>=0&&index<=Math.max(t.stage||0,t.maxStage||0))rbBeginStage(index);return true}
 if(action==='rb-next-stage'){
  const next=Number(button.dataset.stage);
  if(next===3){t.summary=document.getElementById('rbSummary')?.value.slice(0,4000)||t.summary||'';const count=t.summary.trim().split(/\s+/).filter(Boolean).length;if(count<70||count>100){toast('Summary 70–100 so‘z bo‘lishi kerak.');return true}}
  if(next===4&&Object.keys(t.translationChecked||{}).length<15){toast('Avval 15 ta tarjimani tekshiring.');return true}
  if(next===5){const checked=Object.values(t.wrongAnswers||{}).filter(x=>x.checked).length;if(checked<5){toast('Avval 5 ta challengeni tekshiring.');return true}}
  rbBeginStage(next);return true;
 }
 if(action==='rb-check-mcq'){
  const key=button.dataset.key,items=p.training.understanding,answers=t[key]||{};
  if(items.some((_,i)=>answers[i]===undefined)){toast('5 ta savolning barchasiga javob bering.');return true}
  const score=items.filter((q,i)=>Number(answers[i])===q.answer).length;
  t.understandingChecked=true;t.understandingScore=score;t.completedAt=new Date().toISOString();
  rbSave();renderReadingBooster();return true;
 }
 if(action==='rb-translation-prev'||action==='rb-translation-next'){rbTranslationIndex=Math.max(0,Math.min(14,rbTranslationIndex+(action.endsWith('next')?1:-1)));renderReadingBooster();return true}
 if(action==='rb-translation-check'){const input=document.getElementById('rbTranslation'),value=input?.value.trim()||'';if(!value){toast('Avval tarjimangizni yozing.');return true}t.translationAnswers ||= {};t.translationChecked ||= {};t.translationAnswers[rbTranslationIndex]=value.slice(0,1500);t.translationChecked[rbTranslationIndex]=true;rbSave();renderReadingBooster();return true}
 if(action==='rb-translation-shuffle'){t.translationOrder=shuffle(p.sentences.map((_,i)=>i)).slice(0,15);t.translationAnswers={};t.translationChecked={};rbTranslationIndex=0;rbSave();renderReadingBooster();return true}
 if(action==='rb-wrong-prev'||action==='rb-wrong-next'){rbWrongIndex=Math.max(0,Math.min(4,rbWrongIndex+(action.endsWith('next')?1:-1)));renderReadingBooster();return true}
 if(action==='rb-wrong-check'){const reason=document.getElementById('rbReason')?.value.trim()||'',chosen=root.querySelector('input[name="rbEvidence"]:checked');if(reason.length<8||!chosen){toast('Sababni yozing va dalilni tanlang.');return true}t.wrongAnswers ||= {};t.wrongAnswers[rbWrongIndex]={reason:reason.slice(0,1000),evidence:Number(chosen.value),checked:true};rbSave();renderReadingBooster();return true}
 return false;
}
function rbHandleChange(target){
 if(target.dataset.rbGroup){const group=target.dataset.rbGroup,[a,b]=group.split('-'),selected=[...root.querySelectorAll(`[data-rb-group="${group}"]:checked`)];if(selected.length>2){target.checked=false;toast('Ikkita javob tanlang.');return true}const answers=rbScreen==='exam'?rbState().exam.answers:(rbTraining().originalAnswers ||= {});answers[a]=selected[0]?.value||'';answers[b]=selected[1]?.value||'';rbSave();return true}
 if(target.dataset.rbQ){const answers=rbScreen==='exam'?rbState().exam.answers:(rbTraining().originalAnswers ||= {});answers[target.dataset.rbQ]=target.value;rbSave();return true}
 if(target.dataset.rbMcq){const t=rbTraining();t[target.dataset.rbMcq] ||= {};t[target.dataset.rbMcq][target.dataset.index]=Number(target.value);rbSave();return true}
 if(target.dataset.rbEvidence){const t=rbTraining();t.wrongAnswers ||= {};t.wrongAnswers[target.dataset.rbEvidence]={...(t.wrongAnswers[target.dataset.rbEvidence]||{}),evidence:Number(target.value)};rbSave();return true}
 return false;
}
function rbHandleInput(target){if(target.id==='rbSummary'){const t=rbTraining();t.summary=target.value.slice(0,4000);const words=t.summary.trim().split(/\s+/).filter(Boolean).length;const el=document.getElementById('rbSummaryCount');if(el)el.textContent=`${words} / 70–100 words`;rbSave();return true}if(target.id==='rbTranslation'){const t=rbTraining();t.translationAnswers ||= {};t.translationAnswers[rbTranslationIndex]=target.value.slice(0,1500);rbSave();return true}if(target.id==='rbReason'){const t=rbTraining();t.wrongAnswers ||= {};t.wrongAnswers[rbWrongIndex]={...(t.wrongAnswers[rbWrongIndex]||{}),reason:target.value.slice(0,1000)};rbSave();return true}if(target.dataset.rbQ&&target.tagName==='INPUT'&&target.type==='text'){const answers=rbScreen==='exam'?rbState().exam.answers:(rbTraining().originalAnswers ||= {});answers[target.dataset.rbQ]=target.value.slice(0,100);rbSave();return true}return false}
