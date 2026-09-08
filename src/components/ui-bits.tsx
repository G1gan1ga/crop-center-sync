import type { ReactNode } from "react";
import {
  STATUS_FLOW,
  STATUS_LABEL,
  formatTime,
  type Booking,
  type TokenStatus,
} from "@/lib/procurement";

const TONE: Record<TokenStatus, string> = {
  booked: "bg-info/15 text-info-strong",
  "checked-in": "bg-accent/20 text-accent-strong",
  weighing: "bg-accent/20 text-accent-strong",
  procured: "bg-primary/15 text-primary",
  "payment-initiated": "bg-accent/20 text-accent-strong",
  paid: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: TokenStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[status]}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Card({
  title,
  description,
  children,
  action,
}: {
  title?: string | undefined;
  description?: string | undefined;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-bold">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Timeline({ booking }: { booking: Booking }) {
  const done = new Set(booking.timeline.map((t) => t.status));
  const steps = STATUS_FLOW;

  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {steps.map((step) => {
        const entry = [...booking.timeline].reverse().find((t) => t.status === step);
        const complete = done.has(step);
        const current = booking.status === step;
        return (
          <li key={step} className="relative">
            <span
              aria-hidden
              className={`absolute -left-[1.65rem] top-1 h-3.5 w-3.5 rounded-full border-2 ${
                current
                  ? "border-primary bg-primary"
                  : complete
                    ? "border-primary bg-card"
                    : "border-border bg-card"
              }`}
            />
            <p
              className={`text-sm font-semibold ${complete ? "text-foreground" : "text-muted-foreground"}`}
            >
              {STATUS_LABEL[step]}
              {current && <span className="ml-2 text-xs font-medium text-primary">Current</span>}
            </p>
            {entry ? (
              <p className="text-xs text-muted-foreground">
                {formatTime(entry.at)} · {entry.note}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Pending</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
