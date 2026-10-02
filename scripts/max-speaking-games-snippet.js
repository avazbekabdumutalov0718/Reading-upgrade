// Seven independent, resumable 50-card games for every MAX SPEAKING topic.
const maxSpeakingModes=[
 ['flash','Flashcards','Inglizcha iborani eslab, kartani aylantiring.','▣','g-purple'],
 ['mcq','Multiple choice','Ibora va tarjima orasidan to‘g‘ri javobni tanlang.','☑','g-blue'],
 ['pairs','Matching pairs','Inglizcha iborani o‘zbekcha ma’nosiga ulang.','⌘','g-green'],
 ['gap','Fill the gap','Namunadagi tushirib qoldirilgan iborani yozing.','✎','g-orange'],
 ['rush','Word Rush','60 soniyalik raundlarda tarjimani toping.','ϟ','g-red'],
 ['typing','Typing race','O‘zbekcha ma’noga qarab iborani yozing.','⌨','g-violet'],
 ['sentence','Sentence builder','Namuna gapdagi so‘zlarni tartibga soling.','▤','g-pink']
];
let maxSpeakingScreen='library',maxSpeakingGame=null,maxSpeakingTimer=null,maxSpeakingAdvanceTimer=null,maxSpeakingResult=null;
function maxSpeakingGameSanitize(value){
 const cleaned={sessions:{},best:{}};
 if(!value||typeof value!=='object')return cleaned;
 for(const topic of maxSpeakingBank.topics)for(const [mode] of maxSpeakingModes){
  const key=maxSpeakingGameKey(topic,mode),s=value.sessions?.[key],b=value.best?.[key];
  if(s&&Array.isArray(s.order)&&s.order.length===50&&new Set(s.order).size===50&&s.order.every(id=>topic.entries.some(e=>e.id===id))){
   const idx=Math.min(49,Math.max(0,Math.floor(Number(s.idx)||0)));
   const ends=Array.isArray(s.ends)&&s.ends.at(-1)===50&&s.ends.every((n,i)=>Number.isInteger(n)&&n>0&&n<=50&&(!i||n>s.ends[i-1]))?s.ends.slice(0,50):[];
   cleaned.sessions[key]={order:s.order,idx,correct:Math.min(50,Math.max(0,Math.floor(Number(s.correct)||0))),batchStart:Math.min(idx,Math.max(0,Math.floor(Number(s.batchStart)||0))),ends,matched:Array.isArray(s.matched)?s.matched.filter(id=>s.order.includes(id)).slice(0,6):[],updatedAt:Number(s.updatedAt)||0};
  }
  if(b&&Number.isFinite(Number(b.correct)))cleaned.best[key]={correct:Math.min(50,Math.max(0,Math.floor(Number(b.correct)))),completedAt:/^\d{4}-\d{2}-\d{2}$/.test(b.completedAt||'')?b.completedAt:''};
 }
 return cleaned;
}
function maxSpeakingGameKey(topic,mode){return `${topic.id}:${mode}`}
function maxSpeakingGameSave(){
 const g=maxSpeakingGame;if(!g)return;
 maxSpeakingGames.sessions[g.key]={order:g.items.map(e=>e.id),idx:g.idx,correct:g.correct,batchStart:g.batchStart,ends:g.ends,matched:[...g.matched],updatedAt:Date.now()};
 maxSpeakingGameStore();
}
function maxSpeakingGameStore(){
 try{localStorage.setItem(storageKey('vocab-atlas-max-speaking-games-v1'),JSON.stringify(maxSpeakingGames))}catch{}
 window.VocabCloud?.queue();
}
function maxSpeakingGameStop(persist=true){clearInterval(maxSpeakingTimer);clearTimeout(maxSpeakingAdvanceTimer);maxSpeakingTimer=null;maxSpeakingAdvanceTimer=null;if(persist)maxSpeakingGameSave();maxSpeakingGame=null}
function maxSpeakingGameEntries(topic){return topic.entries}
function maxSpeakingPairOrder(entries){
 const pending=shuffle(entries),items=[],ends=[];
 while(pending.length){const batch=[],seen=new Set();for(let i=0;i<pending.length&&batch.length<6;){const meaning=norm(pending[i].uz);if(seen.has(meaning)){i++;continue}seen.add(meaning);batch.push(pending.splice(i,1)[0])}items.push(...batch);ends.push(items.length)}
 return {items,ends};
}
function maxSpeakingOpenGames(){maxSpeakingScreen='games';maxSpeakingQuery='';maxSpeakingPage=0;renderMaxSpeaking();scrollPageTop()}
function maxSpeakingStart(mode){
 if(!maxSpeakingModes.some(x=>x[0]===mode))return;
 const topic=maxSpeakingBank.topics[maxSpeakingTopic],key=maxSpeakingGameKey(topic,mode),saved=maxSpeakingGames.sessions[key];
 const valid=saved&&Array.isArray(saved.order)&&saved.order.length===50&&new Set(saved.order).size===50&&saved.order.every(id=>topic.entries.some(e=>e.id===id));
 const prepared=mode==='pairs'?maxSpeakingPairOrder(maxSpeakingGameEntries(topic)):{items:shuffle(maxSpeakingGameEntries(topic)),ends:[]};
 const items=valid?saved.order.map(id=>maxSpeakingEntry(id)):prepared.items;
 const ends=mode==='pairs'&&valid&&Array.isArray(saved.ends)&&saved.ends.at(-1)===50?saved.ends:mode==='pairs'&&valid?maxSpeakingPairEnds(items):prepared.ends;
 const idx=valid?Math.min(49,Math.max(0,Number(saved.idx)||0)):0;
 maxSpeakingGame={topic,mode,key,items,ends,idx,correct:valid?Math.min(50,Math.max(0,Number(saved.correct)||0)):0,batchStart:mode==='pairs'&&valid?Math.max(0,Math.min(idx,Number(saved.batchStart)||0)):0,matched:new Set(valid&&Array.isArray(saved.matched)?saved.matched:[]),selected:null,flipped:false,choices:null,choiceId:null,answered:false,available:null,picked:null,tokenId:null,paused:false,time:60,round:Math.random()};
 maxSpeakingScreen='play';maxSpeakingGameSave();if(mode==='rush')maxSpeakingRushStart();renderMaxSpeaking();scrollPageTop();
}
function maxSpeakingPairEnds(items){const ends=[];for(let n=6;n<items.length;n+=6)ends.push(n);ends.push(items.length);return ends}
function maxSpeakingRushStart(){
 const g=maxSpeakingGame;if(!g||g.mode!=='rush')return;
 clearInterval(maxSpeakingTimer);g.time=60;g.paused=false;
 maxSpeakingTimer=setInterval(()=>{if(maxSpeakingGame!==g)return;g.time=Math.max(0,g.time-1);const el=document.getElementById('maxGameTime');if(el)el.textContent=g.time+' s';if(g.time<=0&&!g.answered){clearInterval(maxSpeakingTimer);maxSpeakingTimer=null;g.paused=true;maxSpeakingGameSave();renderMaxSpeaking()}},1000);
}
function maxSpeakingGamesMenu(){
 const topic=maxSpeakingBank.topics[maxSpeakingTopic];
 return `<div class="page-back-row"><button type="button" class="page-back" data-action="max-speaking-back">← MAX SPEAKING</button></div>`+heading(`${esc(topic.title)} · 7 ta o‘yin`,'Har bir o‘yinda shu mavzuning barcha 50 ta iborasi bor. Qolgan joyingiz saqlanadi.','50 ta collocation')+`<div class="games-grid">${maxSpeakingModes.map(([mode,title,desc,icon,cls])=>{const key=maxSpeakingGameKey(topic,mode),s=maxSpeakingGames.sessions[key],best=maxSpeakingGames.best[key];return `<button type="button" class="game-tile ${cls}" data-action="max-speaking-start" data-mode="${mode}"><span class="game-icon" aria-hidden="true">${icon}</span><strong>${title}</strong><small>${desc}</small><span class="game-count">${s?`Davom ettirish: ${Math.min(50,s.idx)} / 50`:best?`Eng yaxshi natija: ${best.correct} / 50`:'50 ta ibora'}</span></button>`}).join('')}</div>`;
}
function maxSpeakingGameChoices(entry,reverse){
 const g=maxSpeakingGame;
 if(g.choiceId!==entry.id||g.choiceReverse!==reverse){
  const seen=new Set([norm(reverse?entry.term:entry.uz)]),options=[entry];
  for(const candidate of shuffle(g.topic.entries)){const k=norm(reverse?candidate.term:candidate.uz);if(!seen.has(k)){seen.add(k);options.push(candidate)}if(options.length===4)break}
  g.choices=shuffle(options);g.choiceId=entry.id;g.choiceReverse=reverse;
 }
 return `<div class="choices">${g.choices.map((e,i)=>`<button type="button" class="choice" data-action="max-speaking-choice" data-index="${i}">${esc(reverse?e.term:e.uz)}</button>`).join('')}</div>`;
}
function maxSpeakingGameBody(){
 const g=maxSpeakingGame,e=g.items[g.idx],mode=g.mode,reverse=mode==='mcq'&&g.idx%2===1;
 if(mode==='flash')return `<div class="max-game-flash"><button type="button" class="max-game-card ${g.flipped?'is-flipped':''}" data-action="max-speaking-flip"><span>${g.flipped?'O‘ZBEKCHA MA’NOSI':'INGLIZCHA IBORA'}</span><strong>${esc(g.flipped?e.uz:e.term)}</strong>${g.flipped?`<small>${esc(e.examples[0])}</small>`:'<small>Tarjimani ko‘rish uchun kartani bosing</small>'}</button><button type="button" class="secondary-btn" data-action="max-speaking-pronounce">🔊 Talaffuz</button></div><div class="card-actions"><button type="button" class="action-btn learn" data-action="max-speaking-grade" data-value="again">↺ Yana o‘rganaman</button><button type="button" class="action-btn flip" data-action="max-speaking-flip">Aylantirish</button><button type="button" class="action-btn know" data-action="max-speaking-grade" data-value="know">Bilaman ✓</button></div>`;
 if(mode==='mcq'||mode==='rush')return `<div class="quiz-prompt">${reverse?'Qaysi inglizcha ibora mos?':'Qaysi o‘zbekcha tarjima mos?'}</div><h3 class="quiz-word">${esc(reverse?e.uz:e.term)}</h3>${maxSpeakingGameChoices(e,reverse)}<div id="maxGameFeedback" class="feedback" role="status"></div>`;
 if(mode==='pairs'){
  const start=g.batchStart,end=g.ends.find(x=>x>start)||50,batch=g.items.slice(start,end);
  if(!g.left||g.left[0]?.id!==g.leftBatchId){g.left=shuffle(batch);g.right=shuffle(batch);g.leftBatchId=g.left[0]?.id}
  const column=(items,side)=>items.map(item=>`<button type="button" class="pair ${g.matched.has(item.id)?'matched':''} ${g.selected?.side===side&&g.selected.id===item.id?'selected':''}" data-action="max-speaking-pair" data-side="${side}" data-id="${item.id}" ${g.matched.has(item.id)?'disabled':''}>${esc(side==='left'?item.term:item.uz)}</button>`).join('');
  return `<div class="quiz-prompt">Inglizcha ibora va o‘zbekcha tarjimani juftlang · ${Math.floor(start/6)+1} / ${g.ends.length} guruh</div><div class="pair-grid"><div class="pair-col">${column(g.left,'left')}</div><div class="pair-col">${column(g.right,'right')}</div></div>`;
 }
 if(mode==='gap'||mode==='typing'){
  const sample=e.examples.find(s=>norm(s).includes(norm(e.term)))||e.examples[0],re=new RegExp(e.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),masked=sample.replace(re,'_____');
  return `<div class="quiz-prompt">${mode==='gap'?'Misoldagi iborani to‘ldiring':'Tarjimaga qarab inglizcha iborani yozing'}</div><h3 class="quiz-word">${esc(mode==='gap'?masked:e.uz)}</h3>${mode==='gap'?`<p class="quiz-prompt">Ma’nosi: ${esc(e.uz)}</p>`:''}<input id="maxGameAnswer" class="game-input" type="text" autocomplete="off" spellcheck="false" aria-label="Inglizcha ibora" placeholder="Inglizcha iborani yozing"><div class="center-actions"><button type="button" class="primary-btn" data-action="max-speaking-check">Tekshirish</button><button type="button" class="secondary-btn" data-action="max-speaking-skip">O‘tkazib yuborish</button></div><div id="maxGameFeedback" class="feedback" role="status"></div>`;
 }
 if(mode==='sentence'){
  if(g.tokenId!==e.id){g.available=shuffle(e.examples[0].trim().split(/\s+/).map((text,id)=>({text,id})));g.picked=[];g.tokenId=e.id}
  return `<div class="quiz-prompt">Namuna gapdagi so‘zlarni tartibga soling</div><h3 class="quiz-word">${esc(e.uz)}</h3><div class="answer-zone">${g.picked.length?g.picked.map((x,i)=>`<button type="button" class="token" data-action="max-speaking-remove" data-index="${i}">${esc(x.text)}</button>`).join(''):'Gapni shu yerda tuzing'}</div><div class="sentence-tokens">${g.available.map((x,i)=>`<button type="button" class="token" data-action="max-speaking-add" data-index="${i}">${esc(x.text)}</button>`).join('')}</div><div class="center-actions"><button type="button" class="primary-btn" data-action="max-speaking-check">Tekshirish</button><button type="button" class="secondary-btn" data-action="max-speaking-skip">O‘tkazib yuborish</button></div><div id="maxGameFeedback" class="feedback" role="status"></div>`;
 }
 return '';
}
function maxSpeakingGameRender(){
 const g=maxSpeakingGame;if(!g)return maxSpeakingGamesMenu();
 const title=maxSpeakingModes.find(m=>m[0]===g.mode)[1];
 const bar=`<div class="max-game-top"><div><small>MAX SPEAKING · ${esc(g.topic.title)}</small><h2>${title}</h2></div><button type="button" class="secondary-btn" data-action="max-speaking-back">← O‘yinlar</button></div><div class="max-game-stats"><span>${g.correct} to‘g‘ri · ${Math.min(50,g.idx+1)} / 50</span>${g.mode==='rush'?`<strong id="maxGameTime">${g.time} s</strong>`:''}</div><div class="game-progress"><span style="width:${2*g.idx}%"></span></div>`;
 const content=g.paused?`<div class="sprint-pause"><strong>60 soniya tugadi</strong><p>${g.idx} / 50 ibora ko‘rildi.</p><button type="button" class="primary-btn" data-action="max-speaking-resume">Keyingi 60 soniya</button></div>`:maxSpeakingGameBody();
 root.innerHTML=`<section class="game-stage max-game-stage">${bar}${content}</section>`;
 if(!g.paused&&['gap','typing'].includes(g.mode))document.getElementById('maxGameAnswer')?.focus();
}
function maxSpeakingGameNext(correct,feedback,delay=850){
 const g=maxSpeakingGame;if(!g||g.answered)return;
 g.answered=true;if(correct)g.correct++;
 const f=document.getElementById('maxGameFeedback');if(f){f.textContent=feedback;f.className='feedback '+(correct?'good':'bad')}
 const round=g.round;
 maxSpeakingAdvanceTimer=setTimeout(()=>{if(maxSpeakingGame!==g||g.round!==round)return;g.idx++;g.answered=false;g.choices=null;g.choiceId=null;g.tokenId=null;g.selected=null;g.round=Math.random();if(g.idx>=50)maxSpeakingGameFinish();else{maxSpeakingGameSave();if(g.mode==='rush'&&g.time<=0){clearInterval(maxSpeakingTimer);g.paused=true}renderMaxSpeaking()}},delay);
}
function maxSpeakingGameFinish(){
 const g=maxSpeakingGame;if(!g)return;
 clearInterval(maxSpeakingTimer);clearTimeout(maxSpeakingAdvanceTimer);maxSpeakingTimer=null;maxSpeakingAdvanceTimer=null;
 const old=maxSpeakingGames.best[g.key];maxSpeakingGames.best[g.key]={correct:Math.max(old?.correct||0,g.correct),completedAt:today()};delete maxSpeakingGames.sessions[g.key];maxSpeakingGameStore();
 maxSpeakingResult={topic:g.topic.title,mode:maxSpeakingModes.find(m=>m[0]===g.mode)[1],correct:g.correct};maxSpeakingGame=null;maxSpeakingScreen='result';renderMaxSpeaking();scrollPageTop();
}
function maxSpeakingGameAction(action,button){
 const g=maxSpeakingGame;
 if(action==='max-speaking-games'){maxSpeakingOpenGames();return true}
 if(action==='max-speaking-start'){maxSpeakingStart(button.dataset.mode);return true}
 if(action==='max-speaking-back'){if(g){maxSpeakingGameStop();maxSpeakingScreen='games'}else maxSpeakingScreen=maxSpeakingScreen==='result'?'games':'library';renderMaxSpeaking();scrollPageTop();return true}
 if(!g)return false;
 const e=g.items[g.idx];
 if(action==='max-speaking-pronounce'){pronounce(e.term);return true}
 if(action==='max-speaking-resume'){maxSpeakingRushStart();renderMaxSpeaking();return true}
 if(g.paused||g.answered)return true;
 if(action==='max-speaking-flip'){g.flipped=!g.flipped;renderMaxSpeaking();return true}
 if(action==='max-speaking-grade'){g.correct+=button.dataset.value==='know'?1:0;g.idx++;if(g.idx>=50)maxSpeakingGameFinish();else{maxSpeakingGameSave();renderMaxSpeaking()}return true}
 if(action==='max-speaking-choice'){
  const choice=g.choices[Number(button.dataset.index)],right=choice?.id===e.id;
  document.querySelectorAll('.max-game-stage .choice').forEach((node,i)=>{node.disabled=true;if(g.choices[i].id===e.id)node.classList.add('right');else if(i===Number(button.dataset.index))node.classList.add('wrong')});
  maxSpeakingGameNext(right,right?'To‘g‘ri!':`To‘g‘ri javob: ${g.choiceReverse?e.term:e.uz}`,1100);return true;
 }
 if(action==='max-speaking-pair'){
  const id=button.dataset.id,side=button.dataset.side;if(g.matched.has(id))return true;
  if(!g.selected||g.selected.side===side){g.selected={id,side};renderMaxSpeaking();return true}
  if(g.selected.id===id){g.matched.add(id);g.correct++;g.idx++;g.selected=null;const end=g.ends.find(x=>x>g.batchStart)||50;if(g.idx>=end){g.batchStart=end;g.matched.clear();g.left=null;g.right=null;g.leftBatchId=null}if(g.idx>=50)maxSpeakingGameFinish();else{maxSpeakingGameSave();renderMaxSpeaking()}}
  else{g.selected=null;toast('Bu juftlik mos kelmadi.');renderMaxSpeaking()}return true;
 }
 if(action==='max-speaking-add'||action==='max-speaking-remove'){const index=Number(button.dataset.index);if(action==='max-speaking-add'&&g.available[index])g.picked.push(g.available.splice(index,1)[0]);if(action==='max-speaking-remove'&&g.picked[index])g.available.push(g.picked.splice(index,1)[0]);renderMaxSpeaking();return true}
 if(action==='max-speaking-check'){
  if(g.mode==='sentence'){if(!g.picked.length){toast('Avval gapni tuzing.');return true}const right=g.picked.map(x=>x.id).every((id,i)=>id===i)&&g.picked.length===e.examples[0].trim().split(/\s+/).length;maxSpeakingGameNext(right,right?'To‘g‘ri!':`Model gap: ${e.examples[0]}`,1600);return true}
  const value=document.getElementById('maxGameAnswer')?.value.trim();if(!value){toast('Avval iborani yozing.');return true}maxSpeakingGameNext(norm(value)===norm(e.term),norm(value)===norm(e.term)?'To‘g‘ri!':`To‘g‘ri javob: ${e.term}`,1200);return true;
 }
 if(action==='max-speaking-skip'){maxSpeakingGameNext(false,`To‘g‘ri javob: ${g.mode==='sentence'?e.examples[0]:e.term}`,1300);return true}
 return false;
}
