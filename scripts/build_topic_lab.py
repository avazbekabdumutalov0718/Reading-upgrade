"""Build 100 speaking prompts with three fictional, editable practice models each.

The original vocabulary entries are kept as IDs. New collocations carry their own
translations and definitions, so the source of every card remains visible.
"""
import ast
import json
import pathlib
import re

from speaking_phrases import GENERAL, PACKS as NEW_PACKS
from speaking_topics_source import TOPICS

ROOT = pathlib.Path(__file__).resolve().parents[1]
WORDS = json.loads((ROOT / 'dist/data.json').read_text())
BY = {w['w'].casefold(): w for w in WORDS}
tree = ast.parse((ROOT / 'scripts/build_speaking_content.py').read_text())
ORIGINAL_PACKS = next(ast.literal_eval(node.value) for node in tree.body if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'PACKS' for t in node.targets))
ORIGINAL_PACKS.update(next(ast.literal_eval(node.value.args[0]) for node in tree.body if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Attribute) and node.value.func.attr == 'update' and isinstance(node.value.func.value, ast.Name) and node.value.func.value.id == 'PACKS'))
ORIGINAL_PACKS['sport'] = ('work as part of a team|support each other|stay active|make steady progress|teamwork skills', 'Sports teach people to work as part of a team and support each other. They help us stay active and make steady progress; those teamwork skills also matter outside sport.', '')
ORIGINAL_PACKS['food'] = ('homemade food|try new flavours|family gathering|spend quality time with my family|make lasting memories', 'At a family gathering, homemade food gives us time to talk. I like to try new flavours, but the chance to spend quality time with my family is what can make lasting memories.', '')
ORIGINAL_PACKS['memory'] = ('a memory that stands out|capture special moments|look back on|make lasting memories|a sense of belonging', 'I like to look back on a memory that stands out, although I also try to capture special moments while they happen. Shared experiences can create a sense of belonging and make lasting memories.', '')
ORIGINAL_PACKS['music'] = ('a memorable experience|capture special moments|share personal experiences|spend quality time with my family|make lasting memories', 'A song can remind me of a memorable experience and help me capture special moments in my mind. I share personal experiences and spend quality time with my family when music is playing; moments like those can make lasting memories.', '')
ORIGINAL_PACKS['driving'] = ('reliable public transport|heavy traffic|less traffic and noise|traffic regulations|save time', 'Reliable public transport can save time, whereas heavy traffic makes a journey unpredictable. I prefer routes with less traffic and noise, and clear traffic regulations help everyone travel safely.', '')

