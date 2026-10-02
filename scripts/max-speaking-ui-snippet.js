// Topic-based workbook from the user's 1,500-collocation document.
const MAX_SPEAKING_COOLDOWN=12*60*60*1000;
let maxSpeakingWheelSpinning=false,maxSpeakingWheelTimer=null;
function maxSpeakingWheelSanitize(input){
 const raw=input&&typeof input==='object'?input:{},used=[...new Set((Array.isArray(raw.used)?raw.used:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<30))];
 const lastAt=Number(raw.lastAt)||0;
 return {used,lastAt:lastAt>0&&lastAt<Date.now()+MAX_SPEAKING_COOLDOWN?lastAt:0,selected:used.includes(raw.selected)?raw.selected:null};
}
maxSpeakingWheel=maxSpeakingWheelSanitize(maxSpeakingWheel);
function maxSpeakingWheelSave(){
 try{localStorage.setItem(storageKey('vocab-atlas-max-speaking-wheel-v1'),JSON.stringify(maxSpeakingWheel))}catch{}
 window.VocabCloud?.queue();
}
function maxSpeakingWheelRemaining(){return Math.max(0,MAX_SPEAKING_COOLDOWN-(Date.now()-maxSpeakingWheel.lastAt))}
function maxSpeakingWheelTime(ms){const minutes=Math.ceil(ms/60000);return `${Math.floor(minutes/60)} soat ${String(minutes%60).padStart(2,'0')} daqiqa`}
function maxSpeakingWheelPanel(topics){
 const selected=maxSpeakingWheel.selected,remaining=maxSpeakingWheelRemaining(),finished=maxSpeakingWheel.used.length===30;
 const rotation=selected===null?0:-(selected+.5)*12;
 const colors=['#7255dc','#6d9be0','#40a5a4','#a271dc','#e0a86b'];
 const background=`conic-gradient(${topics.map((_,i)=>`${colors[i%colors.length]} ${i*12}deg ${(i+1)*12}deg`).join(',')})`;
 return `<section class="max-wheel panel" aria-label="MAX SPEAKING mavzular barabani"><div class="max-wheel-head"><span>30 MAVZU · 12 SOATDA BIR MARTA</span><h2>MAX SPEAKING barabani</h2><p>O‘zingiz aylantiring. Har mavzu bir marta tushadi; 30 tasi tugagach baraban to‘xtaydi.</p></div><div class="max-wheel-body"><div class="max-wheel-frame"><span class="max-wheel-pointer" aria-hidden="true"></span><div id="maxSpeakingWheelDisc" class="max-wheel-disc" style="background:${background};transform:rotate(${rotation}deg)">${topics.map((_,i)=>`<span style="--angle:${i*12+6}deg">${String(i+1).padStart(2,'0')}</span>`).join('')}</div><div class="max-wheel-hub" aria-hidden="true">MAX</div></div><div class="max-wheel-control"><strong>${maxSpeakingWheel.used.length} / 30 mavzu tanlandi</strong><button type="button" class="primary-btn" data-action="max-speaking-spin" ${finished||remaining||maxSpeakingWheelSpinning?'disabled':''}>${finished?'30 mavzu tugadi':maxSpeakingWheelSpinning?'Aylanmoqda…':remaining?'12 soatlik kutish':'Barabanni aylantirish'}</button><p id="maxSpeakingWheelStatus" role="status">${finished?'Barcha 30 mavzuni ko‘rdingiz.':remaining?`Keyingi aylantirish: ${maxSpeakingWheelTime(remaining)} dan so‘ng.`:'Baraban tayyor. Tugmani bosing.'}</p>${selected===null?'':`<div class="max-wheel-result"><small>OXIRGI TANLANGAN MAVZU · ${selected+1}/30</small><h3>${esc(topics[selected].title)}</h3><button type="button" class="secondary-btn" data-action="max-speaking-open-selected">50 ta iborasini o‘rganish →</button></div>`}</div></div></section>`;
}
function maxSpeakingSpin(){
 if(maxSpeakingWheelSpinning||maxSpeakingWheel.used.length>=30||maxSpeakingWheelRemaining())return;
 const available=maxSpeakingBank.topics.map((_,i)=>i).filter(i=>!maxSpeakingWheel.used.includes(i));
 const random=new Uint32Array(1);crypto.getRandomValues(random);
 const selected=available[random[0]%available.length];
 maxSpeakingWheel.used.push(selected);maxSpeakingWheel.selected=selected;maxSpeakingWheel.lastAt=Date.now();maxSpeakingWheelSave();
 maxSpeakingWheelSpinning=true;const disc=document.getElementById('maxSpeakingWheelDisc'),button=root.querySelector('[data-action="max-speaking-spin"]');
 if(button){button.disabled=true;button.textContent='Aylanmoqda…'}
 if(disc){disc.style.transition='transform 4s cubic-bezier(.12,.78,.16,1)';requestAnimationFrame(()=>{disc.style.transform=`rotate(${1800-(selected+.5)*12}deg)`})}
 clearTimeout(maxSpeakingWheelTimer);maxSpeakingWheelTimer=setTimeout(()=>{maxSpeakingWheelSpinning=false;if(state.view==='maxspeaking'&&maxSpeakingScreen==='library')renderMaxSpeaking()},4200);
}
setInterval(()=>{if(state.view!=='maxspeaking'||maxSpeakingScreen!=='library'||maxSpeakingWheelSpinning)return;const button=root.querySelector('[data-action="max-speaking-spin"]'),status=document.getElementById('maxSpeakingWheelStatus');if(!button||!status||maxSpeakingWheel.used.length>=30)return;const ms=maxSpeakingWheelRemaining();button.disabled=!!ms;button.textContent=ms?'12 soatlik kutish':'Barabanni aylantirish';status.textContent=ms?`Keyingi aylantirish: ${maxSpeakingWheelTime(ms)} dan so‘ng.`:'Baraban tayyor. Tugmani bosing.'},30000);
function maxSpeakingEntry(id){
 const match=/^t(\d{2})e(\d{2})$/.exec(id||'');
 return match?maxSpeakingBank.topics[Number(match[1])-1]?.entries[Number(match[2])-1]:null;
}
function maxSpeakingFiltered(){
 const query=norm(maxSpeakingQuery);
 const topics=query?maxSpeakingBank.topics:[maxSpeakingBank.topics[maxSpeakingTopic]];
 return topics.flatMap(topic=>(topic?.entries||[]).filter(entry=>(maxSpeakingKind==='all'||entry.kind===maxSpeakingKind)&&(!query||norm(topic.title+' '+entry.term+' '+entry.uz).includes(query))).map(entry=>({...entry,topic:topic.title})));
}
function maxSpeakingCard(entry){
 const saved=maxSpeakingAnswers[entry.id],answers=saved?.answers||['',''];
 return `<article class="max-card"><div class="max-card-header"><div><small>${esc(entry.topic)} · ${esc(entry.kind)} · ${esc(entry.id.toUpperCase())}</small><h3 lang="en">${esc(entry.term)}</h3></div><button type="button" class="max-speak" data-action="max-speaking-speak" data-id="${esc(entry.id)}" aria-label="${esc(entry.term)} talaffuzini eshitish">🔊 Eshitish</button></div><p class="max-uz"><span>O‘zbekcha</span>${esc(entry.uz)}</p><div class="max-examples"><strong>2 ta inglizcha misol</strong><ol lang="en">${entry.examples.map(example=>`<li>${esc(example)}</li>`).join('')}</ol></div><div class="max-practice"><strong>O‘zbekcha gaplarni shu ibora bilan inglizchaga tarjima qil</strong>${entry.prompts.map((prompt,i)=>`<label for="max-answer-${entry.id}-${i}">${i+1}. ${esc(prompt)}</label><textarea id="max-answer-${entry.id}-${i}" data-max-answer="${esc(entry.id)}" data-index="${i}" rows="2" maxlength="600" placeholder="Inglizcha gapingizni yozing...">${esc(answers[i]||'')}</textarea>`).join('')}<div class="max-save-row"><button type="button" class="secondary-btn" data-action="max-speaking-save" data-id="${esc(entry.id)}">Javoblarimni saqlash</button><small id="max-saved-${entry.id}" role="status">${saved?'Saqlangan':'Hali saqlanmagan'}</small></div></div></article>`;
}
function renderMaxSpeaking(){
 const topics=maxSpeakingBank.topics;
 if(topics.length!==30){root.innerHTML=heading('MAX SPEAKING','Hujjatdagi mavzular yuklanmadi.');return}
 if(maxSpeakingScreen==='games'){root.innerHTML=maxSpeakingGamesMenu();return}
 if(maxSpeakingScreen==='play'){maxSpeakingGameRender();return}
 if(maxSpeakingScreen==='result'){root.innerHTML=heading(`${esc(maxSpeakingResult.topic)} · ${esc(maxSpeakingResult.mode)}`,'50 ta iboraning barchasini mashq qildingiz.')+`<div class="panel score-hero"><div class="trophy">✦</div><h2>${maxSpeakingResult.correct} / 50 to‘g‘ri</h2><p>Natija saqlandi. Istagan payt yana mashq qilishingiz mumkin.</p><button type="button" class="primary-btn" data-action="max-speaking-back">← 7 ta o‘yinga qaytish</button></div>`;return}
 const items=maxSpeakingFiltered(),pages=Math.max(1,Math.ceil(items.length/10));
 maxSpeakingPage=Math.max(0,Math.min(maxSpeakingPage,pages-1));
 const chunk=items.slice(maxSpeakingPage*10,(maxSpeakingPage+1)*10);
 let html=heading('MAX SPEAKING','30 mavzu · 1 500 collocation · tarjima, ikki misol va ikki tarjima mashqi','900 Speaking · 600 Writing');
 html+=maxSpeakingWheelPanel(topics);
 html+=`<div class="max-toolbar panel"><label for="maxSpeakingTopic">Mavzu<select id="maxSpeakingTopic" ${maxSpeakingQuery?'disabled':''}>${topics.map((topic,i)=>`<option value="${i}" ${i===maxSpeakingTopic?'selected':''}>${i+1}. ${esc(topic.title)}</option>`).join('')}</select></label><label for="maxSpeakingKind">Ibora turi<select id="maxSpeakingKind"><option value="Speaking" ${maxSpeakingKind==='Speaking'?'selected':''}>Speaking · 900 ta</option><option value="Writing" ${maxSpeakingKind==='Writing'?'selected':''}>Writing · 600 ta</option><option value="all" ${maxSpeakingKind==='all'?'selected':''}>Barchasi · 1 500 ta</option></select></label><label for="maxSpeakingQuery">Barcha mavzulardan qidirish<input id="maxSpeakingQuery" type="search" value="${esc(maxSpeakingQuery)}" placeholder="Inglizcha yoki o‘zbekcha ibora"></label></div>`;
 html+=`<div class="max-play-banner"><div><strong>${esc(topics[maxSpeakingTopic].title)} · 50 ta ibora</strong><span>Shu mavzudagi Speaking va Writing iboralarini 7 xil o‘yinda mashq qiling.</span></div><button type="button" class="primary-btn" data-action="max-speaking-games">7 ta o‘yinni ochish</button></div>`;
 html+=`<div id="maxSpeakingResults"><div class="max-result-heading"><strong>${maxSpeakingQuery?'Qidiruv natijalari':esc(topics[maxSpeakingTopic].title)}</strong><span>${items.length} ta ibora · ${maxSpeakingPage+1} / ${pages} sahifa</span></div>${chunk.length?`<div class="max-list">${chunk.map(maxSpeakingCard).join('')}</div>`:'<div class="empty-state"><strong>Ibora topilmadi</strong><p>Boshqa so‘z yozing yoki ibora turini almashtiring.</p></div>'}<div class="max-pagination"><button type="button" class="secondary-btn" data-action="max-speaking-prev" ${maxSpeakingPage===0?'disabled':''}>← Oldingi 10 ta</button><span>${maxSpeakingPage+1} / ${pages}</span><button type="button" class="secondary-btn" data-action="max-speaking-next" ${maxSpeakingPage>=pages-1?'disabled':''}>Keyingi 10 ta →</button></div></div>`;
 root.innerHTML=html;
}
function maxSpeakingHandleAction(action,button){
 if(maxSpeakingGameAction(action,button))return true;
 if(action==='max-speaking-spin'){maxSpeakingSpin();return true}
 if(action==='max-speaking-open-selected'){if(maxSpeakingWheel.selected!==null){maxSpeakingTopic=maxSpeakingWheel.selected;maxSpeakingQuery='';maxSpeakingKind='all';maxSpeakingPage=0;renderMaxSpeaking();document.querySelector('.max-toolbar')?.scrollIntoView({behavior:'smooth',block:'start'})}return true}
 if(action==='max-speaking-speak'){const entry=maxSpeakingEntry(button.dataset.id);if(entry)pronounce(entry.term);return true}
 if(action==='max-speaking-save'){
  const entry=maxSpeakingEntry(button.dataset.id);if(!entry)return true;
  const inputs=[...root.querySelectorAll(`textarea[data-max-answer="${entry.id}"]`)];
  const answers=inputs.sort((a,b)=>Number(a.dataset.index)-Number(b.dataset.index)).map(input=>input.value.trim().slice(0,600));
  if(answers.length!==2||!answers.some(Boolean)){toast('Avval kamida bitta gapingizni yozing.');return true}
  maxSpeakingAnswers[entry.id]={answers,savedAt:new Date().toISOString()};
  try{localStorage.setItem(storageKey('vocab-atlas-max-speaking-answers-v1'),JSON.stringify(maxSpeakingAnswers))}catch{}
  window.VocabCloud?.queue();
  const status=document.getElementById('max-saved-'+entry.id);if(status)status.textContent='Saqlangan ✓';
  toast('Ikkita mashqdagi javobingiz saqlandi.');return true;
 }
 if(action==='max-speaking-prev'||action==='max-speaking-next'){
  maxSpeakingPage+=action.endsWith('next')?1:-1;renderMaxSpeaking();scrollPageTop();return true;
 }
 return false;
}
