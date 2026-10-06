import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import styles from "./About.module.css";

/* Стена клиентов Вебпрактик: логотипы с webpractik.ru, над каждым — отрасль.
   Видно, что это банки, промышленность и госсектор, где к ИБ строже всего. */

const CLIENTS: { name: string; field: string; logo: string }[] = [
  { name: "ВТБ", field: "банк", logo: "vtb" },
  { name: "Т-Банк", field: "банк", logo: "tbank" },
  { name: "Газпромнефть", field: "нефть и газ", logo: "gas" },
  { name: "Лукойл", field: "нефть и газ", logo: "lukoil" },
  { name: "Московская биржа", field: "биржа", logo: "moex" },
  { name: "ПСБ", field: "банк", logo: "psb" },
  { name: "Почта Банк", field: "банк", logo: "pochta" },
  { name: "ОТП Банк", field: "банк", logo: "otp" },
  { name: "Ренессанс Банк", field: "банк", logo: "renerss" },
  { name: "Росгосстрах", field: "страхование", logo: "rgs" },
  { name: "Т1", field: "ИТ-холдинг", logo: "t1" },
  { name: "Сколково", field: "инновационный центр", logo: "sk" },
  { name: "Главгосэкспертиза", field: "госсектор", logo: "gge" },
  { name: "Центр-инвест", field: "банк", logo: "center" },
  { name: "Главстрой", field: "девелопмент", logo: "galv" },
  { name: "СК10", field: "девелопмент", logo: "sk10" },
];

export default function Clients() {
  return (
    <Reveal className={styles.wall} threshold={0.15}>
      {CLIENTS.map((c, i) => (
        <div key={c.name} className={styles.tile} data-reveal="" style={vars({ "--i": i % 6 })}>
          <span className={styles.field}>{c.field}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/clients/${c.logo}.svg`} alt={c.name} loading="lazy" />
        </div>
      ))}
      <a
        className={styles.tileMore}
        href="https://webpractik.ru"
        target="_blank"
        rel="noopener noreferrer"
        data-reveal=""
        style={vars({ "--i": 4 })}
      >
        <b>300+</b>
        <span>проектов на webpractik.ru →</span>
      </a>
    </Reveal>
  );
}
