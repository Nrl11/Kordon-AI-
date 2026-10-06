import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  robots: { index: false },
};

/* TODO: текст политики по 152-ФЗ готовят юристы — заменить заглушку. */
export default function Privacy() {
  return (
    <section className="page-head">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <nav className="crumbs" aria-label="Путь по сайту">
          <Link href="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Политика ПДн</span>
        </nav>
        <h1 className="h1-page">Политика обработки персональных данных</h1>
        <p className="page-lead">
          Документ готовится. Данные из заявки используются только для того, чтобы связаться с вами и договориться
          о демо и стенде.
        </p>
        <div className="page-actions">
          <Link className="btn btn-line btn-sm" href="/">
            На главную
          </Link>
        </div>
      </div>
    </section>
  );
}
