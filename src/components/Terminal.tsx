'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ConsoleShell } from './ConsoleShell';
import { useExperience } from '@/lib/experience';
import { answers } from '@/content/answers';
import { playerTag } from '@/content/player';
import { modes, modesNote } from '@/content/profile';
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
    setAskOpen,
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
          { kind: 'out', text: 'abu dhabi · builds systems · answers late' },
          { kind: 'dim', text: 'takes businesses off manual. nobody notices afterwards.' },
          { kind: 'dim', text: 'notices the rest. mentions almost none of it.' },
          { kind: 'dim', text: `also answers to ${playerTag.toLowerCase()}.` },
          { kind: 'dim', text: 'you found the shell, so you are already ahead of most.' },
        ],
      },
      modes: {
        desc: 'what is running at once',
        run: () => [
          ...modes.map((m) => ({
            kind: 'out' as const,
            text: `  ${m.label.toLowerCase().padEnd(16)} ${m.body}`,
          })),
          { kind: 'dim' as const, text: modesNote.toLowerCase() },
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
      ask: {
        desc: 'open the ask console',
        run: () => {
          setAskOpen(true);
          setTerminalOpen(false);
          return [
            {
              kind: 'out',
              text: `${answers.length} answers written by hand. anything else reaches his phone.`,
            },
          ];
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
          { kind: 'dim', text: "type 'ask' — that goes straight to his phone." },
          { kind: 'dim', text: 'addresses are in "who i am" at the end of the page.' },
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
    setAskOpen,
    setTerminalOpen,
    toggleMotion,
    toggleOverdrive,
    toggleSound,
  ]);

  // Focus, the scroll lock, Escape and the scrollback all live in ConsoleShell
  // now. The only thing this component still needs to know is when it opened,
  // because `uptime` reports it.
  useEffect(() => {
    opened.current = Date.now();
  }, []);

  const submit = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

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
    <ConsoleShell
      label="Hidden terminal"
      title="asher@shell"
      placeholder="help"
      inputLabel="Command"
      onClose={() => setTerminalOpen(false)}
      onSubmit={submit}
      scrollKey={history.length}
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
          {l.kind === 'in' ? `\u203a ${l.text}` : l.text}
        </p>
      ))}
    </ConsoleShell>
  );
}
