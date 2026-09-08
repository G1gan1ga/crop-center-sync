import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, StatusBadge } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import {
  CENTRES,
  centreById,
  centreQueue,
  formatWait,
  today,
  waitMinutes,
} from "@/lib/procurement";

export const Route = createFileRoute("/queue")({
  head: () => ({
    meta: [
      { title: "Live Queue & Wait Time — Krishi Setu" },
      {
        name: "description",
        content:
          "See the live token queue at each procurement centre, your position and the expected waiting time.",
      },
      { property: "og:title", content: "Live Queue & Wait Time — Krishi Setu" },
      {
        property: "og:description",
        content: "Live token queue and expected wait time at MSP procurement centres.",
      },
    ],
  }),
  component: QueuePage,
});

function QueuePage() {
  const { state } = useStore();
  const [centreId, setCentreId] = useState(CENTRES[0]!.id);
  const centre = centreById(centreId);
  const d = today();
  const queue = centreQueue(state.bookings, centreId, d);
  const farmer = state.farmers.find((f) => f.id === state.currentFarmerId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live queue</h1>
          <p className="text-sm text-muted-foreground">
            Updated as staff move tokens through check-in, weighing and procurement.
          </p>
        </div>
        <div>
          <label htmlFor="q-centre" className="mb-1.5 block text-sm font-medium">
            Centre
          </label>
          <select
            id="q-centre"
            value={centreId}
            onChange={(e) => setCentreId(e.target.value)}
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

      <Card
        title={`${centre.name} · ${queue.length} in queue`}
        description={`Average service time ${centre.avgMinutesPerFarmer} minutes per farmer.`}
      >
        {queue.length === 0 ? (
          <p className="text-sm text-muted-foreground">No farmers waiting right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <caption className="sr-only">Live token queue at {centre.name}</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="py-2 pr-4">Position</th>
                  <th scope="col" className="py-2 pr-4">Token</th>
                  <th scope="col" className="py-2 pr-4">Farmer</th>
                  <th scope="col" className="py-2 pr-4">Crop</th>
                  <th scope="col" className="py-2 pr-4">Slot</th>
                  <th scope="col" className="py-2 pr-4">Status</th>
                  <th scope="col" className="py-2">Expected wait</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((b, i) => {
                  const person = state.farmers.find((f) => f.id === b.farmerId);
                  const isMe = farmer && b.farmerId === farmer.id;
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-border/70 ${isMe ? "bg-primary/5" : ""}`}
                    >
                      <td className="py-3 pr-4 font-bold tabular-nums">#{i + 1}</td>
                      <td className="py-3 pr-4 font-semibold">{b.token}</td>
                      <td className="py-3 pr-4">
                        {person?.name}
                        {isMe && (
                          <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {b.crop} · {b.quantityQuintal} qtl
                      </td>
                      <td className="py-3 pr-4">{b.slot}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3 tabular-nums">{formatWait(waitMinutes(centre, i + 1))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
