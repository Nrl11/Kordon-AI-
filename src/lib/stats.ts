/* External research on AI-related data leaks — with sources. In the text a
   number carries an asterisk; the source itself is a footnote in the page footer. */
export const starOf = (i: number) => "*".repeat(i + 1);

export const STATS = [
  {
    value: "≈40%",
    caption: "of employee interactions with AI tools involve sensitive data",
    source: "Cyberhaven, AI Risk Report 2026",
    href: "https://www.cyberhaven.com/resources/report/ai-adoption-risk-report-2026",
  },
  {
    value: "1 in 5",
    caption: "breaches in IBM’s 2025 study involved shadow AI — tools used without approval",
    source: "IBM, Cost of a Data Breach Report 2025",
    href: "https://www.ibm.com/reports/data-breach",
  },
  {
    value: "97%",
    caption: "of organizations breached through AI lacked proper AI access controls",
    source: "IBM, Cost of a Data Breach Report 2025",
    href: "https://www.ibm.com/reports/data-breach",
  },
] as const;
