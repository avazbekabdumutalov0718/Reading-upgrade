"""Build the 30-day Reading Booster from ten distinct supplied full mocks."""
import ast
import base64
from collections import Counter
from html import escape, unescape
import json
from pathlib import Path
import random
import re
import subprocess
from zipfile import ZipFile

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'content/reading-booster-source.zip'
APP = ROOT / 'dist/app.js'
HEAVY = ['FULL READING (3).html', 'FULL READING TEST.html', 'FULL READING TEST (2).html', 'FULL READING TEST (3).html', 'FULL READING TEST (4).html']
MOCK = ['Reading Mock Test.html', 'Reading Mock Test (3).html', 'Reading Mock Test (4).html']
SIMPLE = ['FULL READING (12).html', 'FULL READING (13).html']
ALLOWED = {'div','p','h2','h3','h4','h5','span','strong','b','em','i','u','ul','ol','li','br','blockquote','small','sup','sub','table','thead','tbody','tr','th','td','label','input','select','option','img','hr'}


def literal(source, name):
    match = re.search(r'\bconst\s+' + re.escape(name) + r'\s*=\s*', source)
    if not match or source[match.end()] not in '{[':
        raise ValueError(f'Missing literal {name}')
    first = match.end(); stack = []; quote = None; slash = False
    for pos in range(first, len(source)):
        char = source[pos]
        if quote:
            if slash: slash = False
            elif char == '\\': slash = True
            elif char == quote: quote = None
            continue
        if char in '\"\'`': quote = char; continue
        if char in '{[': stack.append(char)
        elif char in '}]':
            if not stack or {'{':'}','[':']'}[stack.pop()] != char: raise ValueError(f'Unbalanced {name}')
            if not stack:
                raw = source[first:pos+1]
                try: return json.loads(raw)
                except json.JSONDecodeError: return ast.literal_eval(raw)
    raise ValueError(f'Unterminated {name}')


def sanitized(raw, questions=False):
    wrapper = html.fragment_fromstring('<div>' + raw + '</div>')
    for node in list(wrapper.iter()):
        if node.tag in ('script','style','iframe','svg'):
            node.drop_tree(); continue
        if node.tag not in ALLOWED:
            if node is not wrapper: node.drop_tag()
            continue
        for attr in list(node.attrib):
            value = node.get(attr)
            permitted = attr in ({'class','id','name','type','value','placeholder','for','colspan','rowspan','data-q','data-rb-q','data-rb-group'} if questions else {'class','alt','src'})
            if not permitted or attr == 'src' and not re.fullmatch(r'data:image/(?:jpeg|png);base64,[A-Za-z0-9+/=]{1,120000}',value or ''):
                del node.attrib[attr]
        if questions:
            q = re.fullmatch(r'q(\d{1,2})',node.get('name','') or node.get('id',''))
            if not q and node.get('data-q','').isdigit(): q = re.fullmatch(r'(\d{1,2})',node.get('data-q'))
            if q and node.tag in ('input','select'): node.set('data-rb-q',q.group(1))
            group = re.fullmatch(r'q(\d{1,2})-(\d{1,2})',node.get('name',''))
            if group and node.tag == 'input':node.set('data-rb-group',group.group(1)+'-'+group.group(2))
    return escape(wrapper.text or '',quote=False)+''.join(html.tostring(child,encoding='unicode',method='html') for child in wrapper)


