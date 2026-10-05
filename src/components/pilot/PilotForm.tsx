"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { LogoMark } from "@/components/Logo";
import { cx } from "@/lib/css";
import { describeLicense, onLicense, sizeFor, type LicenseIntent } from "@/lib/license";
import { SIZES, validatePilot, type PilotData, type PilotErrors, type PilotField } from "@/lib/pilot";
import styles from "./Pilot.module.css";

const EMPTY: PilotData = { name: "", company: "", email: "", size: "", consent: false };
const ORDER: PilotField[] = ["name", "company", "email", "size", "consent"];
const LABEL: Record<PilotField, string> = {
  name: "Имя",
  company: "Компания",
  email: "Рабочая почта",
  size: "Сотрудников с ИИ",
  consent: "Согласие",
};

export default function PilotForm({
  onCompany,
  onSize,
}: {
  onCompany?: (v: string) => void;
  onSize?: (v: string) => void;
}) {
  const id = useId();
  const [data, setData] = useState<PilotData>(EMPTY);
  const [errors, setErrors] = useState<PilotErrors>({});
  const [touched, setTouched] = useState<Partial<Record<PilotField, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [pass, setPass] = useState<{ id: string; company: string; email: string; size: string; license?: string } | null>(
    null,
  );
  /* конфигурация из блока лицензии, если пришли за ценой */
  const [license, setLicense] = useState<LicenseIntent | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const honey = useRef<HTMLInputElement>(null);

  useEffect(
    () =>
      onLicense((d) => {
        setLicense(d);
        setData((prev) => (prev.size ? prev : { ...prev, size: sizeFor(d.count) }));
      }),
    [],
  );

  /* выбранный размер компании сразу виден на пропуске слева — и при клике, и когда он пришёл из блока лицензии */
  useEffect(() => {
    onSize?.(data.size);
  }, [data.size, onSize]);

  const set = <K extends PilotField>(k: K, v: PilotData[K]) => {
    const next = { ...data, [k]: v };
    setData(next);
    if (k === "company") onCompany?.(String(v));
    /* после первой проверки поле переоценивается сразу, чтобы ошибка исчезала по мере исправления */
    if (touched[k]) setErrors((e) => ({ ...e, [k]: validatePilot(next)[k], form: undefined }));
  };
  const blur = (k: PilotField) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((e) => ({ ...e, [k]: validatePilot(data)[k] }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = validatePilot(data);
    setTouched({ name: true, company: true, email: true, size: true, consent: true });
    if (Object.keys(found).length) {
      setErrors(found);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          license: license ? describeLicense(license) : undefined,
          website: honey.current?.value ?? "",
        }),
      });
      const json = (await res.json()) as { ok: boolean; id?: string; errors?: PilotErrors };
      if (!json.ok) {
        setErrors(json.errors ?? { form: "Заявка не прошла проверку. Проверьте поля и отправьте ещё раз." });
        setStatus("idle");
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      setPass({
        id: json.id ?? "",
        company: data.company.trim(),
        email: data.email.trim(),
        size: data.size,
        license: license?.tier,
      });
      setStatus("done");
    } catch {
      setErrors({ form: "Нет связи с сервером. Проверьте интернет и отправьте ещё раз — введённое сохранилось." });
      setStatus("idle");
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  if (status === "done" && pass) return <Pass {...pass} />;

  const list = ORDER.filter((k) => errors[k]);
  const err = (k: PilotField) => (touched[k] ? errors[k] : undefined);
  const describe = (k: PilotField) => (err(k) ? `${id}-${k}-err` : undefined);

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-label="Заявка на пилот">
      {(list.length > 0 || errors.form) && (
        <div ref={summaryRef} className={styles.summary} role="alert" tabIndex={-1}>
          {errors.form ? (
            <p>{errors.form}</p>
          ) : (
            <>
              <p>Проверьте {list.length === 1 ? "поле" : "поля"}:</p>
              <ul>
                {list.map((k) => (
                  <li key={k}>
                    <a href={`#${id}-${k}`}>{LABEL[k]}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {license && (
        <div className={styles.intent}>
          <span>
            <small>Запрос цены</small>
            <b>{describeLicense(license)}</b>
          </span>
          <button type="button" onClick={() => setLicense(null)} aria-label="Убрать запрос цены из заявки">
            ×
          </button>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor={`${id}-name`}>
          Имя <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${id}-name`}
          name="name"
          autoComplete="name"
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
          onBlur={() => blur("name")}
          aria-invalid={!!err("name")}
          aria-describedby={describe("name")}
          required
        />
        {err("name") && (
          <p id={`${id}-name-err`} className={styles.error}>
            {err("name")}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-company`}>
          Компания <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${id}-company`}
          name="company"
          autoComplete="organization"
          value={data.company}
          onChange={(e) => set("company", e.target.value)}
          onBlur={() => blur("company")}
          aria-invalid={!!err("company")}
          aria-describedby={describe("company")}
          required
        />
        {err("company") && (
          <p id={`${id}-company-err`} className={styles.error}>
            {err("company")}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-email`}>
          Рабочая почта <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => blur("email")}
          aria-invalid={!!err("email")}
          aria-describedby={describe("email")}
          required
        />
        {err("email") && (
          <p id={`${id}-email-err`} className={styles.error}>
            {err("email")}
          </p>
        )}
      </div>

      <fieldset className={styles.sizes} aria-describedby={describe("size")} aria-invalid={!!err("size")}>
        <legend id={`${id}-size`} tabIndex={-1}>
          Сколько сотрудников пользуются ИИ <span aria-hidden="true">*</span>
        </legend>
        <div className={styles.chips}>
          {SIZES.map((s) => (
            <label key={s} className={cx(styles.chip, data.size === s && styles.chipOn)}>
              <input
                type="radio"
                name="size"
                value={s}
                checked={data.size === s}
                onChange={() => {
                  setTouched((t) => ({ ...t, size: true }));
                  set("size", s);
                  setErrors((e) => ({ ...e, size: undefined }));
                }}
              />
              {s}
            </label>
          ))}
        </div>
        {err("size") && (
          <p id={`${id}-size-err`} className={styles.error}>
            {err("size")}
          </p>
        )}
      </fieldset>

      <div className={styles.consent}>
        <label>
          <input
            id={`${id}-consent`}
            type="checkbox"
            checked={data.consent}
            onChange={(e) => {
              setTouched((t) => ({ ...t, consent: true }));
              set("consent", e.target.checked);
              setErrors((er) => ({ ...er, consent: e.target.checked ? undefined : er.consent }));
            }}
            aria-invalid={!!err("consent")}
            aria-describedby={describe("consent")}
          />
          <span>
            Согласен на обработку персональных данных по{" "}
            <a href="/privacy" target="_blank" rel="noopener">
              политике
            </a>
          </span>
        </label>
        {err("consent") && (
          <p id={`${id}-consent-err`} className={styles.error}>
            {err("consent")}
          </p>
        )}
      </div>

      {/* ловушка для ботов */}
      <input ref={honey} className={styles.honey} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <button type="submit" className="btn btn-primary" disabled={status === "sending"} aria-busy={status === "sending"}>
        {status === "sending" ? "Отправляем…" : license ? "Получить цену" : "Запросить пилот"}
        {status !== "sending" && (
          <span className="arr" aria-hidden="true">
            →
          </span>
        )}
      </button>
    </form>
  );
}

function Pass({
  id,
  company,
  email,
  size,
  license,
}: {
  id: string;
  company: string;
  email: string;
  size: string;
  license?: string;
}) {
  return (
    <div className={styles.passWrap} role="status">
      <div className={styles.pass}>
        <div className={styles.passTop}>
          <span>{license ? "Запрос цены" : "Пропуск на пилот"}</span>
          <LogoMark size={26} tone="dark" />
        </div>
        <dl className={styles.passData}>
          <div>
            <dt>Компания</dt>
            <dd>{company}</dd>
          </div>
          <div>
            <dt>Сотрудников с ИИ</dt>
            <dd>{size}</dd>
          </div>
          {license ? (
            <div>
              <dt>Лицензия</dt>
              <dd>{license}</dd>
            </div>
          ) : (
            <div>
              <dt>Пилот</dt>
              <dd>60 дней · до 100 потребителей</dd>
            </div>
          )}
          <div>
            <dt>Сотрудники</dt>
            <dd>работают как обычно</dd>
          </div>
        </dl>
        <div className={styles.passFoot}>
          <span className={styles.code} aria-hidden="true" />
          <b className="num">{id}</b>
        </div>
      </div>
      <p className={styles.passNote}>
        Заявка принята. Напишем на <b>{email}</b>, чтобы договориться о старте.
      </p>
    </div>
  );
}
