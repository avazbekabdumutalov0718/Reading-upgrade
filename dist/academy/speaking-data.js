/* ============================================================
   VIVID IELTS — Speaking Part 1 data
   4 topics x questions, each with a sample answer and 5
   collocation flashcards (phrase / uz translation / definition /
   2 examples). Add more topics by pushing new objects into
   SPEAKING_TOPICS following the same shape.
   ============================================================ */

const SPEAKING_TOPICS = [
  {
    id: 'travelling',
    title: 'Travelling',
    icon: '✈️',
    questions: [
      {
        q: 'Do you like travelling?',
        answer: "Yeah, definitely. I'm always down to get out of town and switch things up, even if it's just a short weekend trip. I love checking out new places, trying local food, and getting a break from the same old routine. It helps me clear my head and come back feeling recharged.",
        phrases: [
          { phrase: 'be down to', find: 'down to', uz: "qilishga tayyor bo'lmoq", def: 'to be willing or eager to do something', ex1: "I'm always down to get out of town for a trip.", ex2: "He's down to try new food anytime." },
          { phrase: 'get out of town', find: 'get out of town', uz: 'shahardan chiqib ketmoq', def: 'to leave the city, usually for a trip', ex1: 'We decided to get out of town for the weekend.', ex2: 'I need to get out of town and relax.' },
          { phrase: 'switch things up', find: 'switch things up', uz: "odatiy tartibni o'zgartirmoq", def: 'to change your usual routine', ex1: 'I like to switch things up by trying new places.', ex2: "Let's switch things up and cook something different." },
          { phrase: 'check out a place', find: 'checking out new places', uz: "biror joyni borib ko'rmoq", def: 'to visit and explore somewhere new', ex1: 'I love checking out new places when I travel.', ex2: 'We checked out a small café near the beach.' },
          { phrase: 'clear my head', find: 'clear my head', uz: 'fikrimni tiniqlashtirmoq', def: 'to relax and stop worrying for a while', ex1: 'Travelling helps me clear my head after a busy week.', ex2: 'I went for a walk to clear my head.' },
        ],
      },
      {
        q: 'Do you like travelling long distances?',
        answer: "It kinda depends. If the destination is worth it, I don't mind a long trip at all. The journey can be exhausting, but I usually throw on a playlist, watch a movie, and zone out for a while. It may drag on, but once I get there, it usually feels totally worth it.",
        phrases: [
          { phrase: 'it kinda depends', find: 'kinda depends', uz: 'bu vaziyatga bog\u2019liq', def: 'it changes based on the situation', ex1: 'It kinda depends on how far the place is.', ex2: 'Whether I go kinda depends on the weather.' },
          { phrase: 'be worth it', find: 'worth it', uz: 'shunga arziydigan bo\u2019lmoq', def: 'to deserve the time or effort spent', ex1: "If the destination is worth it, I don't mind the trip.", ex2: 'The long queue was worth it for that view.' },
          { phrase: 'throw on a playlist', find: 'throw on a playlist', uz: "playlistni yoqib yubormoq", def: 'to start playing music quickly', ex1: 'I usually throw on a playlist during long trips.', ex2: 'She threw on a playlist to make the drive fun.' },
          { phrase: 'zone out', find: 'zone out', uz: "atrofni unutib, bo'shashmoq", def: 'to stop paying attention and relax', ex1: 'I like to zone out and watch a movie on flights.', ex2: 'He zoned out during the boring meeting.' },
          { phrase: 'drag on', find: 'drag on', uz: 'juda uzoq cho\u2019zilmoq', def: 'to continue for longer than expected', ex1: 'The journey may drag on, but it\u2019s worth it.', ex2: 'The meeting dragged on for two hours.' },
        ],
      },
      {
        q: 'Would you like to travel long distances more often in the future?',
        answer: "Yeah, for sure. I'd love to branch out and see places that feel completely different from home. Once I have more time and money to work with, I want longer trips instead of just quick getaways. It would push me out of my comfort zone and give me a whole new perspective.",
        phrases: [
          { phrase: 'branch out', find: 'branch out', uz: "yangi narsalarni sinab ko'rmoq", def: 'to try new things beyond your usual experience', ex1: "I'd love to branch out and visit new countries.", ex2: 'The company branched out into new markets.' },
          { phrase: 'have more to work with', find: 'more time and money to work with', uz: "ko'proq imkoniyatga ega bo'lmoq", def: 'to have more resources or options available', ex1: "Once I have more money to work with, I'll travel further.", ex2: 'With this budget, we have more to work with.' },
          { phrase: 'a quick getaway', find: 'quick getaways', uz: 'qisqa dam olish safari', def: 'a short trip to relax', ex1: 'I usually take a quick getaway on weekends.', ex2: 'We planned a quick getaway to the mountains.' },
          { phrase: 'push me out of my comfort zone', find: 'push me out of my comfort zone', uz: 'komfort zonamdan chiqarmoq', def: 'to make someone try something unfamiliar', ex1: 'Long trips push me out of my comfort zone.', ex2: 'Public speaking pushed her out of her comfort zone.' },
          { phrase: 'a whole new perspective', find: 'a whole new perspective', uz: 'butunlay yangi qarash', def: 'a completely different way of seeing things', ex1: 'Travelling gives me a whole new perspective on life.', ex2: 'Living abroad gave him a whole new perspective.' },
        ],
      },
      {
        q: 'Do you often travel by plane?',
        answer: "Not really. I only fly once in a while, mostly when the trip is too far to do by car or train. Flying is convenient and saves a ton of time, but airports can be a bit of a hassle. If I had to choose between a twelve-hour drive and a short flight, I'd take the flight any day.",
        phrases: [
          { phrase: 'once in a while', find: 'once in a while', uz: 'vaqti-vaqti bilan', def: 'occasionally, not very often', ex1: 'I only fly once in a while.', ex2: 'We eat out once in a while.' },
          { phrase: 'too far to do by car', find: 'too far to do by car', uz: 'mashinada borish uchun juda uzoq', def: 'too distant to travel by car', ex1: 'The trip was too far to do by car, so we flew.', ex2: "It's too far to do by car in one day." },
          { phrase: 'save a ton of time', find: 'saves a ton of time', uz: 'juda ko\u2019p vaqtni tejamoq', def: 'to save a lot of time', ex1: 'Flying saves a ton of time compared to driving.', ex2: 'This shortcut saves a ton of time.' },
          { phrase: 'be a bit of a hassle', find: 'a bit of a hassle', uz: 'biroz ovora qilmoq', def: 'slightly annoying or troublesome', ex1: 'Airports can be a bit of a hassle.', ex2: 'Filling out the forms was a bit of a hassle.' },
          { phrase: 'take the flight any day', find: 'take the flight any day', uz: 'samolyotni bexordonon tanlamoq', def: 'to strongly prefer one option (the flight)', ex1: "I'd take the flight any day over a long drive.", ex2: "He'd take the flight any day, even if pricier." },
        ],
      },
    ],
  },

  {
    id: 'home-accommodation',
    title: 'Home & Accommodation',
    icon: '🏠',
    questions: [
      {
        q: 'Can you describe the place where you live?',
        answer: "I live in a cozy apartment in Tashkent. The neighborhood is quiet, but everything I need is still within easy reach. There's a small park just around the corner where I sometimes go to unwind after class. It's not too busy or too boring - it's just right for me.",
        phrases: [
          { phrase: 'a cozy apartment', find: 'a cozy apartment', uz: 'shinam kvartira', def: 'a small, comfortable, warm flat', ex1: 'I live in a cozy apartment in Tashkent.', ex2: 'They rented a cozy apartment near the university.' },
          { phrase: 'within easy reach', find: 'within easy reach', uz: 'oson yetib boriladigan joyda', def: 'close and easy to get to', ex1: 'Everything I need is within easy reach.', ex2: 'The shop is within easy reach of my house.' },
          { phrase: 'just around the corner', find: 'just around the corner', uz: 'juda yaqin joyda', def: 'very close by', ex1: 'There\u2019s a small park just around the corner.', ex2: 'The bakery is just around the corner from here.' },
          { phrase: 'unwind after class', find: 'unwind after class', uz: 'darsdan keyin dam olmoq', def: 'to relax after finishing lessons', ex1: 'I go to the park to unwind after class.', ex2: 'She likes to unwind after class with music.' },
          { phrase: 'just right for me', find: 'just right for me', uz: 'men uchun ayni muddao', def: 'perfectly suitable for someone', ex1: 'The neighborhood is just right for me.', ex2: 'This job feels just right for me.' },
        ],
      },
      {
        q: 'What kind of housing accommodation do you live in?',
        answer: "If I'm honest, I live in a pretty decent-sized apartment with my family. It's nothing massive or over-the-top, but it's got everything we need - two bedrooms, a living room, and a kitchen where we usually hang out. The neighbors are pretty chill, so it definitely feels like home.",
        phrases: [
          { phrase: 'pretty decent-sized', find: 'pretty decent-sized', uz: 'anchagina keng', def: 'fairly large or spacious', ex1: 'I live in a pretty decent-sized apartment.', ex2: 'They bought a pretty decent-sized house.' },
          { phrase: 'nothing massive or over-the-top', find: 'nothing massive or over-the-top', uz: 'juda katta yoki dabdabali emas', def: 'not extremely large or extravagant', ex1: "It's nothing massive or over-the-top, just comfortable.", ex2: 'Our office is nothing massive or over-the-top.' },
          { phrase: 'everything we need', find: 'everything we need', uz: 'bizga kerakli barcha narsa', def: 'all the necessary things', ex1: 'The flat has everything we need.', ex2: 'The kitchen has everything we need to cook.' },
          { phrase: 'hang out', find: 'hang out', uz: "birga vaqt o'tkazmoq", def: 'to spend time together casually', ex1: 'We usually hang out in the kitchen.', ex2: "Let's hang out at the park later." },
          { phrase: 'pretty chill', find: 'pretty chill', uz: 'ancha xotirjam', def: 'fairly relaxed and calm', ex1: 'The neighbors are pretty chill.', ex2: "He's a pretty chill guy to work with." },
        ],
      },
      {
        q: 'What do you like about your flat?',
        answer: "What I like most is how bright and homey it feels. My room gets plenty of natural light in the morning, which helps me wake up and lock in. The layout is simple and uncluttered, so the whole place has a calm, fresh-start vibe.",
        phrases: [
          { phrase: 'bright and homey', find: 'bright and homey', uz: 'yorug\u2019 va shinam', def: 'well-lit and comfortable, cozy', ex1: 'The flat feels bright and homey.', ex2: 'Their new house is bright and homey.' },
          { phrase: 'natural light', find: 'natural light', uz: 'tabiiy yorug\u2019lik', def: 'sunlight coming into a room', ex1: 'My room gets plenty of natural light.', ex2: 'Open the curtains to let in natural light.' },
          { phrase: 'lock in', find: 'lock in', uz: "diqqatni to'liq jamlamoq", def: 'to focus completely on a task', ex1: 'The morning light helps me lock in on my work.', ex2: 'I need to lock in before the exam.' },
          { phrase: 'uncluttered', find: 'uncluttered', uz: 'ortiqcha buyumlarsiz', def: 'tidy, without unnecessary items', ex1: 'The layout is simple and uncluttered.', ex2: 'I keep my desk uncluttered for focus.' },
          { phrase: 'fresh-start vibe', find: 'fresh-start vibe', uz: 'yangi boshlanish hissi', def: 'a feeling of a new beginning', ex1: 'The place has a calm, fresh-start vibe.', ex2: 'The new year always gives a fresh-start vibe.' },
        ],
      },
      {
        q: 'Which room does your family spend most of the time in?',
        answer: "Definitely the living room. It's basically the heart of our home, where everyone sits down, catches up, and relaxes after a long day. We usually drink tea or watch something together in the evening. It's spacious enough that nobody feels cramped.",
        phrases: [
          { phrase: 'the heart of our home', find: 'the heart of our home', uz: 'uyimizning markazi', def: 'the most important, central part of a home', ex1: 'The living room is the heart of our home.', ex2: 'The kitchen is often the heart of the home.' },
          { phrase: 'sits down', find: 'sits down', uz: "o'tiradi", def: 'to take a seat', ex1: 'Everyone sits down in the living room.', ex2: 'Please sit down and relax.' },
          { phrase: 'catches up', find: 'catches up', uz: 'gaplashib yangilik almashadi', def: 'to share recent news with someone', ex1: 'We sit down and catch up after a long day.', ex2: "Let's catch up over coffee sometime." },
          { phrase: 'after a long day', find: 'after a long day', uz: 'uzoq kundan keyin', def: 'at the end of a tiring day', ex1: 'We relax together after a long day.', ex2: 'I like to read after a long day.' },
          { phrase: 'feels cramped', find: 'feels cramped', uz: 'siqilgan his qiladi', def: "to feel there isn't enough space", ex1: 'The room is big enough that nobody feels cramped.', ex2: 'Small apartments can feel cramped with furniture.' },
        ],
      },
      {
        q: 'What can you see from the windows where you live?',
        answer: "I mostly look out over the courtyard. There are a few trees, benches, and a small playground where kids usually hang out. It's nothing spectacular, but watching the area come alive gives me a quick break from staring at my screen.",
        phrases: [
          { phrase: 'look out over', find: 'look out over', uz: "yuqoridan ko'rib turmoq", def: 'to have a view over something from above', ex1: 'I look out over the courtyard from my window.', ex2: 'The balcony looks out over the garden.' },
          { phrase: 'hang out', find: 'hang out', uz: "vaqt o'tkazmoq", def: 'to spend time somewhere casually', ex1: 'Kids usually hang out at the playground.', ex2: 'We hang out there every afternoon.' },
          { phrase: 'nothing spectacular', find: 'nothing spectacular', uz: 'ajoyib darajada emas', def: 'not especially impressive', ex1: "The view is nothing spectacular, but it's nice.", ex2: 'The show was nothing spectacular.' },
          { phrase: 'come alive', find: 'come alive', uz: 'jonlanmoq', def: 'to become lively and active', ex1: 'The courtyard comes alive in the evening.', ex2: 'The street comes alive at night.' },
          { phrase: 'a quick break', find: 'a quick break', uz: 'qisqa tanaffus', def: 'a short pause from work', ex1: 'Watching outside gives me a quick break from my screen.', ex2: "Let's take a quick break and stretch." },
        ],
      },
      {
        q: 'Do you prefer living in a house or a flat?',
        answer: "Right now, I'm definitely team apartment. It's easier to maintain, quicker to clean, and fits my busy schedule way better. A house gives you more space, but it also comes with more responsibility. Maybe later in life - just not at the moment.",
        phrases: [
          { phrase: 'team apartment', find: 'team apartment', uz: 'kvartira tarafdori', def: 'a person who prefers apartment living', ex1: "I'm definitely team apartment right now.", ex2: 'Are you team house or team apartment?' },
          { phrase: 'easier to maintain', find: 'easier to maintain', uz: 'saqlash va parvarishlash osonroq', def: 'simpler to take care of', ex1: 'An apartment is easier to maintain than a house.', ex2: 'Small gardens are easier to maintain.' },
          { phrase: 'busy schedule', find: 'busy schedule', uz: 'band jadval', def: 'a full, tightly-packed timetable', ex1: 'An apartment fits my busy schedule better.', ex2: 'She has a busy schedule this week.' },
          { phrase: 'comes with more responsibility', find: 'comes with more responsibility', uz: "ko'proq mas'uliyat talab qiladi", def: 'involves extra duties or obligations', ex1: 'A house comes with more responsibility.', ex2: 'A promotion comes with more responsibility.' },
          { phrase: 'not at the moment', find: 'not at the moment', uz: 'hozircha emas', def: 'not right now', ex1: 'Maybe later, but not at the moment.', ex2: "I'm not free right now, not at the moment." },
        ],
      },
      {
        q: 'What would you like to change in your flat?',
        answer: "I'd probably make my room a little bigger. My bed and workspace are pretty close together, so it can feel tight when I'm checking papers or planning lessons. A larger desk area would help me stay organized. For now, though, I manage just fine.",
        phrases: [
          { phrase: 'a little bigger', find: 'a little bigger', uz: 'biroz kattaroq', def: 'somewhat larger in size', ex1: "I'd make my room a little bigger.", ex2: 'The new office is a little bigger.' },
          { phrase: 'close together', find: 'close together', uz: 'bir-biriga yaqin', def: 'near each other with little space between', ex1: 'My bed and desk are close together.', ex2: 'The buildings here are close together.' },
          { phrase: 'feel tight', find: 'feel tight', uz: 'tor tuyulmoq', def: "to feel like there's not enough space", ex1: "The room can feel tight when I'm working.", ex2: 'The apartment feels tight with all the furniture.' },
          { phrase: 'stay organized', find: 'stay organized', uz: "tartibli bo'lib qolmoq", def: 'to keep things neat and in order', ex1: 'A bigger desk would help me stay organized.', ex2: 'I use folders to stay organized.' },
          { phrase: 'manage just fine', find: 'manage just fine', uz: 'bemalol uddalamoq', def: 'to cope well without problems', ex1: 'For now, I manage just fine.', ex2: 'We manage just fine with the small kitchen.' },
        ],
      },
    ],
  },

  {
    id: 'hometown',
    title: 'Hometown',
    icon: '🏙️',
    questions: [
      {
        q: 'Please describe your hometown a little.',
        answer: "I'm from Tashkent, and my neighborhood is pretty calm even though the city itself is huge. It has tree-lined streets, small local shops, and a park just around the corner. Everything feels familiar, so coming back after a long day always feels like hitting reset.",
        phrases: [
          { phrase: 'tree-lined streets', find: 'tree-lined streets', uz: 'daraxtzor ko\u2019chalar', def: 'streets with trees planted along them', ex1: 'My neighborhood has tree-lined streets.', ex2: 'We walked down a tree-lined street.' },
          { phrase: 'just around the corner', find: 'just around the corner', uz: 'juda yaqin joyda', def: 'very close by', ex1: 'There\u2019s a park just around the corner.', ex2: 'The shop is just around the corner.' },
          { phrase: 'feels familiar', find: 'feels familiar', uz: 'tanish tuyuladi', def: 'seems recognizable or known', ex1: 'Everything here feels familiar to me.', ex2: 'The city felt familiar after a few visits.' },
          { phrase: 'after a long day', find: 'after a long day', uz: 'uzoq kundan keyin', def: 'at the end of a tiring day', ex1: 'Coming home after a long day feels great.', ex2: 'I relax after a long day at work.' },
          { phrase: 'hitting reset', find: 'hitting reset', uz: 'ruhiy jihatdan yangilanish', def: 'refreshing mentally, starting fresh', ex1: 'Coming home feels like hitting reset.', ex2: 'A short walk feels like hitting reset for me.' },
        ],
      },
      {
        q: 'Is that a big city or a small place?',
        answer: "Tashkent is definitely a big city, but my area has more of a small-town feel. I've lived there for years, so I recognize most of the local faces and know where everything is. It gives me city convenience without making the place feel cold or overwhelming.",
        phrases: [
          { phrase: 'a small-town feel', find: 'a small-town feel', uz: 'kichik shaharcha muhiti', def: 'the atmosphere of a small town', ex1: 'My area has more of a small-town feel.', ex2: 'The village has a real small-town feel.' },
          { phrase: 'local faces', find: 'local faces', uz: 'mahalliy tanish odamlar', def: 'people you recognize in your area', ex1: 'I recognize most of the local faces.', ex2: 'You get to know local faces over time.' },
          { phrase: 'city convenience', find: 'city convenience', uz: 'shahar qulayliklari', def: 'the practical benefits of living in a city', ex1: 'It gives me city convenience without the crowds.', ex2: 'I enjoy the city convenience of having shops nearby.' },
          { phrase: 'feel cold', find: 'feel cold', uz: 'sovuqqon tuyulmoq', def: 'to seem unfriendly or distant', ex1: 'Big cities can feel cold to newcomers.', ex2: 'The office felt cold and impersonal.' },
          { phrase: 'overwhelming', find: 'overwhelming', uz: 'haddan tashqari bosimli', def: 'too much to handle at once', ex1: 'Some cities can feel overwhelming.', ex2: 'The crowd was overwhelming at first.' },
        ],
      },
      {
        q: 'What is your town well-known for?',
        answer: "Tashkent is mainly known for its wide streets, modern parks, and mix of old and new architecture. There are also plenty of green spaces where families hang out in the evenings. To me, that balance is what gives the city its character.",
        phrases: [
          { phrase: 'mainly known for', find: 'mainly known for', uz: 'asosan ... bilan mashhur', def: 'recognized mostly for a certain feature', ex1: 'Tashkent is mainly known for its wide streets.', ex2: 'The town is mainly known for its old bridge.' },
          { phrase: 'mix of old and new', find: 'mix of old and new', uz: 'eski va yangining uyg\u2019unligi', def: 'a combination of traditional and modern', ex1: 'The city has a mix of old and new buildings.', ex2: 'I like the mix of old and new architecture here.' },
          { phrase: 'green spaces', find: 'green spaces', uz: 'yashil hududlar', def: 'parks and areas with plants and trees', ex1: 'There are plenty of green spaces in the city.', ex2: 'The new park added more green spaces.' },
          { phrase: 'hang out', find: 'hang out', uz: "birga vaqt o'tkazmoq", def: 'to spend time together casually', ex1: 'Families hang out in the parks in the evening.', ex2: 'We hang out downtown on weekends.' },
          { phrase: 'gives the city its character', find: 'gives the city its character', uz: 'shaharga o\u2019ziga xoslik beradi', def: 'makes a city unique and distinctive', ex1: 'That balance gives the city its character.', ex2: 'Old buildings give the city its character.' },
        ],
      },
      {
        q: 'Do you like your hometown?',
        answer: "Yeah, I'm pretty attached to it. Most of my closest friends and memories are there, and I know the city like the back of my hand. It may not be perfect, but it feels comfortable and grounded. That sense of belonging is hard to replace.",
        phrases: [
          { phrase: 'pretty attached to it', find: 'pretty attached to it', uz: 'unga ancha bog\u2019langanman', def: 'to feel a strong emotional connection', ex1: "I'm pretty attached to my hometown.", ex2: "She's pretty attached to her childhood house." },
          { phrase: 'closest friends', find: 'closest friends', uz: 'eng yaqin do\u2019stlar', def: 'your best, most trusted friends', ex1: 'My closest friends live in my hometown.', ex2: 'I still talk to my closest friends daily.' },
          { phrase: 'like the back of my hand', find: 'like the back of my hand', uz: 'juda yaxshi bilmoq', def: 'to know something extremely well', ex1: 'I know the city like the back of my hand.', ex2: 'He knows the market like the back of his hand.' },
          { phrase: 'sense of belonging', find: 'sense of belonging', uz: "o'z joyingda ekanlik hissi", def: 'feeling like you fit in somewhere', ex1: 'Living there gives me a sense of belonging.', ex2: 'The club gave her a sense of belonging.' },
          { phrase: 'hard to replace', find: 'hard to replace', uz: "o'rnini bosish qiyin", def: 'difficult to find something equally good', ex1: 'That sense of belonging is hard to replace.', ex2: 'A good friend is hard to replace.' },
        ],
      },
      {
        q: 'How long have you been living there?',
        answer: "I've lived there for around twenty years, basically my whole life. I was born in the same district and never moved far away. Staying in one place for that long has made me feel really grounded, and it's shaped most of my daily habits.",
        phrases: [
          { phrase: 'my whole life', find: 'my whole life', uz: 'butun umrim davomida', def: 'for the entire length of your life', ex1: "I've lived there my whole life.", ex2: "She's played piano her whole life." },
          { phrase: 'was born in', find: 'was born in', uz: 'da tug\u2019ilganman', def: 'to have been born in a place', ex1: 'I was born in the same district.', ex2: 'He was born in a small village.' },
          { phrase: 'moved far away', find: 'moved far away', uz: "uzoq joyga ko'chib ketmoq", def: 'to relocate to a distant place', ex1: 'I never moved far away from home.', ex2: 'They moved far away for work.' },
          { phrase: 'feel really grounded', find: 'feel really grounded', uz: 'juda barqaror his qilmoq', def: 'to feel stable and secure', ex1: 'Staying in one place makes me feel grounded.', ex2: 'Family helps me feel really grounded.' },
          { phrase: 'shaped most of my daily habits', find: 'shaped most of my daily habits', uz: 'kundalik odatlarimni shakllantirdi', def: "influenced someone's everyday routines", ex1: 'Living there shaped most of my daily habits.', ex2: 'School shaped most of my study habits.' },
        ],
      },
      {
        q: 'How has your town changed over the last 20 years?',
        answer: "It's changed a lot. There are more shopping centers, wider roads, and modern apartment buildings than there used to be. The city looks cleaner and more developed now, although I sometimes miss the quieter, old-school atmosphere it had when I was younger.",
        phrases: [
          { phrase: 'changed a lot', find: 'changed a lot', uz: "juda ko'p o'zgargan", def: 'changed significantly', ex1: 'The city has changed a lot in 20 years.', ex2: 'Technology has changed a lot recently.' },
          { phrase: 'than there used to be', find: 'than there used to be', uz: "avvalgidan ko'ra", def: 'compared to how it was before', ex1: 'There are more buildings than there used to be.', ex2: 'Prices are higher than there used to be.' },
          { phrase: 'more developed', find: 'more developed', uz: "ko'proq rivojlangan", def: 'more advanced or modern', ex1: 'The city looks more developed now.', ex2: 'This area is more developed than before.' },
          { phrase: 'sometimes miss', find: 'sometimes miss', uz: 'ba\u2019zan sog\u2019inmoq', def: 'to occasionally feel nostalgic for something', ex1: 'I sometimes miss the old atmosphere.', ex2: 'I sometimes miss my school days.' },
          { phrase: 'old-school atmosphere', find: 'old-school atmosphere', uz: 'eski davr muhiti', def: 'a traditional, nostalgic feeling', ex1: 'It had an old-school atmosphere when I was younger.', ex2: 'The café has an old-school atmosphere.' },
        ],
      },
      {
        q: 'Do you ever spend time in the countryside?',
        answer: "Yeah, once in a while. My relatives live outside Tashkent, so I go there when I need a break from the city. We usually drink tea outside, walk near the fields, and take things slow. The peaceful vibe helps me recharge.",
        phrases: [
          { phrase: 'once in a while', find: 'once in a while', uz: 'vaqti-vaqti bilan', def: 'occasionally', ex1: 'I visit the countryside once in a while.', ex2: 'We eat out once in a while.' },
          { phrase: 'need a break', find: 'need a break', uz: "tanaffus kerak bo'lmoq", def: 'to require rest from something', ex1: 'I go there when I need a break from the city.', ex2: 'Everyone needs a break sometimes.' },
          { phrase: 'take things slow', find: 'take things slow', uz: 'shoshilmay yashamoq', def: 'to do things without rushing', ex1: 'In the countryside, we take things slow.', ex2: "Let's take things slow this weekend." },
          { phrase: 'peaceful vibe', find: 'peaceful vibe', uz: 'sokin muhit', def: 'a calm, relaxing atmosphere', ex1: 'The countryside has a peaceful vibe.', ex2: 'The café has a peaceful vibe in the morning.' },
          { phrase: 'recharge', find: 'recharge', uz: "energiya yig'moq", def: 'to restore your energy', ex1: 'The peaceful vibe helps me recharge.', ex2: 'A short holiday helps me recharge.' },
        ],
      },
      {
        q: 'What is the difference between living in the countryside and the city?',
        answer: "The biggest difference is the pace of life. Cities give you more opportunities and convenience, but everything moves fast and people are always on the go. The countryside is quieter and more laid-back. I think one gives you momentum, while the other gives you breathing room.",
        phrases: [
          { phrase: 'the pace of life', find: 'the pace of life', uz: "hayot sur'ati", def: 'the speed at which life moves', ex1: 'The biggest difference is the pace of life.', ex2: 'The pace of life is slower in villages.' },
          { phrase: 'on the go', find: 'on the go', uz: 'doim harakatda', def: 'constantly busy and active', ex1: 'People in the city are always on the go.', ex2: "I'm always on the go during weekdays." },
          { phrase: 'laid-back', find: 'laid-back', uz: 'sokin va stresssiz', def: 'relaxed and easy-going', ex1: 'The countryside is quieter and more laid-back.', ex2: 'He has a laid-back personality.' },
          { phrase: 'gives you momentum', find: 'gives you momentum', uz: 'oldinga harakat beradi', def: 'provides energy to keep progressing', ex1: 'City life gives you momentum.', ex2: 'Early success gives you momentum.' },
          { phrase: 'breathing room', find: 'breathing room', uz: 'erkinlik va xotirjamlik', def: 'space to relax without pressure', ex1: 'The countryside gives you breathing room.', ex2: 'A day off gives me breathing room.' },
        ],
      },
      {
        q: 'What do people living in the countryside like to do?',
        answer: "A lot of people spend time outdoors, look after animals, grow things, or sit together over tea. From what I've seen, life there is more community-based and less rushed. People seem to enjoy simple routines and being close to nature.",
        phrases: [
          { phrase: 'spend time outdoors', find: 'spend time outdoors', uz: "ochiq havoda vaqt o'tkazmoq", def: 'to be outside rather than indoors', ex1: 'People spend time outdoors in the countryside.', ex2: 'We spent time outdoors during the holiday.' },
          { phrase: 'look after animals', find: 'look after animals', uz: 'hayvonlarga qaramoq', def: 'to take care of animals', ex1: 'Many people look after animals there.', ex2: 'She looks after animals on the farm.' },
          { phrase: "from what I've seen", find: "From what I've seen", uz: 'ko\u2019rganlarimga qaraganda', def: 'based on personal observation', ex1: "From what I've seen, life there is calmer.", ex2: "From what I've seen, the food is great." },
          { phrase: 'less rushed', find: 'less rushed', uz: 'kamroq shoshilinch', def: 'not hurried, more relaxed', ex1: 'Life there is less rushed than in the city.', ex2: 'Weekends feel less rushed than weekdays.' },
          { phrase: 'close to nature', find: 'close to nature', uz: 'tabiatga yaqin', def: 'near natural surroundings', ex1: 'People there feel close to nature.', ex2: 'I love being close to nature on holidays.' },
        ],
      },
      {
        q: 'What do you like to do in the countryside?',
        answer: "I usually unplug for a while and walk around the fields. I try to stay off my phone, breathe some fresh air, and clear my head. Nothing dramatic - just slowing down and enjoying the quiet. That's usually enough to reset me.",
        phrases: [
          { phrase: 'unplug for a while', find: 'unplug for a while', uz: 'bir muddat texnologiyadan uzilmoq', def: 'to disconnect from devices temporarily', ex1: 'I usually unplug for a while in the countryside.', ex2: "It's good to unplug for a while on holiday." },
          { phrase: 'stay off my phone', find: 'stay off my phone', uz: 'telefonimdan uzoq turmoq', def: 'to avoid using your phone', ex1: 'I try to stay off my phone there.', ex2: 'I stay off my phone during meals.' },
          { phrase: 'fresh air', find: 'fresh air', uz: 'toza havo', def: 'clean, natural outdoor air', ex1: 'I like to breathe some fresh air.', ex2: "Let's get some fresh air outside." },
          { phrase: 'clear my head', find: 'clear my head', uz: 'fikrimni tiniqlashtirmoq', def: 'to relax and stop worrying', ex1: 'Walking helps me clear my head.', ex2: 'A short break helps clear my head.' },
          { phrase: 'reset me', find: 'reset me', uz: 'meni qayta tiklamoq', def: 'to refresh and restore someone', ex1: 'The quiet countryside is enough to reset me.', ex2: 'A good sleep can reset me completely.' },
        ],
      },
      {
        q: 'Would you like to live in the countryside in the future?',
        answer: "Not full-time, to be honest. I like being close to work, friends, and everything the city offers. Still, I'd be down to have a small weekend place outside Tashkent. City during the week and countryside on weekends sounds like the best of both worlds.",
        phrases: [
          { phrase: 'full-time', find: 'full-time', uz: 'doimiy ravishda', def: 'permanently, all the time', ex1: "I wouldn't live there full-time.", ex2: 'She works full-time at the office.' },
          { phrase: 'everything the city offers', find: 'everything the city offers', uz: 'shahar taklif qiladigan barcha imkoniyatlar', def: 'all the benefits and opportunities of a city', ex1: 'I like everything the city offers.', ex2: 'Everything the city offers keeps me here.' },
          { phrase: 'be down to', find: "I'd be down to", uz: "tayyor bo'lmoq", def: 'to be willing to do something', ex1: "I'd be down to have a weekend place.", ex2: "He's down to try that new place." },
          { phrase: 'weekend place', find: 'weekend place', uz: 'dam olish kunlari uchun uy', def: 'a home used only on weekends', ex1: "We'd love a small weekend place outside the city.", ex2: 'They bought a weekend place by the lake.' },
          { phrase: 'the best of both worlds', find: 'the best of both worlds', uz: 'har ikki tomonning eng yaxshi jihatlari', def: 'the advantages of two different things combined', ex1: 'It sounds like the best of both worlds.', ex2: 'Remote work gives the best of both worlds.' },
        ],
      },
      {
        q: 'Have you ever lived in the countryside?',
        answer: "No, I've only stayed there for short visits and family holidays. I once spent a full week at my relatives' place, and I enjoyed the peace, but I realized I'm more of a city person. I'd happily visit again, though.",
        phrases: [
          { phrase: 'short visits', find: 'short visits', uz: 'qisqa tashriflar', def: 'brief trips or stays', ex1: "I've only stayed there for short visits.", ex2: 'We made a few short visits last year.' },
          { phrase: 'a full week', find: 'a full week', uz: "to'liq bir hafta", def: 'an entire week', ex1: 'I once spent a full week there.', ex2: "She stayed a full week at her aunt's." },
          { phrase: "at my relatives' place", find: "at my relatives' place", uz: 'qarindoshlarimnikida', def: "at the home of one's relatives", ex1: "I spent a week at my relatives' place.", ex2: "We celebrated the holiday at my relatives' place." },
          { phrase: 'a city person', find: 'a city person', uz: 'shahar hayotini yoqtiradigan odam', def: 'someone who prefers city life', ex1: "I realized I'm more of a city person.", ex2: "He's always been a city person." },
          { phrase: 'happily visit again', find: 'happily visit again', uz: 'yana mamnuniyat bilan bormoq', def: 'to be glad to return somewhere', ex1: "I'd happily visit again someday.", ex2: "I'd happily visit that café again." },
        ],
      },
      {
        q: 'Do you think you will continue living there for a long time?',
        answer: "Most likely, yeah. My work, family, and daily routine are all built around Tashkent, so moving away isn't really on my radar right now. I might try living abroad for the experience someday, but this city will probably remain my home base.",
        phrases: [
          { phrase: 'most likely', find: 'Most likely', uz: 'katta ehtimol bilan', def: 'probably, very likely', ex1: "Most likely, I'll stay here for years.", ex2: 'Most likely, it will rain tomorrow.' },
          { phrase: 'built around', find: 'built around', uz: 'atrofida qurilgan', def: 'organized or centered on something', ex1: 'My life is built around Tashkent.', ex2: 'The schedule is built around work hours.' },
          { phrase: 'moving away', find: 'moving away', uz: "boshqa joyga ko'chib ketish", def: 'relocating to a different place', ex1: "Moving away isn't on my radar right now.", ex2: 'Moving away from home was hard.' },
          { phrase: 'on my radar', find: 'on my radar', uz: "rejamda yoki e'tiborimda", def: "something you're considering or aware of", ex1: "It's not really on my radar right now.", ex2: 'That plan is on my radar for next year.' },
          { phrase: 'my home base', find: 'my home base', uz: 'asosiy yashash joyim', def: 'the main place someone considers home', ex1: 'This city will remain my home base.', ex2: 'Tashkent has always been my home base.' },
        ],
      },
    ],
  },

  {
    id: 'work-studies',
    title: 'Work & Studies',
    icon: '💼',
    questions: [
      {
        q: 'Do you work or are you a student?',
        answer: "Right now, I work as an English teacher at a learning center. I mainly teach Beginner and Elementary groups, and I also help students prepare for IELTS. My schedule can get pretty hectic, but every class has its own vibe, so the job never feels repetitive.",
        phrases: [
          { phrase: 'right now', find: 'Right now', uz: 'hozirda', def: 'at the present moment', ex1: 'Right now, I work as a teacher.', ex2: "Right now, I'm studying for an exam." },
          { phrase: 'work as', find: 'work as', uz: "bo'lib ishlamoq", def: 'to have a job in a certain role', ex1: 'I work as an English teacher.', ex2: 'She works as a nurse at the hospital.' },
          { phrase: 'prepare for IELTS', find: 'prepare for IELTS', uz: 'IELTSga tayyorlanmoq', def: 'to study and get ready for the IELTS exam', ex1: 'I help students prepare for IELTS.', ex2: "I'm preparing for IELTS next month." },
          { phrase: 'pretty hectic', find: 'pretty hectic', uz: "ancha tig'iz", def: 'very busy and full of activity', ex1: 'My schedule can get pretty hectic.', ex2: 'Mornings at the office are pretty hectic.' },
          { phrase: 'has its own vibe', find: 'has its own vibe', uz: "o'ziga xos muhiti bor", def: 'has a unique feeling or atmosphere', ex1: 'Every class has its own vibe.', ex2: 'Each city has its own vibe.' },
        ],
      },
      {
        q: 'Why did you choose that job?',
        answer: "I've always been into English, and teaching felt like a natural fit. Even before I became a teacher, my friends would ask me to break grammar down for them. I realized I genuinely enjoyed making difficult ideas easier, so turning that into a career just made sense.",
        phrases: [
          { phrase: 'been into English', find: 'been into English', uz: 'ingliz tiliga qiziqib kelmoq', def: 'to have long liked or been interested in English', ex1: "I've always been into English.", ex2: "She's been into music since childhood." },
          { phrase: 'a natural fit', find: 'a natural fit', uz: 'juda mos keladigan narsa', def: 'something that suits someone perfectly', ex1: 'Teaching felt like a natural fit for me.', ex2: 'This job is a natural fit for his skills.' },
          { phrase: 'break grammar down', find: 'break grammar down', uz: 'grammatikani sodda tushuntirmoq', def: 'to explain grammar in a simple way', ex1: 'My friends asked me to break grammar down.', ex2: 'I love breaking difficult topics down for students.' },
          { phrase: 'turning that into a career', find: 'turning that into a career', uz: 'buni kasbga aylantirish', def: 'making a passion into a profession', ex1: 'I ended up turning that into a career.', ex2: 'He turned his hobby into a career.' },
          { phrase: 'made sense', find: 'made sense', uz: "mantiqan to'g'ri bo'ldi", def: 'seemed logical or reasonable', ex1: 'Becoming a teacher just made sense.', ex2: 'Moving closer to work made sense.' },
        ],
      },
      {
        q: 'Do you like your job?',
        answer: "Yeah, I genuinely do. Working with students keeps things lively, and seeing someone finally get it never gets old. A strong class can instantly boost my mood, even after a long day. The planning takes time, but watching people improve makes it totally worth it.",
        phrases: [
          { phrase: 'keeps things lively', find: 'keeps things lively', uz: 'muhitni jonli saqlaydi', def: 'keeps the atmosphere interesting and active', ex1: 'Working with students keeps things lively.', ex2: 'Music keeps things lively at parties.' },
          { phrase: 'get it', find: 'get it', uz: 'tushunib yetmoq', def: 'to understand something', ex1: 'Seeing a student finally get it feels great.', ex2: 'Now I get it, thanks for explaining.' },
          { phrase: 'never gets old', find: 'never gets old', uz: "hech qachon zeriktirmaydi", def: 'never becomes boring, even over time', ex1: 'That feeling never gets old.', ex2: 'Watching sunsets never gets old for me.' },
          { phrase: 'boost my mood', find: 'boost my mood', uz: "kayfiyatimni ko'tarmoq", def: "to improve someone's mood", ex1: 'A good class can boost my mood.', ex2: 'Exercise always boosts my mood.' },
          { phrase: 'totally worth it', find: 'totally worth it', uz: "to'liq arziydi", def: 'completely deserving of the effort', ex1: 'Watching students improve makes it totally worth it.', ex2: 'The long trip was totally worth it.' },
        ],
      },
      {
        q: 'Is there anything you dislike about your job?',
        answer: "The biggest downside is probably the amount of checking. With so many students, notebooks pile up fast, and going through everything after class can be draining. Still, I push through because detailed feedback is what actually helps their writing improve. It's tiring, but it comes with the job.",
        phrases: [
          { phrase: 'the biggest downside', find: 'The biggest downside', uz: 'eng katta salbiy tomoni', def: 'the main disadvantage', ex1: 'The biggest downside is the amount of checking.', ex2: 'The biggest downside of the job is the commute.' },
          { phrase: 'pile up', find: 'pile up', uz: 'uyulib ketmoq', def: 'to accumulate or build up', ex1: 'Notebooks pile up fast with many students.', ex2: 'Emails pile up over the weekend.' },
          { phrase: 'going through', find: 'going through', uz: 'birma-bir ko\u2019rib chiqish', def: 'to review or examine carefully', ex1: 'Going through everything after class is tiring.', ex2: "I'm going through all the reports today." },
          { phrase: 'push through', find: 'push through', uz: 'qiyinchilikka qaramay davom etmoq', def: 'to keep going despite difficulty', ex1: 'I push through because it helps students.', ex2: 'We pushed through the tough project together.' },
          { phrase: 'comes with the job', find: 'comes with the job', uz: 'ishning bir qismi hisoblanadi', def: 'is a normal, expected part of a job', ex1: "It's tiring, but it comes with the job.", ex2: 'Long hours come with the job sometimes.' },
        ],
      },
      {
        q: 'What was your dream job when you were young?',
        answer: "When I was little, I was dead set on becoming a footballer. I'd watch Real Madrid, then spend hours outside pretending I was scoring the winning goal. Obviously, life took me in a different direction, but football is still my go-to escape after a busy week.",
        phrases: [
          { phrase: 'dead set on', find: 'dead set on', uz: "qat'iy qaror qilgan", def: 'firmly determined about something', ex1: 'I was dead set on becoming a footballer.', ex2: "She's dead set on studying abroad." },
          { phrase: 'the winning goal', find: 'the winning goal', uz: "g'alaba goli", def: "the goal that decides a game's victory", ex1: 'I imagined scoring the winning goal.', ex2: 'He scored the winning goal in the final.' },
          { phrase: 'took me in a different direction', find: 'took me in a different direction', uz: "hayotimni boshqa yo'lga burdi", def: 'led someone to a different path in life', ex1: 'Life took me in a different direction.', ex2: 'University took me in a different direction.' },
          { phrase: 'my go-to escape', find: 'my go-to escape', uz: 'doimiy dam olish usulim', def: 'a regular way someone relaxes or unwinds', ex1: 'Football is still my go-to escape.', ex2: 'Reading is my go-to escape after work.' },
          { phrase: 'after a busy week', find: 'after a busy week', uz: 'band haftadan keyin', def: 'at the end of a hectic week', ex1: 'I relax with football after a busy week.', ex2: 'We rest after a busy week.' },
        ],
      },
    ],
  },

  {
    id: 'carrying-things',
    title: 'Carrying Things',
    icon: '🎒',
    questions: [
      {
        q: 'What do you do if your item is heavy?',
        answer: "To be honest, if something is really heavy, I usually try to make it easier for myself. Since I'm a pretty active 22-year-old, I normally lift it, but I try to be smart about it. For example, when I bring a big box of books to my English classes, I shift the weight and take short breaks. I think it's better to be safe than sorry, because hurting your back is no joke. If it's too much, I just ask someone nearby to give me a hand. So yeah, I try to lift it, but in a careful, work smarter, not harder way.",
        phrases: [
          { phrase: 'give me a hand', find: 'give me a hand', uz: 'yordam bermoq', def: 'to help someone with something', ex1: "I ask someone to give me a hand if it's too heavy.", ex2: 'Can you give me a hand with these bags?' },
          { phrase: 'better to be safe than sorry', find: 'better to be safe than sorry', uz: "ehtiyot bo'lgan yaxshi", def: "it's wiser to be careful than to regret later", ex1: "I think it's better to be safe than sorry with heavy items.", ex2: 'Wear a helmet — better to be safe than sorry.' },
        ],
      },
      {
        q: 'When you go out, what do you carry with you?',
        answer: "Whenever I go out, I usually carry just the essentials. Because my schedule as an English teacher is packed, I like to keep things simple. For instance, I always take my phone, headphones, power bank, and my small black backpack. I feel more organised when I have these things with me—it keeps my day running smoothly. Sometimes I also carry a small notebook for lesson ideas. So yeah, nothing crazy—just the basics that keep me on track.",
        phrases: [
          { phrase: 'essentials', find: 'the essentials', uz: 'eng kerakli narsalar', def: 'the most necessary items', ex1: 'I usually carry just the essentials.', ex2: 'Pack only the essentials for the trip.' },
          { phrase: 'packed schedule', find: 'is packed', uz: 'juda band jadval', def: 'a very full, busy timetable', ex1: 'My schedule as a teacher is pretty packed.', ex2: 'She has a packed schedule this semester.' },
        ],
      },
      {
        q: 'When you go to different places, do you carry different kinds of things?',
        answer: "Yeah, I definitely carry different things depending on where I'm going. Since my day changes a lot, my bag also changes with it. For example, if I'm going to the gym, I take gloves and a water bottle, but for work, I bring books and markers. I actually enjoy switching things up—it makes me feel more prepared. It's like each place comes with its own mini-checklist in my head. So yes, my stuff changes based on the destination.",
        phrases: [
          { phrase: 'mini-checklist', find: 'mini-checklist', uz: 'kichik ichki ro\u2019yxat', def: 'a small mental list of things to remember', ex1: 'Each place comes with its own mini-checklist in my head.', ex2: 'I keep a mini-checklist before leaving home.' },
        ],
      },
      {
        q: 'What is the difference between the things you carry in the evening and in the morning?',
        answer: "There's actually a small difference between what I carry in the morning and in the evening. In the morning, my bag is usually fuller because I bring everything I need for classes. For example, I pack books, pens, and snacks since I'm out almost the whole day. But in the evening, I keep things lighter because I'm usually just heading home or meeting a friend. I like that light and relaxed feeling in the evenings—it's a nice way to end the day. So yeah, mornings are heavy, evenings are light.",
        phrases: [
          { phrase: 'light and relaxed feeling', find: 'light and relaxed', uz: 'yengil va yoqimli his', def: 'a feeling of being unburdened and calm', ex1: 'I like that light and relaxed feeling in the evenings.', ex2: 'Finishing work gives me a light and relaxed feeling.' },
        ],
      },
    ],
  },

  {
    id: 'shoes',
    title: 'Shoes',
    icon: '👟',
    questions: [
      {
        q: 'How much money do you usually spend on shoes?',
        answer: "To be honest, I don't spend a huge amount on shoes. As a student, I try to stick to a reasonable budget. For example, the last pair I bought was around 40 or 50 dollars, which is pretty normal for me. I feel like comfort matters more than the price tag. Sometimes I do save up for slightly better quality sneakers, especially if I'm planning to wear them every day. So yeah, I'd say I usually keep it simple.",
        phrases: [
          { phrase: 'price tag', find: 'price tag', uz: 'narx, baho', def: 'the price shown on an item', ex1: 'Comfort matters more than the price tag.', ex2: 'I always check the price tag first.' },
        ],
      },
      {
        q: 'How often do you buy shoes?',
        answer: "I don't buy shoes that often, to be honest. Usually I get a new pair only when my old ones start falling apart. For instance, I bought my last pair after wearing the previous ones for almost a year. I'm not the type who follows every trend, so I don't feel the need to shop all the time. But if I see a really good discount, I might treat myself. So yeah, maybe once or twice a year.",
        phrases: [
          { phrase: 'fall apart', find: 'falling apart', uz: 'yaroqsiz holga kelmoq', def: 'to break down or wear out completely', ex1: 'I get new shoes when my old ones start falling apart.', ex2: 'The old bag finally fell apart.' },
          { phrase: 'treat myself', find: 'treat myself', uz: "o'zimni bir narsa bilan siylash", def: 'to buy something nice for yourself as a reward', ex1: 'If I see a good discount, I might treat myself.', ex2: 'I treated myself to a nice dinner after exams.' },
        ],
      },
      {
        q: 'Have you ever bought shoes online?',
        answer: "Yes, I've bought shoes online a couple of times. I usually do it when I can't find my size in local stores. For example, I once ordered a pair of white sneakers from an online shop because they were out of stock everywhere. I was a bit nervous about the size, but luckily they fit perfectly. Still, I prefer buying in-store because it's safer and more reliable. But online shopping can be a lifesaver sometimes.",
        phrases: [
          { phrase: 'out of stock', find: 'out of stock', uz: 'sotuvdan tugagan', def: 'not available to buy because it\u2019s sold out', ex1: 'The shoes were out of stock everywhere.', ex2: 'That size is out of stock right now.' },
        ],
      },
      {
        q: 'Do you like to wear shoes that are comfortable or good-looking?',
        answer: "Honestly, comfort comes first for me. Since I walk a lot during the day, I need something that doesn't hurt my feet. For example, even if a pair looks cool, I won't buy it if it feels stiff or heavy. I believe that feeling comfortable boosts your confidence anyway. Of course, if a shoe is both stylish and comfortable, that's the best combo. So yeah, comfort all the way.",
        phrases: [
          { phrase: 'stylish / practical combo', find: 'best combo', uz: 'chiroyli va qulay kombinatsiya', def: 'a mix of good looks and usefulness', ex1: "Stylish and comfortable — that's the best combo.", ex2: 'This jacket is a stylish and practical combo.' },
        ],
      },
      {
        q: 'Do people like to wear shoes that are comfortable or good-looking?',
        answer: "I think most people prefer comfortable shoes, especially nowadays. Everyone is busy and on the move, so practicality matters a lot. For example, you'll see many people choosing sneakers instead of formal shoes for daily activities. Still, some people pick good-looking shoes for special occasions or fashion. It really depends on their lifestyle and personality. But overall, comfort wins for everyday life.",
        phrases: [],
      },
      {
        q: 'What is your favourite type of shoes?',
        answer: "My favourite type of shoes is definitely sneakers. They match almost everything I wear and they're super comfortable. For example, I have a simple black pair that I use for classes, walking, and even casual outings. I like how easy they are to style without thinking too much. Plus, they're perfect for someone like me who's always on the go. So yeah, sneakers are my go-to.",
        phrases: [
          { phrase: 'on the go', find: 'on the go', uz: 'doimo harakatda bo\u2019lmoq', def: 'busy and constantly moving', ex1: "I'm always on the go, so I need comfy shoes.", ex2: "She's always on the go between classes." },
          { phrase: 'go-to', find: 'my go-to', uz: 'har doim tanlanadigan eng yaxshi variant', def: 'the option someone always chooses first', ex1: 'Sneakers are my go-to for everything.', ex2: 'Coffee is my go-to in the morning.' },
        ],
      },
    ],
  },

  {
    id: 'plants',
    title: 'Plants',
    icon: '🌱',
    questions: [
      {
        q: 'Do you keep plants?',
        answer: "Yeah, I actually keep a couple of small plants at home. I'm not a huge plant person, but I like having at least one or two around. For example, I bought a tiny cactus for my desk because it basically takes care of itself. It just makes my room feel a bit more alive, you know? Plus, it's nice to see something green when I'm studying or filming content. So yeah, I keep plants—but only the low-maintenance ones.",
        phrases: [
          { phrase: 'takes care of itself', find: 'takes care of itself', uz: "deyarli o'zi o'sadi", def: 'needs almost no attention to survive', ex1: 'My cactus basically takes care of itself.', ex2: 'This plant takes care of itself with little water.' },
          { phrase: 'low-maintenance', find: 'low-maintenance', uz: 'parvarishi oson', def: 'needing very little care', ex1: 'I keep only low-maintenance plants.', ex2: 'Cacti are low-maintenance plants.' },
        ],
      },
      {
        q: 'Have you ever had a plant?',
        answer: "Yes, I've had a few plants before. I remember getting my first plant back in school when our teacher made us grow beans for a project. Mine grew surprisingly fast, and I was kinda proud of it. It felt nice taking care of something, even if it was just a simple plant. Since then, I've randomly bought small plants whenever my room felt too empty. So yeah, I've had plants on and off over the years.",
        phrases: [
          { phrase: 'surprisingly fast', find: 'surprisingly fast', uz: 'kutilmaganda tez', def: 'faster than expected', ex1: 'My bean plant grew surprisingly fast.', ex2: 'The project finished surprisingly fast.' },
        ],
      },
      {
        q: 'Do you know anything about growing a plant?',
        answer: "I know the basics, but I'm definitely not an expert. I've watched a few YouTube videos about taking care of indoor plants. For example, I learned that most plants die because people water them too much, not too little. Honestly, that was surprising, because I always thought plants just needed more water. But overall, I can handle simple things like watering, sunlight, and not killing the plant accidentally. So yeah, I know enough to keep a small plant alive.",
        phrases: [],
      },
      {
        q: 'What plants did you grow when you were younger?',
        answer: "When I was younger, I mostly grew really simple plants. At school, we usually planted beans or onions in cups. I remember watching my onion plant grow super fast and feeling like a mini scientist. It was honestly fun because you could see progress every single day. At home, my parents also let me water flowers in our yard, even though I did it terribly. So yeah, nothing fancy—just basic school plants.",
        phrases: [
          { phrase: 'mini scientist', find: 'mini scientist', uz: 'kichkina olimdek', def: 'someone acting like a curious young researcher', ex1: 'I felt like a mini scientist growing onions.', ex2: 'Kids become mini scientists during experiments.' },
        ],
      },
      {
        q: 'Do people in your country send plants as gifts?',
        answer: "Yeah, people here sometimes give plants as gifts. It's not super common, but it happens on special occasions. For example, people often give small indoor plants during housewarming parties. I think it's actually a nice gift because it lasts longer than flowers. Some people also give succulents because they're cute and easy to take care of. So yes, plants are definitely a gift option in my country.",
        phrases: [
          { phrase: 'housewarming party', find: 'housewarming parties', uz: "yangi uyga ko'chish bazmi", def: 'a party to celebrate a new home', ex1: 'People give plants at housewarming parties.', ex2: 'We had a small housewarming party last week.' },
          { phrase: 'lasts longer', find: 'lasts longer', uz: 'uzoqroq turadi', def: 'continues to be useful for a longer time', ex1: 'A plant lasts longer than cut flowers.', ex2: 'Good shoes last longer if you care for them.' },
          { phrase: 'succulents', find: 'succulents', uz: "suvli o'simliklar", def: 'plants that store water in thick leaves', ex1: 'Some people give succulents as gifts.', ex2: 'Succulents need very little watering.' },
        ],
      },
    ],
  },

  {
    id: 'noisy-places',
    title: 'Noisy Places, Quiet Places',
    icon: '🔇',
    questions: [
      {
        q: 'Do you like quiet or noisy places?',
        answer: "I definitely prefer quiet places over noisy ones. Since I study a lot and create content, noise usually just gets on my nerves. For example, whenever I go to crowded cafés, I can't focus at all — it feels like my brain is buffering. Quiet places just help me think clearly and stay in my own zone. But sometimes, a bit of background noise is okay if I'm with friends. So yeah, overall, I'm a quiet places kind of person.",
        phrases: [
          { phrase: 'gets on my nerves', find: 'gets on my nerves', uz: 'asabimga tegadi', def: 'annoys or irritates someone', ex1: 'Noise usually just gets on my nerves.', ex2: 'Loud chewing gets on my nerves.' },
          { phrase: 'my brain is buffering', find: 'my brain is buffering', uz: 'miyam ishlamay qolgandek', def: 'feeling mentally slow or unable to think', ex1: 'In crowded cafés it feels like my brain is buffering.', ex2: 'With all this noise, my brain is buffering.' },
          { phrase: 'stay in my own zone', find: 'stay in my own zone', uz: "o'z holatimda bo'lish", def: 'to remain focused in your own space', ex1: 'Quiet places help me stay in my own zone.', ex2: 'I like to stay in my own zone while studying.' },
        ],
      },
      {
        q: 'Would you like to go to quiet or noisy places on weekends when you are free?',
        answer: "On weekends, I usually choose quiet places. After a long week of teaching and studying, my mind just wants peace. I often go to a calm park or a chill coffee shop where I can recharge and plan my week. It just feels refreshing — like pressing a mental reset button. But if my friends insist, I don't mind going somewhere lively once in a while. So yeah, weekends are mostly for quiet vibes for me.",
        phrases: [
          { phrase: 'recharge', find: 'recharge', uz: "energiya yig'ish", def: 'to restore your energy', ex1: 'A calm park helps me recharge.', ex2: 'I recharge with a short walk.' },
          { phrase: 'mental reset button', find: 'mental reset button', uz: 'miyani yangilash', def: 'something that refreshes your mind', ex1: 'It feels like pressing a mental reset button.', ex2: 'A short break is my mental reset button.' },
          { phrase: 'lively places', find: 'lively', uz: 'jonli, shovqinli joylar', def: 'places full of energy and activity', ex1: "I don't mind somewhere lively once in a while.", ex2: 'The market is one of the most lively places in town.' },
        ],
      },
    ],
  },

  {
    id: 'public-places',
    title: 'Public Places',
    icon: '🚏',
    questions: [
      {
        q: "Have you ever talked with someone you don't know in public places?",
        answer: "Yeah, I have — it actually happens more often than I expect. Since I'm usually commuting or grabbing coffee after classes, I meet random people all the time. For example, just last week, a guy asked me for directions at a metro station, and we ended up chatting for a couple of minutes. I don't mind it, because it's a simple way to be a bit more social and break the routine. Plus, talking to strangers sometimes leads to interesting conversations — you never know. So yeah, it definitely happens now and then.",
        phrases: [
          { phrase: 'break the routine', find: 'break the routine', uz: 'odatdagi tartibni buzmoq', def: 'to do something different from usual', ex1: 'Talking to strangers helps break the routine.', ex2: 'A short trip can break the routine nicely.' },
          { phrase: 'you never know', find: 'you never know', uz: 'hech qachon bilmaysan', def: "you can't be sure what might happen", ex1: 'Talking to strangers is interesting — you never know.', ex2: 'Keep trying, you never know what happens.' },
        ],
      },
      {
        q: 'Do you wear headphones in public places?',
        answer: "Yeah, I usually do, especially when I'm out and about. I like listening to music or podcasts while walking to my learning center or going home. For instance, every morning on the bus, I put on my headphones and listen to something to boost my mood. It helps me stay focused and avoid unnecessary noise — you know, public places can get pretty loud. But I always keep the volume low so I can hear what's happening around me. So yeah, headphones are basically part of my daily routine.",
        phrases: [
          { phrase: 'out and about', find: 'out and about', uz: 'moving around, ko\u2019chada', def: 'outside and active, moving around', ex1: "I usually do it when I'm out and about.", ex2: 'We were out and about all afternoon.' },
          { phrase: 'boost my mood', find: 'boost my mood', uz: 'kayfiyatni oshirmoq', def: "to improve someone's mood", ex1: 'Music on the bus helps boost my mood.', ex2: 'Sunny weather always boosts my mood.' },
          { phrase: 'avoid unnecessary noise', find: 'avoid unnecessary noise', uz: 'keraksiz shovqindan qochmoq', def: 'to stay away from unwanted sound', ex1: 'Headphones help me avoid unnecessary noise.', ex2: 'I avoid unnecessary noise while studying.' },
        ],
      },
    ],
  },

  {
    id: 'having-a-break',
    title: 'Having a Break',
    icon: '☕',
    questions: [
      {
        q: 'What do you usually do during a break?',
        answer: "Honestly, I usually just grab my phone and chill for a bit. Since I study a lot, quick breaks help me reset my brain. For example, during classes or self-study sessions, I scroll through Telegram or watch a short motivational video. It makes me feel refreshed, almost like a mini energy boost. Sometimes I also stretch my back because sitting for too long drives me crazy. So yeah, that's my little break routine.",
        phrases: [
          { phrase: 'chill for a bit', find: 'chill for a bit', uz: 'biroz dam olish', def: 'to relax for a short time', ex1: 'I usually grab my phone and chill for a bit.', ex2: "Let's chill for a bit before continuing." },
          { phrase: 'reset my brain', find: 'reset my brain', uz: 'miyamni yangilash', def: 'to refresh your mind after focusing hard', ex1: 'Quick breaks help me reset my brain.', ex2: 'A walk outside helps reset my brain.' },
          { phrase: 'energy boost', find: 'energy boost', uz: "energiya ko'tarilishi", def: 'a quick increase in energy', ex1: 'It feels like a mini energy boost.', ex2: 'Coffee gives me an energy boost.' },
        ],
      },
      {
        q: 'What do you like to do during a break?',
        answer: "I really like to drink something warm, usually tea. It's a small habit I picked up because in Uzbekistan everyone loves tea. For instance, when I'm tired from studying English, I make a quick cup and just stare out the window for a minute. It helps me slow down and clear my thoughts. Sometimes, if I have more time, I listen to a Lo-Fi track to calm my mind. It's simple, but it works wonders for me.",
        phrases: [],
      },
      {
        q: 'How often do you take a break?',
        answer: "I'd say I take a break every hour or so. I try to follow the idea that short breaks improve productivity. For example, after 50 minutes of intense studying, I stand up, stretch, or walk around the room. It keeps me from feeling burned out. Of course, if I'm super focused, I sometimes forget the break entirely. But normally, I try to stick to a healthy rhythm.",
        phrases: [],
      },
      {
        q: 'Do you take a nap when you have a rest?',
        answer: "Sometimes I do, but not very often. As a student, I usually don't have long breaks to sleep properly. But on weekends, I might crash on the sofa for 20 minutes if I'm really tired. It makes me feel surprisingly fresh, like pressing a reset button. Still, if I nap too long, I get a headache, so I try to keep it short. A quick power nap is my best friend on lazy days.",
        phrases: [
          { phrase: 'crash on the sofa', find: 'crash on the sofa', uz: 'divanga yiqilib uxlash', def: 'to fall asleep quickly on a sofa', ex1: 'I might crash on the sofa for 20 minutes.', ex2: 'He crashed on the sofa after work.' },
          { phrase: 'press the reset button', find: 'pressing a reset button', uz: "qayta boshlagandek bo'lish", def: 'to start fresh, feeling renewed', ex1: 'A nap feels like pressing a reset button.', ex2: 'Weekends feel like pressing the reset button.' },
          { phrase: 'power nap', find: 'power nap', uz: 'qisqa, samarali uyqu', def: 'a short, refreshing sleep', ex1: 'A quick power nap is my best friend.', ex2: 'I took a power nap before the exam.' },
        ],
      },
      {
        q: 'How do you feel after taking a nap?',
        answer: "I usually feel pretty refreshed after a nap. My schedule can get hectic, so a short rest helps me recharge. For example, after a tough gym session or a long study day, a 15-minute nap feels like magic. It lifts my mood and helps me focus again. But if I oversleep, I wake up confused and even more tired. So yeah, short naps are the sweet spot for me.",
        phrases: [],
      },
    ],
  },

  {
    id: 'museums',
    title: 'Museums',
    icon: '🏛️',
    questions: [
      {
        q: 'What did you learn from visiting museums and art galleries?',
        answer: "I've learned quite a lot from visiting museums and art galleries. Since I'm interested in history and culture, I usually pay attention to how people lived in the past. For example, I once visited a history museum in Tashkent and learned about ancient Uzbek traditions and tools. It was really eye-opening and made history feel more real. You learn things there that you don't usually find in textbooks. So overall, museums are a great learning experience for me.",
        phrases: [
          { phrase: 'eye-opening', find: 'eye-opening', uz: 'hayratlanarli, yangi fikr beruvchi', def: 'giving new understanding or surprising insight', ex1: 'The visit was really eye-opening.', ex2: 'The documentary was eye-opening for me.' },
        ],
      },
      {
        q: 'Do you think museums are important?',
        answer: "Yes, I definitely think museums are important. They help young people like me understand our roots and cultural identity. For instance, seeing real historical objects makes lessons much more meaningful. I feel museums connect the past with the present in a powerful way. They're also useful for education, not just tourism. So yeah, museums play a big role in society.",
        phrases: [
          { phrase: 'cultural identity', find: 'cultural identity', uz: "madaniy o'zlik", def: 'a sense of belonging to a culture', ex1: 'Museums help us understand our cultural identity.', ex2: 'Traditions shape our cultural identity.' },
          { phrase: 'connect the past with the present', find: 'connect the past with the present', uz: "o'tmish va hozirni bog'lash", def: "to link history with today's world", ex1: 'Museums connect the past with the present.', ex2: 'This exhibit connects the past with the present.' },
        ],
      },
      {
        q: 'Are there many museums in your hometown?',
        answer: "Yes, there are quite a few museums in my hometown. Since I live in a big city, there are different types — history, art, and culture museums. For example, there are museums dedicated to famous writers and historical periods. I think it's great because people have many options to explore. Not everyone visits them often, though. Still, it's nice to have them around.",
        phrases: [],
      },
      {
        q: 'Do you like visiting museums and art galleries?',
        answer: "Yes, I do, but not very frequently. I usually visit them when I want a quiet and meaningful experience. For instance, I prefer museums over noisy places when I want to relax and think. They give me a calm and thoughtful vibe. Art galleries are especially interesting when I'm in the right mood. So yeah, I enjoy them from time to time.",
        phrases: [
          { phrase: 'calm and thoughtful vibe', find: 'calm and thoughtful vibe', uz: "sokin va o'ychan muhit", def: 'a peaceful, reflective atmosphere', ex1: 'Museums give me a calm and thoughtful vibe.', ex2: 'The library has a calm and thoughtful vibe.' },
          { phrase: 'from time to time', find: 'from time to time', uz: 'vaqti-vaqti bilan', def: 'occasionally', ex1: 'I enjoy museums from time to time.', ex2: 'We meet up from time to time.' },
        ],
      },
      {
        q: 'Do you often visit museums?',
        answer: "Not really — I don't visit museums very often. My schedule is usually busy with studying and teaching. I normally go only during holidays or when friends suggest it. Even though I enjoy them, I just don't always have the time. I wish I could go more often in the future. For now, it's more of an occasional activity.",
        phrases: [
          { phrase: 'occasional activity', find: 'occasional activity', uz: 'kamdan-kam qilinadigan ish', def: 'something done not very often', ex1: 'Visiting museums is more of an occasional activity for me.', ex2: 'Hiking is an occasional activity for us.' },
        ],
      },
      {
        q: 'When was the last time you visited a museum?',
        answer: "The last time I visited a museum was a few months ago. I went there with a friend during a free weekend. We visited a local history museum and spent about an hour there. I really enjoyed it and felt relaxed afterward. It reminded me how interesting museums can be. I'm planning to visit another one soon.",
        phrases: [],
      },
    ],
  },
];
