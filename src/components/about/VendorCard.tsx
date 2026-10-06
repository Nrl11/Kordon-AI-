import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import styles from "./VendorCard.module.css";

/* Кто делает Кордон — справка о подрядчике: логотип, цифры и то, что
   служба ИБ проверяет первым: лицензии и статус. */

const NUMBERS = [
  { big: "2011", text: "год основания" },
  { big: "130+", text: "специалистов в штате" },
  { big: "300+", text: "проектов разработки" },
];

const ROWS = [
  { k: "Лицензии", v: "ФСТЭК и ФСБ" },
  { k: "Статус", v: "резидент Сколково с 2025 года" },
  { k: "Партнёрства", v: "Yandex Cloud, золотой партнёр 1С‑Битрикс" },
  { k: "Свои продукты", v: "5 сервисов, 1,7 млн пользователей в месяц" },
];

export default function VendorCard() {
  return (
    <div className={styles.desk}>
      <Reveal className={styles.card} threshold={0.3}>
        <header className={styles.top} data-reveal="">
          <div className={styles.logos}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.logo} src="/clients/webpractik.svg" alt="Вебпрактик" width={256} height={42} />
            <i aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.logoAi} src="/clients/webpractik-ai-dark.svg" alt="Вебпрактик AI" width={172} height={24} />
          </div>
          <span>цифровые продукты и внедрение ИИ для банков, промышленности и госсектора</span>
        </header>
        <dl className={styles.nums}>
          {NUMBERS.map((n, i) => (
            <div key={n.big} data-reveal="" style={vars({ "--i": i + 1 })}>
              <dt>{n.text}</dt>
              <dd>{n.big}</dd>
            </div>
          ))}
        </dl>
        <dl className={styles.rows}>
          {ROWS.map((r, i) => (
            <div key={r.k} data-reveal="" style={vars({ "--i": i + 2 })}>
              <dt>{r.k}</dt>
              <dd>{r.v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  );
}
