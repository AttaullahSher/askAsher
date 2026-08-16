/**
 * The AUTOMATION sector: one pipeline, animated end to end.
 * `log` is the line that types out as the packet lands on the node.
 */
export interface PipelineStage {
  id: string;
  label: string;
  /** Short caption under the node. */
  caption: string;
  /** Terminal line emitted when the packet reaches this stage. */
  log: string;
}

export const pipeline: PipelineStage[] = [
  { id: 'in', label: 'MESSAGE', caption: 'a customer asks for a price', log: 'inbound · whatsapp · unstructured text' },
  { id: 'ai', label: 'UNDERSTAND', caption: 'intent + items pulled out', log: 'parsed → 3 line items, 1 ambiguity flagged' },
  { id: 'data', label: 'RESOLVE', caption: 'stock, price, terms', log: 'catalogue matched · availability checked' },
  { id: 'rule', label: 'DECIDE', caption: 'margins, tiers, exceptions', log: 'tier B pricing applied · approval not required' },
  { id: 'quote', label: 'QUOTE', caption: 'document generated', log: 'quotation drafted · pdf rendered' },
  { id: 'invoice', label: 'INVOICE', caption: 'on acceptance', log: 'awaiting acceptance → invoice queued' },
  { id: 'out', label: 'ACTION', caption: 'sent, filed, logged', log: 'delivered · recorded · human never opened a spreadsheet' },
];

export const automationNote =
  'A real shape, not a diagram for its own sake. The interesting part is never the AI — it is the boring plumbing that makes the output trustworthy enough to send without reading it.';
