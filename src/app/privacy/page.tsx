import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных — Кордон AI",
  robots: { index: false },
};

/* TODO: текст политики по 152-ФЗ готовят юристы — заменить заглушку. */
export default function Privacy() {
  return (
    <main className="wrap" style={{ paddingBlock: "56px 96px", maxWidth: 760 }}>
      <Link href="/" aria-label="Кордон AI — на главную" style={{ display: "inline-flex", textDecoration: "none" }}>
        <Logo size={30} />
      </Link>
      <h1 className="h2" style={{ marginTop: 48 }}>
        Политика обработки персональных данных
      </h1>
      <p className="lead" style={{ marginTop: 24 }}>
        Документ готовится. Данные из заявки на пилот используются только для того, чтобы связаться с вами и
        договориться о пилоте.
      </p>
      <p style={{ marginTop: 32 }}>
        <Link className="btn btn-line btn-sm" href="/">
          На главную
        </Link>
      </p>
    </main>
  );
}
