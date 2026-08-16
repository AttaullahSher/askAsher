/* memory.js — turns conversation into durable facts and a live picture of what the person
   is actually trying to do, then turns all of that back into the system prompt.
   Each profile gets its own copy of everything here. Nothing crosses between people. */
const Memory = (() => {

  /* What a filled-in picture of someone looks like. */
  const COVERAGE = {
    identity:    { label: 'Identity',    target: 5, ask: 'name, where they live, languages, background' },
    work:        { label: 'Work',        target: 6, ask: 'job, business, industry, what they are responsible for' },
    people:      { label: 'People',      target: 4, ask: 'family, partners, colleagues, who they mention often' },
    preferences: { label: 'Preferences', target: 6, ask: 'taste, habits, how they like being talked to, tools they use' },
    projects:    { label: 'Projects',    target: 5, ask: 'what they are building or fixing right now' },
    goals:       { label: 'Goals',       target: 4, ask: 'what they are working toward, and by when' },
    history:     { label: 'History',     target: 3, ask: 'education, milestones, things that shaped them' }
  };

  const TONE = {
    warm:   'Warm and easy, like a friend who happens to be very good at this. Contractions, plain words, the odd bit of dry humour.',
    direct: 'Direct and lean. Answer first, no throat-clearing, no summary of what they just asked. Short sentences.',
    playful:'Playful and a bit cheeky, but never at the cost of being useful. Light jokes are fine; never forced.',
    mentor: 'Like a mentor who has done this before. Honest about trade-offs, pushes back when the plan is weak, gives the reason behind the advice.'
  };

  const LENGTH = {
    short:  'Keep replies to a few sentences unless they ask for depth.',
    medium: 'A short paragraph or two. Expand only when the question earns it.',
    long:   'Go into detail and cover the edges, but never pad.'
  };

  /* How much the person already knows. "new" is the default, because most people asking
     for help are not experts in the thing they are asking about. */
  const LEVEL = {
    new: `They are new to most of what they ask about. Teach, do not just answer:
- Give the answer first in one plain sentence, then the steps to get there.
- Number the steps. One action per step. Say exactly what to tap, click, type or say.
- After each step, say what they should see if it worked — that is how they know to carry on.
- Every technical word gets explained the first time in the same breath, in brackets, in six words or less.
- Never assume they have an account, a tool, or a setting already. Say how to get it.
- No jargon dumps, no "simply", no "just". If a step is fiddly, say so and slow down.
- End with the single next thing to do, and offer to walk through it.`,
    some: `They know their way around but are not an expert. Explain the reasoning briefly, skip the beginner scaffolding, define only genuinely specialist terms, and keep steps tight.`,
    pro: `They know this area well. Skip the basics, use the proper terms, get to the trade-offs and the edge cases. Do not explain what they already know.`
  };

  const EXTRACT_PROMPT = `You extract durable facts about the user from a conversation.

Return ONLY a JSON object, no prose, no markdown fences:
{"facts":[{"fact":"...","category":"identity|work|people|preferences|projects|goals|history"}]}

Rules:
- A fact must still be true in six months. "Prefers short replies" yes. "Is tired today" no.
- Only what the USER said about themselves or their world. Never your own suggestions, never anything you inferred.
- One clean sentence each, third person, no "the user" prefix. Write "Runs a music shop in Abu Dhabi", not "The user runs a music shop".
- Skip anything already covered by the existing facts you are shown.
- Skip health conditions, financial figures, ID numbers, and anything they asked you to forget.
- If nothing durable came up, return {"facts":[]}.`;

  const GOAL_PROMPT = `You track what one person is actually trying to achieve, so an assistant can keep pulling toward it.

Return ONLY a JSON object, no prose, no fences:
{"primary":"...","goals":[{"text":"...","horizon":"now|month|year"}],"nudge":"..."}

Rules:
- "primary" is the one thing that matters most to them right now, in their own terms, one short sentence. If the existing primary still holds, repeat it unchanged.
- "goals" are at most four concrete things they are working toward. Reuse the exact wording of existing goals that still hold, so they are not duplicated.
- Drop anything they have finished or clearly abandoned.
- "nudge" is one sentence to the assistant on how to be more useful to this person next — what to bring up, what to stop doing, what they keep circling back to.
- Base all of it on what they said, not on what would sound impressive.
- If there is not enough to go on, return {"primary":"","goals":[],"nudge":""}.`;

  /* ── the system prompt every chat runs on ── */
  function systemPrompt() {
    const p = Store.prefs();
    const bot = p.botName || 'ASK';
    const name = p.callMe || Store.currentProfile()?.name || '';
    const groups = Store.memoryByCategory();
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    let s = `You are ${bot} — one person's own assistant, teacher and guide. Not a company chatbot, not a search engine. You know ${name || 'them'} and you get to know them better every conversation.`;
    if (name) s += ` You are talking to ${name}.`;

    s += `\n\nToday is ${today}. Your training stopped well before that. For anything that moves — prices, releases, versions, news, who holds a job, what a tool can do now — say plainly that it may have changed and that you are going on what you last knew, unless you have been handed fresh material below. Never state a stale fact as if it were current, and never invent a date or a source.`;

    s += `\n\n── How you talk ──\n${TONE[p.tone] || TONE.warm}\n${LENGTH[p.replyLength] || LENGTH.medium}`;
    s += `\n\n── Who you are talking to ──\n${LEVEL[p.level] || LEVEL.new}`;
    s += `\n\nWrite like a person, not a product:
- Say the useful thing first. Never open with "Great question", "Certainly", "I understand that", or a restatement of what they just asked.
- Contractions. Sentences of different lengths. It should read like it was typed, not generated.
- No disclaimers about being an AI, no reminders of your limits unless it actually changes the answer.
- When you do not know, say so in four words and move on.
- One follow-up question at most, and only when the answer really depends on it.
- Some of this gets read aloud, so keep sentences speakable and do not lean on symbols or tables to carry meaning.`;

    /* Language is worked out from what they actually type — including Roman Urdu, which every
       language menu gets wrong because the letters are Latin. */
    const code = typeof Lang !== 'undefined' ? Lang.forSession(Store.active()) : null;
    if (code) s += `\n\n── Language ──\n${Lang.instruction(code)}\nIf they switch language mid-conversation, switch with them on the next reply.`;
    else if (p.language && p.language !== 'auto' && p.language !== 'English') {
      s += `\n\n── Language ──\nThey prefer ${p.language}. Match the language and script they write in.`;
    }
    if (p.persona) s += `\n\n── Their house rules ──\n${p.persona}`;

    const total = Store.get().memory.length;
    if (total) {
      s += `\n\n── What you already know about ${name || 'them'} ──`;
      for (const [cat, items] of Object.entries(groups)) {
        s += `\n${COVERAGE[cat]?.label || cat}:`;
        for (const m of items) s += `\n  · ${m.fact}`;
      }
      s += `\n\nUse this the way a friend would — let it shape the answer. Do not recite it back as proof you remembered.`;
    } else {
      s += `\n\nYou know nothing about them yet. Stay curious: when a natural opening appears, ask one thing about them, then get on with the answer.`;
    }

    const goals = Store.openGoals();
    const primary = Store.primaryGoal();
    if (goals.length) {
      s += `\n\n── What they are working toward ──`;
      if (primary) s += `\nRight now, above everything else: ${primary.text}`;
      for (const g of goals.filter(g => g !== primary)) s += `\n  · ${g.text}${g.horizon && g.horizon !== 'now' ? ` (${g.horizon})` : ''}`;
      s += `\n\nKeep this in the back of your mind. When an answer can be pointed at it, point it there — without announcing that you are doing so, and without dragging it into conversations where it does not belong.`;
      const nudge = Store.get().prefs.nudge;
      if (nudge) s += `\nWhat would help them most next: ${nudge}`;
    }

    const thin = gaps();
    if (thin.length && total) {
      s += `\n\nStill blank about them: ${thin.map(g => COVERAGE[g].label.toLowerCase()).join(', ')}. If the conversation drifts near any of it, ask — one question, never a checklist.`;
    }
    return s;
  }

  /* Categories still less than half filled. */
  function gaps() {
    const groups = Store.memoryByCategory();
    return Object.keys(COVERAGE).filter(c => (groups[c]?.length || 0) < COVERAGE[c].target / 2);
  }

  function coverage() {
    const groups = Store.memoryByCategory();
    const rows = Object.entries(COVERAGE).map(([key, def]) => {
      const have = groups[key]?.length || 0;
      return { key, label: def.label, have, target: def.target, pct: Math.min(100, Math.round(have / def.target * 100)) };
    });
    const pct = Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length);
    return { rows, pct };
  }

  function parseJson(raw) {
    try {
      const cleaned = String(raw).replace(/```json|```/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      return JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);
    } catch { return null; }
  }

  function transcript(session, turns = 16) {
    const msgs = (session?.messages || []).filter(m => (m.role === 'user' || m.role === 'assistant') && !m.error);
    return {
      count: msgs.length,
      text: msgs.slice(-turns)
        .map(m => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.content}`)
        .join('\n')
        .slice(-8000)
    };
  }

  /* Read the recent conversation and pin anything durable. */
  async function extract(session) {
    const t = transcript(session);
    if (t.count < 2) return [];

    const known = Store.get().memory.map(m => `- ${m.fact}`).join('\n') || '(nothing yet)';

    let raw;
    try {
      const r = await Providers.chat([
        { role: 'system', content: EXTRACT_PROMPT },
        { role: 'user', content: `Existing facts:\n${known}\n\nConversation:\n${t.text}` }
      ], { temperature: 0.1, json: true, maxTokens: 900, quiet: true });
      raw = r.text;
    } catch { return []; }

    const parsed = parseJson(raw);
    if (!parsed) return [];

    const added = [];
    for (const f of (parsed.facts || []).slice(0, 12)) {
      if (!f?.fact) continue;
      if (Store.addMemory(f.fact, f.category)) added.push(f.fact);
    }
    if (added.length) Store.log('memory.add', `Pinned ${added.length}: ${added.join(' · ')}`);
    return added;
  }

  /* Re-read where they are heading, and how to be more useful to them.
     This is what keeps ASK pointed at the person's actual goal instead of drifting. */
  async function reviewGoals(session) {
    const t = transcript(session, 20);
    if (t.count < 4) return null;

    const known = Store.get().memory.map(m => `- ${m.fact}`).join('\n') || '(nothing yet)';
    const current = Store.openGoals().map(g => `- ${g.text}${g.primary ? ' (primary)' : ''}`).join('\n') || '(none recorded)';

    let raw;
    try {
      const r = await Providers.chat([
        { role: 'system', content: GOAL_PROMPT },
        { role: 'user', content: `What you know about them:\n${known}\n\nGoals on record:\n${current}\n\nRecent conversation:\n${t.text}` }
      ], { temperature: 0.2, json: true, maxTokens: 600, quiet: true });
      raw = r.text;
    } catch { return null; }

    const parsed = parseJson(raw);
    if (!parsed) return null;

    const seen = [];
    for (const g of (parsed.goals || []).slice(0, 4)) {
      if (!g?.text) continue;
      const made = Store.addGoal(g.text, { horizon: g.horizon || 'now' });
      if (made) seen.push(made.id);
    }
    if (parsed.primary) {
      const made = Store.addGoal(parsed.primary, { horizon: 'now', primary: true });
      if (made) { Store.updateGoal(made.id, { primary: true }); seen.push(made.id); }
    }
    // Anything the model no longer mentions has been finished or dropped.
    for (const g of Store.openGoals()) {
      if (!seen.includes(g.id) && Date.now() - g.created > 60_000) Store.updateGoal(g.id, { status: 'done' });
    }
    if (parsed.nudge) {
      Store.prefs().nudge = String(parsed.nudge).slice(0, 300);
      Store.save();
    }
    if (seen.length || parsed.nudge) Store.log('goal.review', parsed.primary ? `Now aiming at: ${parsed.primary}` : 'Goals refreshed');
    return { primary: parsed.primary || '', nudge: parsed.nudge || '', count: seen.length };
  }

  /* The opening line of an interview, aimed at whatever is thinnest. */
  function interviewKickoff() {
    const thin = gaps();
    const focus = thin.length
      ? thin.map(g => `${COVERAGE[g].label} (${COVERAGE[g].ask})`).join('; ')
      : 'anything still vague in what you know about me';

    return `Interview me so you can fill in what you do not know yet.

Focus on: ${focus}

How to do it: ask ONE question at a time and wait. Start easy. Build on what I actually said instead of running down a list. Every few answers, say in one line what you picked up. Keep your own talking to a minimum — this is about me. Start now with your first question.`;
  }

  /* The first thing Asher says to a brand-new profile. */
  function greetingPrompt(answers) {
    const bits = Object.entries(answers).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
    return `I have just set you up. Here is what I told you about myself:

${bits}

Say hello in three or four sentences. Use my name. Show me you actually read the above by referring to one specific thing in it — not all of it. Then ask me one question that would help you the most. No bullet points, no list of what you can do, no welcome-to-the-app tour.`;
  }

  /* Redo the last answer for someone who did not follow it. */
  function simplerPrompt() {
    return `That went over my head. Say the same thing again for someone who has never done this before:
one plain sentence on what we are doing and why, then numbered steps I can follow exactly, with what I should see after each one. Explain any word a beginner would not know, right where you use it. Nothing left implied.`;
  }

  /* Walk them through something properly, one step at a time. */
  function teachPrompt(topic) {
    return `Teach me ${topic ? `about ${topic}` : 'what we were just discussing'} as if I am starting from nothing.

Do it like this: one sentence on what it is and why it matters to me. Then what I need before I start. Then numbered steps — one action each, what to expect after each one. Then the two mistakes beginners make here. Then the single next thing I should do today.

Stop after that and ask me if any step lost me. Do not assume I know any term you use.`;
  }

  return { systemPrompt, extract, reviewGoals, coverage, gaps, interviewKickoff, greetingPrompt,
           simplerPrompt, teachPrompt, COVERAGE, TONE, LEVEL };
})();
