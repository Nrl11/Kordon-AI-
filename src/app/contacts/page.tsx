import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import { LogoMark } from "@/components/Logo";
import { CONTACTS, CTA, LEGAL, OFFICES } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { nb } from "@/lib/typo";
import styles from "@/components/contacts/Contacts.module.css";

export const metadata: Metadata = pageMeta({
  path: "/contacts",
  title: "Контакты",
  description:
    "Контакты команды Кордон AI: телефон +7 495 540-51-79, почта ai@webpractik.ru, офисы в Москве и Ростове-на-Дону, реквизиты ООО «Вебпрактик».",
  og: "contacts",
  ogTitle: "Поговорим о Кордоне",
});

const mapUrl = (q: string) => `https://yandex.ru/maps/?text=${encodeURIComponent(q)}`;

/* Контакты: первым экраном — телефон и почта крупно и кнопка на заявку;
   ниже — офисы, реквизиты и куда писать о персональных данных. */
export default function ContactsPage() {
  return (
    <>
      <PageHead
        title="Контакты"
        lead="Расскажем о Кордоне, покажем его в работе и договоримся о пилоте"
        actions={
          <>
            <Link className="btn btn-primary" href={CTA.href}>
              Оставить заявку <span className="arr" aria-hidden="true">→</span>
            </Link>
            <a className="more" href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer">
              Канал Вебпрактик AI <span aria-hidden="true">→</span>
            </a>
          </>
        }
        visual={
          <div className={styles.card}>
            <LogoMark size={40} tone="dark" thick={false} className={styles.mark} />
            <span className={styles.eyebrow}>Команда Кордона</span>
            <a className={styles.phone} href={`tel:${CONTACTS.tel}`}>
              {CONTACTS.phone}
            </a>
            <a className={styles.email} href={`mailto:${CONTACTS.email}`}>
              {CONTACTS.email}
            </a>
            <p className={styles.note}>{nb("Ответим на вопросы о продукте, цене и пилоте")}</p>
          </div>
        }
      />

      <Section id="offices" title="Офисы и реквизиты" tone="soft">
        <div className={styles.grid}>
          {OFFICES.map((o) => (
            <article key={o.city} className={styles.item}>
              <h3>{o.city}</h3>
              <small>{o.note}</small>
              <p>{nb(o.address)}</p>
              <a href={mapUrl(o.map)} target="_blank" rel="noopener noreferrer">
                Открыть на карте <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}

          <article className={styles.item}>
            <h3>Реквизиты</h3>
            <small>аккредитованная ИТ-компания</small>
            <dl className={styles.legal}>
              <div>
                <dt>Компания</dt>
                <dd>{LEGAL.name}</dd>
              </div>
              <div>
                <dt>ИНН</dt>
                <dd>{LEGAL.inn}</dd>
              </div>
              <div>
                <dt>ОГРН</dt>
                <dd>{LEGAL.ogrn}</dd>
              </div>
            </dl>
          </article>
        </div>
      </Section>
    </>
  );
}
