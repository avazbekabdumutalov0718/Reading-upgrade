// Each archive entry points to its own analysis; add future mocks to this numbered catalog.
const mockAnalysisCatalog=[{id:'health-sleep-2026-09-29',number:1,date:'29-sentabr 2026',title:'Health & Sleep',file:'mock-analysis-health-sleep.json'}];
let mockAnalysisSelectedId=null,mockAnalysisBank=null,mockAnalysisLoading=false,mockAnalysisLoadError='',mockAnalysisWords=[],mockAnalysisWordsById=new Map(),mockAnalysisCardRefs=new Map();
const mockAnalysisBanks=new Map();
const mockAnalysisFlipped=new Set();
let mockErrorPractice=load('vocab-atlas-mock-error-practice-v1',{}),mockErrorPracticeIndex=0,mockErrorPracticeRetry=false;
function saveMockErrorPractice(){
 try{localStorage.setItem(storageKey('vocab-atlas-mock-error-practice-v1'),JSON.stringify(mockErrorPractice))}catch{}
 window.VocabCloud?.queue();
}
function mockPracticeHtml(bank){
 const drills=bank.analysis.drills||[],total=drills.length;
 if(!total)return '';
 mockErrorPracticeIndex=Math.max(0,Math.min(mockErrorPracticeIndex,total-1));
 const i=mockErrorPracticeIndex,drill=drills[i],history=mockErrorPractice[bank.id]||{},done=Object.keys(history).filter(k=>Number(k)<total).length;
 const checked=history[i]&&!mockErrorPracticeRetry,attempt=checked?history[i].answer:'';
 const question=bank.questions[drill.questionIndex];
 return `<div class="daily-section-title"><span>03</span><div><h2>Xatoni to‘g‘rila</h2><p>Mockdagi o‘z gapingni qayta yoz. ${done} / ${total} ta gap tekshirilgan.</p></div></div><div class="analysis-practice panel"><div class="analysis-practice-top"><span>GAP ${i+1} / ${total} · PART ${question.part}</span><span>${done} / ${total} bajarildi</span></div><div class="analysis-practice-track"><span style="width:${100*done/total}%"></span></div><p class="analysis-practice-question">Savol: ${esc(question.question)}</p><div class="analysis-practice-prompt"><small>SENING XATO GAPING</small><blockquote lang="en">${esc(drill.before)}</blockquote></div><label class="analysis-practice-label" for="mockErrorAnswer">To‘g‘ri shaklini yoz</label><textarea id="mockErrorAnswer" rows="3" maxlength="300" spellcheck="false" placeholder="Inglizcha to‘g‘ri gapni yozing..." ${checked?'readonly':''}>${esc(attempt)}</textarea><div class="analysis-practice-actions">${checked?'<button type="button" class="secondary-btn" data-action="mock-analysis-practice-retry">Qayta urinib ko‘rish</button>':'<button type="button" class="primary-btn" data-action="mock-analysis-practice-check">Tekshirish</button>'}<button type="button" class="secondary-btn" data-action="mock-analysis-practice-prev" ${i===0?'disabled':''}>← Oldingi</button><button type="button" class="secondary-btn" data-action="mock-analysis-practice-next" ${i===total-1?'disabled':''}>Keyingi →</button></div>${checked?`<div class="analysis-practice-result ${history[i].matched?'matched':''}" role="status"><strong>${history[i].matched?'Namuna bilan bir xil!':'To‘g‘rilangan namuna:'}</strong><p lang="en">${esc(drill.after)}</p><small>${esc(drill.focus)} · Boshqa to‘g‘ri ifodalar ham bo‘lishi mumkin.</small></div>`:'<p class="analysis-practice-note">Tekshirishni bosgach, to‘g‘rilangan namuna ko‘rinadi.</p>'}</div>`;
}
function updateMockPractice(){const section=document.getElementById('analysis-error-practice');if(section&&mockAnalysisBank)section.innerHTML=mockPracticeHtml(mockAnalysisBank)}
function buildMockAnalysisCards(){
 mockAnalysisWords=[];mockAnalysisWordsById=new Map();mockAnalysisCardRefs=new Map();
 const seen=new Set();
 mockAnalysisBank.questions.forEach((q,qi)=>q.cards.forEach((card,ci)=>{
  mockAnalysisCardRefs.set(`q:${qi}:${ci}`,card);
  const key=norm(card.w);if(!key||seen.has(key))return;seen.add(key);
  const w={id:`mockanalysis:${mockAnalysisBank.id}:${mockAnalysisWords.length}`,w:card.w,u:card.u,d:`${mockAnalysisBank.title} mockida ishlatilgan ibora`,e:card.e,p:'',t:mockAnalysisBank.title,s:true};
  mockAnalysisWords.push(w);mockAnalysisWordsById.set(w.id,w);
 }));
}
function loadMockAnalysis(){
 const entry=mockAnalysisCatalog.find(x=>x.id===mockAnalysisSelectedId);
 if(!entry||mockAnalysisLoading)return;
 const cached=mockAnalysisBanks.get(entry.id);
 if(cached){mockAnalysisBank=cached;buildMockAnalysisCards();renderMockAnalysis();return}
 mockAnalysisLoading=true;mockAnalysisLoadError='';
 let embedded=null;
 try{embedded=JSON.parse(document.getElementById('mock-analysis-data')?.textContent||'{}')[entry.id]}catch(error){console.error('Embedded mock data:',error)}
 const source=embedded?Promise.resolve(embedded):fetch(entry.file+'?v=20260929-mock-inline',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()});
 source.then(bank=>{
  if(bank.id!==entry.id||!Array.isArray(bank.questions)||!bank.questions.length||!bank.analysis||bank.questions.some(q=>!Array.isArray(q.cards)||!q.original||!q.sample))throw Error('Mock ma’lumotlari to‘liq emas');
  mockAnalysisBanks.set(entry.id,bank);mockAnalysisLoading=false;
  if(mockAnalysisSelectedId===entry.id){mockAnalysisBank=bank;buildMockAnalysisCards();if(state.view==='mockanalysis')renderMockAnalysis()}
 }).catch(error=>{mockAnalysisLoading=false;mockAnalysisLoadError=error.message;console.error('Mock analysis:',error);if(state.view==='mockanalysis'&&mockAnalysisSelectedId===entry.id)renderMockAnalysis()});
}
function mockAnalysisCard(card,key){
 const back=mockAnalysisFlipped.has(key);
 return `<div class="analysis-flashcard"><button type="button" class="analysis-flashcard-face ${back?'turned':''}" data-action="mock-analysis-flip" data-key="${esc(key)}" aria-pressed="${back}" aria-label="${esc(card.w)} kartasini aylantirish"><small>${back?'TARJIMA VA MISOL':'INGLIZCHA IBORA'}</small><strong>${esc(back?card.u:card.w)}</strong><span>${esc(back?card.e:'Tarjimani ko‘rish ↗')}</span></button><button type="button" class="analysis-speak" data-action="mock-analysis-speak" data-phrase="${esc(card.w)}" aria-label="${esc(card.w)} talaffuzini eshittirish">🔊 Eshitish</button></div>`;
}
function mockAnalysisQuestion(q,qi){
 const label=q.part===2?(q.followup?'PART 2 · QISQA SAVOL':'PART 2 · CUE CARD'):`PART ${q.part}`;
 return `<details class="analysis-question" ${qi===0?'open':''}><summary><span class="analysis-question-number">${String(qi+1).padStart(2,'0')}</span><span class="analysis-question-label"><small>${label}</small><strong>${esc(q.question)}</strong></span><span class="analysis-question-chevron" aria-hidden="true">⌄</span></summary><div class="analysis-question-content"><div class="analysis-answer-pair"><div class="analysis-original"><h4>Sening original javobing</h4><p lang="en">${esc(q.original)}</p></div><div class="analysis-sample"><h4>Band 9 uslubidagi sample answer</h4><p lang="en">${esc(q.sample).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n\n/g,'</p><p lang="en">')}</p></div></div><div class="analysis-question-cards"><h4>${q.cards.length} ta collocation · kartalar va tarjimalar</h4><div class="analysis-card-grid">${q.cards.map((card,ci)=>mockAnalysisCard(card,`q:${qi}:${ci}`)).join('')}</div></div></div></details>`;
}
function renderMockAnalysis(){
 if(!mockAnalysisSelectedId){
  const items=[...mockAnalysisCatalog].sort((a,b)=>a.number-b.number);
  root.innerHTML=heading('MOCK','Speaking mocklaring sana va tartib raqami bilan shu yerda saqlanadi.',`${items.length} ta mock`)+`<div class="analysis-catalog">${items.map(entry=>`<article class="analysis-catalog-card"><span class="analysis-catalog-number">MOCK ${entry.number}</span><div><h2>${esc(entry.title)}</h2><p>${esc(entry.date)} · Part 1, 2, 3</p></div><button type="button" class="primary-btn" data-action="mock-analysis-open" data-id="${esc(entry.id)}" aria-label="Mock ${entry.number}: ${esc(entry.title)} tahlilini ochish">Tahlilni ochish</button></article>`).join('')}</div>`;
  return;
 }
 const entry=mockAnalysisCatalog.find(x=>x.id===mockAnalysisSelectedId);
 if(!entry){mockAnalysisSelectedId=null;renderMockAnalysis();return}
 const back='<div class="page-back-row"><button type="button" class="page-back" data-action="mock-analysis-back">← Barcha mocklar</button></div>';
 if(mockAnalysisLoadError){root.innerHTML=back+heading(`Mock ${entry.number} · ${entry.title}`,'Ma’lumotlarni yuklashda xatolik yuz berdi.')+`<p role="alert" class="note">${esc(mockAnalysisLoadError)}</p><button type="button" class="secondary-btn" data-action="mock-analysis-retry">Qayta urinish</button>`;return}
 if(!mockAnalysisBank||mockAnalysisBank.id!==entry.id){root.innerHTML=back+heading(`Mock ${entry.number} · ${entry.title}`,'Javoblar yuklanmoqda…')+'<div class="loading"><span class="spinner"></span> Yuklanmoqda…</div>';loadMockAnalysis();return}
 const bank=mockAnalysisBank,analysis=bank.analysis;
 let html=back+heading(`Mock ${entry.number} · ${entry.title}`,`${entry.date} · sening to‘liq Speaking mocking`,'Part 1 · 2 · 3');
 html+=`<div class="analysis-jumps"><button type="button" data-action="mock-analysis-jump" data-target="analysis-review">1 · Savollar va tahlil</button><button type="button" data-action="mock-analysis-jump" data-target="analysis-all-cards">2 · ${mockAnalysisWords.length} karta va 7 o‘yin</button>${analysis.drills?.length?`<button type="button" data-action="mock-analysis-jump" data-target="analysis-error-practice">3 · ${analysis.drills.length} ta xatoni to‘g‘rila</button>`:''}</div>`;
 html+=`<section class="analysis-score panel" aria-label="Mock bahosi"><div><small>MATN ASOSIDAGI TAXMINIY BAHO</small><strong>${esc(analysis.score)}<span> / 9</span></strong><p>Talaffuz audio bo‘lmagani uchun baholanmagan. Bu rasmiy IELTS natijasi emas.</p></div><div class="analysis-score-parts">${analysis.partScores.map((score,i)=>`<span>Part ${i+1} <b>${esc(score)}</b></span>`).join('')}</div></section>`;
 html+=`<section id="analysis-review" class="analysis-section"><div class="daily-section-title"><span>01</span><div><h2>Savollar, javoblar va tahlil</h2><p>Barcha ${bank.questions.length} savol. Original javobing saqlangan; sample javobdagi qalin iboralarni kartalarda mashq qil.</p></div></div><div class="analysis-criteria">${analysis.criteria.map(c=>`<div><small>${esc(c.name)}</small><strong>${esc(c.score)}</strong><p>${esc(c.feedback)}</p></div>`).join('')}</div><div class="analysis-feedback panel">${analysis.highlights.map(h=>`<div><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></div>`).join('')}</div>`;
 html+=`<details class="analysis-corrections panel"><summary>Asosiy grammatik xatolar va to‘g‘ri shakli · ${analysis.corrections.length} ta misol</summary><div class="analysis-correction-list">${analysis.corrections.map(([before,after])=>`<div><span>${esc(before)}</span><strong>${esc(after)}</strong></div>`).join('')}</div></details>`;
 for(const part of [1,2,3]){
  const items=bank.questions.map((q,i)=>({q,i})).filter(x=>x.q.part===part);
  if(!items.length)continue;
  html+=`<div class="analysis-part"><div class="analysis-part-heading"><span>PART ${part}</span><h3>${esc(analysis.partTitles?.[part]||`Part ${part}`)}</h3><small>${items.length} ta savol</small></div>${items.map(x=>mockAnalysisQuestion(x.q,x.i)).join('')}</div>`;
 }
 html+='</section>';
 html+=`<section id="analysis-all-cards" class="analysis-section"><div class="daily-section-title"><span>02</span><div><h2>Barcha collocationlar</h2><p>${mockAnalysisWords.length} ta noyob karta · barcha Part 1, 2 va 3 javoblaridan. Kartani aylantirib tarjimasi va misolini ko‘r.</p></div></div><div class="analysis-all-cards">${mockAnalysisWords.map(w=>mockAnalysisCard(w,w.id)).join('')}</div><h3 class="analysis-games-title">Barcha kartalar bilan 7 ta o‘yin</h3><div class="games-grid analysis-games-grid">${games.map(g=>{const session=sessions[sessionKey(g[0],'pack',bank.id,0,'mockanalysis')];return `<button type="button" class="game-tile ${g[4]}" data-action="mock-analysis-start" data-mode="${g[0]}"><span class="game-icon" aria-hidden="true">${g[3]}</span><strong>${esc(g[1])}</strong><small>${esc(g[2])}</small><span class="game-count">${session?`Davom ettirish: ${Math.min(session.idx,mockAnalysisWords.length)} / ${mockAnalysisWords.length}`:`${mockAnalysisWords.length} ta ibora`}</span></button>`}).join('')}</div></section>`;
 if(analysis.drills?.length)html+=`<section id="analysis-error-practice" class="analysis-section">${mockPracticeHtml(bank)}</section>`;
 root.innerHTML=html;
}
function mockAnalysisHandleAction(action,button){
 if(action==='mock-analysis-open'){
  const entry=mockAnalysisCatalog.find(x=>x.id===button.dataset.id);if(!entry)return true;
  mockAnalysisSelectedId=entry.id;mockAnalysisBank=null;mockAnalysisLoadError='';mockErrorPracticeIndex=0;mockErrorPracticeRetry=false;renderMockAnalysis();scrollPageTop();return true;
 }
 if(action==='mock-analysis-back'){mockAnalysisSelectedId=null;renderMockAnalysis();scrollPageTop();return true}
 if(action==='mock-analysis-retry'){mockAnalysisLoadError='';renderMockAnalysis();return true}
 if(action==='mock-analysis-jump'){document.getElementById(button.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'});return true}
 if(action==='mock-analysis-practice-prev'||action==='mock-analysis-practice-next'){
  const length=mockAnalysisBank?.analysis.drills?.length||0;
  mockErrorPracticeIndex=Math.max(0,Math.min(length-1,mockErrorPracticeIndex+(action.endsWith('next')?1:-1)));
  mockErrorPracticeRetry=false;updateMockPractice();document.getElementById('mockErrorAnswer')?.focus();return true;
 }
 if(action==='mock-analysis-practice-retry'){mockErrorPracticeRetry=true;updateMockPractice();document.getElementById('mockErrorAnswer')?.focus();return true}
 if(action==='mock-analysis-practice-check'){
  const bank=mockAnalysisBank,drill=bank?.analysis.drills?.[mockErrorPracticeIndex],answer=document.getElementById('mockErrorAnswer')?.value.trim();
  if(!drill)return true;
  if(!answer){toast('Avval gapingizni yozing.');return true}
  const record={answer,matched:norm(answer)===norm(drill.after),checkedAt:new Date().toISOString()};
  (mockErrorPractice[bank.id]??={})[mockErrorPracticeIndex]=record;
  mockErrorPracticeRetry=false;saveMockErrorPractice();updateMockPractice();return true;
 }
 if(action==='mock-analysis-speak'){pronounce(button.dataset.phrase);return true}
 if(action==='mock-analysis-flip'){
  const key=button.dataset.key,card=mockAnalysisCardRefs.get(key)||mockAnalysisWordsById.get(key);if(!card)return true;
  if(mockAnalysisFlipped.has(key))mockAnalysisFlipped.delete(key);else mockAnalysisFlipped.add(key);
  const back=mockAnalysisFlipped.has(key);
  button.classList.toggle('turned',back);button.setAttribute('aria-pressed',String(back));
  button.querySelector('small').textContent=back?'TARJIMA VA MISOL':'INGLIZCHA IBORA';
  button.querySelector('strong').textContent=back?card.u:card.w;
  button.querySelector('span').textContent=back?card.e:'Tarjimani ko‘rish ↗';return true;
 }
 if(action==='mock-analysis-start'){
  const mode=button.dataset.mode;if(!mockAnalysisBank||!games.some(g=>g[0]===mode))return true;
  startGame(mode,mockAnalysisWords,{section:mockAnalysisBank.id,packIndex:0,label:`Mock collocationlar · ${games.find(g=>g[0]===mode)[1]}`,origin:'mockanalysis'});return true;
 }
 return false;
}
