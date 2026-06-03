import { useState } from "react";

const MIZLY_LOGO_SRC = "/mizly-logo-letterhead.png";

type MizlyLogoProps = {
  size?: number;
  decorative?: boolean;
  className?: string;
};

export function MizlyLogo({ size = 28, decorative = false, className = "" }: MizlyLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const fallback = (
      <span
        className={`inline-flex items-center gap-1.5 font-display font-semibold tracking-tight text-foreground ${className}`}
        style={{ minHeight: size, fontSize: Math.max(12, Math.round(size * 0.78)) }}
      >
        <span className="inline-block rounded-[0.35em] accent-rule" style={{ width: size * 0.72, height: size * 0.5 }} />
        <span>Mizly</span>
      </span>
    );

    return decorative ? <span aria-hidden="true">{fallback}</span> : fallback;
  }

  return (
    <img
      src={MIZLY_LOGO_SRC}
      alt={decorative ? "" : "Mizly"}
      className={`block w-auto ${className}`}
      style={{ height: size }}
      onError={() => setFailed(true)}
    />
  );
}
