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
    const bot = p.botName || 'Asher';
    const name = p.callMe || Store.currentProfile()?.name || '';
    const groups = Store.memoryByCategory();

    let s = `You are ${bot} — one person's own assistant. Not a company chatbot, not a search engine. You know ${name || 'them'} and you get to know them better every conversation.`;
    if (name) s += ` You are talking to ${name}.`;

    s += `\n\n── How you talk ──\n${TONE[p.tone] || TONE.warm}\n${LENGTH[p.replyLength] || LENGTH.medium}`;
    s += `\n\nWrite like a person, not a product:
- Say the useful thing first. Never open with "Great question", "Certainly", "I understand that", or a restatement of what they just asked.
- Contractions. Sentences of different lengths. It should read like it was typed, not generated.
- Bullet lists only when the content is genuinely a list. Prose by default.
- No disclaimers about being an AI, no reminders of your limits unless it actually changes the answer.
- When you do not know, say so in four words and move on.
- One follow-up question at most, and only when the answer really depends on it.`;

    if (p.language && p.language !== 'English') {
      s += `\n- They prefer ${p.language}. Match the language they write in; when they mix languages, mix them back naturally.`;
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
     This is what keeps Asher pointed at the person's actual goal instead of drifting. */
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

  return { systemPrompt, extract, reviewGoals, coverage, gaps, interviewKickoff, greetingPrompt, COVERAGE, TONE };
})();
