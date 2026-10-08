import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import { cx } from "@/lib/css";
import { nb, sub } from "@/lib/typo";

/* Шапка страницы: заголовок, одна строка, было/стало (для решений),
   действия — и справа сцена. */
export default function PageHead({
  title,
  lead,
  before,
  after,
  actions,
  visual,
  tone,
}: {
  title: ReactNode;
  lead?: ReactNode;
  before?: string;
  after?: string;
  actions?: ReactNode;
  visual?: ReactNode;
  tone?: "soft";
}) {
  return (
    <section className={cx("page-head", tone)}>
      <div className={cx("wrap", visual ? "page-grid" : undefined)}>
        <Reveal className="page-copy">
          <h1 className="h1-page" data-reveal="">
            {title}
          </h1>
          {lead && (
            <p className="page-lead" data-reveal="">
              {sub(lead)}
            </p>
          )}
          {before && after && (
            <dl className="ba" data-reveal="">
              <div>
                <dt>Было</dt>
                <dd>{nb(before)}</dd>
              </div>
              <div>
                <dt>Стало</dt>
                <dd>{nb(after)}</dd>
              </div>
            </dl>
          )}
          {actions && (
            <div className="page-actions" data-reveal="">
              {actions}
            </div>
          )}
        </Reveal>
        {visual && <div className="page-visual">{visual}</div>}
      </div>
    </section>
  );
}
