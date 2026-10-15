import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import Hero from "@/components/hero/Hero";
import Section from "@/components/site/Section";
import Inside from "@/components/inside/Inside";
import LocalPacks from "@/components/local/LocalPacks";
import Portal from "@/components/home/Portal";
import Architecture from "@/components/product/Architecture";
import Savings from "@/components/home/Savings";
import PilotCta from "@/components/home/PilotCta";

export const metadata = pageMeta({
  path: "/",
  title: "Kordon AI — the enterprise AI gateway inside your network",
  description:
    "Every employee and AI-agent request to AI models goes through one gateway inside your network: personal data is masked, and access and model spend stay under control.",
  og: "home",
  ogTitle: "Security that pays for itself",
});

/* The home page tells the whole product story: security that pays for itself,
   the portal for IT, security and finance, how data is protected, how masking
   follows local laws and languages, how it deploys, how much it saves — and
   the pilot at the end. */
export default function Home() {
  return (
    <>
      <Hero />

      <Section
        id="control"
        title="Every AI model in one place"
        sub="Who uses which models, on what terms and what it costs"
        tone="soft"
      >
        <Portal />
      </Section>

      <Section
        id="protect"
        title="Personal data stays inside"
        sub="Kordon checks every request before it leaves your company"
        aside={
          <Link className="more" href="/security">
            How protection works <span aria-hidden="true">→</span>
          </Link>
        }
      >
        <Inside bare />
      </Section>

      <Section
        id="local"
        title="Local laws, local languages"
        sub="Kordon masks data the way each country writes it — in its languages, with its ID formats, under its privacy law"
        tone="soft"
      >
        <LocalPacks />
      </Section>

      <Section
        id="deploy"
        title="Runs inside your network"
        sub="And lowers your model bill from day one"
      >
        <Architecture />
      </Section>

      <Savings />
      <PilotCta />
    </>
  );
}
