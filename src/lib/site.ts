/* Site map: one source of truth for the header and the footer. The home page
   tells the product story — there is no separate product page. */

export const SOLUTIONS = [
  { href: "/solutions/it", label: "For IT", note: "One API, keys, agents" },
  { href: "/solutions/infosec", label: "For Security", note: "Data, audit log, reviews" },
  { href: "/solutions/finance", label: "For Finance", note: "Budgets and model spend" },
] as const;

export const NAV = [
  { href: "/solutions", label: "Solutions", children: SOLUTIONS },
  { href: "/security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const CTA = { href: "/start", label: "Talk to us" } as const;

/* The company that operates the site and makes Kordon AI — as in its Florida
   Articles of Incorporation (filed May 8, 2026). The only way to reach us on
   the site is the request form on /start.
   TODO: fill in before launch — an email for privacy requests. Empty values are not shown. */
export const LEGAL = {
  name: "TalentMind AI Corp",
  kind: "Florida profit corporation",
  docNumber: "P26000025453",
  street: "1850 S Ocean Dr, Unit 1203",
  city: "Hallandale Beach",
  region: "FL",
  zip: "33009",
  country: "USA",
  privacyEmail: "",
} as const;
/* the address as two lines — street, then city: a narrow screen wraps between them */
export const LEGAL_ADDRESS_LINES = [
  LEGAL.street,
  `${LEGAL.city}, ${LEGAL.region} ${LEGAL.zip}, ${LEGAL.country}`,
] as const;
export const LEGAL_ADDRESS = LEGAL_ADDRESS_LINES.join(", ");
export const PRIVACY = { href: "/privacy", label: "Privacy Policy" } as const;

export const FOOTER = [
  {
    title: "Product",
    links: [
      { href: "/#control", label: "Admin portal" },
      { href: "/#local", label: "Local laws and languages" },
      { href: "/#deploy", label: "How it deploys" },
      { href: "/security", label: "Security" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  { title: "Solutions", links: SOLUTIONS.map((s) => ({ href: s.href, label: s.label })) },
  {
    title: "Company",
    links: [
      { href: "/start", label: "Request a pilot" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
] as const;
