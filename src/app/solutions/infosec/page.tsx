import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Feed from "@/components/infosec/Feed";
import Investigation from "@/components/infosec/Investigation";
import Compliance from "@/components/infosec/Compliance";
import DataClasses from "@/components/infosec/DataClasses";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/solutions/infosec",
  title: "AI gateway for security teams: every AI request logged",
  description:
    "Every AI request lands in the audit log and your SIEM, with rules for each data class and history search in seconds. Evidence for SOC 2, HIPAA and privacy audits.",
  og: "infosec",
  ogTitle: "Security sees every AI request",
});

export default function InfosecPage() {
  return (
    <>
      <PageHead
        title="Security sees every AI request"
        lead="Every request passes through the gateway and is saved to the audit log. Personal data is replaced with placeholders, and confidential documents never leave your network"
        actions={
          <Link className="more" href="/security">
            What the gateway detects <span aria-hidden="true">→</span>
          </Link>
        }
        visual={<Feed />}
      />

      <Section
        id="classes"
        title="Rules for every data class"
        sub="The more sensitive the data, the closer to you the model that sees it"
        tone="soft"
      >
        <DataClasses />
      </Section>

      <Section
        id="investigate"
        title="A searchable audit log"
        sub="By employee, key or data type — no ticket to IT"
      >
        <Investigation />
      </Section>

      <Section id="compliance" title="What auditors ask for" tone="soft">
        <Compliance />
      </Section>

      <CtaBand
        title="See the log on your data"
        text="We'll set up a pilot, stream events to your SIEM and run your own documents through it — before you decide to buy"
      />
    </>
  );
}
