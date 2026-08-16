/**
 * The SECURITY sector.
 *
 * Written as capability plus restraint, which is the only version of this that
 * is both true and worth reading. The posture run is defensive — a check on
 * something the operator owns — and there is nothing offensive here for anyone
 * to copy. The edge comes from what is implied, never from a claim.
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
      'finding · error page leaks a stack frame',
      'severity · low, low. noted anyway.',
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
  {
    label: 'Surface',
    body: 'Every convenience is a door. Most of them were fitted by someone who never came back to close them.',
  },
  {
    label: 'Devices',
    body: 'A phone is a microphone, a camera, a radio and a very long memory. It was never only a phone.',
  },
  {
    label: 'Signal',
    body: 'People give away more in the shape of their traffic than in anything they actually say.',
  },
  {
    label: 'Secure coding',
    body: 'Validate at the edge. Encode on the way out. Assume the input arrived wanting something.',
  },
  {
    label: 'Privacy',
    body: 'Collect less. Keep it shorter. The safest record is the one that was never written.',
  },
  {
    label: 'Restraint',
    body: 'Knowing how is common enough. Choosing not to is the part almost nobody trains.',
  },
];

export const securityScope =
  'Scope: systems I own, or have been invited to test. What runs below is a posture check on my own asset — a habit, not a method.';

/**
 * The closing line. Says what he is without ever claiming anything: the
 * awareness is a reflex, and the discipline is what he does about it.
 */
export const securityClose =
  'The habit was never breaking things. It is noticing — immediately, without trying, without being asked — exactly where a thing would give. That part does not switch off when you close the laptop. What you do with it afterwards is the only thing that has ever mattered.';
