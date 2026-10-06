import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Compliance.module.css";

/* Требования — и чем Кордон их закрывает. Внизу каждой карточки —
   какая запись подтверждает это при проверке. */

const ROWS = [
  {
    doc: "152-ФЗ",
    about: "Персональные данные в запросах к моделям",
    how: "Персданные заменяются метками до отправки во внешние модели",
    proof: "ФИО_1, ТЕЛЕФОН_1 вместо данных",
    at: "10:42",
    tone: "mask",
  },
  {
    doc: "Приказ ФСТЭК № 117, п. 60",
    about: "Информация ограниченного доступа",
    how: "Закрытые документы обрабатывает только локальная модель",
    proof: "финмодель 2027 → локальная модель",
    at: "12:05",
    tone: "local",
  },
  {
    doc: "Приказ ФСТЭК № 117, п. 63",
    about: "Регистрация событий и управление доступом",
    how: "Журнал каждого обращения, выгрузка в SIEM, отзыв доступа через каталог",
    proof: "запись № 52107 → SIEM",
    at: "12:41",
    tone: "log",
  },
];

export default function Compliance() {
  return (
    <div className={styles.wrap}>
      <Reveal className={styles.cards} threshold={0.2}>
        {ROWS.map((r, i) => (
          <article key={r.doc} className={styles.card} data-reveal="" style={vars({ "--i": i })}>
            <h3 className={styles.doc}>{r.doc}</h3>
            <p className={styles.about}>{nb(r.about)}</p>
            <p className={styles.how}>{nb(r.how)}</p>
            <p className={styles.proof} data-t={r.tone}>
              <span>При проверке видно</span>
              <b>
                <time>{r.at}</time> {r.proof}
              </b>
            </p>
          </article>
        ))}
      </Reveal>
      <p className={styles.note}>Карту требований под ваш контур составляем на разборе — вместе с вашей службой ИБ.</p>
    </div>
  );
}
