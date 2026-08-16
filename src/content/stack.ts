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
  { id: 'ts', label: 'TypeScript', use: 'the default. types before the bug happens.', group: 'language', weight: 3, x: 0.28, y: 0.17 },
  { id: 'js', label: 'JavaScript', use: 'where it started, still where it ships.', group: 'language', weight: 2, x: 0.12, y: 0.30 },
  { id: 'py', label: 'Python', use: 'scripting, scraping, data, anything one-off.', group: 'language', weight: 3, x: 0.14, y: 0.62 },
  { id: 'sql', label: 'SQL', use: 'the language that outlives every framework.', group: 'language', weight: 3, x: 0.30, y: 0.78 },
  { id: 'bash', label: 'Bash', use: 'glue of last resort. usually the fastest answer.', group: 'language', weight: 1, x: 0.10, y: 0.88 },

  // interface
  { id: 'react', label: 'React', use: 'interfaces that hold state without falling apart.', group: 'interface', weight: 3, x: 0.48, y: 0.10 },
  { id: 'next', label: 'Next.js', use: 'this site. and most of the others.', group: 'interface', weight: 3, x: 0.66, y: 0.20 },
  { id: 'tailwind', label: 'Tailwind', use: 'design tokens instead of a stylesheet nobody dares touch.', group: 'interface', weight: 2, x: 0.84, y: 0.11 },
  { id: 'flutter', label: 'Flutter', use: 'one codebase when it has to live on a phone.', group: 'interface', weight: 2, x: 0.88, y: 0.31 },
  { id: 'css', label: 'HTML / CSS', use: 'still the part most people get wrong.', group: 'interface', weight: 2, x: 0.44, y: 0.35 },
  { id: 'canvas', label: 'Canvas', use: 'when the interface has to move and still stay cheap.', group: 'interface', weight: 1, x: 0.62, y: 0.40 },

  // runtime + system
  { id: 'node', label: 'Node', use: 'servers, jobs, CLIs, whatever needs a process.', group: 'runtime', weight: 2, x: 0.52, y: 0.53 },
  { id: 'linux', label: 'Linux', use: 'where everything eventually runs, whether you meant it to or not.', group: 'system', weight: 2, x: 0.76, y: 0.60 },
  { id: 'docker', label: 'Docker', use: 'so it breaks the same way on every machine.', group: 'system', weight: 1, x: 0.90, y: 0.50 },
  { id: 'git', label: 'Git', use: 'the only undo button that has never let me down.', group: 'system', weight: 2, x: 0.68, y: 0.86 },

  // data
  { id: 'postgres', label: 'Postgres', use: 'when the data has to still be right in five years.', group: 'data', weight: 3, x: 0.42, y: 0.66 },
  { id: 'supabase', label: 'Supabase', use: 'postgres when control beats speed.', group: 'data', weight: 2, x: 0.50, y: 0.88 },
  { id: 'firebase', label: 'Firebase', use: 'auth and realtime when speed beats control.', group: 'data', weight: 2, x: 0.26, y: 0.94 },

  // glue
  { id: 'api', label: 'APIs', use: 'reading someone else’s docs so you do not have to.', group: 'glue', weight: 3, x: 0.72, y: 0.72 },
  { id: 'gas', label: 'Apps Script', use: 'the unglamorous glue that runs real businesses.', group: 'glue', weight: 2, x: 0.90, y: 0.83 },
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