# Two linked observations for each subject area. The concrete scene itself is
# always taken from the user's individual topic row below.
ANGLES = {
 'home': ("The way a room worked for ordinary tasks mattered more than its size.", "A good space should give people a place to focus and another place to talk."),
 'city': ("The route between places shaped the visit as much as the sights did.", "A city becomes easier to enjoy when its daily services are genuinely accessible."),
 'hometown': ("Small familiar details were what made the streets feel like mine.", "Changes are welcome when local people can still recognise the character of a place."),
 'study': ("One practical example did more for me than a long list of rules.", "I retain an idea better when I test it and explain it to somebody else."),
 'social': ("The useful part was being able to count on someone in a small, ordinary moment.", "Good relationships grow through attention and honest conversation."),
 'tech': ("The tool mattered because it solved a specific problem, not because it looked impressive.", "A useful device should give me more time and attention for the task itself."),
 'nature': ("I noticed details that I would have missed if I had rushed past.", "Even a short visit outdoors helps me observe a place more carefully."),
 'media': ("What I remembered afterwards was the clear explanation rather than the dramatic opening.", "I try to choose material that leaves me with a question worth exploring."),
 'film': ("The character's choices made the scene more memorable than any visual effect.", "I enjoy stories when the ending follows from what the characters have learned."),
 'time': ("The plan only worked once I accepted that an unexpected task might change it.", "I feel more focused when I choose a few priorities and keep the rest flexible."),
 'food': ("The conversation around the table was part of the experience.", "The setting and the people sharing a meal shape how I remember it."),
 'sport': ("What stayed with me was the cooperation, not the final score.", "I value activities that leave everyone included and encourage steady improvement."),
 'business': ("A modest solution to a real need was more impressive than a grand promise.", "I respect patient work, useful feedback and the willingness to improve."),
 'travel': ("A quiet moment on the journey taught me more than a packed itinerary.", "I prefer a pace that leaves room to notice everyday life in a new place."),
 'shopping': ("Taking time to compare the choices prevented a rushed decision.", "I value items that do their job well and remain useful over time."),
 'art': ("A small design choice changed how the whole piece felt.", "I appreciate creative work that invites me to look again and ask why it works."),
 'environment': ("A visible local change made the issue feel closer to home.", "Practical improvements depend on communities and clear, consistent support."),
 'children': ("The simple activity left room for imagination and conversation.", "A good game lets people learn, make mistakes and try again together."),
 'health': ("I learnt that an overly rigid plan was difficult to sustain.", "I prefer a reasonable routine with movement, rest and flexibility."),
 'books': ("The detail I remembered was connected to a character or a real question.", "I enjoy reading that makes me curious enough to discuss an idea afterwards."),
 'rules': ("The rule made more sense once someone explained its practical purpose.", "People cooperate more readily when expectations are clear and fair."),
 'communication': ("Listening first changed the tone of the whole exchange.", "A short, thoughtful conversation can solve more than several hurried messages."),
 'mirror': ("A quick practical check saved time without making it a big issue.", "I prefer useful routines that do not occupy more attention than they deserve."),
 'watch': ("Knowing the time helped me feel less rushed on the way out.", "I value tools that are easy to use rather than needlessly complicated."),
 'animals': ("The animal's small habits made its personality easy to remember.", "Enjoying animals also means taking their needs and care seriously."),
 'memory': ("It was a tiny detail that made the whole afternoon return to me.", "I find that stories and conversations keep memories alive better than dates."),
 'photos': ("The picture mattered because of what happened just beyond its frame.", "I prefer photographs that bring back a real conversation or moment."),
 'sleep': ("I had been trying to fit too much into a single evening.", "An unhurried end to the day helps me be ready for the next one."),
 'planning': ("A change to the original plan turned out to be useful rather than disastrous.", "I write down the essentials and accept that the details can move."),
 'music': ("The setting where I heard it became part of the memory.", "I notice the mood and the moment attached to a song as much as its melody."),
 'clothes': ("The most useful choice was the one that suited a normal day.", "I choose comfort and function in a way that fits the occasion."),
 'driving': ("How we managed the route was more important than the vehicle.", "A reliable, comfortable journey is more useful to me than a showy one."),
 'quiet': ("Once the noise faded, I could notice what I was actually thinking.", "A calm setting gives me room to pause and return to a task with clarity."),
 'visitcity': ("The ordinary streets told me more than the famous landmark alone.", "I enjoy a city best when I can take a slow walk and observe everyday life."),
}

def subject(title):
    return title.replace('favorite', 'favourite')

def words_in(s):
    return len(re.findall(r"\b[\w’'-]+\b", s))

