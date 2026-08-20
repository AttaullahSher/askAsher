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
  { id: 'decisions', label: 'DECISIONS', body: 'Should we, how much, how soon — answered from your own numbers, before the meeting instead of after it.', angle: 0 },
  { id: 'agents', label: 'AGENTS', body: 'Software that runs the whole errand: looks, decides, acts. Trusted only once it fails loudly.', angle: 60 },
  { id: 'language', label: 'LANGUAGE', body: 'Voice notes, messages and photographs of handwritten lists become clean records. That is where most businesses lose the day.', angle: 120 },
  { id: 'pipe', label: 'WORKFLOWS', body: 'Chains that survive a bad answer. Retry, check, fall back, hand it to a person with the context attached.', angle: 180 },
  { id: 'foresight', label: 'FORESIGHT', body: 'What the numbers are about to do, not what they did. Stated with a confidence you are allowed to distrust.', angle: 240 },
  { id: 'bi', label: 'INTELLIGENCE', body: 'Turning what already happened into the one number somebody will actually act on.', angle: 300 },
];

/** Boot log for the core. Deliberately labelled as a simulation. */
export const aiBootLog = [
  'core · handshake',
  'context window allocated',
  'tool registry mounted · 6 modules',
  'guardrails online',
  'evaluation harness attached',
  'ready',
];

export const aiDisclaimer =
  'Visual simulation. No model is running on this page — nothing you type here is sent anywhere.';
