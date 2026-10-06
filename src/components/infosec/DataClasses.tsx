import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import styles from "./DataClasses.module.css";

/* Классы данных и куда им можно. Колонки — как далеко от компании стоит
   модель: локальная в контуре, российские облака, любые модели. Полоса
   класса тянется до самой дальней модели, которой его можно показать:
   чем строже класс, тем короче путь. ИБ задаёт эти правила сама. */

const ZONES = [
  { t: "Локальная модель", s: "в вашем контуре" },
  { t: "Российские модели", s: "GigaChat, YandexGPT" },
  { t: "Любые модели", s: "включая зарубежные" },
];

const CLASSES = [
  { t: "Открытые данные", s: "пресс-релизы, статьи, код open source", reach: 3, how: "уходят как есть" },
  { t: "Персональные данные", s: "ФИО, паспорта, телефоны, карты", reach: 3, how: "уходят только метки" },
  { t: "Внутренние документы", s: "регламенты, переписка, отчёты", reach: 2, how: "только российские модели" },
  { t: "Коммерческая тайна", s: "финмодели, сделки, документы с грифом", reach: 1, how: "не покидает контур" },
];

export default function DataClasses() {
  return (
    <Reveal className={styles.board} threshold={0.25}>
      <div className={styles.head} aria-hidden="true">
        <span />
        <div className={styles.zones}>
          {ZONES.map((z) => (
            <span key={z.t} className={styles.zone}>
              <b>{z.t}</b>
              <small>{z.s}</small>
            </span>
          ))}
        </div>
      </div>
      <ul className={styles.rows}>
        {CLASSES.map((c, i) => (
          <li key={c.t} style={vars({ "--i": i })}>
            <div className={styles.name}>
              <b>{c.t}</b>
              <small>{c.s}</small>
            </div>
            <div className={styles.lane} style={vars({ "--reach": c.reach })} data-reach={c.reach}>
              <span className={styles.bar}>
                <em>{c.how}</em>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.note}>Классы и правила задаёт служба ИБ — в портале, без запроса в ИТ.</p>
    </Reveal>
  );
}
