'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useExperience } from '@/lib/experience';
import { ToastStack, type ToastMessage } from './Toast';

const KONAMI = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright',
  'b', 'a',
];

const CONSOLE_ART = `
   ▄▀█ █▀ █░█ █▀▀ █▀█
   █▀█ ▄█ █▀█ ██▄ █▀▄
`;

/**
 * All the hidden things, in one place so they are easy to audit and easy to
 * change. Nothing here interrupts the visitor who never looks for it.
 */
export function EasterEggs() {
  const { entered, setTerminalOpen, terminalOpen, toggleOverdrive, overdrive, markFound } =
    useExperience();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const seq = useRef<string[]>([]);
  const word = useRef('');
  const nextId = useRef(1);

  const push = useCallback((title: string, body?: string) => {
    const id = nextId.current;
    nextId.current += 1;
    setToasts((t) => [...t.slice(-2), { id, title, body }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200);
  }, []);

  // --- console note: for whoever opens devtools
  useEffect(() => {
    const brand = 'color:#ff8a1f;font-weight:700;font-family:monospace';
    const dim = 'color:#7d8894;font-family:monospace';
    console.log(`%c${CONSOLE_ART}`, brand);
    console.log('%cyou opened the console. good instinct.', dim);
    console.log(
      '%cthere is a shell on this page. press ` or tap the wordmark three times.',
      dim,
    );
    console.log('%c↑ ↑ ↓ ↓ ← → ← → B A still works, too.', dim);
  }, []);

  // --- supply drop: fired by the atmosphere canvas hit test
  useEffect(() => {
    const onSupply = () => push('Supply secured', 'One crate, one beacon, one person who looked up.');
    window.addEventListener('asher:supply', onSupply);
    return () => window.removeEventListener('asher:supply', onSupply);
  }, [push]);

  // --- keyboard secrets
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (typing) return;

      // backtick / tilde opens the shell
      if ((e.key === '`' || e.key === '~') && entered && !terminalOpen) {
        e.preventDefault();
        setTerminalOpen(true);
        return;
      }

      const k = e.key.toLowerCase();

      // konami
      seq.current = [...seq.current, k].slice(-KONAMI.length);
      if (seq.current.join(',') === KONAMI.join(',')) {
        seq.current = [];
        toggleOverdrive();
        markFound('konami');
        push(
          overdrive ? 'Overdrive disengaged' : 'Overdrive engaged',
          overdrive ? 'Back to standard atmosphere.' : 'The whole drop zone just got warmer.',
        );
        return;
      }

      // typing the name anywhere
      if (/^[a-z]$/.test(k)) {
        word.current = (word.current + k).slice(-5);
        if (word.current === 'asher') {
          word.current = '';
          push('Signal acknowledged', 'Press ` for the shell. Then type asher again.');
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entered, terminalOpen, setTerminalOpen, toggleOverdrive, overdrive, markFound, push]);

  return <ToastStack items={toasts} />;
}
