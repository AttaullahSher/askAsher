/**
 * How the work happens.
 *
 * Five steps, in the order they happen. Instructions, not qualities — a step
 * that could sit on a consultancy's website above a photograph of a handshake
 * gets cut until it could not.
 *
 * One line each, and the line is short. This ran fifty words a step, then
 * thirty-five, and both were a methodology slide sitting in the middle of a
 * descent that is supposed to move. Doctrine is short or it is not doctrine.
 */

export interface Step {
  index: string;
  label: string;
  body: string;
}

export const method: Step[] = [
  {
    index: '01',
    label: 'Watch',
    body: 'A week. I say almost nothing. The owner tells you the problem, and the owner is nearly always wrong.',
  },
  {
    index: '02',
    label: 'Follow one thing',
    body: 'One order, arrival to money. Count the hands. That count is the diagnosis, and nobody has ever counted it.',
  },
  {
    index: '03',
    label: 'Build small',
    body: 'Not the platform. The one piece that removes the longest wait. In use by Friday.',
  },
  {
    index: '04',
    label: 'Make it survive me',
    body: 'It runs alone. If it still needs me in a month I built it wrong.',
  },
  {
    index: '05',
    label: 'Leave',
    body: 'No launch. No training day. An hour a day stops existing and nobody works out why.',
  },
];

/** The cost, stated out loud. Every honest method has one. */
export const methodNote = 'The building is the easy half. The week of watching is where the money is.';
