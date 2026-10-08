import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-head">
      <div className="wrap" style={{ maxWidth: 760, minHeight: "50vh" }}>
        <h1 className="h1-page">Такой страницы нет</h1>
        <p className="page-lead">Возможно, адрес изменился. Начните с главной или посмотрите, как устроен шлюз</p>
        <div className="page-actions">
          <Link className="btn btn-primary" href="/">
            На главную
          </Link>
          <Link className="more" href="/#protect">
            Как устроен шлюз <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
