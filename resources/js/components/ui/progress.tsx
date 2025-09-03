import * as React from "react";

type Props = { value?: number; className?: string };

export function Progress({ value = 0, className = "" }: Props) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`h-2 w-full rounded bg-muted ${className}`}>
      <div className="h-2 rounded bg-primary transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default Progress;