import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import styles from "./TokenSheet.module.css";

/* Что Кордон находит в тексте — листом меток: что было написано и какую
   метку вместо этого получила модель. Метки переворачиваются при появлении. */

const TYPES = [
  { token: "ФИО_1", what: "ФИО", raw: "Петрову Андрею Викторовичу" },
  { token: "ПАСПОРТ_1", what: "Паспорт", raw: "серия 4608, номер 771203" },
  { token: "СНИЛС_1", what: "СНИЛС", raw: "112-233-445 95" },
  { token: "ТЕЛЕФОН_1", what: "Телефон", raw: "+7 903 514-22-08" },
  { token: "ПОЧТА_1", what: "Почта", raw: "petrov.av@mail.ru" },
  { token: "АДРЕС_1", what: "Адрес", raw: "ул. Ленина, д. 5, кв. 12" },
  { token: "КАРТА_1", what: "Карта", raw: "5536 9138 0045 2271" },
  { token: "КЛЮЧ_1", what: "Ключ или токен", raw: "sk-proj-Q7mWx2Lr…" },
];

export default function TokenSheet() {
  return (
    <div className={styles.wrap}>
      <Reveal className={styles.sheet} threshold={0.25}>
        {TYPES.map((t, i) => (
          <div key={t.token} className={styles.cell} style={vars({ "--i": i })}>
            <span className={styles.what}>{t.what}</span>
            <s className={styles.raw}>{t.raw}</s>
            <span className={styles.token}>{t.token}</span>
          </div>
        ))}
      </Reveal>
      <ul className={styles.notes}>
        <li>
          <b>Склонения и пропись.</b> «Петрову», «Петрова» и «Петров» — один ФИО_1; «сорок шесть ноль восемь» —
          тот же паспорт.
        </li>
        <li>
          <b>Кодировки.</b> base64, hex и URL раскодируются до проверки — ключ в конфиге не проскочит.
        </li>
        <li>
          <b>Обратимо.</b> Метки живут в рамках разговора: ответ возвращается сотруднику с его данными.
        </li>
      </ul>
    </div>
  );
}
