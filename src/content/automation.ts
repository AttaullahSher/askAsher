/**
 * The AUTOMATION sector.
 *
 * Not a diagram of a process. A relay: one request walks through six apps that
 * were never built to speak to each other, and nobody opens a single one of
 * them. Illustrative of the shape of the work, not a measurement of anything.
 */

export interface Hop {
  id: string;
  /** The app. Real names — everybody already knows what these are. */
  app: string;
  /** What it is doing in the chain. A few words. */
  role: string;
  /** What leaves it and walks to the next one. */
  carries: string;
}

export const relay: Hop[] = [
  { id: 'whatsapp', app: 'WhatsApp', role: 'where it lands', carries: 'a voice note · 11.40pm' },
  { id: 'sheets', app: 'Sheets', role: 'what actually exists', carries: 'three items · two in stock' },
  { id: 'drive', app: 'Drive', role: 'the document writes itself', carries: 'a quotation · priced' },
  { id: 'gmail', app: 'Gmail', role: 'out of the door', carries: 'sent · nobody was awake' },
  { id: 'calendar', app: 'Calendar', role: 'the chase books itself', carries: 'Tuesday · if they go quiet' },
  { id: 'phone', app: 'My phone', role: 'the only part a human sees', carries: 'quoted · sent · filed' },
];

export const automationLead = 'One message. Six apps. Nobody opened any of them.';

/** Shown once the relay has run end to end. */
export const relayFooter = {
  value: '1.4',
  unit: 'sec',
  label: 'end to end',
};

export const automationNote =
  'Not one of these apps was built to speak to any of the others. That is the entire job — I put the wiring in between them. After that the request walks the whole chain on its own, at midnight, while everybody who used to do it by hand is asleep.';
