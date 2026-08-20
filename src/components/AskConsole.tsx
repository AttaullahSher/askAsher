'use client';

import { useState } from 'react';
import { ConsoleShell } from './ConsoleShell';
import { matchAnswer } from '@/lib/ask';
import { answers, askIntro, askMiss, askPrompts, type Answer } from '@/content/answers';
import { contact, relay } from '@/content/profile';

interface Turn {
  q: string;
  answer: Answer | null;
}

type Stage = 'idle' | 'form' | 'sending' | 'done' | 'failed';

/**
 * The front door.
 *
 * The repository has been called askAsher the whole time and there was nothing
 * on the page to ask — the only interaction was a heart with a made-up number
 * under it and a 140-character note that nothing ever came back from.
 *
 * What happens here: the visitor types, `matchAnswer` scores it against the
 * hand-written corpus, and the winning answer is printed in his voice. A miss
 * is the interesting case — it offers to carry the question to his phone, so
 * the console has two good outcomes and no dead end.
 *
 * Nothing is generated. See `src/lib/ask.ts` for why that matters.
 */
export function AskConsole({ onClose }: { onClose: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [stage, setStage] = useState<Stage>('idle');
  const [pending, setPending] = useState('');
  const [who, setWho] = useState('');
  /** Honeypot. A human never sees it; a bot fills it and gets dropped. */
  const [trap, setTrap] = useState('');

  const instagram = contact.find((c) => c.href.includes('instagram'))?.href;
  const last = turns[turns.length - 1];

  const ask = (q: string) => {
    setTurns((t) => [...t, { q, answer: matchAnswer(q) }]);
    // A new question supersedes a half-finished relay rather than stacking on it.
    if (stage !== 'sending') setStage('idle');
  };

  const openRelay = (q: string) => {
    setPending(q);
    setWho('');
    setStage('form');
  };

  const send = async () => {
    if (stage === 'sending' || !pending.trim()) return;
    if (trap) {
      // Silently accept and discard — a bot gets no signal either way.
      setStage('done');
      return;
    }

    setStage('sending');
    const name = who.trim() || 'someone';

    try {
      const res = await fetch(relay.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          message: pending,
          _subject: `ASHER — a question from ${name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStage('done');
    } catch {
      setStage('failed');
    }
  };

  return (
    <ConsoleShell
      label="Ask Asher"
      title="ask asher"
      status={
        <span className="hud-sm" style={{ color: 'var(--color-steel-500)' }}>
          {answers.length} written
        </span>
      }
      placeholder="ask me something"
      inputLabel="Your question"
      onClose={onClose}
      onSubmit={ask}
      scrollKey={`${turns.length}:${stage}`}
      below={
        stage === 'idle' ? null : (
          <Relay
            stage={stage}
            pending={pending}
            who={who}
            setWho={setWho}
            trap={trap}
            setTrap={setTrap}
            instagram={instagram}
            onSend={() => void send()}
            onCancel={() => setStage('idle')}
          />
        )
      }
    >
      {askIntro.map((l, i) => (
        <p key={l} style={{ color: i === 0 ? 'var(--color-signal)' : 'var(--color-steel-500)' }}>
          {l}
        </p>
      ))}

      {turns.length === 0 && (
        <Chips
          className="mt-3"
          items={askPrompts}
          onPick={ask}
        />
      )}

      {turns.map((t, i) => (
        <div key={`${i}-${t.q}`} className="mt-4">
          <p className="break-words" style={{ color: 'var(--color-hot)' }}>
            {`› ${t.q}`}
          </p>

          {t.answer ? (
            <>
              {t.answer.reply.map((line, j) => (
                <p
                  key={line}
                  className="mt-1.5 break-words"
                  style={{
                    color: j === 0 ? 'var(--color-bone)' : 'var(--color-muted)',
                    animation: 'fade-in 420ms var(--ease-out-expo) both',
                    animationDelay: `${j * 130}ms`,
                  }}
                >
                  {line}
                </p>
              ))}
              {/* Follow-ups only on the newest turn — older ones are transcript. */}
              {t === last && t.answer.then && t.answer.then.length > 0 && (
                <Chips className="mt-2.5" items={t.answer.then} onPick={ask} />
              )}
            </>
          ) : (
            <div className="mt-1.5">
              <p style={{ color: 'var(--color-bone)' }}>{askMiss.lead}</p>
              <p className="mt-1" style={{ color: 'var(--color-muted)' }}>
                {askMiss.body}
              </p>
              {t === last && stage === 'idle' && (
                <button
                  type="button"
                  onClick={() => openRelay(t.q)}
                  className="hud-sm mt-2.5 px-3 py-2 transition-colors hover:text-[var(--color-signal)]"
                  style={{
                    border: '1px solid color-mix(in oklab, var(--color-signal) 45%, transparent)',
                    color: 'var(--color-signal)',
                  }}
                >
                  {askMiss.cta} →
                </button>
              )}
            </div>
          )}

          {/*
            Also offered after a matched answer. Somebody who liked the answer
            is the likeliest person on the page to want to say something back,
            and making them go and find an address is how that gets lost.
          */}
          {t === last && t.answer && stage === 'idle' && (
            <button
              type="button"
              onClick={() => openRelay(t.q)}
              className="hud-sm mt-2.5 transition-colors hover:text-[var(--color-signal)]"
              style={{ color: 'var(--color-steel-500)' }}
            >
              or send this one to him →
            </button>
          )}
        </div>
      ))}
    </ConsoleShell>
  );
}

/** The relay, in the slot between the transcript and the input. */
function Relay({
  stage,
  pending,
  who,
  setWho,
  trap,
  setTrap,
  instagram,
  onSend,
  onCancel,
}: {
  stage: Stage;
  pending: string;
  who: string;
  setWho: (v: string) => void;
  trap: string;
  setTrap: (v: string) => void;
  instagram?: string;
  onSend: () => void;
  onCancel: () => void;
}) {
  if (stage === 'done') {
    return (
      <div
        className="px-3 py-3"
        style={{ borderTop: '1px solid var(--hud-line)', fontFamily: 'var(--font-mono)' }}
      >
        <p
          className="font-display text-sm font-extrabold uppercase"
          style={{ letterSpacing: '0.08em', color: 'var(--color-signal)' }}
        >
          {relay.thanksTitle}
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
          {relay.thanksBody}
        </p>
      </div>
    );
  }

  if (stage === 'failed') {
    return (
      <div
        className="px-3 py-3"
        style={{ borderTop: '1px solid var(--hud-line)', fontFamily: 'var(--font-mono)' }}
      >
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {relay.failBody}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="hud-sm px-3 py-2 transition-colors hover:text-[var(--color-signal)]"
              style={{ border: '1px solid var(--hud-line)' }}
            >
              Instagram →
            </a>
          )}
          <button
            type="button"
            onClick={onSend}
            className="hud-sm px-3 py-2 transition-colors hover:text-[var(--color-bone)]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="px-3 py-3"
      style={{ borderTop: '1px solid var(--hud-line)', fontFamily: 'var(--font-mono)' }}
    >
      <p className="hud-sm" style={{ color: 'var(--color-signal)' }}>
        Sending
      </p>
      <p
        className="mt-1 break-words text-xs"
        style={{ color: 'var(--color-bone)' }}
      >
        {`“${pending}”`}
      </p>

      <label className="mt-2.5 block">
        <span className="hud-sm mb-1 block">Who are you? (optional)</span>
        <input
          value={who}
          onChange={(e) => setWho(e.target.value)}
          placeholder="a name, or a handle to answer on"
          maxLength={60}
          className="w-full bg-transparent px-2.5 py-2 outline-none"
          style={{
            border: '1px solid var(--hud-line)',
            fontFamily: 'var(--font-mono)',
            // 16px stops iOS zooming the whole page on focus.
            fontSize: '16px',
            color: 'var(--color-hot)',
          }}
        />
      </label>

      {/* honeypot */}
      <input
        type="text"
        name="_honey"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="sr-only"
      />

      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onSend}
          disabled={stage === 'sending'}
          className="hud-sm px-4 py-2 transition-all disabled:opacity-35"
          style={{
            border: '1px solid color-mix(in oklab, var(--color-signal) 50%, transparent)',
            color: 'var(--color-signal)',
            background: 'color-mix(in oklab, var(--color-signal) 8%, transparent)',
          }}
        >
          {stage === 'sending' ? 'Sending…' : 'Send →'}
        </button>
        {stage === 'form' && (
          <button
            type="button"
            onClick={onCancel}
            className="hud-sm px-3 py-2 transition-colors hover:text-[var(--color-bone)]"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Chips({
  items,
  onPick,
  className,
}: {
  items: string[];
  onPick: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ''}`}>
      {items.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          className="hud-sm px-2.5 py-1.5 text-left transition-colors hover:text-[var(--color-signal)]"
          style={{ border: '1px solid var(--hud-line)' }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
