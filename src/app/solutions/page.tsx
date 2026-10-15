import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import CtaBand from "@/components/site/CtaBand";
import { pageMeta } from "@/lib/seo";
import { nb } from "@/lib/typo";

export const metadata: Metadata = pageMeta({
  path: "/solutions",
  title: "Solutions for IT, security and finance",
  description:
    "How Kordon AI helps IT leaders, security teams and CFOs: one access point for every AI model, an audit log of every request and AI spend you can explain.",
  og: "solutions",
  ogTitle: "One gateway — three jobs",
});

const ROLES = [
  {
    href: "/solutions/it",
    who: "CIO, DevOps",
    title: "One endpoint for every model",
    text: "Personal keys instead of shared ones, access revoked through your directory, and a new provider with no code changes.",
  },
  {
    href: "/solutions/infosec",
    who: "CISO",
    title: "Security sees every AI request",
    text: "Every request in the audit log and your SIEM, any employee's history in one search, evidence for SOC 2 and HIPAA audits.",
  },
  {
    href: "/solutions/finance",
    who: "CFO",
    title: "AI spend you can forecast",
    text: "What APIs, subscriptions and a shared pool cost for the same workload, budgets in dollars and a monthly report by team.",
  },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHead
        title="One gateway — three jobs"
        lead="IT gets one endpoint for every model, security gets control over data, finance gets a clear bill"
      />
      <section className="section" aria-label="Solutions by role">
        <div className="wrap">
          <ul className="ruled g3">
            {ROLES.map((r) => (
              <li key={r.href}>
                <small>{r.who}</small>
                <b>{r.title}</b>
                <p>{nb(r.text)}</p>
                <Link className="more" href={r.href}>
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
