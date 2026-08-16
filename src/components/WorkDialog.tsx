'use client';

import { useState } from 'react';
import { Block, Overlay } from './Overlay';
import { projects, type Project } from '@/content/projects';
import { asset } from '@/lib/paths';

const STATUS_COLOR: Record<Project['status'], string> = {
  LIVE: 'var(--color-signal)',
  INTERNAL: 'var(--color-ice)',
  ONGOING: 'var(--color-violet)',
};

/**
 * The work. A list first, then one file at a time — a stack of six full
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

function Index({ onOpen }: { onOpen: (p: Project) => void }) {
  return (
    <>
      <p className="prose-body mb-6">
        Six systems. Most of them are quietly running somewhere right now.
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
                <span
                  className="font-display block text-base font-extrabold uppercase transition-colors duration-300 group-hover:text-[var(--color-signal)]"
                  style={{ letterSpacing: '0.08em' }}
                >
                  {p.title}
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

      {project.flow && (
        <Block label="How it works">
          <ol className="relative space-y-0">
            <span
              aria-hidden
              className="absolute bottom-4 left-[11px] top-4 w-px"
              style={{ background: 'var(--hud-line)' }}
            />
            {project.flow.map((f) => (
              <li key={f.step} className="relative flex gap-4 py-2.5">
                <span
                  aria-hidden
                  className="relative z-10 mt-1 grid h-[23px] w-[23px] shrink-0 place-items-center"
                  style={{
                    border: '1px solid color-mix(in oklab, var(--color-signal) 55%, transparent)',
                    background: 'var(--color-void)',
                  }}
                >
                  <span
                    className="block h-1.5 w-1.5"
                    style={{ background: 'var(--color-signal)' }}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="font-display block text-xs font-bold uppercase"
                    style={{ letterSpacing: '0.2em', color: 'var(--color-signal)' }}
                  >
                    {f.step}
                  </span>
                  <span
                    className="mt-1 block text-sm leading-relaxed"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {f.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Block>
      )}

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

      <Block label="Built with">
        <ul className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <li
              key={t}
              className="hud-sm px-2 py-1"
              style={{ border: '1px solid var(--hud-line)' }}
            >
              {t}
            </li>
          ))}
        </ul>
      </Block>

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
