/** The AI sector. Modules deploy around the core when it is brought online. */
export interface AiModule {
  id: string;
  label: string;
  body: string;
  /** Angle on the ring, in degrees, 0 = top. */
  angle: number;
}

export const aiModules: AiModule[] = [
  { id: 'agents', label: 'AGENTS', body: 'Loops with tools and a stopping condition. Useful the moment they can be trusted to fail loudly.', angle: 0 },
  { id: 'llm', label: 'LLM INTEGRATION', body: 'Model as a component. Swappable, budgeted, and never the only thing between input and output.', angle: 60 },
  { id: 'prompt', label: 'PROMPTING', body: 'Less clever wording, more structure: schemas, examples, refusal paths, evaluation.', angle: 120 },
  { id: 'pipe', label: 'AI WORKFLOWS', body: 'Chains that survive a bad response. Retry, validate, fall back, escalate to a human.', angle: 180 },
  { id: 'data', label: 'DATA PROCESSING', body: 'Extraction and normalisation on messy real input — voice notes, photos, half-typed requests.', angle: 240 },
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
