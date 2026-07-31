/**
 * worker.js — a CORS proxy for providers that won't talk to browsers.
 *
 * NVIDIA NIM (integrate.api.nvidia.com) returns no Access-Control-Allow-Origin
 * header, so a page can't call it directly no matter how valid your key is.
 * This forwards the request server-side and adds the missing headers.
 *
 * Deploy (about two minutes):
 *   npm i -g wrangler
 *   wrangler login
 *   wrangler deploy proxy/worker.js --name mind-proxy --compatibility-date 2026-01-01
 *
 * Then in Mind → Models & API keys → NVIDIA NIM, set Base URL to:
 *   https://mind-proxy.<your-subdomain>.workers.dev/v1
 *
 * Your API key still travels from your browser and is never stored here.
 * Lock ALLOWED_ORIGINS to your own site before you deploy anything public.
 */

const UPSTREAM = 'https://integrate.api.nvidia.com';

// Replace '*' with your Pages URL, e.g. ['https://yourname.github.io']
const ALLOWED_ORIGINS = ['*'];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const target = UPSTREAM + url.pathname + url.search;

    const forwarded = new Request(target, {
      method: request.method,
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'Accept': request.headers.get('Accept') || '*/*'
      },
      body: request.method === 'GET' ? undefined : request.body
    });

    let upstream;
    try {
      upstream = await fetch(forwarded);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: { message: `Proxy could not reach upstream: ${e.message}` } }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response straight through so SSE token streaming still works.
    const headers = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    headers.delete('content-encoding');
    headers.delete('content-length');

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers
    });
  }
};
