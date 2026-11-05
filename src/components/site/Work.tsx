'use client';

import { platform, systems, workIntro, type System } from '@/content/work';
import { Band, Heading, Reveal, Status, Tag } from './ui';

/**
 * The professional work. First section after the hero, on purpose: a
 * recruiter should reach the systems a business runs on before anything else.
 */
export function Work() {
  return (
    <Band id="work" accent="var(--color-signal)">
      <Heading index="01" eyebrow={workIntro.eyebrow} title={workIntro.title} lead={workIntro.lead}>
        <p className="hud mt-6" style={{ letterSpacing: '0.2em' }}>
          Client · <span style={{ color: 'var(--color-hot)' }}>{workIntro.client}</span>
        </p>
      </Heading>

      <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systems.map((s, i) => (
          <Reveal as="li" key={s.id} delay={(i % 3) * 90} className="h-full">
            <SystemCard s={s} />
          </Reveal>
        ))}
      </ul>

      <Reveal className="mt-6">
        <div
          className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ border: '1px dashed var(--hud-line)' }}
        >
          <p className="prose-body max-w-2xl text-sm">{workIntro.method}</p>
          <div className="flex flex-wrap gap-2">
            {workIntro.stack.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-16">
        <article
          className="bracket relative grid gap-8 px-6 py-8 sm:px-8 md:grid-cols-[1fr_auto] md:items-end"
          style={{
            border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)',
            background: 'linear-gradient(120deg, color-mix(in oklab, var(--accent) 9%, transparent), rgba(4,6,10,0.7) 55%)',
            ['--bracket-color' as string]: 'var(--accent)',
          }}
        >
          <div>
            <div className="flex items-center gap-4">
              <span className="hud-sm" style={{ color: 'var(--accent)' }}>
                {platform.code} · Platform
              </span>
              <Status status="LIVE" />
            </div>
            <h3 className="display-md mt-4">{platform.name}</h3>
            <p className="font-display mt-3 text-lg font-semibold text-[var(--color-hot)]">{platform.line}</p>
            <p className="prose-body mt-3 max-w-2xl">{platform.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {platform.stack.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
          <a
            href={platform.href}
            target="_blank"
            rel="noreferrer"
            className="font-display inline-flex items-center gap-3 self-start px-5 py-3 text-xs font-bold uppercase transition-colors duration-300 hover:bg-[var(--accent)] hover:text-[var(--color-void)] md:self-end"
            style={{ letterSpacing: '0.22em', border: '1px solid var(--accent)', color: 'var(--accent)' }}
          >
            {platform.hrefLabel} <span aria-hidden>↗</span>
          </a>
        </article>
      </Reveal>
    </Band>
  );
}

function SystemCard({ s }: { s: System }) {
  return (
    <article
      className="panel bracket group relative flex h-full flex-col px-5 py-6 transition-colors duration-500 hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)]"
      style={{ ['--bracket-color' as string]: 'var(--accent)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="hud-sm" style={{ color: 'var(--accent)' }}>
          {s.code}
        </span>
        <Status status="LIVE" />
      </div>

      <h3 className="font-display mt-5 text-xl font-extrabold uppercase tracking-[0.04em] text-[var(--color-hot)]">
        {s.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-bone)' }}>
        {s.line}
      </p>

      {s.proof && (
        <div className="mt-6 py-4" style={{ borderTop: '1px solid var(--hud-line)', borderBottom: '1px solid var(--hud-line)' }}>
          <span className="font-display block text-[2rem] font-extrabold leading-none" style={{ color: 'var(--accent)' }}>
            {s.proof.value}
          </span>
          <span className="hud-sm mt-2 block" style={{ letterSpacing: '0.18em' }}>
            {s.proof.label}
          </span>
        </div>
      )}

      <ul className="mt-5 grid gap-2.5">
        {s.does.map((d) => (
          <li key={d} className="flex gap-3 text-[0.8rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            <span aria-hidden style={{ color: 'var(--accent)' }}>
              ▸
            </span>
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        {s.href ? (
          <a
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="hud inline-flex items-center gap-2 transition-colors hover:text-[var(--color-hot)]"
            style={{ color: 'var(--accent)' }}
          >
            {s.hrefLabel} <span aria-hidden>↗</span>
          </a>
        ) : (
          <span className="hud-sm">Internal · staff login only</span>
        )}
      </div>
    </article>
  );
}
