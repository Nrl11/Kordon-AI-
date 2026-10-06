import styles from "./Bench.module.css";

/* Как меряем защиту. Цифр здесь нет специально: их даёт прогон на ваших
   документах. Слева пример разметки — на нём видно, что считает каждая
   метрика, справа сами метрики формулами. */

type Mark = "hit" | "miss" | "false";
type Part = string | { t: string; m: Mark };

const SAMPLE: Part[] = [
  "Договор с ООО «Ромашка» подписала ",
  { t: "Соколова Е. Н.", m: "hit" },
  ", паспорт ",
  { t: "4511 336078", m: "hit" },
  ". Счёт отправить на ",
  { t: "e.sokolova@romashka.ru", m: "hit" },
  " до пятницы. Офис: ",
  { t: "Москва", m: "false" },
  ", ",
  { t: "ул. Ленина, 5", m: "miss" },
  ".",
];

const METRICS = [
  { name: "Полнота", what: "сколько персданных нашли", top: "найдено верно", bottom: "все персданные в тексте" },
  { name: "Точность", what: "сколько найденного — действительно персданные", top: "найдено верно", bottom: "всё, что замаскировали" },
  { name: "Атаки остановлены", what: "сколько атак из бенчмарка не дошли до модели", top: "остановлено атак", bottom: "все атаки набора" },
  { name: "Ложные остановки", what: "сколько обычных запросов остановили зря", top: "остановлено зря", bottom: "все обычные запросы" },
  { name: "Задержка", what: "сколько времени добавляет шлюз", top: "время с Кордоном", bottom: "время напрямую" },
];

export default function Bench() {
  return (
    <div className={styles.bench}>
      <figure className={styles.sample}>
        <figcaption>Пример разметки</figcaption>
        <p>
          {SAMPLE.map((p, k) =>
            typeof p === "string" ? (
              p
            ) : (
              <mark key={k} data-m={p.m}>
                {p.t}
              </mark>
            ),
          )}
        </p>
        <ul className={styles.legend}>
          <li data-m="hit">найдено верно — 3</li>
          <li data-m="miss">пропущено — 1</li>
          <li data-m="false">найдено лишнее — 1</li>
        </ul>
        <p className={styles.calc}>
          В этом примере полнота — 3 из 4, точность — 3 из 4.
        </p>
      </figure>

      <ul className={styles.metrics}>
        {METRICS.map((m) => (
          <li key={m.name}>
            <div>
              <b>{m.name}</b>
              <small>{m.what}</small>
            </div>
            <span className={styles.frac} aria-label={`${m.top}, делённое на ${m.bottom}`}>
              <span>{m.top}</span>
              <span>{m.bottom}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
