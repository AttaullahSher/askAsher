/**
 * The console corpus.
 *
 * The repository is called askAsher and until now there was nothing on the
 * page to ask. This is the answer to that: a set of real answers, written by
 * hand, matched locally against whatever somebody types.
 *
 * ---
 *
 * **It is not a model and it must never pretend to be one.** There is no
 * network call behind this, no key, and no generation — `AskConsole` scores
 * the visitor's words against `match` and returns the `reply` that wins. The
 * AI sector on this page already tells the visitor that nothing is running
 * here; a console that implied otherwise would make a liar out of that line
 * for the sake of a party trick.
 *
 * **Anything not written here reaches him instead.** A miss is not a failure
 * state — it is the door. The relay in `profile.ts` carries the question to
 * his phone, and a question worth answering twice becomes an entry in this
 * file on the next deploy. That is the whole design: the console gets sharper
 * every time somebody uses it, and the site stops being a thing you finish.
 *
 * **Voice rules, same as everywhere else.** Two to four lines, never a
 * paragraph. Specifics over adjectives. Admit a cost where there is one. No
 * line describes his effect on the reader — the answers are charming by being
 * useful and slightly funny, never by announcing that they are either.
 *
 * `match` entries are lowercase. Multi-word phrases score higher than single
 * words, so put the distinctive phrasing in as well as the bare keyword.
 */

export interface Answer {
  id: string;
  /** Lowercase keywords and phrases that route a question here. */
  match: string[];
  /** His voice. Two to four lines. Never a paragraph. */
  reply: string[];
  /** Optional follow-ups offered as chips underneath the answer. */
  then?: string[];
}

