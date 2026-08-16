/**
 * Resolves a public asset or internal link against the deploy base path.
 * Root deploys get "/thing", project pages get "/askAsher/thing".
 */
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

export function asset(path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const clean = path.replace(/^\//, '');
  return `${BASE}/${clean}`;
}

export const basePath = BASE;
