import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import styles from "./About.module.css";

/* Руководители — с их каналами: продукт для ИБ покупают у людей,
   которых можно читать. Фото — с webpractik.ru, лежат в public/team;
   без фото в рамке инициалы. */

export const LEADERS: { name: string; role: string; channel: string; tg: string; photo?: string }[] = [
  {
    name: "Александр Букуров",
    role: "Основатель и генеральный директор",
    channel: "О стратегии и цифровой трансформации",
    tg: "bukurovfix",
    photo: "/team/bukurov.jpg",
  },
  {
    name: "Иван Поддубный",
    role: "Технический директор, руководитель разработки",
    channel: "О разработке, архитектуре и ИИ",
    tg: "techlead_stream",
    photo: "/team/poddubny.jpg",
  },
  {
    name: "Анастасия Андронова",
    role: "Директор по маркетингу",
    channel: "Личный канал",
    tg: "Itz_andronova",
    photo: "/team/andronova.jpg",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("");

export default function Leaders() {
  return (
    <Reveal className={styles.leaders} threshold={0.2}>
      {LEADERS.map((l, i) => (
        <article key={l.tg} className={styles.leader} data-reveal="" style={vars({ "--i": i })}>
          <div className={styles.portrait}>
            {l.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.photo} alt={l.name} />
            ) : (
              <span aria-hidden="true">{initials(l.name)}</span>
            )}
          </div>
          <div className={styles.who}>
            <h3>{l.name}</h3>
            <p>{l.role}</p>
          </div>
          <a className={styles.tg} href={`https://t.me/${l.tg}`} target="_blank" rel="noopener noreferrer">
            <span>{l.channel}</span>
            <b>@{l.tg} →</b>
          </a>
        </article>
      ))}
    </Reveal>
  );
}
