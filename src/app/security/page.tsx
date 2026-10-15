import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Stream from "@/components/security/Stream";
import RiskStats from "@/components/security/RiskStats";
import TokenSheet from "@/components/security/TokenSheet";
import Bench from "@/components/security/Bench";
import Injections from "@/components/security/Injections";

export const metadata: Metadata = pageMeta({
  path: "/security",
  title: "Data protection for AI requests",
  description:
    "Kordon checks every AI request before it is sent: personal data and keys become placeholders, prompt injection is blocked, restricted files stay on a local model.",
  og: "security",
  ogTitle: "The model sees only what’s allowed",
});

export default function SecurityPage() {
  return (
    <>
      <PageHead
        title="The model sees only what’s allowed"
        lead="Kordon checks every request before it is sent. It swaps personal data and keys for placeholders, blocks hidden instructions and keeps confidential documents on a local model"
        actions={
          <>
            <Link className="btn btn-primary" href="/start">
              Try it on your documents <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link className="more" href="#bench">
              How we measure quality <span aria-hidden="true">→</span>
            </Link>
          </>
        }
        visual={<Stream />}
      />

      <Section id="risk" title="What leaks without a gateway" tone="soft">
        <RiskStats />
      </Section>

      <Section id="found" title="What Kordon finds in text">
        <TokenSheet />
      </Section>

      <Section
        id="injections"
        title="Hidden instructions never reach the model"
        sub="An instruction can hide in an email, on a web page or inside a “game”. Kordon finds it before the request goes to the model"
        tone="soft"
      >
        <Injections />
      </Section>

      <Section
        id="bench"
        title="How we measure quality"
        sub="Masking is tested on labeled documents, injection defense on public attack benchmarks. You get the numbers in the pilot report"
      >
        <Bench />
      </Section>

      <CtaBand
        title="Test masking on your documents"
        text="We set up a test environment in your network and run the checks on your data — a report with numbers before you buy"
      />
    </>
  );
}
