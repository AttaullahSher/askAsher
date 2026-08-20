/**
 * How the work actually happens.
 *
 * The site had five sectors saying *what* he does and a personal file saying
 * *who* he is, and nothing at all saying *how*. This is that half.
 *
 * Written as a sequence, not as a set of virtues. Every step is something that
 * physically happens in a building, in an order, and the reason each one is
 * there is that skipping it has cost somebody money. No step describes a
 * quality of the person doing it — if a line could appear on a consultancy's
 * website above a photograph of a handshake, it gets rewritten until it could
 * not.
 */

export interface Step {
  index: string;
  label: string;
  body: string;
}

export const method: Step[] = [
  {
    index: '01',
    label: 'Watch first',
    body: 'A week of saying almost nothing. The owner will tell you what the problem is, and the owner is nearly always wrong — not because they are stupid, because they have not stood at the counter at four on a Thursday in two years. The problem is wherever people have quietly built a workaround and stopped mentioning it.',
  },
  {
    index: '02',
    label: 'Follow one thing all the way',
    body: 'One order, one invoice, one delivery. Trace it from the moment it arrives to the moment the money lands, and count every hand it passes through and every time somebody retypes what the last person already typed. That count is the whole diagnosis. It is usually somewhere between six and eleven, and nobody in the building has ever counted it.',
  },
  {
    index: '03',
    label: 'Build the smallest thing that works',
    body: 'Not the platform. Not the system that will do everything by next year. The one piece that removes the longest wait, shipped in days, in use by Friday. A business can survive a small thing being wrong. It cannot survive six months of me being clever.',
  },
  {
    index: '04',
    label: 'Make it survive me',
    body: 'It runs on its own, it explains itself when it breaks, and the person using it never has to know why it works. If it still needs me a month later I built it wrong and I go back and fix that, on my own time, because that one is mine.',
  },
  {
    index: '05',
    label: 'Leave',
    body: 'The measure of the job is that nothing feels different. No launch, no training day, no new thing to learn. An hour a day stops existing and the only evidence is that people start getting home earlier and never quite work out why.',
  },
];

/**
 * The frame around the method. States the trade-off out loud, because every
 * honest method has one and hiding it is how you end up sounding like a
 * brochure.
 */
export const methodNote =
  'None of this is fast, and none of it is the part anybody wants to pay for. The building is the easy half. The week of watching is where the money actually is.';
