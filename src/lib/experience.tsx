'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getAmbient } from './audio';
import { usePersistentState, usePrefersReducedMotion } from './hooks';

export type MotionMode = 'full' | 'reduced';

interface ExperienceValue {
  /** False until the visitor passes the entry gate. */
  entered: boolean;
  enter: () => void;
  /** True while the three-line cinematic is still playing. */
  introPlaying: boolean;
  endIntro: () => void;

  motion: MotionMode;
  toggleMotion: () => void;

  sound: boolean;
  toggleSound: () => void;

  overdrive: boolean;
  toggleOverdrive: () => void;

  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;

  /** Easter-egg flags, surfaced in the hidden terminal's `status` command. */
  found: Record<string, boolean>;
  markFound: (key: string) => void;
}

const Ctx = createContext<ExperienceValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const osReduced = usePrefersReducedMotion();
  const [motionPref, setMotionPref] = usePersistentState<MotionMode | 'auto'>(
    'asher.motion',
    'auto',
  );

  const [entered, setEntered] = useState(false);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const [overdrive, setOverdrive] = useState(false);
  const [terminalOpen, setTerminalOpenState] = useState(false);
  const [found, setFound] = useState<Record<string, boolean>>({});

  const motion: MotionMode =
    motionPref === 'auto' ? (osReduced ? 'reduced' : 'full') : motionPref;

  // The two document-level flags every stylesheet rule keys off.
  useEffect(() => {
    document.documentElement.dataset.motion = motion;
  }, [motion]);

  useEffect(() => {
    document.documentElement.dataset.overdrive = overdrive ? 'on' : 'off';
    getAmbient().setIntensity(overdrive);
  }, [overdrive]);

  useEffect(() => {
    document.body.dataset.locked = String(!entered);
  }, [entered]);

  // Warm the audio probe while the gate is still up, so ENTER is instant.
  useEffect(() => {
    void getAmbient().prepare();
  }, []);

  const markFound = useCallback((key: string) => {
    setFound((f) => (f[key] ? f : { ...f, [key]: true }));
  }, []);

  const enter = useCallback(() => {
    setEntered(true);
    // Reduced motion skips the cinematic entirely — there is nothing to play.
    setIntroPlaying(motion === 'full');
  }, [motion]);

  const endIntro = useCallback(() => setIntroPlaying(false), []);

  const setTerminalOpen = useCallback(
    (open: boolean) => {
      setTerminalOpenState(open);
      if (open) markFound('terminal');
    },
    [markFound],
  );

  const toggleMotion = useCallback(() => {
    setMotionPref(motion === 'full' ? 'reduced' : 'full');
  }, [motion, setMotionPref]);

  const toggleSound = useCallback(() => {
    const amb = getAmbient();
    setSound((on) => {
      if (on) amb.suspend();
      else void amb.start();
      return !on;
    });
  }, []);

  const toggleOverdrive = useCallback(() => setOverdrive((v) => !v), []);

  const value = useMemo<ExperienceValue>(
    () => ({
      entered,
      enter,
      introPlaying,
      endIntro,
      motion,
      toggleMotion,
      sound,
      toggleSound,
      overdrive,
      toggleOverdrive,
      terminalOpen,
      setTerminalOpen,
      found,
      markFound,
    }),
    [
      entered,
      enter,
      introPlaying,
      endIntro,
      motion,
      toggleMotion,
      sound,
      toggleSound,
      overdrive,
      toggleOverdrive,
      terminalOpen,
      setTerminalOpen,
      found,
      markFound,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExperience(): ExperienceValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useExperience must be used inside <ExperienceProvider>');
  return v;
}
