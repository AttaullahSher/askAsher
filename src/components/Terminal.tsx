'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useExperience } from '@/lib/experience';
import { playerTag } from '@/content/player';
import { projects } from '@/content/projects';
import { sectors, site } from '@/content/site';
import { stack } from '@/content/stack';

interface Line {
  kind: 'in' | 'out' | 'accent' | 'dim';
  text: string;
}

const BANNER = [
  '  ▄▀█ █▀ █░█ █▀▀ █▀█',
  '  █▀█ ▄█ █▀█ ██▄ █▀▄',
];

/**
 * The hidden terminal. Real commands, no fake spam, and every one of them
 * returns something true about this site. Opened with ` / ~, the HUD button, or
 * three taps on the wordmark.
 */
export function Terminal() {
  const {
    setTerminalOpen,
    overdrive,
    toggleOverdrive,
    motion,
    toggleMotion,
    sound,
    toggleSound,
    found,
    markFound,
  } = useExperience();

  const [history, setHistory] = useState<Line[]>(() => [
    { kind: 'accent', text: `${site.name} // shell` },
    { kind: 'dim', text: "type 'help'. esc closes." },
  ]);
  const [value, setValue] = useState('');
  const [recall, setRecall] = useState<string[]>([]);
  const [recallAt, setRecallAt] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const opened = useRef(0);

  const commands = useMemo(() => {
    const list: Record<string, { desc: string; run: () => Line[] | void }> = {
      help: {
        desc: 'this list',
        // Commands with no description stay off the list. Those are the ones
        // you are meant to find rather than be told about.
        run: () =>
          Object.entries(list)
            .filter(([, v]) => v.desc.length > 0)
            .map(([k, v]) => ({
              kind: 'out' as const,
              text: `  ${k.padEnd(10)} ${v.desc}`,
            })),
      },
      whoami: {
        desc: 'who is asher',
        run: () => [
          { kind: 'accent', text: 'asher' },
          { kind: 'out', text: 'business transformation · automation + ai · plays to win' },
          { kind: 'dim', text: 'takes businesses off manual. nobody notices afterwards.' },
          { kind: 'dim', text: 'notices the rest. mentions almost none of it.' },
          { kind: 'dim', text: `also answers to ${playerTag.toLowerCase()}.` },
          { kind: 'dim', text: 'you found the shell, so you are already ahead of most.' },
        ],
      },
      sectors: {
        desc: 'list the sectors',
        run: () =>
          sectors.map((s) => ({
            kind: 'out' as const,
            text: `  ${s.index}  ${s.title.padEnd(12)} ${s.subtitle}`,
          })),
      },
      work: {
        desc: 'what exists',
        run: () =>
          projects.map((p) => ({
            kind: 'out' as const,
            text: `  ${p.code}  [${p.status.padEnd(8)}] ${p.title.padEnd(8)} ${p.blurb}`,
          })),
      },
      stack: {
        desc: 'tools of the trade',
        run: () => [
          { kind: 'out', text: stack.map((s) => s.label).join(' · ') },
        ],
      },
      status: {
        desc: 'what you have found',
        run: () => {
          const secrets: [string, string][] = [
            ['supply', 'clicked the airdrop'],
            ['konami', 'entered overdrive'],
            ['terminal', 'opened this terminal'],
            ['deep', 'found the last one'],
          ];
          return [
            { kind: 'accent', text: `secrets ${secrets.filter(([k]) => found[k]).length}/${secrets.length}` },
            ...secrets.map(([k, label]) => ({
              kind: (found[k] ? 'out' : 'dim') as Line['kind'],
              text: `  [${found[k] ? '×' : ' '}] ${label}`,
            })),
          ];
        },
      },
      uptime: {
        desc: 'session time',
        run: () => {
          const s = Math.round((Date.now() - opened.current) / 1000);
          return [{ kind: 'out', text: `terminal up ${s}s · you have been here longer` }];
        },
      },
      overdrive: {
        desc: 'toggle overdrive',
        run: () => {
          toggleOverdrive();
          markFound('konami');
          return [
            { kind: 'accent', text: overdrive ? 'overdrive · off' : 'overdrive · engaged' },
          ];
        },
      },
      motion: {
        desc: 'toggle animation',
        run: () => {
          toggleMotion();
          return [{ kind: 'out', text: `motion · ${motion === 'full' ? 'reduced' : 'full'}` }];
        },
      },
      sound: {
        desc: 'toggle ambience',
        run: () => {
          toggleSound();
          return [{ kind: 'out', text: `sound · ${sound ? 'off' : 'on'}` }];
        },
      },
      sudo: {
        desc: '?',
        run: () => [
          { kind: 'dim', text: 'you are not in the sudoers file.' },
          { kind: 'dim', text: 'i am. this incident has been logged and quietly enjoyed.' },
        ],
      },
      contact: {
        desc: 'where to find me',
        run: () => [
          { kind: 'out', text: `${site.url}` },
          { kind: 'dim', text: 'open "who i am" at the end of the page. it is in there.' },
        ],
      },
      asher: {
        desc: '',
        run: () => {
          markFound('deep');
          return [
            ...BANNER.map((text) => ({ kind: 'accent' as const, text })),
            { kind: 'dim', text: '' },
            { kind: 'out', text: 'you went looking. most people do not.' },
            { kind: 'dim', text: 'every line on this page was written by hand, on purpose.' },
            { kind: 'dim', text: 'so was the part you have not found.' },
          ];
        },
      },
      clear: { desc: 'wipe the buffer', run: () => setHistory([]) },
      exit: { desc: 'close', run: () => setTerminalOpen(false) },
    };
    return list;
  }, [
    found,
    markFound,
    motion,
    overdrive,
    sound,
    setTerminalOpen,
    toggleMotion,
    toggleOverdrive,
    toggleSound,
  ]);

  useEffect(() => {
    opened.current = Date.now();
    const id = window.setTimeout(() => inputRef.current?.focus(), 120);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [history]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTerminalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setTerminalOpen]);

  const submit = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setValue('');
    if (!cmd) return;
    setRecall((r) => [cmd, ...r].slice(0, 30));
    setRecallAt(-1);

    const next: Line[] = [{ kind: 'in', text: cmd }];
    const entry = commands[cmd];
    if (entry) {
      const out = entry.run();
      if (out) next.push(...out);
    } else {
      next.push({ kind: 'dim', text: `${cmd}: not found. try 'help'.` });
    }
    if (cmd === 'clear') return;
    setHistory((h) => [...h, ...next]);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center sm:justify-center">
      <button
        type="button"
        aria-label="Close terminal"
        onClick={() => setTerminalOpen(false)}
        className="absolute inset-0 cursor-default"
        style={{ background: 'rgba(2,4,7,0.82)', backdropFilter: 'blur(4px)' }}
        tabIndex={-1}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hidden terminal"
        className="scanlines relative flex h-[70svh] w-full flex-col overflow-hidden sm:h-[30rem] sm:max-w-2xl"
        style={{
          border: '1px solid color-mix(in oklab, var(--color-signal) 30%, transparent)',
          background: 'linear-gradient(180deg, rgba(7,10,15,0.97), rgba(3,5,8,0.97))',
          animation: 'dialog-in 340ms var(--ease-out-expo) both',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: '1px solid var(--hud-line)' }}
        >
          <span className="hud-sm" style={{ color: 'var(--color-signal)' }}>
            asher@shell
          </span>
          <button
            type="button"
            onClick={() => setTerminalOpen(false)}
            className="hud-sm px-2 py-1 transition-colors hover:text-[var(--color-bone)]"
          >
            esc
          </button>
        </div>

        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto px-3 py-3"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.65 }}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((l, i) => (
            <p
              key={i}
              className="whitespace-pre-wrap break-words"
              style={{
                color:
                  l.kind === 'accent'
                    ? 'var(--color-signal)'
                    : l.kind === 'dim'
                      ? 'var(--color-steel-500)'
                      : l.kind === 'in'
                        ? 'var(--color-hot)'
                        : 'var(--color-muted)',
              }}
            >
              {l.kind === 'in' ? `› ${l.text}` : l.text}
            </p>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className="flex items-center gap-2 px-3 py-2.5 focus-within:bg-[rgba(255,138,31,0.04)]"
          style={{ borderTop: '1px solid color-mix(in oklab, var(--color-signal) 26%, transparent)' }}
        >
          <span style={{ color: 'var(--color-signal)', fontFamily: 'var(--font-mono)' }}>›</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                const at = Math.min(recallAt + 1, recall.length - 1);
                if (at >= 0) {
                  setRecallAt(at);
                  setValue(recall[at] ?? '');
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const at = recallAt - 1;
                setRecallAt(at);
                setValue(at >= 0 ? (recall[at] ?? '') : '');
              }
            }}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Command"
            placeholder="help"
            // The caret is the focus indicator here; a ring around the only
            // control in a shell reads as an error state.
            className="w-full bg-transparent outline-none focus-visible:outline-none"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px', // 16px stops iOS zooming the whole page on focus
              color: 'var(--color-hot)',
            }}
          />
        </form>
      </div>
    </div>
  );
}
