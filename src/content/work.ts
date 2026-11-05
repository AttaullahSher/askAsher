/**
 * The professional half of the site: what he has built that a business runs
 * on, the trade underneath it, and the record.
 *
 * Every figure here is one he has stated and can defend in an interview: no
 * invented metrics, no money, no headcount. The internal systems sit behind a
 * login, so they are described and never linked — a public portfolio that
 * points at four admin sign-in pages is handing out a map. Only the public
 * storefront and Hkula get a link.
 */

export interface System {
  id: string;
  code: string;
  name: string;
  /** One line. What it is, in words an owner uses. */
  line: string;
  /** Three to five facts. Plain, checkable. */
  does: string[];
  /** The one number worth putting in large type, and what it measures. */
  proof?: { value: string; label: string };
  /** Only for public systems. */
  href?: string;
  hrefLabel?: string;
}

export const workIntro = {
  eyebrow: 'The work',
  title: ['Systems', 'in production'],
  lead: 'An established Abu Dhabi business ran on paper, spreadsheets and WhatsApp. It now runs on six connected systems I designed, built and still maintain.',
  method:
    'Built through AI-assisted software development: I decide what the business needs, direct the build with Claude Code, test it against a real working day and keep it running.',
  stack: ['React', 'TypeScript', 'Firebase', 'Cloudflare Workers', 'GitHub Actions'],
  client: 'AKM Music Centre LLC · Abu Dhabi',
};

export const systems: System[] = [
  {
    id: 'pos',
    code: 'S-01',
    name: 'Point of Sale',
    line: 'The till. It keeps selling when the internet does not.',
    does: [
      'Sales, invoicing, refunds, repairs, cash and bank deposits, Tabby.',
      'Holds sales when the connection drops and numbers them when it returns.',
      'Prepares the VAT-201 return figures.',
      'Daily and monthly reports arrive by email on their own.',
    ],
    proof: { value: '20s → 0.2s', label: 'till load time' },
  },
  {
    id: 'crm',
    code: 'S-02',
    name: 'CRM',
    line: 'Every customer, unpaid invoice and expiring document. One place.',
    does: [
      'Customers, leads, quotations and unpaid invoices.',
      'Piano rentals, school consignments and supplier records.',
      'Document expiry tracking, so a licence never lapses quietly.',
      'An internal AI advisor, and a task email at 8 AM every day.',
    ],
    proof: { value: '8:00', label: 'the day’s list, every morning' },
  },
  {
    id: 'web',
    code: 'S-03',
    name: 'Website & online store',
    line: 'A store that restocks its own shelves.',
    does: [
      'English and Arabic.',
      '2,100+ supplier products synchronised automatically.',
      'Studio and music-school booking, online payment.',
      'Search engine work done by scheduled jobs, not by hand.',
    ],
    proof: { value: '52 → 92', label: 'page speed score' },
    href: 'https://www.akm-music.com',
    hrefLabel: 'akm-music.com',
  },
  {
    id: 'assistant',
    code: 'S-04',
    name: 'AI customer assistant',
    line: 'Answers WhatsApp at 3 AM. Knows when to wake a human.',
    does: [
      'WhatsApp, Instagram and Facebook, around the clock.',
      'Books studio sessions and hands real requests to staff.',
      'Runs on several AI providers, so one outage never silences it.',
      'Sends Tabby and PayPal payment links that mark the invoice paid.',
    ],
    proof: { value: '24/7', label: 'replies on three channels' },
  },
  {
    id: 'docs',
    code: 'S-05',
    name: 'Document system',
    line: 'Every quotation, invoice and contract the business sends.',
    does: [
      'Quotations, tax invoices, delivery orders and receipts.',
      'Rental and consignment contracts, letters, statements of account.',
      'Numbered and stored in one place, sent as PDF or on WhatsApp.',
    ],
    proof: { value: '8', label: 'document types, one system' },
  },
  {
    id: 'inventory',
    code: 'S-06',
    name: 'Inventory',
    line: 'Nothing leaves the shelf without a record.',
    does: [
      'Products tracked across stock locations.',
      'Staff request stock in, stock out and new items; an admin approves.',
      'Full transaction history, Excel import and export.',
    ],
    proof: { value: '1,343', label: 'products tracked' },
  },
];

/** The professional project outside AKM. */
export const platform = {
  code: 'P-01',
  name: 'Hkula',
  line: 'Free online shops for small businesses in Swabi, Pakistan.',
  body: 'A shop owner who has never built a website gets their own page with products, prices and WhatsApp ordering, in English and Urdu, at no cost.',
  href: 'https://hkula.com',
  hrefLabel: 'hkula.com',
  stack: ['Cloudflare Workers', 'D1', 'Hono'],
};

/**
 * The trade underneath the software. This is what makes the systems right:
 * they were built by somebody who did the job by hand for years first.
 *
 * Named organisations are supply and project engagements — never employers,
 * and never a claim of authority inside them.
 */
export const trade = {
  eyebrow: 'The trade',
  title: ['Fifteen years', 'of the real thing'],
  lead: 'Before the code there was the work itself: procurement, tenders and supply to some of the most demanding buyers in Abu Dhabi. It still is.',
  pillars: [
    {
      k: 'Tenders',
      v: 'RFQs, quotations and tender submissions. Supplier registration and prequalification on government portals, including ADERP (Oracle Fusion).',
    },
    {
      k: 'Sourcing',
      v: 'Direct negotiation with international suppliers. Overseas purchasing, shipment coordination and import documentation.',
    },
    {
      k: 'Order to cash',
      v: 'Quotation, purchase order, delivery note, tax invoice, collection. Credit terms, statements of account and reconciliation.',
    },
  ],
  engagementsLabel: 'Supply and project engagements involving',
  engagements: [
    'Sorbonne University Abu Dhabi',
    'NYU Abu Dhabi',
    'UAE University',
    'Government schools',
    'Qasr Al Watan',
    'ADNOC',
    'ADEK',
    'Etihad Rail',
    'DCT Abu Dhabi',
  ],
};

export interface CareerStep {
  year: string;
  role: string;
  org: string;
  note: string;
}

/** Newest first. */
export const career: CareerStep[] = [
  {
    year: '2026',
    role: 'Bachelor of Arts (General)',
    org: 'Allama Iqbal Open University',
    note: 'Finished alongside full-time work.',
  },
  {
    year: '2020',
    role: 'Founder & Managing Director',
    org: 'TheAnfal Dot Com SPC LLC',
    note: 'E-commerce and general trading. Sourcing, international suppliers, Amazon.ae and Noon.',
  },
  {
    year: '2020',
    role: 'Partner & Operations Lead',
    org: 'AKM Music Centre LLC',
    note: 'Ten percent shareholder. Procurement, tenders, operations, and every system on this page.',
  },
  {
    year: '2016',
    role: 'Sales Executive',
    org: 'AKM Music Centre LLC',
    note: 'Customer sales, quotations and order follow-up.',
  },
  {
    year: '2011',
    role: 'Archives Clerk',
    org: 'AKM Music Centre LLC',
    note: 'Started in the records room. Learned where every piece of paper in a business goes.',
  },
];

export const careerIntro = {
  eyebrow: 'The record',
  title: ['Records room', 'to partner'],
};
