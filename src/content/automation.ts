/**
 * The AUTOMATION sector.
 *
 * A pipeline diagram explains the mechanism but not the point. The point is
 * the gap: the same morning, in two businesses. One still runs on people, one
 * has already been moved. Illustrative of the shape of the work, not a
 * measurement of any particular business.
 */

export interface ManualStep {
  text: string;
  /** Minutes this step costs a person. */
  cost: number;
}

export const manual: ManualStep[] = [
  { text: 'A customer asks what it costs. Read it twice.', cost: 3 },
  { text: 'Open three files to find what is actually in stock.', cost: 5 },
  { text: 'Ask the one person who remembers this customer’s price.', cost: 4 },
  { text: 'Find last month’s document. Rename it. Again.', cost: 2 },
  { text: 'Type it all out by hand and pray about the decimal point.', cost: 4 },
  { text: 'Send it. Mean to file it. File it tomorrow.', cost: 2 },
  { text: 'Start again — another one just came in.', cost: 4 },
];

export const automated = {
  /** Seconds. */
  cost: 1.4,
  line: 'Request in. Answer out. Priced, sent and filed before anyone looks up.',
  /** Shown under the bar once the machine side has resolved. */
  status: 'Nobody was asked. Nobody was chased.',
  idle: 'Waiting',
};

export const automationLead = 'The same morning, in two businesses.';

export const automationNote =
  'The clever part was never the software. It is that the whole business finally answers from one place — one price, one stock figure, one record — so the fast answer and the correct answer are the same answer. Nobody gets thanked for saving twenty minutes. Everybody notices when the twenty minutes stop existing.';
