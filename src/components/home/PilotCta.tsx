"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { isEmail, requestPilot } from "@/lib/pilot";
import { nb } from "@/lib/typo";
import styles from "./PilotCta.module.css";

/* Последний блок главной: пилот. Одно поле — рабочая почта; остальное
   заполняется в заявке на странице «Как начать». */
export default function PilotCta() {
  const id = useId();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const check = (v: string) => (isEmail(v) ? "" : "Введите рабочую почту, например name@company.ru");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = check(email);
    setError(err);
    if (err) return;
    requestPilot(email);
    router.push("/start#request");
  };

  return (
    <section id="pilot" className={styles.band} aria-labelledby={`${id}-t`}>
      <div className="wrap">
        <div className={styles.card}>
          <LogoMark size={64} tone="dark" thick={false} className={styles.mark} />
          <div className={styles.copy}>
            <h2 id={`${id}-t`}>Начните с пилота</h2>
            <p>{nb("Оставьте рабочую почту — инженер свяжется и всё обсудит.")}</p>
          </div>
          <form className={styles.form} onSubmit={submit} noValidate>
            <label htmlFor={`${id}-e`}>Рабочая почта</label>
            <div className={styles.row}>
              <input
                id={`${id}-e`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.ru"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(check(e.target.value));
                }}
                onBlur={() => email && setError(check(email))}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? `${id}-err` : undefined}
              />
              <button type="submit" className="btn btn-gold">
                Запросить пилот <span className="arr" aria-hidden="true">→</span>
              </button>
            </div>
            {error && (
              <p id={`${id}-err`} className={styles.error} role="alert">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
