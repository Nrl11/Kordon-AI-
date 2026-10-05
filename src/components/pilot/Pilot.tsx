"use client";

import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { useSeen } from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import PilotForm from "./PilotForm";
import styles from "./Pilot.module.css";

/* Заявка на пилот — тёмная карточка. Слева пропуск на пилот: печатается,
   когда карточка появляется, и заполняется по мере того, как вы вводите
   компанию и выбираете, сколько сотрудников пользуются ИИ. Справа — форма. */

export default function Pilot() {
  const [company, setCompany] = useState("");
  const [size, setSize] = useState("");
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);

  const name = company.trim();
  return (
    <div id="pilot" className={styles.stage}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h3 className={styles.title}>Заявка на пилот</h3>
          <p className={styles.lead}>Оставьте контакты — свяжемся и согласуем старт.</p>

          <div ref={ref} className={styles.slot} data-in={seen || undefined}>
            <div className={styles.ticket}>
              <div className={styles.ticketTop}>
                <span>Пропуск на пилот</span>
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
                  <dt>Пилот</dt>
                  <dd>60 дней · до 100 потребителей</dd>
                </div>
                <div style={vars({ "--i": 3 })}>
                  <dt>Сотрудники</dt>
                  <dd>работают как обычно</dd>
                </div>
              </dl>
              <div className={styles.ticketFoot}>
                <span className={styles.code} aria-hidden="true" />
                <b>KRD-60</b>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <PilotForm onCompany={setCompany} onSize={setSize} />
        </div>
      </div>
    </div>
  );
}
