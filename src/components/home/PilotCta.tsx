import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { CTA } from "@/lib/site";
import { nb } from "@/lib/typo";
import styles from "./PilotCta.module.css";

/* Последний блок главной: пилот. Без своего поля — все заявки идут через
   одну форму на странице «Как начать», чтобы ни одна не потерялась. */
export default function PilotCta() {
  return (
    <section id="pilot" className={styles.band} aria-labelledby="pilot-title">
      <div className="wrap">
        <div className={styles.card}>
          <LogoMark size={64} tone="dark" thick={false} className={styles.mark} />
          <div className={styles.copy}>
            <h2 id="pilot-title">Начните с пилота</h2>
            <p>{nb("Короткая заявка — и инженер свяжется с вами, чтобы обсудить задачи и договориться о пилоте")}</p>
          </div>
          <Link className={`btn btn-gold ${styles.action}`} href={CTA.href}>
            Запросить пилот <span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
