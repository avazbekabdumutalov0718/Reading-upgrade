// Grammar laboratory: short patterns and newly authored examples.
const grammarModes=[
 ['flash','Flashcards','Qolipni oching, misol bilan mustahkamlang.','▣','g-purple'],
 ['meaning','Ma’noni tanlang','Strukturaga mos o‘zbekcha ma’noni toping.','☑','g-blue'],
 ['pairs','Juftliklarni toping','Qolipni aynan unga mos gap bilan bog‘lang.','⌘','g-green'],
 ['gap','Bo‘shliqni to‘ldiring','Namunadagi yetishmayotgan bo‘lakni yozing.','✎','g-orange'],
 ['sentence','Gapni tuzing','Bo‘laklarni tartiblash orqali gap yarating.','▤','g-pink'],
 ['detect','Structure Hunt','Qolip ishlatilgan gapni toping.','◎','g-violet'],
 ['rush','45 soniya','Tezkor raundlarda barcha strukturalarni aylaning.','ϟ','g-red']
];
function grammarSave(){try{localStorage.setItem(storageKey('vocab-atlas-grammar-progress-v1'),JSON.stringify(grammarProgress));localStorage.setItem(storageKey('vocab-atlas-grammar-sessions-v1'),JSON.stringify(grammarSessions));localStorage.setItem(storageKey('vocab-atlas-grammar-mistakes-v1'),JSON.stringify(grammarMistakes))}catch{}window.VocabCloud?.queue()}
function grammarAddMistake(id){const old=grammarMistakes[id]||{count:0,correct:0};grammarMistakes[id]={count:(old.count||0)+1,correct:0,last:today()};grammarSave();updateNav()}
function grammarResolveMistake(id){const item=grammarMistakes[id];if(!item)return;item.correct=(item.correct||0)+1;if(item.correct>=2)delete grammarMistakes[id];grammarSave();updateNav()}
function grammarLoad(){
 if(grammarBank||grammarLoading)return;
 grammarLoading=true;
 fetch('grammar-content.json').then(r=>{if(!r.ok)throw Error('Grammar yuklanmadi');return r.json()}).then(data=>{
  if(!Array.isArray(data.entries)||data.entries.length<100||!Array.isArray(data.sources))throw Error('Grammar formati noto‘g‘ri');
  grammarBank=data;grammarLoading=false;if(state.view==='grammar'||state.view==='grammargames'||state.view==='mistakes'&&state.mistakeTab==='grammar')render();
 }).catch(()=>{grammarLoading=false;if(['grammar','grammargames'].includes(state.view)||state.view==='mistakes'&&state.mistakeTab==='grammar')root.innerHTML=heading('Grammar structures','Ma’lumotlarni yuklab bo‘lmadi.')+'<button type="button" class="secondary-btn" data-action="grammar-retry">Qayta urinish</button>'});
}
function grammarPool(source=state.grammarSource){
 if(!grammarBank)return [];
 return grammarBank.entries.filter(e=>source==='all'||(source==='correction'?e.correction:e.sources.includes(source)));
}
function grammarSourceOptions(){
 if(!grammarBank)return '';
 const options=[['all','Barcha strukturalar'],...grammarBank.sources.map(s=>[s.id,s.name]),['correction','25 common mistakes']];
 return options.map(([id,name])=>'<option value="'+esc(id)+'" '+(state.grammarSource===id?'selected':'')+'>'+esc(name)+'</option>').join('');
}
function grammarSelected(){return grammarBank?.entries.find(e=>e.id===state.grammarFocus)||grammarBank?.entries[0]}
function grammarSourceChips(e){return e.sources.map(id=>'<span class="grammar-source">'+esc(grammarBank.sources.find(s=>s.id===id)?.name||id)+'</span>').join('')}
function renderGrammarLibrary(){
 if(!grammarBank){root.innerHTML=heading('Grammar structures','Strukturalar yuklanmoqda…')+'<div class="loading"><span class="spinner"></span> Yuklanmoqda…</div>';grammarLoad();return}
 const pool=grammarPool(),q=norm(state.grammarQuery),list=pool.filter(e=>!q||norm(e.pattern+' '+e.meaning+' '+e.example).includes(q));
 if(list.length&&!list.some(e=>e.id===state.grammarFocus)){state.grammarFocus=list[0].id;state.grammarFlipped=false}
 const pages=Math.max(1,Math.ceil(list.length/18));state.grammarPage=Math.max(0,Math.min(pages-1,state.grammarPage));
 const page=list.slice(state.grammarPage*18,state.grammarPage*18+18),e=list.find(x=>x.id===state.grammarFocus),known=grammarBank.entries.filter(x=>grammarProgress[x.id]?.known).length,idx=e?list.indexOf(e):-1;
 let html=heading('Grammar structures','4 ta grammatik fayldagi qoliplar, o‘zbekcha izohlar va yangi IELTS misollari.',grammarBank.entries.length+' ta noyob karta');
 html+='<div class="page-back-row"><button type="button" class="page-back" data-action="back-one">← Ortga</button><span class="speaking-count">'+known+' / '+grammarBank.entries.length+' ta o‘rganilgan</span></div>';
 html+='<div class="grammar-toolbar"><label for="grammarSource">Manba</label><select id="grammarSource">'+grammarSourceOptions()+'</select><label for="grammarSearch">Qidirish</label><input id="grammarSearch" type="search" autocomplete="off" value="'+esc(state.grammarQuery)+'" placeholder="Qolip, ma’no yoki misol..."><button type="button" class="primary-btn" data-action="grammar-games">7 ta o‘yin →</button></div>';
 html+='<div class="grammar-layout"><section class="panel grammar-index"><div class="section-heading"><h2>Strukturalar</h2><small>'+list.length+' ta</small></div><div class="grammar-list">'+(page.length?page.map((x,i)=>'<button type="button" class="grammar-list-item '+(x.id===e?.id?'active':'')+'" data-action="grammar-select" data-id="'+esc(x.id)+'"><small>'+(state.grammarPage*18+i+1)+' · '+(x.correction?'Xatoni tuzatish':'Grammar')+'</small><strong>'+esc(x.pattern)+'</strong></button>').join(''):'<p class="note">Qidiruv natijasi topilmadi.</p>')+'</div><div class="pager"><button type="button" data-action="grammar-page-prev" '+(state.grammarPage===0?'disabled':'')+'>←</button><span>'+(state.grammarPage+1)+' / '+pages+'</span><button type="button" data-action="grammar-page-next" '+(state.grammarPage===pages-1?'disabled':'')+'>→</button></div></section>';
 if(e){
  html+='<section class="panel grammar-detail"><div class="grammar-chips">'+grammarSourceChips(e)+'</div><div class="grammar-card"><div class="grammar-card-label">STRUCTURE '+(idx+1)+' / '+list.length+'</div><h2>'+esc(e.pattern)+'</h2>';
  if(state.grammarFlipped)html+='<div class="grammar-answer"><span>O‘ZBEKCHA MA’NO</span><p>'+esc(e.meaning)+'</p><span>YANGI MISOL</span><blockquote>'+esc(e.example)+'</blockquote><button type="button" class="speaking-card-audio" data-action="grammar-speak">🔊 Misolni eshitish</button></div>';
  else html+='<p class="grammar-card-hint">Qolip qaysi vaziyatda ishlatilishini o‘ylang, so‘ng kartani aylantiring.</p>';
  html+='<button type="button" class="speaking-sample-toggle" data-action="grammar-flip">'+(state.grammarFlipped?'Qolipga qaytish ↑':'Ma’no va misolni ochish ↓')+'</button></div>';
  if(e.id==='nominalisation')html+='<div class="grammar-forms"><h3>Nominalisation: 28 ta so‘z shakli</h3><div>'+grammarBank.nominalForms.map(([from,to])=>'<span><b>'+esc(from)+'</b> → '+esc(to)+'</span>').join('')+'</div><small>Manbadagi “advanced → advancement” juftligi “advance → advancement” tarzida tuzatildi.</small></div>';
  html+='<div class="grammar-actions"><button type="button" class="secondary-btn" data-action="grammar-prev" '+(idx===0?'disabled':'')+'>← Oldingi</button><button type="button" class="secondary-btn '+(grammarProgress[e.id]?.known?'grammar-known':'')+'" data-action="grammar-mark" data-status="'+(grammarProgress[e.id]?.known?'learning':'known')+'">'+(grammarProgress[e.id]?.known?'✓ O‘rganilgan':'✓ Yodladim')+'</button><button type="button" class="secondary-btn" data-action="grammar-next" '+(idx===list.length-1?'disabled':'')+'>Keyingi →</button></div><p class="note">Misollar mashq uchun qayta yozilgan. Qolipni o‘z javobingizda ham ishlatib ko‘ring.</p></section>';
 }else html+='<section class="panel grammar-detail"><p class="note">Boshqa so‘z yoki manbani sinab ko‘ring.</p></section>';
 root.innerHTML=html+'</div>';
}
function grammarSelectRelative(delta){
 const q=norm(state.grammarQuery),list=grammarPool().filter(e=>!q||norm(e.pattern+' '+e.meaning+' '+e.example).includes(q));
 const n=list.findIndex(e=>e.id===state.grammarFocus)+delta;
 if(n>=0&&n<list.length){state.grammarFocus=list[n].id;state.grammarPage=Math.floor(n/18);state.grammarFlipped=false;renderGrammarLibrary()}
}
function grammarSessionKey(mode,source=state.grammarSource){return mode+'|'+source}
function grammarCurrent(){return state.grammarGame?.items[state.grammarGame.idx]}
function grammarSaveSession(){
 const g=state.grammarGame;if(!g)return;
 grammarSessions[g.key]={order:g.items.map(e=>e.id),idx:g.idx,correct:g.correct,matched:[...g.matched]};
 grammarSave();
}
function renderGrammarGames(){
 if(!grammarBank){root.innerHTML=heading('Grammar o‘yinlari','Ma’lumotlar yuklanmoqda…')+'<div class="loading"><span class="spinner"></span> Yuklanmoqda…</div>';grammarLoad();return}
 if(state.grammarGame){renderGrammarGame();return}
 if(state.grammarResult){
  const r=state.grammarResult;
  root.innerHTML=heading('Grammar raundi tugadi','O‘rganish davom etadi.')+'<section class="panel score-hero"><div class="trophy">✧</div><h2>'+r.correct+' / '+r.total+'</h2><p>'+esc(r.title)+' · '+r.total+' ta struktura</p><div class="center-actions"><button type="button" class="primary-btn" data-action="grammar-result-back">← O‘yinlar</button><button type="button" class="secondary-btn" data-action="grammar-result-learn">Kartalarni ko‘rish</button></div></section>';return
 }
 const pool=grammarPool();
 let html='<div class="page-back-row"><button type="button" class="page-back" data-action="back-one">← Ortga</button><button type="button" class="page-close" data-action="back-one">✕ Chiqish</button></div>';
 html+=heading('Grammar o‘yinlari','Har bir o‘yin tanlangan manbadagi barcha '+pool.length+' ta struktura bo‘ylab yuradi; jarayon saqlanadi.','7 xil o‘yin');
 html+='<div class="games-toolbar"><label for="grammarGameScope">Qaysi strukturalar?</label><select id="grammarGameScope">'+grammarSourceOptions()+'</select><span>Juftliklar 6 tadan, tezkor o‘yin 45 soniyalik raundlarda davom etadi.</span></div><div class="games-grid">';
 html+=grammarModes.map(m=>{const s=grammarSessions[grammarSessionKey(m[0])];return '<button type="button" class="game-tile '+m[4]+'" data-action="grammar-start" data-mode="'+m[0]+'"><span class="game-icon" aria-hidden="true">'+m[3]+'</span><strong>'+m[1]+'</strong><small>'+m[2]+'</small><span class="game-count">'+(s?'Davom ettirish: '+s.idx+' / '+s.order.length:pool.length+' ta struktura')+'</span></button>'}).join('')+'</div>';
 root.innerHTML=html;
}
function grammarStart(mode){
 if(!grammarModes.some(m=>m[0]===mode))return;
 const pool=grammarPool();if(!pool.length){toast('Bu manbada struktura topilmadi.');return}
 const key=grammarSessionKey(mode),saved=grammarSessions[key],valid=saved&&saved.order.length===pool.length&&saved.order.every(id=>pool.some(e=>e.id===id));
 const items=valid?saved.order.map(id=>grammarBank.entries.find(e=>e.id===id)):shuffle(pool);
 pushPage('grammargame');
 state.grammarResult=null;state.grammarGame={mode,key,items,idx:valid?Math.min(saved.idx,items.length-1):0,correct:valid?saved.correct:0,matched:new Set(valid?saved.matched:[]),selected:null,options:null,answered:false,feedback:'',flipped:false,tokenIndex:-1,tokens:[],picked:[],batchStart:-1,timeLeft:45,paused:false};
 grammarSaveSession();if(mode==='rush')grammarStartTimer();renderGrammarGame();
}
function grammarStartTimer(){
 clearInterval(state.grammarTimer);
 const g=state.grammarGame;if(!g||g.mode!=='rush')return;
 g.paused=false;g.timeLeft=45;const end=Date.now()+45000;
 state.grammarTimer=setInterval(()=>{if(state.grammarGame!==g){clearInterval(state.grammarTimer);return}g.timeLeft=Math.max(0,Math.ceil((end-Date.now())/1000));const el=$('#grammarClock');if(el)el.textContent=g.timeLeft+' s';if(!g.timeLeft){clearInterval(state.grammarTimer);state.grammarTimer=null;g.paused=true;grammarSaveSession();renderGrammarGame()}},250);
}
function grammarOptions(g){
 if(g.options)return g.options;
 const answer=grammarCurrent(),others=pick(g.items.filter(x=>x.id!==answer.id),3);
 g.options=shuffle([answer,...others]);return g.options;
}
function grammarGameBar(g){return '<div class="game-top"><button type="button" class="secondary-btn" data-action="grammar-exit">← O‘yinlarga qaytish</button><strong>'+esc(grammarModes.find(m=>m[0]===g.mode)?.[1]||'Mashq')+'</strong><small>'+(g.idx+1)+' / '+g.items.length+'</small></div><div class="game-progress"><span style="width:'+(100*g.idx/g.items.length)+'%"></span></div>'}
function grammarAnswerPanel(g){return g.answered?'<div class="grammar-feedback '+(g.lastCorrect?'good':'bad')+'">'+(g.lastCorrect?'To‘g‘ri!':'To‘g‘ri javob: '+esc(g.feedback))+'</div><div class="center-actions"><button type="button" class="primary-btn" data-action="grammar-advance">Keyingi →</button></div>':''}
function renderGrammarGame(){
 const g=state.grammarGame;if(!g)return;
 const e=grammarCurrent(),mode=g.mode;
 if(mode==='rush'&&g.paused){root.innerHTML=heading('45 soniya','Qolgan kartalar keyingi raundda davom etadi.')+'<section class="game-stage">'+grammarGameBar(g)+'<div class="score-hero"><h2>'+g.idx+' / '+g.items.length+'</h2><p>Shu joyingiz saqlandi.</p><button type="button" class="primary-btn" data-action="grammar-resume">Keyingi 45 soniya →</button></div></section>';return}
 let html=heading('Grammar o‘yini','Har bir struktura shu o‘yinda bir marta ko‘rinadi.')+'<section class="game-stage grammar-game">'+grammarGameBar(g);
 if(mode==='flash'){
  html+='<button type="button" class="grammar-game-flash '+(g.flipped?'revealed':'')+'" data-action="grammar-game-flip"><small>FLASHCARD · '+(g.idx+1)+' / '+g.items.length+'</small><strong>'+esc(g.flipped?e.meaning:e.pattern)+'</strong><span>'+esc(g.flipped?e.example:'Ma’no va misolni ochish uchun bosing')+'</span></button><div class="center-actions"><button type="button" class="secondary-btn" data-action="grammar-grade" data-status="learning">Yana mashq qilaman</button><button type="button" class="primary-btn" data-action="grammar-grade" data-status="known">Yodladim ✓</button></div>';
 }else if(mode==='pairs'){
  const start=Math.floor(g.idx/6)*6,batch=g.items.slice(start,start+6);
  if(g.batchStart!==start){g.batchStart=start;g.left=shuffle(batch);g.right=shuffle(batch);g.selected=null}
  html+='<p class="quiz-prompt">Qolipni unga mos yangi misol bilan juftlang · '+(start+1)+'–'+(start+batch.length)+'</p><div class="pair-grid"><div class="pair-col">'+g.left.map(x=>'<button type="button" class="pair '+(g.matched.has(x.id)?'matched':'')+' '+(g.selected?.id===x.id&&g.selected.side==='left'?'selected':'')+'" '+(g.matched.has(x.id)?'disabled':'')+' data-action="grammar-pair" data-side="left" data-id="'+esc(x.id)+'">'+esc(x.pattern)+'</button>').join('')+'</div><div class="pair-col">'+g.right.map(x=>'<button type="button" class="pair '+(g.matched.has(x.id)?'matched':'')+' '+(g.selected?.id===x.id&&g.selected.side==='right'?'selected':'')+'" '+(g.matched.has(x.id)?'disabled':'')+' data-action="grammar-pair" data-side="right" data-id="'+esc(x.id)+'">'+esc(x.example)+'</button>').join('')+'</div></div>';
 }else if(mode==='gap'){
  html+='<p class="quiz-prompt">Yetishmayotgan bo‘lakni yozing · '+esc(e.pattern)+'</p><h2 class="quiz-word">'+esc(e.gap)+'</h2><p class="grammar-meaning-hint">'+esc(e.meaning)+'</p><input id="grammarGameInput" class="game-input" type="text" autocomplete="off" spellcheck="false" placeholder="Inglizcha bo‘lak" aria-label="Yetishmayotgan bo‘lak" '+(g.answered?'disabled':'')+'><div class="center-actions">'+(g.answered?'':'<button type="button" class="primary-btn" data-action="grammar-check-gap">Tekshirish</button>')+'</div>'+grammarAnswerPanel(g);
 }else if(mode==='sentence'){
  if(g.tokenIndex!==g.idx){g.tokenIndex=g.idx;g.tokens=shuffle(e.example.trim().split(/\s+/).map((word,i)=>({word,i})));g.picked=[]}
  html+='<p class="quiz-prompt">Qolip: '+esc(e.pattern)+'</p><p class="grammar-meaning-hint">'+esc(e.meaning)+'</p><div class="answer-zone">'+(g.picked.length?g.picked.map((x,i)=>'<button type="button" class="token" data-action="grammar-untoken" data-index="'+i+'">'+esc(x.word)+'</button>').join(''):'So‘zlarni tanlab gapni tuzing')+'</div><div class="sentence-tokens">'+g.tokens.map((x,i)=>'<button type="button" class="token" data-action="grammar-token" data-index="'+i+'">'+esc(x.word)+'</button>').join('')+'</div><div class="center-actions">'+(g.answered?'':'<button type="button" class="primary-btn" data-action="grammar-check-sentence">Tekshirish</button>')+'</div>'+grammarAnswerPanel(g);
 }else{
  const options=grammarOptions(g),prompt=mode==='meaning'?e.pattern:mode==='detect'?e.pattern:e.meaning,lead=mode==='meaning'?'Ma’nosini tanlang':mode==='detect'?'Shu qolip ishlatilgan gapni toping':'45 soniya · mos strukturani toping';
  html+='<p class="quiz-prompt">'+lead+'</p><h2 class="quiz-word">'+esc(prompt)+'</h2>'+(mode==='rush'?'<div class="grammar-clock">⏱ <strong id="grammarClock">'+g.timeLeft+' s</strong></div>':'')+'<div class="choices">'+options.map(x=>'<button type="button" class="choice '+(g.answered?(x.id===e.id?'right':x.id===g.chosen?'wrong':''):'')+'" data-action="grammar-choice" data-id="'+esc(x.id)+'" '+(g.answered?'disabled':'')+'>'+esc(mode==='meaning'?x.meaning:mode==='detect'?x.example:x.pattern)+'</button>').join('')+'</div>'+grammarAnswerPanel(g);
 }
 root.innerHTML=html+'</section>';
}
function grammarGrade(correct,feedback=''){
 const g=state.grammarGame;if(!g||g.answered)return;
 g.answered=true;g.lastCorrect=correct;g.feedback=feedback;g.correct+=correct?1:0;
 if(correct){grammarProgress[grammarCurrent().id]={known:true,date:today()};recordActivity();grammarResolveMistake(grammarCurrent().id)}
 else{grammarAddMistake(grammarCurrent().id);if(g.mode==='flash')grammarProgress[grammarCurrent().id]={known:false,date:today()}}
 grammarSave();grammarSaveSession();
 if(g.mode==='flash'){grammarAdvance();return}
 if(g.mode==='rush'){if(!correct)toast('Javob: '+feedback);grammarAdvance();return}
 renderGrammarGame();
}
function grammarAdvance(){
 const g=state.grammarGame;if(!g)return;
 g.idx++;g.options=null;g.answered=false;g.feedback='';g.flipped=false;g.chosen=null;
 if(g.idx>=g.items.length){grammarFinish();return}
 grammarSaveSession();renderGrammarGame();
}
function grammarFinish(){
 const g=state.grammarGame;if(!g)return;
 clearInterval(state.grammarTimer);state.grammarTimer=null;
 delete grammarSessions[g.key];grammarSave();
 state.grammarResult={correct:g.correct,total:g.items.length,title:grammarModes.find(m=>m[0]===g.mode)?.[1]||'O‘yin'};
 state.grammarGame=null;renderGrammarGames();
}
function grammarExit(){
 if(state.grammarGame)grammarSaveSession();
 clearInterval(state.grammarTimer);state.grammarTimer=null;
 state.grammarGame=null;state.grammarResult=null;backSteps(1);
}
function grammarHandleAction(a,b){
 const g=state.grammarGame;
 if(a==='grammar-retry'){grammarLoad();return true}
 if(a==='grammar-games'){view('grammargames');return true}
 if(a==='grammar-select'){
  if(grammarBank?.entries.some(x=>x.id===b.dataset.id)&&state.grammarFocus!==b.dataset.id){pushPage('grammar');state.grammarFocus=b.dataset.id;state.grammarFlipped=false;renderGrammarLibrary()}return true
 }
 if(a==='grammar-page-prev'||a==='grammar-page-next'){state.grammarPage+=a==='grammar-page-next'?1:-1;renderGrammarLibrary();return true}
 if(a==='grammar-flip'){state.grammarFlipped=!state.grammarFlipped;renderGrammarLibrary();return true}
 if(a==='grammar-mark'){
  const id=state.grammarFocus;
  if(grammarBank?.entries.some(x=>x.id===id)){grammarProgress[id]={known:b.dataset.status==='known',date:today()};grammarSave();recordActivity();renderGrammarLibrary()}return true
 }
 if(a==='grammar-prev'||a==='grammar-next'){grammarSelectRelative(a==='grammar-prev'?-1:1);return true}
 if(a==='grammar-speak'){const e=grammarSelected();if(e)pronounce(e.example);return true}
 if(a==='grammar-start'){grammarStart(b.dataset.mode);return true}
 if(a==='grammar-exit'){grammarExit();return true}
 if(a==='grammar-result-back'){state.grammarResult=null;backSteps(1);return true}
 if(a==='grammar-result-learn'){state.grammarResult=null;view('grammar');return true}
 if(a==='grammar-resume'){grammarStartTimer();renderGrammarGame();return true}
 if(!g)return false;
 if(a==='grammar-game-flip'){g.flipped=!g.flipped;renderGrammarGame();return true}
 if(a==='grammar-grade'){grammarGrade(b.dataset.status==='known');return true}
 if(a==='grammar-advance'){grammarAdvance();return true}
 if(a==='grammar-choice'){
  if(g.answered||g.paused)return true;
  const id=b.dataset.id,e=grammarCurrent();
  if(!g.options?.some(x=>x.id===id))return true;
  g.chosen=id;
  grammarGrade(id===e.id,g.mode==='meaning'?e.meaning:g.mode==='detect'?e.example:e.pattern);
  return true
 }
 if(a==='grammar-pair'){
  const id=b.dataset.id,side=b.dataset.side;
  if(g.mode!=='pairs'||g.matched.has(id)||!['left','right'].includes(side)||![...g.left,...g.right].some(x=>x.id===id))return true;
  if(!g.selected||g.selected.side===side){g.selected={id,side};renderGrammarGame();return true}
  if(g.selected.id===id){g.matched.add(id);g.correct++;g.idx++;grammarProgress[id]={known:true,date:today()};recordActivity();grammarResolveMistake(id);g.selected=null;if(g.idx>=g.items.length)grammarFinish();else{grammarSaveSession();renderGrammarGame()}}
  else{grammarAddMistake(g.selected.id);grammarAddMistake(id);g.selected=null;toast('Bu juftlik mos kelmadi.');renderGrammarGame()}
  return true
 }
 if(a==='grammar-check-gap'){
  if(g.mode!=='gap'||g.answered)return true;
  const value=$('#grammarGameInput')?.value.trim()||'';if(!value){toast('Avval bo‘shliqni to‘ldiring.');return true}
  grammarGrade(norm(value)===norm(grammarCurrent().chunk),grammarCurrent().chunk);return true
 }
 if(a==='grammar-token'||a==='grammar-untoken'){
  if(g.mode!=='sentence'||g.answered)return true;
  const from=a==='grammar-token'?g.tokens:g.picked,to=a==='grammar-token'?g.picked:g.tokens,n=Number(b.dataset.index);
  if(n>=0&&n<from.length){to.push(from.splice(n,1)[0]);renderGrammarGame()}return true
 }
 if(a==='grammar-check-sentence'){
  if(g.mode!=='sentence'||g.answered)return true;
  if(!g.picked.length){toast('Avval gapni tuzing.');return true}
  grammarGrade(norm(g.picked.map(x=>x.word).join(' '))===norm(grammarCurrent().example),grammarCurrent().example);return true
 }
 return false
}
