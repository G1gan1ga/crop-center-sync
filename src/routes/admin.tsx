import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Stat, StatusBadge, Timeline } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import {
  CENTRES,
  MSP_PER_QUINTAL,
  STATUS_FLOW,
  STATUS_LABEL,
  centreById,
  formatCurrency,
  formatDate,
  today,
  type Booking,
  type TokenStatus,
} from "@/lib/procurement";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Centre Operations Console — Krishi Setu" },
      {
        name: "description",
        content:
          "Staff console to manage the procurement queue, record weighing and procurement, and release MSP payments.",
      },
      { property: "og:title", content: "Centre Operations Console — Krishi Setu" },
      {
        property: "og:description",
        content: "Manage queues, procurement records and payment status across procurement centres.",
      },
    ],
  }),
  component: AdminPage,
});

const FILTERS = ["all", "in-queue", "procured", "payment"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABEL: Record<Filter, string> = {
  all: "All tokens",
  "in-queue": "In queue",
  procured: "Procured",
  payment: "Payment pending",
};

export default function noop() {}

function AdminPage() {
  const { state, updateStatus } = useStore();
  const [centreId, setCentreId] = useState(CENTRES[0]!.id);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const d = today();
  const centre = centreById(centreId);
  const all = state.bookings.filter((b) => b.centreId === centreId && b.date === d);

  const rows = all.filter((b) => {
    if (filter === "in-queue") return ["booked", "checked-in", "weighing"].includes(b.status);
    if (filter === "procured")
      return ["procured", "payment-initiated", "paid"].includes(b.status);
    if (filter === "payment") return b.status === "procured" || b.status === "payment-initiated";
    return true;
  });

  const selected = state.bookings.find((b) => b.id === selectedId) ?? null;

  function advance(b: Booking) {
    const i = STATUS_FLOW.indexOf(b.status);
    const next = STATUS_FLOW[i + 1];
    if (!next) return;
    const note =
      next === "procured"
        ? `${b.quantityQuintal} quintal accepted at MSP (${formatCurrency(b.quantityQuintal * MSP_PER_QUINTAL[b.crop])})`
        : next === "paid"
          ? "Amount credited to registered bank account"
          : STATUS_LABEL[next];
    updateStatus(b.id, next, note);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Centre operations</h1>
          <p className="text-sm text-muted-foreground">
            {centre.name} · {formatDate(d)} · capacity {centre.capacityPerSlot} farmers per slot
          </p>
        </div>
        <div>
          <label htmlFor="a-centre" className="mb-1.5 block text-sm font-medium">
            Centre
          </label>
          <select
            id="a-centre"
            value={centreId}
            onChange={(e) => {
              setCentreId(e.target.value);
              setSelectedId(null);
            }}
            className="input"
          >
            {CENTRES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tokens today" value={String(all.length)} />
        <Stat
          label="Waiting"
          value={String(all.filter((b) => ["booked", "checked-in", "weighing"].includes(b.status)).length)}
        />
        <Stat
          label="Procured"
          value={`${all
            .filter((b) => ["procured", "payment-initiated", "paid"].includes(b.status))
            .reduce((s, b) => s + b.quantityQuintal, 0)} qtl`}
        />
        <Stat
          label="Paid out"
          value={formatCurrency(
            all.filter((b) => b.status === "paid").reduce((s, b) => s + (b.amount ?? 0), 0),
          )}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card
          title="Token register"
          action={
            <div role="group" aria-label="Filter tokens" className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {FILTER_LABEL[f]}
                </button>
              ))}
            </div>
          }
        >
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tokens match this filter.</p>
          ) : (
            <ul className="space-y-3">
              {rows.map((b) => {
                const person = state.farmers.find((f) => f.id === b.farmerId);
                const i = STATUS_FLOW.indexOf(b.status);
                const next = STATUS_FLOW[i + 1];
                return (
                  <li key={b.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {b.token} · {person?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {b.crop} {b.quantityQuintal} qtl · {b.slot} · {person?.village}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {next && (
                        <button
                          type="button"
                          onClick={() => advance(b)}
                          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
                        >
                          Mark {STATUS_LABEL[next].toLowerCase()}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedId(b.id)}
                        className="rounded-md border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                      >
                        View timeline
                      </button>
                      {b.status !== "paid" && b.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(b.id, "cancelled" as TokenStatus, "Token cancelled by centre staff")
                          }
                          className="rounded-md border border-input px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                        >
                          Cancel token
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card
          title={selected ? `Timeline · ${selected.token}` : "Timeline"}
          description={selected ? undefined : "Select a token to see its full history."}
        >
          {selected ? (
            <Timeline booking={selected} />
          ) : (
            <p className="text-sm text-muted-foreground">No token selected.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
