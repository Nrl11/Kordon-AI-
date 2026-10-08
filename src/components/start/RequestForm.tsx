"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { LogoMark } from "@/components/Logo";
import { cx } from "@/lib/css";
import { describeLicense, sizeFor, takeLicense, type LicenseIntent } from "@/lib/license";
import { takePilot } from "@/lib/pilot";
import { FOCUS, SIZES, validateLead, type Focus, type LeadData, type LeadErrors, type LeadField } from "@/lib/lead";
import styles from "./Request.module.css";

const EMPTY: LeadData = { name: "", company: "", email: "", phone: "", size: "", focus: [], consent: false };
const ORDER: LeadField[] = ["name", "company", "email", "phone", "size", "consent"];
const LABEL: Record<LeadField, string> = {
  name: "Имя",
  company: "Компания",
  email: "Рабочая почта",
  phone: "Телефон",
  size: "Сотрудников с ИИ",
  consent: "Согласие",
};

export default function RequestForm({
  onCompany,
  onSize,
  onFocus,
}: {
  onCompany?: (v: string) => void;
  onSize?: (v: string) => void;
  onFocus?: (v: Focus[]) => void;
}) {
  const id = useId();
  const [data, setData] = useState<LeadData>(EMPTY);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [touched, setTouched] = useState<Partial<Record<LeadField, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [pass, setPass] = useState<{ id: string; company: string; email: string; size: string; license?: string } | null>(
    null,
  );
  /* конфигурация со страницы стоимости, если пришли за ценой */
  const [license, setLicense] = useState<LicenseIntent | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const honey = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      /* почта из поля «Пилот» на главной */
      const email = takePilot();
      if (email) setData((prev) => (prev.email ? prev : { ...prev, email }));
      const d = takeLicense();
      if (!d) return;
      setLicense(d);
      setData((prev) => (prev.size ? prev : { ...prev, size: sizeFor(d.count) }));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  /* выбранное сразу видно на карточке заявки слева */
  useEffect(() => {
    onSize?.(data.size);
  }, [data.size, onSize]);
  useEffect(() => {
    onFocus?.(data.focus);
  }, [data.focus, onFocus]);

  const set = <K extends keyof LeadData>(k: K, v: LeadData[K]) => {
    const next = { ...data, [k]: v };
    setData(next);
    if (k === "company") onCompany?.(String(v));
    /* после первой проверки поле переоценивается сразу, чтобы ошибка исчезала по мере исправления */
    if (k !== "focus" && touched[k as LeadField])
      setErrors((e) => ({ ...e, [k]: validateLead(next)[k as LeadField], form: undefined }));
  };
  const blur = (k: LeadField) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((e) => ({ ...e, [k]: validateLead(data)[k] }));
  };
  const toggleFocus = (f: Focus) =>
    set("focus", data.focus.includes(f) ? data.focus.filter((x) => x !== f) : [...data.focus, f]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateLead(data);
    setTouched({ name: true, company: true, email: true, phone: true, size: true, consent: true });
    if (Object.keys(found).length) {
      setErrors(found);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          license: license ? describeLicense(license) : undefined,
          website: honey.current?.value ?? "",
        }),
      });
      const json = (await res.json()) as { ok: boolean; id?: string; errors?: LeadErrors };
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
  const err = (k: LeadField) => (touched[k] ? errors[k] : undefined);
  const describe = (k: LeadField) => (err(k) ? `${id}-${k}-err` : undefined);

  const text = (k: "name" | "company" | "email" | "phone", type: string, auto: string, required: boolean) => (
    <div className={styles.field}>
      <label htmlFor={`${id}-${k}`}>
        {LABEL[k]} {required ? <span aria-hidden="true">*</span> : <small>необязательно</small>}
      </label>
      <input
        id={`${id}-${k}`}
        name={k}
        type={type}
        inputMode={type === "email" ? "email" : type === "tel" ? "tel" : undefined}
        autoComplete={auto}
        value={data[k]}
        onChange={(e) => set(k, e.target.value)}
        onBlur={() => blur(k)}
        aria-invalid={!!err(k)}
        aria-describedby={describe(k)}
        required={required}
      />
      {err(k) && (
        <p id={`${id}-${k}-err`} className={styles.error}>
          {err(k)}
        </p>
      )}
    </div>
  );

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

      <div className={styles.pair}>
        {text("name", "text", "name", true)}
        {text("company", "text", "organization", true)}
      </div>
      <div className={styles.pair}>
        {text("email", "email", "email", true)}
        {text("phone", "tel", "tel", false)}
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

      <fieldset className={styles.sizes}>
        <legend>
          Что важнее <small>можно несколько</small>
        </legend>
        <div className={styles.chips}>
          {FOCUS.map((f) => (
            <label key={f} className={cx(styles.chip, data.focus.includes(f) && styles.chipOn)}>
              <input type="checkbox" checked={data.focus.includes(f)} onChange={() => toggleFocus(f)} />
              {f}
            </label>
          ))}
        </div>
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
              политике обработки персональных данных
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
        {status === "sending" ? "Отправляем…" : license ? "Получить цену" : "Отправить заявку"}
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
          <span>{license ? "Запрос цены" : "Заявка принята"}</span>
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
          <div>
            <dt>{license ? "Лицензия" : "Дальше"}</dt>
            <dd>{license ?? "пилот"}</dd>
          </div>
          <div>
            <dt>Связь</dt>
            <dd>напишем на почту</dd>
          </div>
        </dl>
        <div className={styles.passFoot}>
          <span className={styles.code} aria-hidden="true" />
          <b className="num">{id}</b>
        </div>
      </div>
      <p className={styles.passNote}>
        Заявка принята. Напишем на <b>{email}</b>, чтобы договориться о пилоте.
      </p>
    </div>
  );
}
