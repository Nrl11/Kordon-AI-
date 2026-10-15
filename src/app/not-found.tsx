import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-head">
      <div className="wrap" style={{ maxWidth: 760, minHeight: "50vh" }}>
        <h1 className="h1-page">This page doesn’t exist</h1>
        <p className="page-lead">The address may have changed. Start from the home page or see how the gateway works</p>
        <div className="page-actions">
          <Link className="btn btn-primary" href="/">
            Go to home page
          </Link>
          <Link className="more" href="/#protect">
            How the gateway works <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
