import type { CSSProperties } from "react";
import type { Perfume } from "@/types";
export function Bottle({ perfume: p }: { perfume: Perfume }) {
  return (
    <div
      className="bottle"
      aria-hidden="true"
      style={{ "--juice": p.moodColor } as CSSProperties}
    >
      <div className="cap" />
      <div className="neck" />
      <div className="glass" />
      <div className="labelBottle">
        <b>SCENTIA</b>
        <small>{p.name}</small>
      </div>
    </div>
  );
}
export function Flower() {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="#fff5f0" stroke="#d7a9aa" strokeWidth="2">
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse
            key={i}
            cx="250"
            cy="139"
            rx="66"
            ry="125"
            transform={`rotate(${i * 40} 250 250)`}
          />
        ))}
      </g>
      <circle cx="250" cy="250" r="49" fill="#e7b9a7" />
      <circle cx="250" cy="250" r="28" fill="#f4e0be" />
    </svg>
  );
}