def make_answer(title, cat, anchor, tense, original, new, past, present, future):
    thing = subject(title).lower()
    memory, principle = ANGLES[cat]
    support = ORIGINAL_PACKS[cat][1]
    usage = NEW_PACKS[cat][1]
    if tense == 'past':
        paragraphs = [
            f"Looking back, one memory helps me explain {thing} more clearly. {anchor} It was not a spectacular event, and perhaps that is why I can still describe it clearly. I remember noticing small details instead of thinking about whether the moment would make an interesting story later. At the time, I had no idea I would keep referring to it when this subject came up.",
            f"What happened next was fairly ordinary, but it gave the experience some depth. {memory} I did not understand that immediately; I noticed it when I thought about the day again. If somebody had asked me beforehand what I expected, I probably would have mentioned the obvious details. Afterwards, I was more interested in the decisions people made, the little interruptions, and the way the experience unfolded at its own pace.",
            f"It also changed the way I talk about this subject. {support} {usage} These expressions describe different sides of the same experience rather than a single dramatic moment. For instance, the setting influenced what I noticed, while the conversation or activity gave me something concrete to remember. I would not claim that everything went perfectly. That is precisely why the memory feels believable: some things needed adjustment, and we learnt as we went along.",
            f"Looking back, I can take a step back from the immediate details, although the scene is still in the back of my mind. It gave me a fresh perspective on {thing} and on what makes an ordinary experience worth discussing. I have since realised that {principle[0].lower()+principle[1:]} The lesson was not a grand revelation. It was simply that I began to notice the small choices and explanations that I had previously taken for granted.",
            f"That memory still shapes my view today. {present} I can see a connection between what happened then and the choices I make now, although the circumstances have changed. {future} If I were telling a friend about it, I would start with the scene and explain its meaning afterwards."
        ]
    elif tense == 'present':
        paragraphs = [
            f"If somebody asked me about {thing} today, I would begin with an ordinary example. {anchor} That is a fairly accurate picture of how it fits into my life now. It is not something I have to make impressive for other people. I notice it in the choices I make during a normal week, in conversations, and in the way I decide which details are worth my attention.",
            f"What appeals to me most is the practical side. {principle} I have tried doing things in a more complicated way, and it usually takes away from what I originally enjoyed. These days I tend to ask whether a choice will still feel useful once the first excitement has passed. That question keeps me grounded, especially when a new recommendation or a busy schedule makes everything seem urgent.",
            f"My habits are not completely fixed, of course. {support} {usage} The point is not to use sophisticated language for its own sake; these are useful expressions because they describe something I can actually observe. The particular scene in my example may sound small, yet it gives me a starting point for a wider conversation. From there, I can explain what works well, what occasionally gets in the way, and how I respond.",
            f"I try to take a step back before deciding what really matters about {thing}. In the back of my mind, I know first impressions can be misleading, so a fresh perspective is always welcome. For example, another person's question can make me explain a habit I had never examined closely. Sometimes I change my view; at other times I become more confident in it. Either result is useful, provided I can give a reason rather than just repeat a preference.",
            f"My view has also changed with experience. {past} That earlier example helps explain why I now pay more attention to practical details. {future} If somebody asked me about this today, I would begin with what I actually do, explain why it works for me and leave room for my preferences to develop."
        ]
    else:
        paragraphs = [
            f"I have a fairly clear picture of how {thing} might fit into my future. {anchor} I cannot predict every detail, but that is a direction I would be pleased to explore. Rather than making an enormous promise, I would begin with a manageable step and see what I learnt from it. The idea appeals to me because it builds on something I have already noticed in everyday life.",
            f"If the opportunity arose, I would pay attention to the context instead of rushing to the finish. {principle} I would ask a few questions, listen to people with more experience, and be willing to revise my first plan. Some aspects might turn out differently from what I expect. I think that uncertainty can be productive, as long as I remain realistic about the time and effort involved.",
            f"To explain the kind of future I mean, I would start with these practical ideas: {support} {usage} They may sound like broad principles, but I could apply them one step at a time. First I would decide what matters most. Then I would try a small version, ask for feedback, and improve it. If something were not working, I would change my approach instead of pretending that my original idea had been flawless.",
            f"I would also take a step back every so often to check whether the plan still suited me. In the back of my mind, I would want to keep the original purpose clear. A fresh perspective from somebody else could be especially valuable at that stage, because it might reveal an option I had overlooked. That does not mean abandoning the idea; it means giving it enough room to become more thoughtful and useful.",
            f"The plan has a real starting point. {past} {present} A few years from now, I hope I will be able to say I actually tried something rather than only talked about it. Even if the outcome differs from what I picture today, I would still have learnt something concrete about {thing}."
        ]
    answer = '\n\n'.join(paragraphs)
    cards = original + new
    assert len(cards) == 10 and len({c if isinstance(c,int) else c['w'].casefold() for c in cards}) == 10
    assert all((WORDS[c]['w'] if isinstance(c,int) else c['w']).casefold() in answer.casefold() for c in cards), (title, tense)
    return {'answer': answer, 'cards': cards, 'words': words_in(answer)}

output = []
for i, (title, cat, past, present, future) in enumerate(TOPICS, 1):
    assert cat in ANGLES and cat in ORIGINAL_PACKS and cat in NEW_PACKS, title
    original = [BY[phrase.casefold()]['id'] for phrase in ORIGINAL_PACKS[cat][0].split('|')]
    new = NEW_PACKS[cat][0] + GENERAL
    assert len(original) == 5 and len(new) == 5
    answers = {tense: make_answer(title, cat, scene, tense, original, new, past, present, future)
               for tense, scene in [('past', past), ('present', present), ('future', future)]}
    output.append({'id': f'topic-{i:03}', 'number': i, 'title': title,
                   'category': cat, 'answers': answers})

(ROOT / 'dist/topic-lab.json').write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')))
counts = [a['words'] for t in output for a in t['answers'].values()]
print(f'{len(output)} topics, {len(counts)} answers; word counts {min(counts)}–{max(counts)}, median {sorted(counts)[len(counts)//2]}')