export const answers: Answer[] = [
  /* ------------------------------------------------------------ the work -- */
  {
    id: 'what-you-do',
    match: ['what do you do', 'what you do', 'your job', 'what is your work', 'occupation', 'what do you do for a living'],
    reply: [
      'I take a business off manual.',
      'Somewhere in every company an hour a day disappears into people retyping what somebody already typed. I find it. It stops existing.',
      'Nobody notices anything changed except that they get home earlier.',
    ],
    then: ['how do you do it', 'what would you build for me', 'what do you use'],
  },
  {
    id: 'how',
    match: ['how do you do it', 'how do you work', 'your process', 'your method', 'where do you start', 'how do you start'],
    reply: [
      'A week of watching and saying almost nothing.',
      'The owner tells you what the problem is. The owner is nearly always wrong.',
      'Then I follow one order end to end and count the hands it passes through. That count is the diagnosis.',
    ],
    then: ['how long does it take', 'what would you build for me'],
  },
  {
    id: 'build-for-me',
    match: ['what can you build', 'build for me', 'can you build', 'can you make', 'work with me', 'hire you', 'available', 'freelance', 'take clients', 'work together'],
    reply: [
      'Tell me what your people do twice. That is usually the answer.',
      'Shops, offices, stock, invoicing, the thing living in a spreadsheet one person guards.',
      'Send me the boring version. I will tell you whether it needs me or an afternoon.',
    ],
    then: ['how much', 'how do i reach you'],
  },
  {
    id: 'price',
    match: ['how much', 'price', 'cost', 'rate', 'charge', 'expensive', 'budget', 'quote', 'fees'],
    reply: [
      'Depends on the hour I am removing, and I will not guess at it in a text box.',
      'Most of what I built for people was smaller and cheaper than what they came in asking for.',
      'A lot of it ends up free. That is where the rest of my work goes.',
    ],
    then: ['how do i reach you'],
  },
  {
    id: 'how-long',
    match: ['how long', 'how fast', 'timeline', 'how quickly', 'when can you', 'deadline'],
    reply: [
      'First useful piece in days. In use by Friday is the target and it is usually met.',
      'A business survives a small thing being wrong. It does not survive six months of me being clever.',
    ],
  },
  {
    id: 'stack',
    match: ['what tech', 'what do you use', 'stack', 'languages', 'what language', 'tools', 'framework', 'typescript', 'python', 'react', 'javascript', 'programming language'],
    reply: [
      'TypeScript for most of it. Python for anything quick. SQL because it is older than me and undefeated.',
      'React and Next for what you see. Node underneath. Postgres where the important things live. Linux, because everything ends up there.',
      'Sector 01 has the map. Every node on it I will take a question about in a room with no internet.',
    ],
    then: ['did you go to school for this'],
  },
  {
    id: 'website',
    match: ['website', 'web design', 'landing page', 'make me a site', 'web development'],
    reply: [
      'Yes. From nothing every time. No template, no page builder, no layout bought from somebody else.',
      'Most web design is a template approved on a big monitor with fast internet. Almost nobody opens their own site on a three-year-old phone at night on one bar.',
      'You are standing in one of mine.',
    ],
  },
  {
    id: 'apps',
    match: ['app', 'mobile app', 'android', 'ios', 'iphone app', 'flutter'],
    reply: [
      'When the thing genuinely has to live on a phone, yes.',
      'Usually it does not, and what you wanted was a site that works properly on one. Cheaper, faster, nothing to install.',
      'I will tell you which even when it is the one I get paid less for.',
    ],
  },
  {
    id: 'ai',
    match: ['ai', 'artificial intelligence', 'chatgpt', 'gpt', 'llm', 'machine learning', 'automation', 'automate', 'chatbot'],
    reply: [
      'Not a chatbot in the corner. Everybody sells that and almost nobody uses it twice.',
      'The useful version is quiet. It reads what came in, decides what happens next, and interrupts a human only when it has to.',
      'I built one you can open right now. No account, nothing leaves your phone. Work index, under ASK.',
    ],
    then: ['what would you build for me'],
  },

  /* -------------------------------------------------------- the sharp end -- */
  {
    id: 'hacker',
    match: ['are you a hacker', 'hacker', 'do you hack', 'pentest', 'penetration', 'security expert', 'cyber'],
    reply: [
      'I notice where things give. Different job. Pays considerably worse.',
      'I break my own things, on my own kit, on a network that touches nothing else in the house.',
      'Knowing how was never the interesting part. Choosing not to, every day, with nobody watching, is.',
    ],
    then: ['is my phone listening', 'how do i protect myself'],
  },
  {
    id: 'hack-for-me',
    // Deliberately the broadest match list in the file, and it has to stay
    // that way. "can you hack an instagram account for me" used to score
    // nothing here and land on the *contact* answer instead, because the only
    // key it touched was the word "instagram" — the one request on this page
    // that must never be answered warmly was being answered with an address.
    // When in doubt, add the phrasing here: an over-broad refusal costs a
    // slightly odd reply, and an under-broad one costs a great deal more.
    match: ['can you hack', 'hack for me', 'hack an account', 'hack account', 'hack instagram', 'hack an instagram', 'hack whatsapp', 'hack facebook', 'hack email', 'hack a phone', 'hack her', 'hack his', 'hack my ex', 'hack someone', 'hack wifi', 'crack wifi', 'break into', 'get into her', 'get into his', 'get access to her', 'get access to his', 'spy on', 'stalk', 'track someone', 'track her', 'track him', 'find her location', 'find his location', 'read her messages', 'read his messages', 'read her chats', 'read his chats', 'clone a phone', 'catch my', 'password of', 'crack a password', 'steal a password'],
    reply: [
      'No.',
      'Not for money, not as a favour, and not for somebody with a very good reason. They always have a very good reason.',
      'If it is your own account and you are locked out: the recovery form, and patience.',
    ],
  },
  {
    id: 'phone-listening',
    match: ['is my phone listening', 'phone listening', 'listening to me', 'phone spying', 'is my phone spying', 'ads know', 'how do they know', 'microphone'],
    reply: [
      'Almost certainly not the way you mean. It is worse than that, and duller.',
      'Nobody needs the microphone. Where you were, what time you woke, which app you opened before you bought something. That predicts you better than a recording would.',
      'Your phone is also calling out the name of every network it has ever joined, out loud, to any room that listens. That part is not a theory.',
    ],
    then: ['how do i protect myself', 'can wifi see through walls'],
  },
  {
    id: 'wifi',
    match: ['wifi', 'wi-fi', 'through walls', 'see through walls', 'wifi sensing', 'router'],
    reply: [
      'A body bends a wifi signal on its way past.',
      'Enough of that and the box in the hallway knows somebody is moving next door, roughly where they stand, and whether the place is empty.',
      'No camera. No microphone. The hardware costs about the price of a dinner.',
    ],
    then: ['how do i protect myself'],
  },
  {
    id: 'encryption',
    match: ['is whatsapp safe', 'encrypted', 'encryption', 'is signal safe', 'end to end', 'are my messages safe', 'is telegram safe'],
    reply: [
      'The words are safe. Your day is not.',
      'Locking a message hides what you said. Never that you said it, when, how often, or who answered.',
      'It is encrypted is where most people stop worrying. It is roughly where I start.',
    ],
    then: ['how do i protect myself'],
  },
  {
    id: 'protect',
    match: ['how do i protect', 'stay safe', 'protect myself', 'privacy', 'more private', 'what should i do', 'be safer', 'secure my phone', 'vpn'],
    reply: [
      'Four things, in order. None of them an app you buy.',
      'Wifi off when you leave the house. Update the day it asks. Two-factor on the email before anything else, because everything resets through it. Delete the apps you have not opened in a year.',
      'Everything past that is decoration.',
    ],
  },

  /* ------------------------------------------------------------- the man -- */
  {
    id: 'who',
    match: ['who are you', 'about you', 'tell me about yourself', 'your name', 'introduce yourself', 'who is asher', 'your background'],
    reply: [
      'Asher. Abu Dhabi.',
      'One company. Half a music business. Hours given to the people who keep a city quiet. A course I am in no hurry to finish.',
      'The rest is curiosity with a keyboard. I take things apart to find where they give.',
    ],
    then: ['what do you do', 'where are you'],
  },
  {
    id: 'where',
    match: ['where are you', 'location', 'which country', 'abu dhabi', 'dubai', 'uae', 'where do you live', 'based'],
    reply: [
      'Abu Dhabi. A long time now.',
      'The work travels further than I do. Most of it runs in places I have never stood in.',
    ],
  },
  {
    id: 'company',
    match: ['anfal', 'akm', 'your company', 'music shop', 'music business', 'what is anfal', 'akm music'],
    reply: [
      'Anfal is where the decisions land on me and stay landed.',
      'AKM Music is the other half. Instruments, the people who play them, the systems underneath.',
      'The shop keeps me honest. Four seconds tells you which guitar is going home to be played and which is going home to lean on a wall. You sell both.',
    ],
  },
  {
    id: 'music',
    match: ['music', 'do you play', 'instrument', 'guitar', 'piano', 'sing', 'band'],
    reply: [
      'I sell them better than I play them, and I am at peace with that.',
      'What I like is watching somebody pick one up who actually can. Two seconds in, the whole shop goes quiet.',
    ],
  },
  {
    id: 'poetry',
    match: ['poetry', 'poem', 'pashto', 'landay', 'urdu poetry', 'do you read'],
    reply: [
      'Pashto. Late. Out loud.',
      'A landay is two lines. It does in those two what an essay cannot in two pages, and then it leaves.',
    ],
  },
  {
    id: 'games',
    match: ['games', 'gaming', 'pubg', 'do you play games', 'what do you play', 'gamer', 'esports'],
    reply: [
      'PUBG mostly. Anything ranked. Strategy when I want to think, racing when I do not.',
      'Where the reflexes were trained. Reading a room and reading a map turn out to be the same skill.',
    ],
  },
  {
    id: 'police',
    match: ['police', 'law enforcement', 'volunteer', 'you help police', 'security work'],
    reply: [
      'Hours given, quietly.',
      'Not a story I tell at dinner, and not one I am going to start in a text box.',
    ],
  },
  {
    id: 'study',
    match: ['did you go to school', 'degree', 'university', 'self taught', 'how did you learn', 'education', 'course', 'certification', 'college'],
    reply: [
      'Still studying. Part time. No hurry. The day I stop is the day this gets boring.',
      'None of the code came from a course. It came from breaking things and being annoyed enough to find out why.',
    ],
    then: ['can you teach me'],
  },
  {
    id: 'teach',
    match: ['can you teach me', 'teach me', 'learn to code', 'how do i learn', 'mentor', 'where do i start', 'beginner'],
    reply: [
      'Pick something that annoys you every week. Build the thing that stops it.',
      'A course gives you a certificate. The annoying thing gives you a reason to still be up at eleven, which is the only part that has ever mattered.',
      'Ask me what to build if you cannot think of one. That I will answer properly.',
    ],
  },
  {
    id: 'sleep',
    match: ['do you sleep', 'when do you sleep', 'late', 'night owl', 'insomnia', 'what time'],
    reply: [
      'Late. Reliably the last one awake.',
      'Most of this page was written after one in the morning. Recommendation or warning, depending what you were about to ask.',
    ],
  },
  {
    id: 'family',
    match: ['family', 'married', 'kids', 'children', 'parents', 'siblings'],
    reply: [
      'Above all of it. Not a value I list, an order I follow.',
      'Everything else here is negotiable.',
    ],
  },
  {
    id: 'single',
    match: ['are you single', 'single', 'girlfriend', 'boyfriend', 'dating', 'relationship', 'wife', 'partner', 'do you have someone', 'available for a date', 'your type'],
    reply: [
      'Top five thing typed into this box, and still no answer written for it.',
      'Ask me directly. It goes to my phone and I do reply. Late, but I reply.',
    ],
    then: ['how do i reach you'],
  },
  {
    id: 'now',
    match: ['what are you working on', 'working on now', 'current project', 'latest', 'what is next', 'busy with'],
    reply: [
      'Something taking a business off manual. Something on the bench that is mostly falling over. And this page.',
      'The work index has the honest version, including which ones you can open.',
    ],
  },

  /* ------------------------------------------------------------ the meta -- */
  {
    id: 'are-you-ai',
    match: ['are you an ai', 'are you a bot', 'is this a bot', 'is this real', 'am i talking to a human', 'is this ai', 'are you real', 'are you a chatbot'],
    reply: [
      'Neither. No model runs on this page and nothing you type leaves it.',
      'These are answers I wrote by hand. The console is matching your words against them.',
      'Ask something I have not written and it goes to my phone. That part is a human, and a slow one.',
    ],
  },
  {
    id: 'this-site',
    match: ['this site', 'this website', 'who made this', 'how did you make this', 'did you build this', 'built this page', 'why is this site'],
    reply: [
      'By hand, from nothing. No template, no page builder, no animation library. The whole motion system is two CSS classes and a scroll observer.',
      'The night behind you is drawn on a canvas a few kilobytes wide, because you are on a phone on mobile data and a 3D engine would have cost you four seconds for nothing.',
      'The sound is generated in your browser while you listen to it. There is no audio file.',
    ],
  },
  {
    id: 'prove',
    match: ['prove it', 'show me', 'anyone can say that', 'talk is cheap', 'sounds fake', 'you are full of', 'bullshit', 'doubt it', 'impress me'],
    reply: [
      'Fair. Sector 04 reads your own device in front of you and then throws it away.',
      'Or open the work index. Three of them you can click and use right now, free, no account.',
      'The rest is a claim. File it that way until you have used one.',
    ],
  },
  {
    id: 'contact',
    match: ['how do i reach you', 'contact', 'email', 'instagram', 'whatsapp', 'phone number', 'get in touch', 'message you', 'dm', 'reach out', 'talk to you'],
    reply: [
      'Type it here and press send. Anything this console cannot answer goes to my phone.',
      'Instagram if you would rather see a face first. Email for anything that needs a paper trail.',
      'Both are at the bottom of the personal file.',
    ],
  },
  {
    id: 'greeting',
    match: ['hi', 'hello', 'hey', 'salam', 'assalam', 'good evening', 'good morning', 'yo', 'hola'],
    reply: [
      'Hello.',
      'Ask something real. What I do, what I would build for you, or whether your phone is listening. The last one has the better answer.',
    ],
    then: ['what do you do', 'is my phone listening'],
  },
  {
    id: 'thanks',
    match: ['thanks', 'thank you', 'appreciate it', 'nice one', 'cheers', 'shukriya'],
    reply: [
      'Any time.',
      'If something here was useful, tell me which part. Only feedback worth having.',
    ],
  },
];

/** The console's opening lines. Sets expectations honestly, in two sentences. */
export const askIntro: string[] = [
  'Ask me something.',
  'Answers written by hand, matched against what you type. No model runs on this page. Anything I have not written goes to my phone.',
];

/** Starter chips. The first is safe, the rest are the ones people actually want. */
export const askPrompts: string[] = [
  'what do you do',
  'are you a hacker',
  'is my phone listening',
  'what would you build for me',
];

/**
 * The miss. Deliberately not an error — this is the door, and the copy has to
 * read like an invitation rather than a dead end.
 */
export const askMiss = {
  lead: 'Nothing written for that one yet.',
  body: 'Which makes it more interesting than the ones that are. Send it. I will answer it myself.',
  cta: 'Send it to me',
};

/**
 * The block at the bottom of the personal file, where the heart and its
 * invented tally used to be. Somebody who has just read the whole file is the
 * likeliest person on the site to want to say something; handing them a
 * counter was the wrong thing to hand them.
 */
export const askInvite = {
  title: 'Ask me something',
  body: 'Anything I have not already written an answer for goes straight to my phone. A late reply, but a real one.',
  cta: 'Open the console',
};