def passage_record(title, body, questions_html, answers, unordered=None, source=''):
    clean = sanitized(body)
    tree = html.fromstring('<div>' + clean + '</div>')
    paragraphs = []
    for node in tree.xpath('.//p|.//div[contains(@class,"passage-para")]|.//div[contains(@class,"letter-para")]'):
        # Avoid counting nested paragraph text twice.
        if node.xpath('ancestor::p|ancestor::div[contains(@class,"passage-para")]|ancestor::div[contains(@class,"letter-para")]'):continue
        text = ' '.join(node.text_content().split())
        if len(text) >= 80: paragraphs.append(text)
    if len(paragraphs) < 3:
        paragraphs = [' '.join(p.text_content().split()) for p in tree.xpath('.//p') if len(p.text_content().split())>=10]
    if len(paragraphs) < 3: raise ValueError('Insufficient passage paragraphs: '+title)
    sentences=[]
    for p_index,paragraph in enumerate(paragraphs):
        paragraph = re.sub(r'^[A-J]\s+(?=[A-Z])','',paragraph)
        for sentence in re.split(r'(?<=[.!?])\s+(?=[A-Z“‘])',paragraph):
            sentence=sentence.strip(' \n“”')
            words=sentence.split()
            if 10 <= len(words) <= 75 and len(sentence) <= 520 and not sentence.startswith('Figure '):sentences.append({'text':sentence,'paragraph':p_index})
    if len(sentences) < 15: raise ValueError('Insufficient translation sentences: '+title+' '+str(len(sentences)))
    answers={str(k):[str(x) for x in (v if isinstance(v,list) else [v])] for k,v in answers.items()}
    return {'title':unescape(title).strip(),'passageHtml':clean,'questionHtml':sanitized(questions_html,True),'answers':answers,'unordered':unordered or [],'sentences':sentences,'paragraphs':paragraphs,'source':source}


def bank(items, key, label):
    return '<div class="rb-bank"><strong>'+escape(label)+'</strong><ul>'+''.join('<li><b>'+escape(str(item[key]))+'</b> '+escape(unescape(str(item.get('text',item.get('name',item.get('word',''))))))+'</li>' for item in items)+'</ul></div>'


def select(q, options):
    options = [str(x) for x in options]
    return '<select data-rb-q="'+str(q)+'" aria-label="Question '+str(q)+'"><option value="">Choose</option>'+''.join('<option value="'+escape(x,quote=True)+'">'+escape(x)+'</option>' for x in options)+'</select>'


