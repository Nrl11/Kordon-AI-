import type { Metadata } from "next";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Merge from "@/components/finance/Merge";
import PayModels from "@/components/finance/PayModels";
import SpendFlow from "@/components/finance/SpendFlow";
import Limits from "@/components/finance/Limits";
import Calculator from "@/components/finance/Calculator";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/solutions/finance",
  title: "AI spend reporting and team budgets",
  description:
    "One report on AI spend instead of scattered subscriptions: what APIs, seats and shared pools cost, team budgets with hard limits, and a calculator for your numbers.",
  og: "finance",
  ogTitle: "AI spend you can forecast",
});

const LIMITS = [
  "A dollar budget per key, team or project",
  "At 80%, the manager gets an alert",
  "At 100%, requests stop until the budget is raised",
  "The monthly bill never exceeds the budget",
];

export default function FinancePage() {
  return (
    <>
      <PageHead
        title="AI spend you can forecast"
        lead="Seats on personal cards, API invoices, expense reports — Kordon rolls them into one report by team, with budgets and a forecast"
        visual={<Merge />}
      />

      <Section
        id="spend"
        title="Where the money goes"
        sub="Complex tasks are few, but they take most of the bill. Kordon sends the simple ones to cheaper models"
        tone="soft"
      >
        <SpendFlow />
      </Section>

      <Section
        id="pay"
        title="Three ways to pay for models"
        sub="Each has its own price and risk. Kordon works with any of them — or several at once"
      >
        <PayModels />
      </Section>

      <Section id="calc" title="Run your own numbers" tone="soft">
        <Calculator />
      </Section>

      <Section id="limits" title="Budgets without surprises">
        <div className="split">
          <div className="split-text">
            <p className="lead">Each team spends within its own budget — the gateway enforces it</p>
            <ul className="list-check">
              {LIMITS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <Limits />
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
