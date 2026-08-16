/**
 * The AUTOMATION sector.
 *
 * A pipeline diagram explains the mechanism but not the point. The point is
 * the gap: the same job, done twice, side by side. One enquiry — illustrative
 * of the shape of the work, not a measurement of any particular business.
 */

export interface ManualStep {
  text: string;
  /** Minutes this step costs a person. */
  cost: number;
}

export const manual: ManualStep[] = [
  { text: 'Read the message. Read it again.', cost: 2 },
  { text: 'Open the catalogue. Hunt for three items.', cost: 5 },
  { text: 'Check what is genuinely in stock.', cost: 4 },
  { text: 'Work out the price for this customer.', cost: 3 },
  { text: 'Find last month’s template. Rename it.', cost: 2 },
  { text: 'Retype all of it, correctly, by hand.', cost: 4 },
  { text: 'Send it. File it. Forget to file it.', cost: 2 },
];

export const automated = {
  /** Seconds. */
  cost: 1.4,
  line: 'Message in. Quotation out. Filed on the way past.',
};

export const automationLead = 'One enquiry. Two ways.';

export const automationNote =
  'The interesting part was never the model. It is the boring plumbing around it — the validation, the fallbacks, the record written exactly once — that makes the output trustworthy enough to send without reading it first.';
