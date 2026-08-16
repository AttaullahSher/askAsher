/** The CODE sector. `weight` drives node size in the constellation. */
export interface StackNode {
  id: string;
  label: string;
  /** One line, lowercase, no marketing. What it is actually used for. */
  use: string;
  group: 'language' | 'interface' | 'runtime' | 'data' | 'glue';
  weight: 1 | 2 | 3;
  /** Normalised 0–1 position inside the constellation field. */
  x: number;
  y: number;
}

export const stack: StackNode[] = [
  { id: 'ts', label: 'TypeScript', use: 'the default. types before the bug happens.', group: 'language', weight: 3, x: 0.30, y: 0.24 },
  { id: 'js', label: 'JavaScript', use: 'where it started, still where it ships.', group: 'language', weight: 2, x: 0.14, y: 0.40 },
  { id: 'py', label: 'Python', use: 'scripting, scraping, data, anything one-off.', group: 'language', weight: 3, x: 0.20, y: 0.70 },
  { id: 'react', label: 'React', use: 'interfaces that hold state without falling apart.', group: 'interface', weight: 3, x: 0.50, y: 0.14 },
  { id: 'next', label: 'Next.js', use: 'this site. and most of the others.', group: 'interface', weight: 3, x: 0.66, y: 0.28 },
  { id: 'flutter', label: 'Flutter', use: 'one codebase when it has to live on a phone.', group: 'interface', weight: 2, x: 0.82, y: 0.16 },
  { id: 'css', label: 'HTML / CSS', use: 'still the part most people get wrong.', group: 'interface', weight: 2, x: 0.44, y: 0.44 },
  { id: 'node', label: 'Node', use: 'servers, jobs, CLIs, whatever needs a process.', group: 'runtime', weight: 2, x: 0.62, y: 0.60 },
  { id: 'firebase', label: 'Firebase', use: 'auth and realtime when speed beats control.', group: 'data', weight: 2, x: 0.36, y: 0.86 },
  { id: 'supabase', label: 'Supabase', use: 'postgres when control beats speed.', group: 'data', weight: 2, x: 0.54, y: 0.78 },
  { id: 'api', label: 'APIs', use: 'reading someone else’s docs so you do not have to.', group: 'glue', weight: 3, x: 0.78, y: 0.52 },
  { id: 'gas', label: 'Apps Script', use: 'the unglamorous glue that runs real businesses.', group: 'glue', weight: 2, x: 0.88, y: 0.76 },
];

/** Constellation edges — drawn faint, lit when either end is active. */
export const stackEdges: [string, string][] = [
  ['ts', 'js'], ['ts', 'react'], ['ts', 'next'], ['react', 'next'],
  ['react', 'css'], ['next', 'node'], ['next', 'api'], ['node', 'api'],
  ['node', 'supabase'], ['supabase', 'firebase'], ['py', 'api'], ['py', 'js'],
  ['api', 'gas'], ['gas', 'firebase'], ['flutter', 'next'], ['css', 'react'],
  ['firebase', 'supabase'], ['py', 'supabase'],
];
