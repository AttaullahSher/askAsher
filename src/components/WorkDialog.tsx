'use client';

import { useState } from 'react';
import { Block, Overlay } from './Overlay';
import { projects, type Project } from '@/content/projects';
import { asset } from '@/lib/paths';

const STATUS_COLOR: Record<Project['status'], string> = {
  LIVE: 'var(--color-signal)',
  PRIVATE: 'var(--color-ice)',
  CLOSED: 'var(--color-alert)',
};

/**
 * The work. A list first, then one file at a time — a stack of eight full
 * case studies is a wall of text on a phone.
 */
export function WorkDialog({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState<Project | null>(null);

  return (
    <Overlay
      label={open ? `Project: ${open.title}` : 'The work'}
      eyebrow={open ? `● ${open.status} · ${open.code}` : '● Index'}
      title={open ? open.title : 'The work'}
      onClose={onClose}
      onBack={open ? () => setOpen(null) : undefined}
    >
      {open ? <Detail project={open} /> : <Index onOpen={setOpen} />}
    </Overlay>
  );
}

/** Counting in words, so the copy can never drift out of step with the list. */
const WORDS = [
  'no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve',
];
const spell = (n: number) => WORDS[n] ?? String(n);
const Spell = (n: number) => {
  const w = spell(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

function Index({ onOpen }: { onOpen: (p: Project) => void }) {
  // Counted, never typed. The old copy said "ten files, three you can open"
  // in two different places and both were hand-maintained.
  const openable = projects.filter((p) => p.href).length;

  return (
    <>
      <p className="prose-body mb-3">
        Some of it runs a business. The rest is how a thing works, and then how
        it comes apart.
      </p>
      {/*
        The line that decides how a reader files him. Taking something apart
        and keeping it standing are the same skill; saying which one he has
        been paid for says he could do the other without ever claiming he did.
      */}
      <p className="prose-body mb-3">
        Knowing how a thing comes apart is the same skill as keeping it
        together. I have only ever been paid for the second one.
      </p>
      <p className="prose-body mb-6" style={{ color: 'var(--color-muted)' }}>
        {Spell(projects.length)} files. {Spell(openable)} open.
      </p>
      <ul className="grid gap-2">
        {projects.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onOpen(p)}
              className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors duration-300"
              style={{
                border: '1px solid var(--hud-line)',
                background: 'color-mix(in oklab, var(--color-smoke) 45%, transparent)',
              }}
            >
              <span
                className="hud-sm shrink-0 tabular-nums"
                style={{ color: STATUS_COLOR[p.status] }}
              >
                {p.code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span
                    className="font-display block text-base font-extrabold uppercase transition-colors duration-300 group-hover:text-[var(--color-signal)]"
                    style={{ letterSpacing: '0.08em' }}
                  >
                    {p.title}
                  </span>
                  {/*
                    The status used to exist only as the colour of the code on
                    the left, which meant the one piece of signal on the row was
                    unreadable. LIVE / PRIVATE / CLOSED all say something worth
                    reading, so they are said.
                  */}
                  <span
                    className="hud-sm shrink-0"
                    style={{ color: STATUS_COLOR[p.status] }}
                  >
                    {p.status}
                  </span>
                </span>
                <span className="mt-1 block text-xs" style={{ color: 'var(--color-muted)' }}>
                  {p.blurb}
                </span>
              </span>
              <span
                aria-hidden
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: 'var(--color-steel-500)' }}
              >
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Detail({ project }: { project: Project }) {
  return (
    <div className="space-y-7">
      <Block label="What it is">
        <p className="prose-body">{project.what}</p>
      </Block>

      <Block label="Why it exists">
        <p className="prose-body">{project.why}</p>
      </Block>

      {project.does && (
        <Block label="What it does">
          <ul className="space-y-2">
            {project.does.map((d) => (
              <li key={d} className="prose-body flex gap-3">
                <span aria-hidden style={{ color: 'var(--color-signal)' }}>
                  ›
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {project.made && (
        <Block label="What it took">
          <p className="prose-body">{project.made}</p>
        </Block>
      )}

      {project.guarded && (
        <p
          className="px-4 py-3 text-xs leading-relaxed"
          style={{
            border: '1px solid var(--hud-line)',
            color: 'var(--color-steel-500)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {project.guarded}
        </p>
      )}

      {project.href && (
        <a
          href={asset(project.href)}
          target={project.href.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="hud-sm inline-flex items-center gap-2 px-5 py-3 transition-colors"
          style={{
            border: '1px solid color-mix(in oklab, var(--color-signal) 50%, transparent)',
            color: 'var(--color-signal)',
            background: 'color-mix(in oklab, var(--color-signal) 8%, transparent)',
          }}
        >
          {project.hrefLabel ?? 'Open'} <span aria-hidden>→</span>
        </a>
      )}
    </div>
  );
}
