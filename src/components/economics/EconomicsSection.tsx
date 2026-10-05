import Economics from "./Economics";

export default function EconomicsSection() {
  return (
    <section id="economics" className="section" aria-labelledby="economics-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="economics-title" className="h2">
            Сколько вы переплачиваете за ИИ
          </h2>
        </div>
        <Economics />
      </div>
    </section>
  );
}
