import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta, SITE_NAME, SITE_URL } from "@/lib/seo";
import { LEGAL, LEGAL_ADDRESS, LEGAL_ADDRESS_LINES } from "@/lib/site";
import { nb } from "@/lib/typo";
import styles from "@/components/legal/Legal.module.css";

export const metadata: Metadata = pageMeta({
  path: "/privacy",
  title: "Privacy Policy",
  description:
    "How TalentMind AI Corp, the company behind Kordon AI, handles the personal information of website visitors: what we collect, why, who we share it with and your rights.",
  og: "privacy",
});

/* A privacy policy for the website only: the request form, cookies and
   analytics. It is written with US state privacy laws (CCPA/CPRA and similar)
   and the GDPR in mind. The operator's details and a privacy email come from
   LEGAL in lib/site.ts — have counsel review the text before launch. */

const HOST = SITE_URL.replace(/^https?:\/\//, "");

const TOC = [
  { id: "general", title: "Who we are" },
  { id: "data", title: "What we collect" },
  { id: "purposes", title: "How we use it" },
  { id: "cookie", title: "Cookies and analytics" },
  { id: "sharing", title: "Who we share it with" },
  { id: "storage", title: "How long we keep it" },
  { id: "protect", title: "How we protect it" },
  { id: "rights", title: "Your privacy rights" },
  { id: "children", title: "Children" },
  { id: "contacts", title: "How to reach us" },
  { id: "changes", title: "Changes to this policy" },
];

/* The policy in four cells, set like the gateway's decision panel on the home
   page: label above value, a dot for the kind of answer (gold — a fact about
   your data, green — a promise in your favor). Each cell opens its section. */
const BRIEF = [
  { id: "general", k: "Responsible", v: LEGAL.name, tone: "gold" },
  { id: "data", k: "We collect", v: "Form details and basic browser data", tone: "gold" },
  { id: "sharing", k: "Sold or used for ads", v: "Never", tone: "green" },
  { id: "storage", k: "Kept", v: "Requests — up to 3 years", tone: "gold" },
] as const;

export default function Privacy() {
  return (
    <>
      <section className="page-head">
        <div className="wrap page-grid">
          <div>
            <h1 className="h1-page">Privacy Policy</h1>
            <p className="page-lead">
              {nb(
                `What personal information ${LEGAL.name} collects through this site, why, who sees it and the choices you have`,
              )}
            </p>
            <p className={styles.meta}>
              Last updated <time dateTime="2026-10-15">October 15, 2026</time>
            </p>
          </div>
          <aside className={styles.brief} aria-labelledby="brief-title">
            <p id="brief-title" className={styles.briefTitle}>
              Your data on this site
            </p>
            <ul>
              {BRIEF.map((b) => (
                <li key={b.id} data-tone={b.tone}>
                  <a href={`#${b.id}`}>
                    <span>{b.k}</span>
                    <b>{nb(b.v)}</b>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className={`section ${styles.body}`}>
        <div className={`wrap ${styles.layout}`}>
          <nav className={styles.toc} aria-label="Policy sections">
            <p>Sections</p>
            <ol>
              {TOC.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>{t.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <article className={styles.doc}>
            <section id="general">
              <h2>Who we are</h2>
              <p>
                {nb(`${LEGAL.name} (“we”, “us”) is the company behind ${SITE_NAME} and operates `)}
                <span className={styles.host}>{HOST}</span>
                {nb(
                  ". We decide how and why the personal information described here is processed — under the GDPR, we are its controller.",
                )}
              </p>
              <dl className={styles.terms}>
                <dt>Company</dt>
                <dd>{LEGAL.name}</dd>
                <dt>Type</dt>
                <dd>{LEGAL.kind}</dd>
                <dt>Document number</dt>
                <dd>{LEGAL.docNumber}, Florida Department of State</dd>
                <dt>Address</dt>
                <dd>{LEGAL_ADDRESS}</dd>
                <dt>Product</dt>
                <dd>{SITE_NAME}</dd>
              </dl>
              <p>
                {nb(
                  "This policy covers the personal information we collect through this website — when you browse it or send us a request. It does not cover the Kordon gateway itself: inside a customer’s network the gateway is run by that customer, and the data it handles stays with them.",
                )}
              </p>
              <p>We follow a few simple principles:</p>
              <ul>
                <li>we collect only what we need to answer your request and run the site;</li>
                <li>we use it only for the purposes described here;</li>
                <li>we do not sell your personal information or share it for cross-context behavioral advertising;</li>
                <li>we keep it no longer than we need it, then delete or de-identify it.</li>
              </ul>
            </section>

            <section id="data">
              <h2>What we collect</h2>
              <h3>What you give us</h3>
              <p>When you send a request through the form:</p>
              <ul>
                <li>your name;</li>
                <li>your company;</li>
                <li>your work email and, if you add it, your phone number;</li>
                <li>how many people at your company use AI and what matters to you;</li>
                <li>license details, if you ask about pricing.</li>
              </ul>
              <h3>What your browser sends</h3>
              <ul>
                <li>IP address, browser and device type, operating system and language;</li>
                <li>pages you visit, the site that referred you, date and time of the visit;</li>
                <li>cookie identifiers — see “Cookies and analytics” below.</li>
              </ul>
              <p>
                {nb(
                  "We do not ask for sensitive personal information such as Social Security numbers, financial account numbers or health data. Please don’t include it in the form.",
                )}
              </p>
            </section>

            <section id="purposes">
              <h2>How we use it</h2>
              <ul>
                <li>to reply to your request and arrange a call, an assessment or a pilot;</li>
                <li>to send you information you asked for about Kordon;</li>
                <li>to keep the site working and secure, and to prevent spam and abuse;</li>
                <li>to understand how the site is used and improve it — only with your consent to analytics cookies;</li>
                <li>to meet legal obligations and to establish or defend legal claims.</li>
              </ul>
              <p>
                {nb(
                  "If you are in the European Economic Area or the United Kingdom, our legal bases are: taking steps at your request before a contract (replying to your request), our legitimate interests (site security and B2B communication), your consent (analytics cookies) and legal obligations.",
                )}
              </p>
            </section>

            <section id="cookie">
              <h2>Cookies and analytics</h2>
              <p>
                {nb(
                  "Cookies are small files a website stores in your browser. We use two kinds:",
                )}
              </p>
              <ul>
                <li>
                  <b>Necessary</b> — they remember your cookie choice and keep the site secure. They are always on.
                </li>
                <li>
                  <b>Analytics</b> — they help us count visits and see which pages are useful. They are set only after you
                  choose “Accept all”.
                </li>
              </ul>
              <p>
                {nb(
                  "You can change your choice at any time with “Cookie settings” at the bottom of every page, and you can block or delete cookies in your browser settings. Your cookie choice is kept for 12 months; analytics data — for up to 12 months.",
                )}
              </p>
            </section>

            <section id="sharing">
              <h2>Who we share it with</h2>
              <p>{nb("We share personal information only with:")}</p>
              <ul>
                <li>service providers that host the site, deliver email and route requests to our team — they process data on our behalf and under contract;</li>
                <li>analytics providers — only if you accepted analytics cookies;</li>
                <li>authorities, when the law requires it;</li>
                <li>a buyer or successor, if our business is reorganized or sold — under this policy.</li>
              </ul>
              <p>
                {nb(
                  "Our providers may process data in the United States and in other countries. When we transfer data from the EEA or the UK, we use safeguards the law provides for, such as standard contractual clauses.",
                )}
              </p>
            </section>

            <section id="storage">
              <h2>How long we keep it</h2>
              <ul>
                <li>requests from the form — up to three years after our last contact, unless you ask us to delete them sooner;</li>
                <li>analytics data — up to 12 months;</li>
                <li>server logs for security — up to 90 days.</li>
              </ul>
            </section>

            <section id="protect">
              <h2>How we protect it</h2>
              <p>
                {nb(
                  "We use encrypted connections, limit access to requests to the people who answer them, and require our providers to protect the data they process for us. No system is perfectly secure, but we work to keep the risk low and fix issues quickly.",
                )}
              </p>
            </section>

            <section id="rights">
              <h2>Your privacy rights</h2>
              <p>
                {nb(
                  "Depending on where you live — for example, California under the CCPA/CPRA, other US states with similar laws, the EEA or the UK — you may have the right to:",
                )}
              </p>
              <ul>
                <li>know what personal information we hold about you and get a copy;</li>
                <li>correct inaccurate information;</li>
                <li>delete your information;</li>
                <li>withdraw consent to analytics cookies at any time;</li>
                <li>object to or restrict certain processing, and receive your data in a portable format (EEA and UK);</li>
                <li>lodge a complaint with your data protection authority (EEA and UK).</li>
              </ul>
              <p>
                {nb(
                  "We do not sell personal information or share it for cross-context behavioral advertising, and we do not use sensitive personal information. We will not treat you differently for using your rights. To protect you, we may ask you to confirm your identity before we act on a request; you can also use an authorized agent.",
                )}
              </p>
            </section>

            <section id="children">
              <h2>Children</h2>
              <p>
                {nb(
                  "The site is meant for businesses and their employees. It is not directed to children under 16, and we do not knowingly collect their personal information.",
                )}
              </p>
            </section>

            <section id="contacts">
              <h2>How to reach us</h2>
              <p>
                {nb("To ask a question about your personal information or to use your rights, send us your details through the form on the ")}
                <Link href="/start">Request a pilot</Link>
                {nb(" page — we will reply to the email you provide.")}
                {LEGAL.privacyEmail && (
                  <>
                    {" "}
                    You can also email <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>.
                  </>
                )}
              </p>
              <p>{nb("You can also write to us by mail:")}</p>
              <address className={styles.card}>
                <b>{LEGAL.name}</b>
                {LEGAL_ADDRESS_LINES.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              <p>{nb("We reply within 45 days, or sooner where the law requires.")}</p>
            </section>

            <section id="changes">
              <h2>Changes to this policy</h2>
              <p>
                {nb(
                  "We may update this policy — for example, when the law or the way the site works changes. The new version takes effect when it is posted on this page; the date at the top shows the latest update.",
                )}
              </p>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
