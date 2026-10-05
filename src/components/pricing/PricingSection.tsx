import Pricing from "./Pricing";

export default function PricingSection() {
  return (
    <section id="pricing" className="section soft" aria-labelledby="pricing-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="pricing-title" className="h2">
            Лицензия по&nbsp;числу потребителей ИИ
          </h2>
        </div>
        <Pricing />
      </div>
    </section>
  );
}
