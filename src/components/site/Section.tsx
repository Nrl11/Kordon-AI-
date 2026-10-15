import type { ReactNode } from "react";
import { cx } from "@/lib/css";
import { sub as subline } from "@/lib/typo";

/* Page block: a heading, an optional line under it, and the scene. */
export default function Section({
  id,
  title,
  sub,
  tone,
  aside,
  children,
}: {
  id: string;
  title: ReactNode;
  sub?: ReactNode;
  tone?: "soft" | "dark";
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cx("section", tone)} aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <div className={cx("section-head", aside ? "section-head-row" : undefined)}>
          <div>
            <h2 id={`${id}-title`} className="h2">
              {title}
            </h2>
            {sub && <p className="section-sub">{subline(sub)}</p>}
          </div>
          {aside}
        </div>
        {children}
      </div>
    </section>
  );
}
