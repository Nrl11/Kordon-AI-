import PromptWall from "./PromptWall";
import styles from "./Problem.module.css";

const STATS = [
  {
    value: "≈40%",
    caption: "запросов к публичным нейросетям содержат конфиденциальные данные",
    source: "ГК «Солар», I полугодие 2026",
    href: "https://www.anti-malware.ru/news/2026-08-10-111332/50969",
  },
  {
    value: "×30",
    caption: "больше данных утекло через ИИ-сервисы в 2025 году, чем годом раньше",
    source: "ГК «Солар», 150 компаний",
    href: "https://www.cnews.ru/news/top/2026-02-04_sotrudniki_rossijskih_kompanij",
  },
  {
    value: "23%",
    caption: "компаний внедрили хотя бы базовую защиту ИИ",
    source: "AppSec Solutions и АРПП, 2026",
    href: "https://www1.ru/news/2026/09/23/437754-ii-uze-vnedrili-no-zashhitu-ispolzuiut-lis-23-kompanii.html",
  },
];

export default function Problem() {
  return (
    <section id="problem" className={`section ${styles.problem}`} aria-labelledby="problem-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="problem-title" className="h2">
            ИИ в компании уже есть. Контроля нет.
          </h2>
        </div>

        <PromptWall />

        <div className={styles.stats}>
          {STATS.map((s) => (
            <figure key={s.source} className={styles.stat}>
              <b className={styles.big}>{s.value}</b>
              <figcaption>
                {s.caption}
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.source}
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
