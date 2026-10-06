import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./PayModels.module.css";

/* Три способа платить за модели — описанием, без расчётов: что это,
   и по трём шкалам — цена, риск блокировки, гибкость. Посчитать свой
   случай можно в калькуляторе ниже. */

type Scale = 1 | 2 | 3;
const WAYS: { key: string; title: string; text: string; tag: string; price: Scale; risk: Scale; flex: Scale }[] = [
  {
    key: "api",
    title: "API провайдеров",
    text: "Платите за каждый запрос по тарифу модели. Доступны любые модели, но счёт растёт вместе с нагрузкой.",
    tag: "гибко, но дороже",
    price: 3,
    risk: 1,
    flex: 3,
  },
  {
    key: "subs",
    title: "Подписка на каждого",
    text: "Фиксированная цена за сотрудника и лимиты подписки. Блокировка аккаунта затронет одного человека.",
    tag: "предсказуемо",
    price: 2,
    risk: 1,
    flex: 1,
  },
  {
    key: "pool",
    title: "Общий пул подписок",
    text: "Несколько аккаунтов на всю компанию — дешевле всего. Но условия OpenAI и Anthropic запрещают делить аккаунт: блокировка отключит всех.",
    tag: "дёшево, но рискованно",
    price: 1,
    risk: 3,
    flex: 2,
  },
];

const SCALES: { key: "price" | "risk" | "flex"; name: string; words: [string, string, string] }[] = [
  { key: "price", name: "Цена", words: ["низкая", "средняя", "высокая"] },
  { key: "risk", name: "Риск блокировки", words: ["низкий", "средний", "высокий"] },
  { key: "flex", name: "Выбор моделей", words: ["узкий", "средний", "любые"] },
];

export default function PayModels() {
  return (
    <Reveal className={styles.grid} threshold={0.2}>
      {WAYS.map((w, i) => (
        <article key={w.key} className={styles.card} data-reveal="" data-k={w.key} style={vars({ "--i": i })}>
          <span className={styles.tag}>{w.tag}</span>
          <h3>{w.title}</h3>
          <p>{nb(w.text)}</p>
          <dl className={styles.scales}>
            {SCALES.map((s) => {
              const v = w[s.key];
              return (
                <div key={s.key} data-k={s.key}>
                  <dt>{s.name}</dt>
                  <dd>
                    <span className={styles.dots} aria-hidden="true">
                      {[1, 2, 3].map((d) => (
                        <i key={d} data-on={d <= v || undefined} />
                      ))}
                    </span>
                    {s.words[v - 1]}
                  </dd>
                </div>
              );
            })}
          </dl>
        </article>
      ))}
    </Reveal>
  );
}
