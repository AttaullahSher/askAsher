'use client';

import { useExperience } from '@/lib/experience';
import { bio, bioClose, contact, facts, modes, modesNote, offRecord, roles } from '@/content/profile';
import { outro } from '@/content/site';
import { Band, Heading, Reveal } from './ui';

/**
 * The person. It used to hide behind a door at the bottom of the page; now it
 * is a section of its own, because the one thing a page cannot fake is a
 * human being with specifics — and specifics are what this file is made of.
 */
export function Person() {
  return (
    <Band id="person" accent="var(--color-gold)">
      <Heading index="05" eyebrow="Off the clock" title={['The person', 'behind it']} />

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Reveal>
            <ul className="grid gap-px sm:grid-cols-2" style={{ background: 'var(--hud-line)' }}>
              {roles.map((r) => (
                <li key={r.title} className="px-5 py-5" style={{ background: 'var(--color-void)' }}>
                  <span className="font-display block text-base font-extrabold uppercase tracking-[0.1em] text-[var(--color-hot)]">
                    {r.title}
                  </span>
                  <span className="hud-sm mt-1.5 block" style={{ color: 'var(--accent)', letterSpacing: '0.16em' }}>
                    {r.org}
                  </span>
                  <span className="mt-2.5 block text-[0.8rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {r.note}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-10 grid gap-4">
            {bio.map((p) => (
              <p key={p.slice(0, 24)} className="prose-body">
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        <div>
          <Reveal>
            <p className="hud">Running at once</p>
            <ul className="mt-4 grid gap-px" style={{ background: 'var(--hud-line)' }}>
              {modes.map((m, i) => (
                <li key={m.id} className="flex gap-4 px-5 py-4" style={{ background: 'var(--color-void)' }}>
                  <span className="hud-sm shrink-0 tabular-nums" style={{ color: 'var(--accent)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="font-display block text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-hot)]">
                      {m.label}
                    </span>
                    <span className="mt-1.5 block text-[0.8rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                      {m.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="prose-body mt-4 text-sm">{modesNote}</p>
          </Reveal>
        </div>
      </div>

      <Reveal className="mt-16">
        <div
          className="bracket relative px-6 py-7 sm:px-8"
          style={{
            border: '1px solid color-mix(in oklab, var(--accent) 34%, transparent)',
            background: 'color-mix(in oklab, var(--accent) 6%, transparent)',
            ['--bracket-color' as string]: 'var(--accent)',
          }}
        >
          <p className="hud" style={{ color: 'var(--accent)' }}>
            Off the record
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
            {offRecord.map((f) => (
              <li key={f.k}>
                <span className="hud-sm block">{f.k}</span>
                <span className="font-display mt-1.5 block text-[0.95rem] font-bold uppercase leading-snug tracking-[0.04em] text-[var(--color-hot)]">
                  {f.v}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal className="mt-10">
        <dl className="grid grid-cols-2 gap-px md:grid-cols-3" style={{ background: 'var(--hud-line)' }}>
          {facts.map((f) => (
            <div key={f.k} className="px-5 py-4" style={{ background: 'var(--color-void)' }}>
              <dt className="hud-sm">{f.k}</dt>
              <dd className="mt-1.5 text-sm" style={{ color: 'var(--color-bone)' }}>
                {f.v}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal className="mt-14 max-w-3xl">
        <p className="font-display text-[clamp(1.15rem,4vw,1.75rem)] font-extrabold uppercase leading-snug tracking-[0.02em]">
          {bioClose}
        </p>
      </Reveal>
    </Band>
  );
}

/** The end of the page: three ways in, and a signature. */
export function Contact() {
  const { setAskOpen } = useExperience();
  const github = { label: 'GitHub', href: 'https://github.com/AttaullahSher', note: 'the code behind the lab' };
  const doors = [...contact, github];

  return (
    <Band id="contact" accent="var(--color-signal)">
      <Heading index="06" eyebrow={outro.eyebrow} title={outro.title} lead={outro.lead} />

      <Reveal className="mt-12 grid gap-3 md:grid-cols-[1.3fr_1fr]">
        <button
          type="button"
          onClick={() => setAskOpen(true)}
          className="group flex flex-col items-start justify-between gap-10 px-6 py-7 text-left transition-colors duration-300"
          style={{ background: 'var(--color-signal)', color: 'var(--color-void)' }}
        >
          <span className="hud-sm" style={{ color: 'var(--color-void)' }}>
            The console
          </span>
          <span>
            <span className="font-display block text-[clamp(1.6rem,5vw,2.6rem)] font-extrabold uppercase leading-none">
              Ask me anything
            </span>
            <span className="mt-3 block text-sm">Answers what it can. Sends the rest to my phone.</span>
          </span>
        </button>

        <ul className="grid gap-3">
          {doors.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-300 hover:border-[var(--color-signal)]"
                style={{ border: '1px solid var(--hud-line)' }}
              >
                <span>
                  <span className="font-display block text-sm font-bold uppercase tracking-[0.22em] transition-colors group-hover:text-[var(--color-signal)]">
                    {c.label}
                  </span>
                  <span className="hud-sm mt-1 block" style={{ letterSpacing: '0.12em' }}>
                    {c.note}
                  </span>
                </span>
                <span aria-hidden className="hud" style={{ color: 'var(--color-signal)' }}>
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <footer className="mt-24 flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between" style={{ borderTop: '1px solid var(--hud-line)' }}>
        <span className="hud-sm">© {new Date().getFullYear()} Attaullah Sher · Abu Dhabi</span>
        <span className="hud-sm">{outro.signature}</span>
        <span className="hud-sm" style={{ color: 'var(--color-steel-500)' }} title="Try the backtick key. Or an old cheat code.">
          {outro.hidden}
        </span>
      </footer>
    </Band>
  );
}
