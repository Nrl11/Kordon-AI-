import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Uptime from "@/components/it/Uptime";
import KeyRoutes from "@/components/it/KeyRoutes";
import Scenarios from "@/components/it/Scenarios";
import AgentRun from "@/components/it/AgentRun";
import { pageMeta } from "@/lib/seo";
import { nb } from "@/lib/typo";

export const metadata: Metadata = pageMeta({
  path: "/solutions/it",
  title: "AI gateway for IT: one API for every model",
  description:
    "One endpoint for every AI model, automatic failover when a provider goes down, personal keys with budgets and role-based access for AI agents — inside your network.",
  og: "it",
  ogTitle: "One endpoint for every model",
});

const KEY_RULES = [
  "its own models — for example, local only for the support bot",
  "a monthly budget in dollars",
  "an expiration date",
];

export default function ItPage() {
  return (
    <>
      <PageHead
        title="One endpoint for every model"
        lead="One endpoint and one key for any model — OpenAI, Anthropic, Google or a local one. If a provider goes down, Kordon automatically fails over to a backup model"
        actions={
          <>
            <Link className="btn btn-primary" href="/start">
              Discuss your setup <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link className="more" href="/#deploy">
              How it deploys <span aria-hidden="true">→</span>
            </Link>
          </>
        }
        visual={<Uptime />}
      />

      <Section id="keys" title="Personal keys with built-in rules" tone="soft">
        <div className="split">
          <div className="split-text">
            <p className="lead">
              {nb("Keys go to employees, services and contractors, while provider keys stay inside the gateway. Each key has:")}
            </p>
            <ul className="list-check">
              {KEY_RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <KeyRoutes />
        </div>
      </Section>

      <Section id="cases" title="Three situations — one action">
        <Scenarios />
      </Section>

      <Section
        id="agents"
        title="Agents stay within their role"
        sub="The gateway stops anything outside the role — no matter where the command came from"
        tone="soft"
      >
        <AgentRun />
      </Section>

      <CtaBand
        title="Let's review your model setup"
        text="An engineer will look at where your keys live and how requests flow, then stand up a pilot with Docker Compose or Helm"
      />
    </>
  );
}
