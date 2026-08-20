/**
 * The CODE sector — a field map that scans itself.
 *
 * Keep this honest: remove anything you would not want to be asked about in
 * a room with no internet. `x`/`y` are normalised 0–1 positions in the field.
 */
export interface StackNode {
  id: string;
  label: string;
  /** One line, lowercase, no marketing. What it is actually used for. */
  use: string;
  group: 'language' | 'interface' | 'runtime' | 'data' | 'system' | 'glue';
  weight: 1 | 2 | 3;
  x: number;
  y: number;
}

export const stack: StackNode[] = [
  // languages
  { id: 'ts', label: 'TypeScript', use: 'the language I write most things in. it complains before your customer does.', group: 'language', weight: 3, x: 0.28, y: 0.17 },
  { id: 'js', label: 'JavaScript', use: 'where it all started. still what every website in the world runs on.', group: 'language', weight: 2, x: 0.12, y: 0.30 },
  { id: 'py', label: 'Python', use: 'for anything quick, messy, or only needed once.', group: 'language', weight: 3, x: 0.14, y: 0.62 },
  { id: 'sql', label: 'SQL', use: 'how you ask a database a question. older than me and still undefeated.', group: 'language', weight: 3, x: 0.30, y: 0.78 },
  { id: 'bash', label: 'Bash', use: 'duct tape. usually also the fastest answer.', group: 'language', weight: 1, x: 0.10, y: 0.88 },

  // interface
  { id: 'react', label: 'React', use: 'the part you actually see and touch.', group: 'interface', weight: 3, x: 0.48, y: 0.10 },
  { id: 'next', label: 'Next.js', use: 'this site. and most of the others.', group: 'interface', weight: 3, x: 0.66, y: 0.20 },
  { id: 'tailwind', label: 'Tailwind', use: 'how it gets its looks without a fight.', group: 'interface', weight: 2, x: 0.84, y: 0.11 },
  { id: 'flutter', label: 'Flutter', use: 'for when the thing has to live on a phone.', group: 'interface', weight: 2, x: 0.88, y: 0.31 },
  { id: 'css', label: 'HTML / CSS', use: 'the paint and the walls. still what most people get wrong.', group: 'interface', weight: 2, x: 0.44, y: 0.35 },
  { id: 'canvas', label: 'Canvas', use: 'for when the screen has to move and stay cheap about it.', group: 'interface', weight: 1, x: 0.62, y: 0.40 },

  // runtime + system
  { id: 'node', label: 'Node', use: 'the engine room. the things that run while nobody is watching.', group: 'runtime', weight: 2, x: 0.52, y: 0.53 },
  { id: 'linux', label: 'Linux', use: 'what everything ends up running on, whether you meant it to or not.', group: 'system', weight: 2, x: 0.76, y: 0.60 },
  { id: 'docker', label: 'Docker', use: 'so it breaks the same way on every machine, which is progress.', group: 'system', weight: 1, x: 0.90, y: 0.50 },
  { id: 'git', label: 'Git', use: 'the only undo button that has never once let me down.', group: 'system', weight: 2, x: 0.68, y: 0.86 },

  // data
  { id: 'postgres', label: 'Postgres', use: 'where the important things live. still right in five years.', group: 'data', weight: 3, x: 0.42, y: 0.66 },
  { id: 'supabase', label: 'Supabase', use: 'a database with the boring parts already done.', group: 'data', weight: 2, x: 0.50, y: 0.88 },
  { id: 'firebase', label: 'Firebase', use: 'for when speed matters more than control.', group: 'data', weight: 2, x: 0.26, y: 0.94 },

  // glue
  { id: 'api', label: 'APIs', use: 'how two apps talk to each other. most of my job, honestly.', group: 'glue', weight: 3, x: 0.72, y: 0.72 },
  { id: 'gas', label: 'Apps Script', use: 'the unglamorous glue that quietly runs real businesses.', group: 'glue', weight: 2, x: 0.90, y: 0.83 },
];

/** Field connections — drawn faint, lit when either end is scanned. */
export const stackEdges: [string, string][] = [
  ['ts', 'js'], ['ts', 'react'], ['ts', 'next'], ['react', 'next'],
  ['react', 'css'], ['react', 'canvas'], ['next', 'tailwind'], ['next', 'node'],
  ['next', 'api'], ['tailwind', 'css'], ['flutter', 'next'], ['canvas', 'css'],
  ['node', 'api'], ['node', 'postgres'], ['node', 'linux'], ['linux', 'docker'],
  ['linux', 'bash'], ['bash', 'py'], ['py', 'api'], ['py', 'sql'],
  ['sql', 'postgres'], ['postgres', 'supabase'], ['supabase', 'firebase'],
  ['api', 'gas'], ['gas', 'firebase'], ['git', 'linux'], ['git', 'api'],
  ['js', 'py'], ['sql', 'firebase'],
];
