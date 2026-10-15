import type { Metadata } from "next";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Faq from "@/components/site/Faq";
import Pricing from "@/components/pricing/Pricing";
import Included from "@/components/pricing/Included";
import Growth from "@/components/pricing/Growth";
import ServiceTrack from "@/components/pricing/ServiceTrack";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/pricing",
  title: "AI gateway license pricing",
  description:
    "Kordon AI is licensed by the number of AI users: base plus add-on modules, a 10% buffer at no extra charge, prices locked for three years and a perpetual CAPEX option.",
  og: "pricing",
  ogTitle: "Pricing based on AI users",
});

const FAQ = [
  {
    q: "Who counts as an AI user?",
    a: "Anyone who sent a request to AI through the gateway in the last 30 days: an employee, a service key or an agent. If they didn't, they don't count.",
  },
  {
    q: "What if we grow?",
    a: "You get a 10% buffer above your tier at no extra charge. If you outgrow the buffer, you move up a tier at the annual true-up and pay only the difference.",
  },
  {
    q: "Do we pay for models separately?",
    a: "Yes: cloud providers bill you at their own rates, and local models run on your hardware. Kordon makes that bill smaller with routing by price, caching and budgets.",
  },
  {
    q: "Why isn't the price on the site?",
    a: "It depends on your tier and add-on modules. We quote it after a call and lock it for three years.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Pricing
        title="Pricing based on AI users"
        lead="Choose how many AI users you have and which add-on modules you need — we'll show your license tier. Tier prices are locked for three years"
      />

      <Section id="included" title="Base and add-on modules" tone="soft">
        <Included />
      </Section>

      <Section id="growth" title="A license that grows with you">
        <Growth />
      </Section>

      <Section id="services" title="Rollout and support" tone="soft">
        <ServiceTrack />
      </Section>

      <Section id="faq" title="License questions">
        <Faq items={FAQ} />
      </Section>

      <CtaBand
        title="A fixed price for your tier"
        text="We'll size the tier and add-on modules for your network and lock the price for three years"
        action="Get a quote"
      />
    </>
  );
}
