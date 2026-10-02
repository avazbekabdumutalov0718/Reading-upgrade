"""Build the user's Health & Sleep mock study data from its source Markdown."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHORT_EXAMPLES = {
    'scrolling through social media': 'I stopped scrolling through social media before bed.',
    'take a toll on my concentration': 'Poor sleep can take a toll on my concentration.',
    'set a regular bedtime': 'I decided to set a regular bedtime at ten.',
    'put my phone out of reach': 'I now put my phone out of reach at night.',
    'stick with the change': 'After a week, it became easier to stick with the change.',
    'wake up feeling refreshed': 'I wake up feeling refreshed when I follow my routine.',
    'protect my sleep': 'I try to protect my sleep during busy weeks.',
    'set realistic boundaries': 'I set realistic boundaries around late-night study.',
    'keep the core habit': 'I want to keep the core habit of reading before bed.',
    'a false economy': 'Skipping sleep to work longer is often a false economy.',
    'early start times': 'Early start times can leave students feeling tired.',
    'work irregular shifts': 'Some adults work irregular shifts and struggle to sleep.',
    'find a workable balance': 'We need to find a workable balance for everyone.',
    'create supportive environments': 'Governments can create supportive environments for healthy choices.',
    'reliable health information': 'Schools should share reliable health information with students.',
    'set sensible boundaries': 'I try to set sensible boundaries around screen time.',
    'safe public spaces': 'Cities should provide safe public spaces for walking.',
}
source = (ROOT / 'content/health-sleep-mock.md').read_text(encoding='utf-8')
sections = re.split(r'(?=^## Part [123] —)', source, flags=re.M)[1:]
questions = []
for section in sections:
    part = int(re.search(r'^## Part (\d)', section).group(1))
    blocks = re.split(r'(?=^### )', section, flags=re.M)[1:]
    for block in blocks:
        heading = block.splitlines()[0].removeprefix('### ').strip()
        question = re.sub(r'^\d+\. ', '', heading)
        if question.startswith('Cue card: '):
            question = question.removeprefix('Cue card: ')
        if question.startswith('Short follow-up: '):
            question = question.removeprefix('Short follow-up: ')
        original = re.search(r'\*\*Sizning original javobingiz\*\*\s*\n\s*> (.*?)\n\s*\n', block, re.S)
        sample = re.search(r'\*\*Band 9 uslubidagi [^\n]+\*\*\s*\n\s*(.*?)\n\s*\*\*Ishlatilgan (\d+) ta collocation', block, re.S)
        if not original or not sample:
            raise ValueError('Missing response in ' + heading)
        cards = [dict(w=w, u=u) for w, u in re.findall(r'^\d+\. \*\*(.*?)\*\* — (.*)$', block, re.M)]
        if len(cards) != int(sample.group(2)):
            raise ValueError('Wrong number of cards: ' + heading)
        text = sample.group(1).strip()
        plain = text.replace('**', '').replace('\n\n', ' ')
        sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', plain)
        for card in cards:
            if '**' + card['w'] + '**' not in text:
                raise ValueError('Card not highlighted in answer: ' + card['w'])
            card['e'] = next((sentence for sentence in sentences if card['w'].casefold() in sentence.casefold()), '')
            if not card['e']:
                raise ValueError('Missing example: ' + card['w'])
            if len(card['e'].split()) > 22:
                card['e'] = SHORT_EXAMPLES[card['w']]
            if card['w'].casefold() not in card['e'].casefold() or len(card['e'].split()) > 22:
                raise ValueError('Invalid game example: ' + card['w'])
        questions.append(dict(part=part, question=question, original=original.group(1).strip(), sample=text, cards=cards, followup=heading.startswith('Short follow-up: ')))

if len(questions) != 12 or [sum(q['part'] == n for q in questions) for n in (1, 2, 3)] != [5, 2, 5]:
    raise ValueError('Incomplete mock')
analysis = {
    'score': '5.5',
    'partScores': ['5.5', '6.0', '5.0–5.5'],
    'criteria': [
        {'name': 'FLUENCY & COHERENCE', 'score': '≈ 6', 'feedback': 'Part 2 da uzun javobni davom ettirding. Qayta boshlash va “I usually”, “so that’s it” takrorlari oqimni susaytirdi.'},
        {'name': 'LEXICAL RESOURCE', 'score': '≈ 5–5.5', 'feedback': 'Fikr yetdi, lekin “get rid of tired”, “work so bad” kabi birikmalar tabiiy emas. So‘z topolmaganda fikrni sodda qayta ayt.'},
        {'name': 'GRAMMAR', 'score': '≈ 5', 'feedback': 'O‘tmish va hozirgi zamonni aralashtirish, “if I will go”, “can tracking”, “going to studying” kabi xatolar ko‘p bo‘ldi.'},
        {'name': 'PRONUNCIATION', 'score': '—', 'feedback': 'Yozma matndan tovush, urg‘u va ohangni tekshirib bo‘lmaydi.'},
    ],
    'highlights': [
        {'title': 'Eng yaxshi qism — Part 2', 'text': 'Eski tartibing, qilgan o‘zgarishing va natijani ketma-ket tushuntirding. Vaqtlarni aniq ayt: about a year ago va two months ago.'},
        {'title': 'Keyingi mashq — Part 3', 'text': 'Har javobni fikr → sabab → aniq misol → qisqa izoh tartibida tuz. Bir savolda bitta fikrni yetarlicha rivojlantir.'},
    ],
    'corrections': [
        ['I often trouble falling asleep.', 'I often have trouble falling asleep.'],
        ['In recent years, I changed my a lot of health habits.', 'In recent years, I’ve changed many of my health habits.'],
        ['I usually sleep at 12 p.m. It’s midnight.', 'I used to go to bed at 12 a.m. (midnight).'],
        ['You can tracking your health.', 'You can track your health.'],
        ['If I will go abroad to studying next year…', 'If I go abroad to study next year…'],
        ['I am going to studying abroad.', 'I am going to study abroad.'],
        ['I do cardio for reduce stress.', 'I do cardio to reduce stress.'],
        ['I spent a lot of time for social media.', 'I spent a lot of time on social media.'],
        ['It helps me better sleep and calm.', 'It helps me sleep better and feel calmer.'],
        ['Every people should do this.', 'Everyone should do this.'],
    ],
    'partTitles': {'1': 'Sleep & Health', '2': 'Sleep routine · cue card', '3': 'Sleep, technology & public health'},
}
# Each prompt is a verbatim fragment of the user's answer; one natural correction is shown after checking.
drills = [
    (0, 'I usually sleep eight or seven hours during days', 'I usually sleep seven or eight hours a night.', 'time expression'),
    (0, 'when I go to the bed for sleep', 'when I go to bed', 'article and collocation'),
    (0, 'If I sleep at 12 p.m.', 'If I go to bed at 12 a.m.', 'midnight and verb choice'),
    (1, 'I often trouble falling asleep', 'I often have trouble falling asleep.', 'have trouble + -ing'),
    (1, "I usually don't sleep till 1 a.m. or 2 a.m.", "I often don't fall asleep until 1 or 2 a.m.", 'natural phrasing'),
    (2, "if I didn't sleep enough, next day I feel tired and anxious", "If I don't get enough sleep, I feel tired and anxious the next day.", 'present conditional'),
    (2, 'I usually drink water in the morning for relaxed', 'I usually drink water in the morning to feel refreshed.', 'purpose: to + verb'),
    (2, 'It helps me get rid of tired and better', 'It helps me feel less tired and better.', 'natural adjective pattern'),
    (3, 'I usually do the small habits to stay healthy', 'I follow small habits to stay healthy.', 'natural verb choice'),
    (3, 'Whenever I do regular cardio exercise, and they help me feel better', 'I also do regular cardio exercise, which helps me feel better.', 'complete sentence'),
    (4, 'In recent years, I changed my a lot of health habits', "In recent years, I've changed many of my health habits.", 'present perfect and word order'),
    (4, 'I spent a lot of time for social media', 'I spent a lot of time on social media.', 'preposition: on'),
    (4, 'It helps me better sleep and calm', 'It helps me sleep better and feel calmer.', 'verb pattern and word order'),
    (5, 'Around two years ago, one year ago, I usually sleep at 12 p.m. or 1 a.m.', 'About a year ago, I used to go to bed at midnight or 1 a.m.', 'used to and midnight'),
    (5, 'So I tired.', 'So I felt tired.', 'past tense of feel'),
    (5, 'I changed my sleep time, and I go to bed at around 9 p.m', 'I changed my bedtime and started going to bed at around 9 p.m.', 'consistent past tense'),
    (5, 'I usually do cardio for reduce stress', 'I usually do cardio to reduce stress.', 'purpose: to + verb'),
    (5, 'it affected effectively sleep and easily wake up', 'It improved my sleep and made it easier to wake up.', 'natural verb choice'),
    (6, 'I am going to studying abroad', 'I am going to study abroad.', 'going to + verb'),
    (6, 'if I will go abroad to studying next year', 'if I go abroad to study next year', 'first conditional and purpose'),
    (6, 'because I should hard work and hard study', 'because I will need to work and study hard', 'verb and adverb order'),
    (7, 'people sleep less now than past', 'people sleep less now than in the past', 'in the past'),
    (7, 'they just wasting of their time', 'they are just wasting their time', 'be + -ing; no of'),
    (7, 'more effectively to learning something', 'learn something more effectively', 'verb and adverb order'),
    (8, 'the first people should change their thoughts about sleep', 'people should first change the way they think about sleep', 'natural word order'),
    (9, 'you can tracking', 'you can track', 'can + base verb'),
    (9, 'people worked agricultural relentlessly', 'people worked relentlessly in agriculture', 'word form'),
    (9, 'Technology now working instead of them', 'Technology now does some of that work for them.', 'present simple'),
    (10, 'The first and foremost', 'First and foremost', 'fixed expression'),
    (10, 'if they are cough', 'if they have a cough', 'have a cough'),
    (10, 'they immediately consume pill', 'they immediately take a pill', 'verb and article'),
    (11, 'Every people should do this.', 'Everyone should do this.', 'everyone + singular verb'),
]
for question_index, before, after, focus in drills:
    if before.casefold() not in questions[question_index]['original'].casefold():
        raise ValueError('Drill quote not found in the original answer: ' + before)
analysis['drills'] = [dict(questionIndex=index, before=before, after=after, focus=focus) for index, before, after, focus in drills]
output = {'id': 'health-sleep-2026-09-29', 'date': '2026-09-29', 'title': 'Health & Sleep', 'analysis': analysis, 'questions': questions}
(ROOT / 'dist/mock-analysis-health-sleep.json').write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
index_path = ROOT / 'dist/index.html'
index = index_path.read_text(encoding='utf-8')
start = '<!-- MOCK_ANALYSIS_DATA_START -->'
end = '<!-- MOCK_ANALYSIS_DATA_END -->'
if index.count(start) != 1 or index.count(end) != 1:
    raise ValueError('Mock data markers missing from index.html')
embedded = json.dumps({output['id']: output}, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
index = re.sub(re.escape(start) + r'.*?' + re.escape(end), lambda _: start + '\n  <script id="mock-analysis-data" type="application/json">' + embedded + '</script>\n  ' + end, index, count=1, flags=re.S)
index_path.write_text(index, encoding='utf-8')
print('Mock analysis built:', len(questions), 'answers,', sum(len(q['cards']) for q in questions), 'card references')
