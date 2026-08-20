/**
 * How the work happens.
 *
 * Five steps, in the order they happen. Written as instructions rather than as
 * qualities — a step that could sit on a consultancy's website above a
 * photograph of a handshake gets cut until it could not.
 *
 * One line each. The previous version ran fifty words a step, which is a
 * methodology slide; this is doctrine, and doctrine is short.
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
    body: 'A week. I say almost nothing. The owner tells you what the problem is, and the owner is nearly always wrong — they have not stood at the counter at four on a Thursday in two years.',
  },
  {
    index: '02',
    label: 'Follow one thing',
    body: 'One order, arrival to money. Count the hands it passes through and every time somebody retypes what the last person typed. That count is the diagnosis. Nobody in the building has ever counted it.',
  },
  {
    index: '03',
    label: 'Build small',
    body: 'Not the platform. The one piece that removes the longest wait. In use by Friday. A business survives a small thing being wrong. It does not survive six months of me being clever.',
  },
  {
    index: '04',
    label: 'Make it survive me',
    body: 'It runs alone. It explains itself when it breaks. If it still needs me in a month I built it wrong, and I fix that on my own time.',
  },
  {
    index: '05',
    label: 'Leave',
    body: 'No launch. No training day. An hour a day stops existing and nobody works out why they are getting home earlier.',
  },
];

/** The cost, stated out loud. Every honest method has one. */
export const methodNote =
  'The building is the easy half. The week of watching is where the money actually is.';
