import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import styles from "./Included.module.css";

/* Что входит в базовую лицензию и что добавляется модулями. */

const BASE = [
  { group: "Шлюз", items: ["Один API для всех моделей", "Маршрут по цене и кэш", "Облачные, российские и локальные модели"] },
  { group: "Доступ", items: ["Виртуальные ключи", "Вход через SSO", "Отзыв доступа через каталог"] },
  { group: "Контроль", items: ["Маскирование персданных", "Классы данных и политики", "Лимиты и журнал в SIEM"] },
  { group: "Люди", items: ["Порталы сотрудника и администратора", "Журнал вызовов агентов", "Обновления и поддержка 8×5"] },
];

const MODULES = [
  {
    name: "Гардрейлы",
    text: "Защита от промпт-инъекций и обхода правил, запретные темы, проверка ответов модели до выдачи сотруднику.",
  },
  {
    name: "Периметр агента",
    text: "Правила для агентов: в какие системы можно, учётные данные — на время вызова.",
  },
  {
    name: "Закрытый контур",
    text: "Работа без интернета: зеркало обновлений и каталога моделей, сверка хешей.",
  },
  {
    name: "Поддержка 24×7",
    text: "Круглосуточно, с SLA — для промышленной нагрузки.",
  },
];

export default function Included() {
  return (
    <div className={styles.stage}>
      <div className={styles.base}>
        <p className={styles.head}>
          <span>База</span>
          <small>в каждой лицензии</small>
        </p>
        <div className={styles.groups}>
          {BASE.map((g) => (
            <div key={g.group}>
              <b>{g.group}</b>
              <ul className="list-check">
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Reveal className={styles.mods} threshold={0.2}>
        <p className={styles.head}>
          <span>Модули</span>
          <small>по необходимости</small>
        </p>
        {MODULES.map((m, i) => (
          <article key={m.name} className={styles.mod} data-reveal="" style={vars({ "--i": i })}>
            <span className={styles.plus} aria-hidden="true">
              +
            </span>
            <div>
              <h3>{m.name}</h3>
              <p>{m.text}</p>
            </div>
          </article>
        ))}
      </Reveal>
    </div>
  );
}
