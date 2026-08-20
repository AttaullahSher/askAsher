/**
 * The AI sector. Modules deploy around the core when it is brought online.
 *
 * Written for the person who has to decide something, not for the person who
 * has to implement it. If a module cannot be explained to an owner in one
 * sentence, it does not belong on the ring.
 */
export interface AiModule {
  id: string;
  label: string;
  body: string;
  /** Angle on the ring, in degrees, 0 = top. */
  angle: number;
}

export const aiModules: AiModule[] = [
  { id: 'decisions', label: 'DECISIONS', body: 'Should we, how much, how soon. From your own numbers, before the meeting.', angle: 0 },
  { id: 'agents', label: 'AGENTS', body: 'Software that runs the whole errand, and shouts for a human instead of guessing.', angle: 60 },
  { id: 'language', label: 'LANGUAGE', body: 'Voice notes, messages, photographs of handwritten lists. Into proper records.', angle: 120 },
  { id: 'pipe', label: 'WORKFLOWS', body: 'It carries on when something breaks. Retries, checks itself, hands over the whole story.', angle: 180 },
  { id: 'foresight', label: 'FORESIGHT', body: 'What the numbers are about to do. Not what they did.', angle: 240 },
  { id: 'bi', label: 'INTELLIGENCE', body: 'What already happened, as the one number somebody will act on.', angle: 300 },
];

/** Boot log for the core. Deliberately labelled as a simulation. */
export const aiBootLog = [
  'core · handshake',
  'memory attached',
  'six modules mounted',
  'guardrails online',
  'sanity checks armed',
  'ready',
];

export const aiDisclaimer =
  'Visual simulation. No model is running on this page — nothing you type here is sent anywhere.';
