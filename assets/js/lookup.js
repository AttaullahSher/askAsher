/* lookup.js — a small, keyless way to check the world before answering.

   A model only knows what it was trained on, so anything about "the latest", a current price,
   a new release or this week's news is a guess unless something looks it up. These three
   sources all allow direct browser calls, need no key, and no account:

     Wikipedia          background and definitions, kept current by people
     Hacker News        what was actually posted recently, with dates — good for tech news
     DuckDuckGo         one-line instant answers

   Nothing here is a full search engine. It is enough to stop confident nonsense about
   things that changed after the model was trained, and every claim comes back with a link. */
const Lookup = (() => {

  const TIMEOUT = 9000;

  /* Words that mean "this may have changed since you were trained". */
  const FRESH_WORDS = /\b(latest|newest|current|currently|right now|today|tonight|this (week|month|year)|recent|recently|news|update[ds]?|released?|launch(ed|es)?|version|price|cost|202[4-9]|203\d|who is|what is|what's new|nowadays|these days|still (available|around|working))\b/i;

  function needed(text) {
    const mode = Store.prefs().lookup || 'smart';
    if (mode === 'off') return false;
    const t = String(text).trim();
    if (t.length < 8) return false;
    if (mode === 'always') return true;
    return FRESH_WORDS.test(t);
  }

  /* Turn a chatty message into something worth searching. */
  function toQuery(text) {
    return String(text)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\b(please|can you|could you|tell me|i want to know|what do you think|explain|help me|about)\b/gi, ' ')
      .replace(/[^\p{L}\p{N}\s.+#-]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .slice(0, 12)
      .join(' ');
  }

  async function getJson(url) {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  }

  /* ── Wikipedia: two best pages, intro paragraph each ── */
  async function wikipedia(q) {
    const search = await getJson(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}` +
      `&srlimit=2&format=json&origin=*`);
    const hits = search?.query?.search || [];
    if (!hits.length) return [];

    const titles = hits.map(h => h.title);
    const extracts = await getJson(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info&inprop=url&exintro=1&explaintext=1` +
      `&titles=${encodeURIComponent(titles.join('|'))}&format=json&origin=*`);

    return Object.values(extracts?.query?.pages || {})
      .filter(p => p.extract)
      .map(p => ({
        from: 'Wikipedia',
        title: p.title,
        url: p.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
        snippet: p.extract.replace(/\s+/g, ' ').slice(0, 700)
      }));
  }

  /* ── Hacker News: what people posted lately, newest first, with real dates ── */
  async function hackernews(q) {
    const data = await getJson(
      `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=4`);
    return (data?.hits || [])
      .filter(h => h.title)
      .map(h => ({
        from: 'Hacker News',
        title: h.title,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        when: h.created_at ? new Date(h.created_at).toISOString().slice(0, 10) : '',
        snippet: (h.story_text || h._highlightResult?.title?.value || h.title || '')
          .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 300)
      }));
  }

  /* ── DuckDuckGo instant answer: a one-liner when there is one ── */
  async function duckduckgo(q) {
    const data = await getJson(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`);
    const text = data?.AbstractText || data?.Answer || '';
    if (!text) return [];
    return [{
      from: 'DuckDuckGo',
      title: data.Heading || q,
      url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      snippet: String(text).slice(0, 500)
    }];
  }

  /* Run all three, keep whatever came back. One dead source never stops the others. */
  async function run(text) {
    const q = toQuery(text);
    if (!q) return null;

    const settled = await Promise.allSettled([wikipedia(q), hackernews(q), duckduckgo(q)]);
    const sources = settled
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value || [])
      .slice(0, 8);

    const failed = settled.filter(r => r.status === 'rejected').length;
    if (!sources.length) {
      Store.log('lookup.empty', `Nothing found for "${q}"${failed ? ` (${failed} source(s) unreachable)` : ''}`);
      return null;
    }

    Store.log('lookup.run', `${sources.length} results for "${q}"`);
    return { query: q, sources, context: asContext(q, sources) };
  }

  /* How the results reach the model. */
  function asContext(q, sources) {
    const today = new Date().toISOString().slice(0, 10);
    let out = `Looked up "${q}" just now (${today}). Use this where it is relevant and ignore the rest.\n`;
    out += `These snippets are more current than your training. Where they disagree with what you remember, trust them, say so plainly, and cite the source by name.\n`;
    for (const s of sources) {
      out += `\n[${s.from}] ${s.title}${s.when ? ` (${s.when})` : ''}\n${s.snippet}\nLink: ${s.url}\n`;
    }
    out += `\nIf none of it answers the question, say what you do know and flag that it may be out of date. Never invent a source or a date.`;
    return out;
  }

  return { needed, run, toQuery };
})();
