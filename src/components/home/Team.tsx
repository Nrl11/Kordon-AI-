import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { LEADERS } from "@/components/about/Leaders";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Team.module.css";

/* Кто отвечает за Кордон: Вебпрактик и его ИИ-направление, люди, которые
   ведут продукт, и клиенты, которым мы уже строили системы. */

const LOGOS = [
  { src: "vtb", name: "ВТБ" },
  { src: "tbank", name: "Т-Банк" },
  { src: "psb", name: "ПСБ" },
  { src: "gas", name: "Газпромнефть" },
  { src: "lukoil", name: "Лукойл" },
  { src: "moex", name: "Московская биржа" },
  { src: "rgs", name: "Росгосстрах" },
  { src: "sk", name: "Сколково" },
];

export default function Team() {
  return (
    <section className={styles.team} aria-labelledby="team-title">
      <div className="wrap">
        <div className={styles.grid}>
          <Reveal className={styles.copy}>
            <div className={styles.logos} data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/clients/webpractik.svg" alt="Вебпрактик" width={256} height={42} />
              <span aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/clients/webpractik-ai-dark.svg" alt="Вебпрактик AI" width={172} height={24} />
            </div>
            <h2 id="team-title" data-reveal="">
              {nb("Кордон создала команда Вебпрактик")}
            </h2>
            <p data-reveal="">
              {nb(
                "С 2011 года мы строим цифровые продукты для банков, промышленности и госсектора. Кордон разрабатывают, внедряют и поддерживают инженеры нашего ИИ-направления — без посредников между вами и разработчиками.",
              )}
            </p>
            <ul className={styles.facts} data-reveal="">
              <li>130+ специалистов</li>
              <li>лицензии ФСТЭК и ФСБ</li>
              <li>резидент Сколково</li>
            </ul>
            <Link className="btn btn-primary" href="/about" data-reveal="">
              Познакомиться с командой <span className="arr" aria-hidden="true">→</span>
            </Link>
          </Reveal>

          <Reveal className={styles.people} threshold={0.2}>
            {LEADERS.map((l, i) => (
              <figure key={l.tg} data-reveal="" style={vars({ "--i": i })}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.photo} alt={l.name} width={640} height={640} loading="lazy" />
                <figcaption>
                  <b>{l.name}</b>
                  <span>{l.role}</span>
                </figcaption>
              </figure>
            ))}
          </Reveal>
        </div>

        <ul className={styles.clients} aria-label="Клиенты Вебпрактик">
          {LOGOS.map((l) => (
            <li key={l.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/clients/${l.src}.svg`} alt={l.name} loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