def heavy_questions(sections, passage):
    markup=[];answers={};unordered=[]
    for section in sections:
        kind=section['type'];items=section['items']
        markup.append('<section class="rb-question-group"><h3>'+escape(section.get('title',kind))+'</h3>')
        markup.append('<p class="rb-instruction">'+sanitized(section.get('instruction',''))+'</p>')
        if section.get('noteTitle'):markup.append('<h4>'+escape(section['noteTitle'])+'</h4>')
        headings=section.get('headings') or passage.get('headings',[])
        if kind=='matching-headings' and headings:markup.append(bank(headings,'id','List of Headings'))
        if kind=='matching-features':markup.append(bank(section['people'],'l',section.get('bankLabel','List of choices')))
        if kind=='sentence-endings':markup.append(bank(section['endings'],'l','Sentence endings'))
        if kind=='wordbank':markup.append(bank(section['bank'],'id','List of words'))
        if kind=='mcq-multi':
            markup.append('<p>'+sanitized(section.get('prompt',''))+'</p>')
            markup.append(bank([{'l':x['l'],'text':x['t']} for x in section['options']],'l','Options'))
            unordered.append([int(x['id']) for x in items])
        if kind=='matching-info':markup.append('<p>Paragraphs: '+', '.join(section['options'])+'</p>')
        if kind=='wordbank':
            prose=escape(unescape(section.get('prose','')))
            for item in items:prose=prose.replace('{{'+str(item['id'])+'}}',select(item['id'],[x['id'] for x in section['bank']]))
            markup.append('<p class="rb-summary">'+prose+'</p>')
        if kind in ('notes','summary'):
            prose=''
            for item in items:
                q=int(item['id']);answers[str(q)]=str(item['answer'])
                prose+=sanitized(item.get('label',''))+' <span class="rb-inline-gap" id="rb-q-'+str(q)+'"><b>'+str(q)+'</b> <input type="text" data-rb-q="'+str(q)+'" aria-label="Question '+str(q)+'" autocomplete="off"></span> '+sanitized(item.get('after',''))+' '
            markup.append('<div class="rb-summary">'+prose+'</div>')
            markup.append('</section>')
            continue
        for index,item in enumerate(items):
            q=int(item['id']);answers[str(q)]=str(item['answer'])
            if kind=='wordbank':continue
            label=item.get('label',item.get('stem',''))
            if kind=='matching-headings' and not label:
                slot=next((x['letter'] for x in (section.get('headingSlots') or passage.get('headingSlots',[])) if x['qNum']==q),chr(65+index))
                label='Paragraph '+slot
            options=[]
            if kind=='tfng':options=['TRUE','FALSE','NOT GIVEN']
            if kind=='ynng':options=['YES','NO','NOT GIVEN']
            if kind=='matching-headings':options=[x['id'] for x in headings]
            if kind=='matching-info':options=section['options']
            if kind=='matching-features':options=[x['l'] for x in section['people']]
            if kind=='sentence-endings':options=[x['l'] for x in section['endings']]
            if kind=='mcq-multi':options=[x['l'] for x in section['options']]
            if kind=='mcq':options=[re.match(r'\s*([A-D])\.',x).group(1) for x in item['options']]
            if kind=='mcq' and item.get('options'):
                choices=''.join('<label><input type="radio" name="q'+str(q)+'" value="'+escape(opt)+'" data-rb-q="'+str(q)+'"> '+sanitized(option)+'</label>' for opt,option in zip(options,item['options']))
                control='<div class="rb-choice-list">'+choices+'</div>'
            elif options:control=select(q,options)
            else:control='<input type="text" data-rb-q="'+str(q)+'" aria-label="Question '+str(q)+'" autocomplete="off">'
            markup.append('<div class="rb-question" id="rb-q-'+str(q)+'"><span class="rb-num">'+str(q)+'</span><div class="rb-q-content">'+sanitized(label)+' '+control+' '+sanitized(item.get('after',''))+'</div></div>')
        markup.append('</section>')
    return ''.join(markup),answers,unordered


def mock_source(source):
    doc=html.fromstring(source); key=literal(source,'correctAnswers');records=[]
    for n in (1,2,3):
        p=doc.get_element_by_id('passage-text-'+str(n))
        title=' '.join(p.xpath('.//h4')[0].text_content().split())
        for h in p.xpath('.//h4'):h.drop_tree()
        q=doc.get_element_by_id('questions-'+str(n))
        lo,hi=(1,13) if n==1 else ((14,26) if n==2 else (27,40))
        answers={str(k):v for k,v in key.items() if lo<=int(k)<=hi}
        unordered=[]
        for group in q.xpath('.//input[@type="checkbox"]/@name'):
            m=re.fullmatch(r'q(\d+)-(\d+)',group)
            if m and [int(m[1]),int(m[2])] not in unordered:unordered.append([int(m[1]),int(m[2])])
        records.append(passage_record(title,html.tostring(p,encoding='unicode'),html.tostring(q,encoding='unicode'),answers,unordered))
    return records


def simple_question_html(source, q, heading_list):
    start=source.index('function renderPassage(')
    end=source.index('const partData=',start)
    script=source[start:end]
    bridge='''const fs=require('fs'),vm=require('vm'),data=JSON.parse(fs.readFileSync(0,'utf8'));
const ctx={q:data.q,headingList:data.headingList,state:{answers:{}},esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))};
vm.createContext(ctx);vm.runInContext(data.script+'\\nJSON.stringify([renderQ1(),renderQ2(),renderQ3()])',ctx,{timeout:1000});
process.stdout.write(vm.runInContext('JSON.stringify([renderQ1(),renderQ2(),renderQ3()])',ctx,{timeout:1000}));'''
    result=subprocess.run(['node','-e',bridge],input=json.dumps({'script':script,'q':q,'headingList':heading_list}),text=True,capture_output=True,check=True)
    return json.loads(result.stdout)


