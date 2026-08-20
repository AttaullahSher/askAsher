'use client';

import { answers, type Answer } from '@/content/answers';

/**
 * Routing a typed question to a written answer.
 *
 * Local, deterministic and offline. There is no request, no key and no model —
 * the AI sector on this page tells the visitor that nothing is running here,
 * and that has to stay true of the console as well as of the animation.
 *
 * A miss is not a failure. It returns `null`, the console offers to send the
 * question to him instead, and a question worth answering twice becomes a new
 * entry in `answers.ts` on the next deploy.
 */

/** ` what do you do ` — padded and space-normalised so word edges are just spaces. */
function normalise(q: string): string {
  return ` ${q.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Does this match key appear in the question as a whole word or phrase?
 *
 * Suffix tolerance ("hack" catching "hacking") is limited to keys of four
 * characters or more. Without that floor, `hi` matches the `s` on the end of
 * *his* and every mention of somebody else's phone gets greeted politely.
 */
function hit(text: string, key: string): boolean {
  if (text.includes(` ${key} `)) return true;
  if (key.length >= 4 && !key.includes(' ')) {
    return new RegExp(` ${escapeRe(key)}(s|es|ed|ing) `).test(text);
  }
  return false;
}

/**
 * Best match, or `null`.
 *
 * Longer phrases win decisively — the square of the word count means "is my
 * phone listening" (64) can never lose to a stray "phone" (5) somewhere else
 * in the corpus. That is the whole reason both the phrase and the bare keyword
 * are listed on an entry.
 */
export function matchAnswer(question: string): Answer | null {
  const text = normalise(question);
  if (text.trim().length === 0) return null;

  let best: Answer | null = null;
  let bestScore = 0;

  for (const a of answers) {
    let score = 0;
    for (const key of a.match) {
      if (!hit(text, key)) continue;
      const words = key.split(' ').length;
      score += words * words * 4 + key.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }

  return best;
}
