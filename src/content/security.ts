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
    body: 'A business grows by adding doors — an app, a portal, a login for a supplier. Nobody is ever handed the job of counting them.',
  },
  {
    label: 'Devices',
    body: 'A phone is a microphone, a camera, a radio and a very long memory. It was never only a phone.',
  },
  {
    label: 'Signal',
    body: 'Nobody has to read what you sent. When you sent it, how often, and who answered already tells most of the story.',
  },
  {
    label: 'Trust',
    body: 'Anything arriving from outside is a stranger at the door. Greeted, checked, and never walked straight through to the till.',
  },
  {
    label: 'Privacy',
    body: 'The safest record is the one that was never written. The second safest is the one deleted on time. Everything after that is a promise.',
  },
  {
    label: 'Restraint',
    body: 'Knowing how is common enough. Choosing not to — every day, with nobody watching and nobody ever finding out — is the part almost nobody trains.',
  },
];

export const securityScope = 'Scope: what I own, or what I was invited to look at.';

/**
 * The closing line. Says what he is without ever claiming anything: the
 * awareness is a reflex, and the discipline is what he does about it.
 */
export const securityClose =
  'The habit was never breaking things. It is noticing where a thing would give — immediately, without trying, without being asked. That does not stop at software, and it does not switch off. What I do about it is the only part that matters, and the answer has always been nothing.';
