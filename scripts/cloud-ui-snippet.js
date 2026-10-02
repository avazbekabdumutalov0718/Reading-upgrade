// Account state is mirrored locally per user; Supabase is the saved source of truth.
function cloudSnapshot(legacy=false){
 const draftKey=legacy?'vocab-atlas-mock-draft-v1':storageKey('vocab-atlas-mock-draft-v1');
 let mockDraft=null;
 try{mockDraft=JSON.parse(localStorage.getItem(draftKey))}catch{}
 return {version:1,progress,scores,sessions,mistakes,favorites,customPacks,activity,speakingHistory,grammarProgress,grammarSessions,grammarMistakes,mockDraft,mockReview:{finished:!!state.mockFeedback,result:state.mockLocalResult}};
}
function cloudHasData(d){
 return !!(Object.keys(d.progress||{}).length||Object.keys(d.sessions||{}).length||Object.keys(d.grammarProgress||{}).length||Object.keys(d.grammarSessions||{}).length||Object.keys(d.grammarMistakes||{}).length||Object.keys(d.mistakes||{}).length||Object.keys(d.activity||{}).length||d.scores?.games||d.speakingHistory?.length||d.favorites?.length||d.customPacks?.length||d.mockDraft?.answers?.some(a=>typeof a==='string'?a:a?.text||a?.audioPath));
}
function cloudApply(data){
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 progress=object(data?.progress);scores=Object.keys(object(data?.scores)).length?data.scores:{points:0,games:0,best:{},day:today(),todayPoints:0};
 sessions=object(data?.sessions);mistakes=object(data?.mistakes);favorites=Array.isArray(data?.favorites)?data.favorites:[];
 customPacks=Array.isArray(data?.customPacks)?data.customPacks:[];activity=object(data?.activity);
 speakingHistory=Array.isArray(data?.speakingHistory)?data.speakingHistory:[];
 grammarProgress=object(data?.grammarProgress);grammarSessions=object(data?.grammarSessions);grammarMistakes=object(data?.grammarMistakes);
 const cache={
  'vocab-atlas-progress-v1':progress,'vocab-atlas-scores-v1':scores,'vocab-atlas-sessions-v2':sessions,
  'vocab-atlas-mistakes-v1':mistakes,'vocab-atlas-favorites-v1':favorites,'vocab-atlas-custom-packs-v1':customPacks,
  'vocab-atlas-activity-v1':activity,'vocab-atlas-speaking-v1':speakingHistory,
  'vocab-atlas-grammar-progress-v1':grammarProgress,'vocab-atlas-grammar-sessions-v1':grammarSessions,'vocab-atlas-grammar-mistakes-v1':grammarMistakes,
 };
 try{
  for(const [key,value] of Object.entries(cache))localStorage.setItem(storageKey(key),JSON.stringify(value));
  const draftKey=storageKey('vocab-atlas-mock-draft-v1');
  if(data?.mockDraft)localStorage.setItem(draftKey,JSON.stringify(data.mockDraft));else localStorage.removeItem(draftKey);
 }catch{}
 state.mockSession=null;state.mockFeedback=data?.mockDraft&&data?.mockReview?.finished?{local:true}:null;state.mockLocalResult=data?.mockReview?.result||null;
}
