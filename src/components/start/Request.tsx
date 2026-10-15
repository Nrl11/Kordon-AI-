"use client";

import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { useSeen } from "@/components/ui/Reveal";
import type { Focus } from "@/lib/lead";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import RequestForm from "./RequestForm";
import styles from "./Request.module.css";

/* The request is a dark card and the first screen of /start.
   Left: the heading and the pilot pass. The pass prints when the block comes
   into view and fills in as you complete the form on the right: company, how
   many employees use AI, what matters most. */

export default function Request() {
  const [company, setCompany] = useState("");
  const [size, setSize] = useState("");
  const [focus, setFocus] = useState<Focus[]>([]);
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);

  const name = company.trim();
  const what = focus.join(", ");
  return (
    <div id="request" className={styles.stage}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h1 className={styles.title}>Start with a pilot</h1>
          <p className={styles.lead}>
            {nb("We run Kordon on your data and write up a report: what goes out to models and what it costs. You decide on buying after the report")}
          </p>

          <div ref={ref} className={styles.slot} data-in={seen || undefined}>
            <div className={styles.ticket}>
              <div className={styles.ticketTop}>
                <span>Pilot</span>
                <LogoMark size={24} />
              </div>
              <dl className={styles.ticketData}>
                <div style={vars({ "--i": 0 })}>
                  <dt>Company</dt>
                  <dd key={name} className={name ? styles.filled : styles.empty}>
                    {name || "enter it in the form"}
                  </dd>
                </div>
                <div style={vars({ "--i": 1 })}>
                  <dt>AI users</dt>
                  <dd key={size} className={size ? styles.filled : styles.empty}>
                    {size || "choose in the form"}
                  </dd>
                </div>
                <div style={vars({ "--i": 2 })}>
                  <dt>Focus</dt>
                  <dd key={what} className={what ? styles.filled : styles.empty}>
                    {what || "pick in the form"}
                  </dd>
                </div>
                <div style={vars({ "--i": 3 })}>
                  <dt>Next</dt>
                  <dd>call with an engineer</dd>
                </div>
              </dl>
              <div className={styles.ticketFoot}>
                <span className={styles.code} aria-hidden="true" />
                <b>KRD</b>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <RequestForm onCompany={setCompany} onSize={setSize} onFocus={setFocus} />
        </div>
      </div>
    </div>
  );
}
