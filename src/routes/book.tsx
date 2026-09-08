import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import {
  CENTRES,
  CROPS,
  MSP_PER_QUINTAL,
  SLOTS,
  centreById,
  formatCurrency,
  formatWait,
  nextToken,
  slotLoad,
  today,
  waitMinutes,
  type Booking,
  type Crop,
} from "@/lib/procurement";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Procurement Slot — Krishi Setu" },
      {
        name: "description",
        content:
          "Choose your centre, crop, quantity and time slot. Get a token number with expected wait time instantly.",
      },
      { property: "og:title", content: "Book a Procurement Slot — Krishi Setu" },
      {
        property: "og:description",
        content: "Reserve an MSP procurement slot and receive a token with expected wait time.",
      },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const navigate = useNavigate();
  const { state, addBooking, setCurrentFarmer } = useStore();
  const farmer = state.farmers.find((f) => f.id === state.currentFarmerId) ?? state.farmers[0]!;

  const [centreId, setCentreId] = useState(CENTRES[0]!.id);
  const [crop, setCrop] = useState<Crop>("Wheat");
  const [quantity, setQuantity] = useState("20");
  const [date, setDate] = useState(today());
  const [slot, setSlot] = useState(SLOTS[0]!);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const centre = centreById(centreId);
  const qty = Number(quantity);
  const estValue = Number.isFinite(qty) && qty > 0 ? qty * MSP_PER_QUINTAL[crop] : 0;
  const load = slotLoad(state.bookings, centreId, date, slot);
  const full = load >= centre.capacityPerSlot;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    if (qty > 200) {
      setError("Maximum 200 quintal per token. Please split across slots.");
      return;
    }
    if (full) {
      setError("This slot is full. Please choose another slot or date.");
      return;
    }
    setError(null);
    const booking: Booking = {
      id: `b-${Date.now()}`,
      token: nextToken(state.bookings, centreId),
      farmerId: farmer.id,
      centreId,
      crop,
      quantityQuintal: qty,
      date,
      slot,
      status: "booked",
      amount: null,
      timeline: [
        {
          status: "booked",
          at: new Date().toISOString(),
          note: `Slot confirmed for ${slot} at ${centre.name}`,
        },
      ],
    };
    addBooking(booking);
    setCurrentFarmer(farmer.id);
    setConfirmed(booking);
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Card title="Slot confirmed" description="An SMS with these details has been sent to your registered mobile number.">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Token number</dt>
              <dd className="text-2xl font-bold text-primary">{confirmed.token}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Expected wait on arrival</dt>
              <dd className="text-2xl font-bold">
                {formatWait(waitMinutes(centre, load + 1))}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Centre</dt>
              <dd className="font-medium">{centre.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Slot</dt>
              <dd className="font-medium">{confirmed.slot}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Crop &amp; quantity</dt>
              <dd className="font-medium">
                {confirmed.crop} · {confirmed.quantityQuintal} quintal
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estimated value at MSP</dt>
              <dd className="font-medium">{formatCurrency(estValue)}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
            >
              Go to dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/queue" })}
              className="rounded-lg border border-input px-4 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              See live queue
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Book a procurement slot</h1>
        <p className="text-sm text-muted-foreground">
          Booking as <strong className="text-foreground">{farmer.name}</strong> ({farmer.farmerId}) ·{" "}
          {farmer.village}
        </p>

        <Card>
          <form onSubmit={submit} className="space-y-5">
            <Field label="Procurement centre" htmlFor="centre">
              <select
                id="centre"
                value={centreId}
                onChange={(e) => setCentreId(e.target.value)}
                className="input"
              >
                {CENTRES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.district}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Crop" htmlFor="crop">
                <select
                  id="crop"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value as Crop)}
                  className="input"
                >
                  {CROPS.map((c) => (
                    <option key={c} value={c}>
                      {c} — {formatCurrency(MSP_PER_QUINTAL[c])}/qtl
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Quantity (quintal)" htmlFor="qty">
                <input
                  id="qty"
                  type="number"
                  min={1}
                  max={200}
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Date" htmlFor="date">
                <input
                  id="date"
                  type="date"
                  min={today()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Time slot" htmlFor="slot">
                <select
                  id="slot"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="input"
                >
                  {SLOTS.map((s) => {
                    const l = slotLoad(state.bookings, centreId, date, s);
                    return (
                      <option key={s} value={s} disabled={l >= centre.capacityPerSlot}>
                        {s} — {l}/{centre.capacityPerSlot} booked
                        {l >= centre.capacityPerSlot ? " (full)" : ""}
                      </option>
                    );
                  })}
                </select>
              </Field>
            </div>

            {error && (
              <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-deep sm:w-auto"
            >
              Confirm booking
            </button>
          </form>
        </Card>
      </div>

      <aside className="space-y-6">
        <Card title="Booking summary">
          <dl className="space-y-3 text-sm">
            <Row label="Centre" value={centre.name} />
            <Row label="Slot load" value={`${load} / ${centre.capacityPerSlot} booked`} />
            <Row label="Expected wait" value={formatWait(waitMinutes(centre, load + 1))} />
            <Row label="MSP rate" value={`${formatCurrency(MSP_PER_QUINTAL[crop])} / quintal`} />
            <Row label="Estimated value" value={formatCurrency(estValue)} />
          </dl>
        </Card>
        <Card title="Bring with you">
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Farmer registration ID and Aadhaar</li>
            <li>Land record (Khasra / Khatauni) copy</li>
            <li>Bank passbook for MSP credit</li>
            <li>Produce cleaned and moisture below 14%</li>
          </ul>
        </Card>
      </aside>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
