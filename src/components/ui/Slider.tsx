"use client";

import { useId } from "react";
import { vars } from "@/lib/css";
import styles from "./Slider.module.css";

/* Нативный ползунок: клавиатура, экранные дикторы и касания работают сами. */
export default function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  tone = "light",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  tone?: "light" | "dark";
}) {
  const id = useId();
  const p = (value - min) / (max - min);
  return (
    <div className={styles.slider} data-tone={tone}>
      <div className={styles.top}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="num">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format(value)}
        style={vars({ "--p": p })}
      />
    </div>
  );
}
