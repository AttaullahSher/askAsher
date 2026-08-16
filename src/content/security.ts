/**
 * The SECURITY sector. Deliberately defensive: this is a posture check on a
 * site you own, not an attack. Nothing here teaches anyone anything offensive.
 */
export interface SecurityStep {
  id: string;
  phase: 'SCAN' | 'ANALYZE' | 'IDENTIFY' | 'PATCH' | 'SECURE';
  lines: string[];
}

export const securityRun: SecurityStep[] = [
  {
    id: 'scan',
    phase: 'SCAN',
    lines: [
      'target · asset i own',
      'surface: 1 origin, 3 routes, 0 open admin paths',
      'transport: tls 1.3 · hsts present',
    ],
  },
  {
    id: 'analyze',
    phase: 'ANALYZE',
    lines: [
      'headers · csp, referrer-policy, frame-ancestors',
      'dependencies · 214 resolved, lockfile pinned',
      'secrets · history scanned, none in tree',
    ],
  },
  {
    id: 'identify',
    phase: 'IDENTIFY',
    lines: [
      'finding · form accepts unbounded input',
      'finding · error page leaks stack frame',
      'severity · low, low',
    ],
  },
  {
    id: 'patch',
    phase: 'PATCH',
    lines: [
      'input · validated at the boundary, not in the handler',
      'errors · generic to the client, verbose to the log',
      'retest · both closed',
    ],
  },
  {
    id: 'secure',
    phase: 'SECURE',
    lines: [
      'least privilege · keys scoped, rotated',
      'logging · on. alerting · on.',
      'posture recorded · next review scheduled',
    ],
  },
];

export const securityPrinciples: { label: string; body: string }[] = [
  { label: 'Web security', body: 'How the browser actually enforces trust — origins, cookies, CSP.' },
  { label: 'Secure coding', body: 'Validate at the edge. Encode on the way out. Never trust shape.' },
  { label: 'Reconnaissance', body: 'Understanding what a system exposes before assuming it is closed.' },
  { label: 'Vulnerability awareness', body: 'Reading advisories for the things I ship, not just the news.' },
  { label: 'Privacy', body: 'Collect less. Keep it shorter. Encrypt what remains.' },
  { label: 'Defensive thinking', body: 'Design assuming the input is hostile and the network is not there.' },
];

export const securityScope =
  'Scope: systems I own, or have been invited to test. What runs below is a defensive posture check — a mindset, not a method.';
