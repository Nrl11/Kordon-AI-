"use client";

import { useSeen } from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import { num, rubShort } from "@/lib/format";
import type { Bill } from "./calc";
import styles from "./Economics.module.css";

/* Счёт за ИИ в месяц — две полосы в одном масштабе: «Сейчас» и «С Кордоном».
   Колонки — подписки и запросы к API; ширина колонки — сколько она стоит
   сейчас. В нижней полосе из каждой колонки вырезана экономия (золотая
   штриховка), а подпись под ней говорит, откуда она взялась. Подписи —
   текстом рядом с полосами, без легенды. */
export default function BillBars({ b }: { b: Bill }) {
  const [ref, seen] = useSeen<HTMLElement>(0.35);
  const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0);
  const cols = vars({
    "--subs": Math.max(b.subs, 1),
    "--api": Math.max(b.api, 0.0001),
    "--subs-keep": b.subsAfter,
    "--subs-cut": b.subsSaved,
    "--api-keep": b.apiAfter,
    "--api-cut": b.apiSaved,
    "--subs-s": share(b.subsSaved, b.subs),
    "--api-s": share(b.apiSaved, b.api),
  });

  return (
    <figure ref={ref} className={styles.bill} data-in={seen || undefined} style={cols}>
      <figcaption className={styles.billTitle}>
        Счёт за ИИ <span>в месяц</span>
      </figcaption>

      <div className={styles.billGrid}>
        <span className={styles.spacer} />
        <div className={styles.cols} aria-hidden="true">
          <span className={styles.colHead} data-c="subs">
            Подписки
          </span>
          <span className={styles.colHead} data-c="api">
            Запросы к API
          </span>
        </div>
        <span className={styles.spacer} />

        <span className={styles.rowName}>Сейчас</span>
        <div className={styles.cols} data-row="now">
          <div className={styles.col} data-c="subs">
            <i className={styles.seg} data-k="subs">
              <span>{rubShort(b.subs)}</span>
            </i>
          </div>
          <div className={styles.col} data-c="api">
            <i className={styles.seg} data-k="api">
              <span>{rubShort(b.api)}</span>
            </i>
          </div>
        </div>
        <b className={styles.rowTotal}>{rubShort(b.before)}</b>

        <span className={styles.rowName}>С Кордоном</span>
        <div className={styles.cols} data-row="after">
          <div className={styles.col} data-c="subs">
            <i className={styles.seg} data-k="subs" data-part="keep">
              <span>{rubShort(b.subsAfter)}</span>
            </i>
            <i className={styles.seg} data-k="cut" data-from="subs" data-part="cut" />
          </div>
          <div className={styles.col} data-c="api">
            <i className={styles.seg} data-k="api" data-part="keep">
              <span>{rubShort(b.apiAfter)}</span>
            </i>
            <i className={styles.seg} data-k="cut" data-from="api" data-part="cut" />
          </div>
        </div>
        <b className={styles.rowTotal} data-after="">
          {rubShort(b.after)}
        </b>

        <span className={styles.spacer} />
        <div className={styles.cols} data-row="notes">
          <p className={styles.note} data-c="subs">
            <b>−{rubShort(b.subsSaved)}</b>
            <small>{num(b.moved)} подписок → базовый тариф</small>
          </p>
          <p className={styles.note} data-c="api">
            <b>−{rubShort(b.apiSaved)}</b>
            <small>кэш и дешёвые модели</small>
          </p>
        </div>
        <span className={styles.spacer} />
      </div>

      {/* таблица не подчиняется overflow — прячем её обёрткой, иначе она раздвигает страницу */}
      <div className="sr-only">
        <table>
          <caption>Счёт за ИИ в месяц</caption>
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col">Подписки</th>
              <th scope="col">Запросы к API</th>
              <th scope="col">Всего</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Сейчас</th>
              <td>{rubShort(b.subs)}</td>
              <td>{rubShort(b.api)}</td>
              <td>{rubShort(b.before)}</td>
            </tr>
            <tr>
              <th scope="row">С Кордоном</th>
              <td>{rubShort(b.subsAfter)}</td>
              <td>{rubShort(b.apiAfter)}</td>
              <td>{rubShort(b.after)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </figure>
  );
}
