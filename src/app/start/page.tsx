import type { Metadata } from "next";
import Section from "@/components/site/Section";
import Faq from "@/components/site/Faq";
import RequestCard from "@/components/start/Request";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/start",
  title: "AI gateway pilot in your network",
  description:
    "Request a Kordon AI pilot: we’ll discuss your use cases and show the gateway at work before you decide to buy. Answers to common questions about setup.",
  og: "start",
  ogTitle: "Start with a pilot",
});

const FAQ = [
  {
    q: "Do we need to rewrite our apps?",
    a: "No. Kordon is compatible with the OpenAI API: apps change the endpoint and the key — two lines.",
  },
  {
    q: "Which models can we connect?",
    a: "Any model with an API: cloud models from the major providers and local models on your own hardware.",
  },
  {
    q: "Can people keep personal subscriptions?",
    a: "Yes. Traffic from personal subscriptions goes through the gateway — with masking and the audit log.",
  },
  {
    q: "Where are prompts and the audit log stored?",
    a: "In your network — in your own PostgreSQL and Redis. Only requests to external models leave it, and only after masking.",
  },
  {
    q: "Does it work without internet access?",
    a: "Yes, with the Air-gapped module: a local mirror for updates and the model catalog, with hash checks.",
  },
  {
    q: "How much does it cost?",
    a: "The license depends on how many people and agents use AI and which modules you need. We’ll quote a price after a call and lock it in for three years.",
  },
];

/* The first screen is the request itself: the pilot pass and the form. */
export default function StartPage() {
  return (
    <>
      <section className="page-head" aria-label="Pilot request">
        <div className="wrap">
          <RequestCard />
        </div>
      </section>

      <Section id="faq" title="Common questions" tone="soft">
        <Faq items={FAQ} />
      </Section>
    </>
  );
}
