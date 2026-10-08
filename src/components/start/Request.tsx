"use client";

import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { useSeen } from "@/components/ui/Reveal";
import type { Focus } from "@/lib/lead";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import RequestForm from "./RequestForm";
import styles from "./Request.module.css";

/* Заявка — тёмная карточка, она же первый экран страницы «Как начать».
   Слева — как идёт пилот и пропуск: печатается, когда блок появляется,
   и заполняется по мере того, как вы заполняете форму справа: компания,
   сколько сотрудников с ИИ, что важнее. */

export default function Request() {
  const [company, setCompany] = useState("");
  const [size, setSize] = useState("");
  const [focus, setFocus] = useState<Focus[]>([]);
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);

  const name = company.trim();
  const what = focus.join(", ");
  return (
    <div id="request" className={styles.stage}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h1 className={styles.title}>Начните с пилота</h1>
          <p className={styles.lead}>
            {nb("Покажем Кордон на ваших данных и соберём отчёт: что уходит в модели и сколько это стоит. Решение о покупке — после отчёта")}
          </p>

          <div ref={ref} className={styles.slot} data-in={seen || undefined}>
            <div className={styles.ticket}>
              <div className={styles.ticketTop}>
                <span>Пилот</span>
                <LogoMark size={24} />
              </div>
              <dl className={styles.ticketData}>
                <div style={vars({ "--i": 0 })}>
                  <dt>Компания</dt>
                  <dd key={name} className={name ? styles.filled : styles.empty}>
                    {name || "впишите в заявке"}
                  </dd>
                </div>
                <div style={vars({ "--i": 1 })}>
                  <dt>Сотрудников с ИИ</dt>
                  <dd key={size} className={size ? styles.filled : styles.empty}>
                    {size || "выберите в заявке"}
                  </dd>
                </div>
                <div style={vars({ "--i": 2 })}>
                  <dt>Что важнее</dt>
                  <dd key={what} className={what ? styles.filled : styles.empty}>
                    {what || "отметьте в заявке"}
                  </dd>
                </div>
                <div style={vars({ "--i": 3 })}>
                  <dt>Дальше</dt>
                  <dd>созвон с инженером</dd>
                </div>
              </dl>
              <div className={styles.ticketFoot}>
                <span className={styles.code} aria-hidden="true" />
                <b>KRD</b>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <RequestForm onCompany={setCompany} onSize={setSize} onFocus={setFocus} />
        </div>
      </div>
    </div>
  );
}
