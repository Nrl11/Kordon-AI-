import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Hero from "@/components/hero/Hero";
import Problem from "@/components/problem/Problem";
import Inside from "@/components/inside/Inside";
import Rules from "@/components/rules/Rules";
import EconomicsSection from "@/components/economics/EconomicsSection";
import PricingSection from "@/components/pricing/PricingSection";
import Path from "@/components/path/Path";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержанию
      </a>
      <SmoothScroll />
      <Nav />
      <main id="main">
        <Hero />
        <Problem />
        <Inside />
        <Rules />
        <EconomicsSection />
        <PricingSection />
        <Path />
      </main>
      <Footer />
    </>
  );
}
