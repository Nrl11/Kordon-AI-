import Reveal from "@/components/ui/Reveal";
import Pilot from "@/components/pilot/Pilot";
import { vars } from "@/lib/css";
import styles from "./Path.module.css";

/* «Начните с пилота»: три шага — что делаем мы, что получаете вы, что
   решаете вы. Сверху — полоса этапов: прорисовывается слева направо,
   как идёт время; лицензия уходит стрелкой дальше. Ниже — заявка. */
const STEPS = [
  {
    key: "pilot",
    title: "Пилот",
    price: "500 000 ₽",
    who: "Мы делаем",
    text: "Изучаем ваш контур и проводим первичный анализ всех данных",
  },
  {
    key: "report",
    title: "Отчёты",
    who: "Вы получаете",
    text: "Отчёты по итогам пилота: расходы на ИИ, что уходит наружу, где можно сэкономить",
  },
  {
    key: "license",
    title: "Лицензия",
    who: "Вы решаете",
    text: "Если результат устраивает, покупаете лицензию",
  },
] as const;

export default function Path() {
  return (
    <section id="path" className="section" aria-labelledby="path-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="path-title" className="h2">
            Начните с пилота
          </h2>
        </div>
        <Reveal className={styles.track} threshold={0.35}>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.key} className={styles.step} data-k={s.key} style={vars({ "--i": i })}>
                <div className={styles.clip}>
                  <div className={styles.band}>
                    <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className={styles.title}>
                      {s.title}
                      {"price" in s && <span className={styles.price}> · {s.price}</span>}
                    </h3>
                  </div>
                </div>
                <p className={styles.who}>{s.who}</p>
                <p className={styles.text}>{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
        <Pilot />
      </div>
    </section>
  );
}