def simple_source(source):
    p=literal(source,'passages');q=literal(source,'q');aliases=literal(source,'answerAliases')
    headings=literal(source,'headingList') if 'const headingList=' in source else {}
    question_html=simple_question_html(source,q,headings)
    records=[]
    for n in (1,2,3):
        item=p[str(n)];paragraphs=item['paras']
        body=''.join('<p>'+('<strong>'+escape(x['letter'])+'</strong> ' if x.get('letter') else '')+escape(x['text'])+'</p>' for x in paragraphs)
        lo,hi=(1,13) if n==1 else ((14,26) if n==2 else (27,40))
        answers={str(k):v for k,v in aliases.items() if lo<=int(k)<=hi}
        records.append(passage_record(item['sub'],body,question_html[n-1],answers))
    return records


def sentences_for_training(record):
    candidates=record['sentences'];rng=random.Random(record['title']);indices=list(range(len(candidates)));rng.shuffle(indices)
    chosen=[];seen_paragraph=set()
    for i in indices:
        if candidates[i]['paragraph'] not in seen_paragraph:chosen.append(i);seen_paragraph.add(candidates[i]['paragraph'])
    chosen += [i for i in indices if i not in chosen]
    details=[];wrong=[]
    for i in chosen:
        evidence=candidates[i]['text']; altered,change=contradict(evidence)
        if altered and len(wrong)<5:
            other=[j for j in indices if j!=i and candidates[j]['paragraph']!=candidates[i]['paragraph']]
            options=[evidence]+[candidates[j]['text'] for j in other[:3]]
            random.Random(record['title']+str(i)).shuffle(options)
            wrong.append({'statement':altered,'evidence':evidence,'evidenceChoices':options,'answer':options.index(evidence),'explanation':'Matnda buning aksi aytilgan: '+evidence,'changed':change})
        if len(wrong)==5:break
    if len(wrong)<5:
        already={x['evidence'] for x in wrong}
        for i in chosen:
            evidence=candidates[i]['text']
            if evidence in already or len(evidence.split())>38:continue
            other=[j for j in indices if j!=i and candidates[j]['paragraph']!=candidates[i]['paragraph']]
            options=[evidence]+[candidates[j]['text'] for j in other[:3]]
            random.Random(record['title']+str(i)).shuffle(options)
            wrong.append({'statement':'The passage never makes this claim: “'+evidence+'”','evidence':evidence,'evidenceChoices':options,'answer':options.index(evidence),'explanation':'Bu fikr matnda aynan keltirilgan: '+evidence,'changed':'never'})
            if len(wrong)==5:break
    for i in chosen:
        evidence=candidates[i]['text'];p=candidates[i]['paragraph']
        if len(evidence.split())>38 or len(evidence.split())<12 or evidence[0] in '“‘':continue
        distractors=[];seen={p}
        for j in indices:
            alt=candidates[j];words=len(alt['text'].split());other=alt['paragraph']
            if other not in seen and 12<=words<=38 and alt['text']!=evidence:
                distractors.append(alt['text']);seen.add(other)
            if len(distractors)==3:break
        if len(distractors)<3:continue
        options=[evidence]+distractors;random.Random(str(i)+record['title']).shuffle(options)
        details.append({'question':f'Which idea is stated in paragraph {p+1}?','options':options,'answer':options.index(evidence),'evidence':evidence})
        if len(details)==5:break
    if len(wrong)<5 or len(details)<5:raise ValueError('Insufficient practice evidence: '+record['title'])
    return {'wrong':wrong,'understanding':details}


