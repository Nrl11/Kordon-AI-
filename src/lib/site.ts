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

/* The only way to reach us on the site is the request form on /start.
   TODO: fill in before launch — the legal name of the company that operates
   the site and an email for privacy requests. Empty values are not shown. */
export const LEGAL = {
  name: "Kordon AI",
  privacyEmail: "",
} as const;
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
