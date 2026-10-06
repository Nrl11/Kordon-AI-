import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { CTA } from "@/lib/site";
import { nb } from "@/lib/typo";
import styles from "./site.module.css";

/* Последний блок страницы: что дальше и одна кнопка. */
export default function CtaBand({
  title = "Посчитаем экономию на вашем трафике",
  text = "Инженер разберёт вашу схему подключения моделей и поднимет стенд — до решения о покупке.",
  action = CTA.label,
}: {
  title?: string;
  text?: string;
  action?: string;
}) {
  return (
    <section className={styles.ctaBand} aria-label="Следующий шаг">
      <div className="wrap">
        <div className={styles.ctaCard}>
          <LogoMark size={64} tone="dark" thick={false} className={styles.ctaMark} />
          <div>
            <h2 className={styles.ctaTitle}>{title}</h2>
            <p className={styles.ctaText}>{nb(text)}</p>
          </div>
          <Link className="btn btn-gold" href={CTA.href}>
            {action} <span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