def contradict(sentence):
    if len(sentence.split())>42 or len(sentence.split())<12 or '?' in sentence or re.search(r'[“”‘’"\']|\b(?:not|never|no|without|only)\b|\b(?:may|might|could|would|should)\s+have\b',sentence,re.I):return '', ''
    substitutions=[
        (r'\b(18|19|20)(\d{2})\b',lambda m:str(int(m.group())+3)),
        (r'\b(\d{1,3})\b',lambda m:str(int(m.group())+2)),
        (r'\bmore than\b',lambda m:'less than'),(r'\bless than\b',lambda m:'more than'),
        (r'\bincreased\b',lambda m:'decreased'),(r'\bdecreased\b',lambda m:'increased'),
        (r'\bbefore\b',lambda m:'after'),(r'\bafter\b',lambda m:'before'),
        (r'\b(first|earliest)\b',lambda m:'last'),(r'\b(last|latest)\b',lambda m:'first'),
        (r'\b(is|are|was|were|can|has)\b(?!\s+not\b)',lambda m:m.group()+' not')
    ]
    for pattern,replacement in substitutions:
        match=re.search(pattern,sentence,re.I)
        if match:
            new=sentence[:match.start()]+replacement(match)+sentence[match.end():]
            if new!=sentence:return new,match.group()
    return '', ''


def main():
    mocks=[]
    with ZipFile(ARCHIVE) as zipped:
        for file in HEAVY:
            source=zipped.read('test/'+file).decode('utf-8-sig')
            passages=literal(source,'PASSAGES');sections=literal(source,'SECTIONS')
            records=[]
            for n in (1,2,3):
                p=passages[str(n)];q,a,u=heavy_questions(sections[str(n)],p)
                records.append(passage_record(p['title'],p['content'],q,a,u))
            mocks.append((file,records))
        for file in MOCK:mocks.append((file,mock_source(zipped.read('test/'+file).decode('utf-8-sig'))))
        for file in SIMPLE:mocks.append((file,simple_source(zipped.read('test/'+file).decode('utf-8-sig'))))
    assert len(mocks)==10
    output=[]
    for mock_number,(file,records) in enumerate(mocks,1):
        for part,record in enumerate(records,1):
            record['id']=f'd{len(output)+1:02}';record['day']=len(output)+1;record['part']=part;record['mock']=mock_number;record['source']=file
            expected=list(range(1,14)) if part==1 else list(range(14,27)) if part==2 else list(range(27,41))
            if sorted(map(int,record['answers']))!=expected:raise ValueError('Missing original question in '+file+': '+str(part))
            parsed=html.fromstring(record['questionHtml']);found=set(int(x) for x in parsed.xpath('//*[@data-rb-q]/@data-rb-q'))
            groups=[int(x) for s in parsed.xpath('//*[@data-rb-group]/@data-rb-group') for x in s.split('-')]
            if set(expected)-found-set(groups):raise ValueError('No answer control '+file+': '+str(sorted(set(expected)-found-set(groups))))
            record['training']=sentences_for_training(record)
            output.append(record)
    titles=[re.sub(r'\W+','',x['title'].lower()) for x in output]
    if len(set(titles))!=30:raise ValueError('Repeated passage title: '+str([x for x,n in Counter(titles).items() if n>1]))
    data=json.dumps({'passages':output},ensure_ascii=False,separators=(',',':'))
    app=APP.read_text()
    begin='// READING_BOOSTER_DATA_START';end='// READING_BOOSTER_DATA_END'
    if app.count(begin)!=1 or app.count(end)!=1:raise ValueError('Reading Booster markers missing')
    app=re.sub(re.escape(begin)+r'.*?'+re.escape(end),lambda _:begin+'\nconst readingBoosterBank='+data+';\n'+end,app,flags=re.S,count=1)
    APP.write_text(app)
    print('Reading Booster: 30 passages from 10 full mocks, 400 original questions, 150 understanding MCQs, 150 wrong-answer challenges,',len(data),'JSON characters')


if __name__=='__main__':main()
