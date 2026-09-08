import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card, Stat, StatusBadge, Timeline } from "@/components/ui-bits";
import {
  CENTRES,
  centreById,
  centreQueue,
  formatCurrency,
  formatDate,
  formatWait,
  queuePosition,
  today,
  waitMinutes,
} from "@/lib/procurement";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krishi Setu — Smart Procurement Centre Dashboard" },
      {
        name: "description",
        content:
          "Book MSP procurement slots, track live queue position, wait time, procurement and payment status at your nearest centre.",
      },
      { property: "og:title", content: "Krishi Setu — Smart Procurement Centre Dashboard" },
      {
        property: "og:description",
        content:
          "Slot booking, live queue and payment tracking for farmers and procurement centre staff.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, role } = useStore();
  const farmer = state.farmers.find((f) => f.id === state.currentFarmerId) ?? state.farmers[0]!;
  const mine = state.bookings.filter((b) => b.farmerId === farmer.id);
  const active = mine.find((b) => b.status !== "paid" && b.status !== "cancelled");
  const paidTotal = mine
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);

  if (role === "staff") return <StaffOverview />;

  const centre = active ? centreById(active.centreId) : null;
  const pos = active ? queuePosition(state.bookings, active) : null;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-primary-deep p-6 text-primary-foreground md:p-8">
        <p className="text-sm opacity-90">Namaste, {farmer.name.split(" ")[0]}</p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">
          Your procurement at a glance
        </h1>
        <p className="mt-2 max-w-2xl text-sm opacity-90">
          Farmer ID {farmer.farmerId} · {farmer.village} · {farmer.landAcres} acres registered
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/book"
            className="rounded-lg bg-card px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-card/90"
          >
            Book a procurement slot
          </Link>
          <Link
            to="/queue"
            className="rounded-lg border border-primary-foreground/40 px-4 py-2.5 text-sm font-semibold transition hover:bg-primary-foreground/10"
          >
            View live queue
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active token" value={active ? active.token : "—"} hint={active ? formatDate(active.date) : "No upcoming visit"} />
        <Stat
          label="Queue position"
          value={pos ? `#${pos}` : "—"}
          hint={pos && centre ? `${centreQueue(state.bookings, centre.id, active!.date).length} farmers in queue` : "Not in queue"}
        />
        <Stat
          label="Expected wait"
          value={pos && centre ? formatWait(waitMinutes(centre, pos)) : "—"}
          hint={centre ? `${centre.avgMinutesPerFarmer} min average per farmer` : "Book a slot to see"}
        />
        <Stat label="Payments received" value={formatCurrency(paidTotal)} hint="This season, at MSP" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card title="My bookings" description="Every slot you have booked this season.">
          {mine.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bookings yet.{" "}
              <Link to="/book" className="font-semibold text-primary underline">
                Book your first slot
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {mine.map((b) => {
                const c = centreById(b.centreId);
                return (
                  <li
                    key={b.id}
                    className="rounded-lg border border-border p-4 transition hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          Token {b.token} · {b.crop} {b.quantityQuintal} qtl
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {c.name} · {formatDate(b.date)} · {b.slot}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    {b.amount != null && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Value at MSP: <strong className="text-foreground">{formatCurrency(b.amount)}</strong>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          {active ? (
            <Card
              title={`Status timeline · ${active.token}`}
              description="Live updates from the procurement centre."
            >
              <Timeline booking={active} />
            </Card>
          ) : (
            <Card title="Status timeline">
              <p className="text-sm text-muted-foreground">
                Book a slot to start tracking check-in, weighing, procurement and payment.
              </p>
            </Card>
          )}

          <Card title="Notifications" description="SMS alerts sent to {phone}".replace("{phone}", "") ? undefined : undefined}>
            <ul className="space-y-3 text-sm">
              {[...mine]
                .flatMap((b) => b.timeline.map((t) => ({ ...t, token: b.token })))
                .sort((a, b) => (a.at < b.at ? 1 : -1))
                .slice(0, 5)
                .map((n, i) => (
                  <li key={i} className="rounded-lg bg-muted/60 p-3">
                    <p className="font-medium">Token {n.token}</p>
                    <p className="text-muted-foreground">{n.note}</p>
                  </li>
                ))}
              {mine.length === 0 && (
                <li className="text-muted-foreground">No notifications yet.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>

      <Card title="Procurement centres near you" description="Live load for today.">
        <div className="grid gap-4 md:grid-cols-3">
          {CENTRES.map((c) => {
            const q = centreQueue(state.bookings, c.id, today());
            return (
              <div key={c.id} className="rounded-lg border border-border p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.district}</p>
                <p className="mt-3 text-sm">
                  <strong className="text-lg tabular-nums">{q.length}</strong> farmers in queue ·{" "}
                  {formatWait(waitMinutes(c, q.length + 1))} wait
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StaffOverview() {
  const { state } = useStore();
  const d = today();
  const todays = state.bookings.filter((b) => b.date === d);
  const procured = todays.filter((b) =>
    ["procured", "payment-initiated", "paid"].includes(b.status),
  );
  const pendingPayments = todays.filter((b) => b.status !== "paid" && b.amount != null);
  const quintals = procured.reduce((s, b) => s + b.quantityQuintal, 0);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-ink to-primary-deep p-6 text-primary-foreground md:p-8">
        <p className="text-sm opacity-90">Centre staff console</p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Today&apos;s procurement operations</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-90">
          Manage queues, record procurement and release payments across all connected centres.
        </p>
        <div className="mt-5">
          <Link
            to="/admin"
            className="rounded-lg bg-card px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-card/90"
          >
            Open centre operations
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tokens today" value={String(todays.length)} hint={formatDate(d)} />
        <Stat label="In queue" value={String(todays.filter((b) => ["booked", "checked-in", "weighing"].includes(b.status)).length)} />
        <Stat label="Quantity procured" value={`${quintals} qtl`} hint="Accepted at MSP" />
        <Stat label="Payments pending" value={String(pendingPayments.length)} hint="Awaiting credit" />
      </div>

      <Card title="Centre load" description="Live queue length per centre.">
        <div className="grid gap-4 md:grid-cols-3">
          {CENTRES.map((c) => {
            const q = centreQueue(state.bookings, c.id, d);
            const pct = Math.min(100, Math.round((q.length / (c.capacityPerSlot * 2)) * 100));
            return (
              <div key={c.id} className="rounded-lg border border-border p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.district}</p>
                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {q.length} waiting · {pct}% of today&apos;s capacity
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
