import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./ServiceTrack.module.css";

/* Как идёт работа с нами — по порядку: пилот до покупки, запуск,
   поддержка. Золотая линия проходит этапы слева направо, под каждым —
   что делаем. */

const STAGES = [
  {
    when: "До покупки",
    title: "Пилот",
    text: "Разбираем, как у вас подключены модели, поднимаем Кордон и прогоняем ваши данные.",
  },
  {
    when: "Внедрение",
    title: "Промышленный запуск",
    text: "SSO, выгрузка в SIEM, отказоустойчивость, обучение администраторов.",
  },
  {
    when: "Эксплуатация",
    title: "Поддержка",
    text: "Обновления, консультации и разбор инцидентов: 8×5 в базе, 24×7 — модулем.",
  },
];

export default function ServiceTrack() {
  return (
    <Reveal className={styles.track} threshold={0.25}>
      <span className={styles.line} aria-hidden="true">
        <i />
      </span>
      <ol className={styles.stages}>
        {STAGES.map((s, i) => (
          <li key={s.title} data-reveal="" style={vars({ "--i": i })}>
            <span className={styles.node} aria-hidden="true" />
            <small>{s.when}</small>
            <h3 className={styles.stageTitle}>{s.title}</h3>
            <p>{nb(s.text)}</p>
          </li>
        ))}
      </ol>
      <p className={styles.capex}>
        <b>Для CAPEX</b> — бессрочная лицензия: покупаете навсегда, обновления и поддержка идут отдельной подпиской.
      </p>
    </Reveal>
  );
}
