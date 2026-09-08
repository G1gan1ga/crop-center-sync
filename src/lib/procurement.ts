export type Crop = "Wheat" | "Paddy" | "Maize" | "Mustard" | "Gram";

export type TokenStatus =
  | "booked"
  | "checked-in"
  | "weighing"
  | "procured"
  | "payment-initiated"
  | "paid"
  | "cancelled";

export const STATUS_FLOW: TokenStatus[] = [
  "booked",
  "checked-in",
  "weighing",
  "procured",
  "payment-initiated",
  "paid",
];

export const STATUS_LABEL: Record<TokenStatus, string> = {
  booked: "Slot booked",
  "checked-in": "Checked in at centre",
  weighing: "Weighing & quality check",
  procured: "Procurement complete",
  "payment-initiated": "Payment initiated",
  paid: "Payment credited",
  cancelled: "Cancelled",
};

export type TimelineEntry = {
  status: TokenStatus;
  at: string;
  note: string;
};

export type Farmer = {
  id: string;
  name: string;
  phone: string;
  village: string;
  farmerId: string;
  landAcres: number;
};

export type Booking = {
  id: string;
  token: string;
  farmerId: string;
  centreId: string;
  crop: Crop;
  quantityQuintal: number;
  date: string;
  slot: string;
  status: TokenStatus;
  amount: number | null;
  timeline: TimelineEntry[];
};

export type Centre = {
  id: string;
  name: string;
  district: string;
  capacityPerSlot: number;
  avgMinutesPerFarmer: number;
};

export const SLOTS = [
  "08:00 – 10:00",
  "10:00 – 12:00",
  "12:00 – 14:00",
  "14:00 – 16:00",
];

export const CROPS: Crop[] = ["Wheat", "Paddy", "Maize", "Mustard", "Gram"];

export const MSP_PER_QUINTAL: Record<Crop, number> = {
  Wheat: 2425,
  Paddy: 2300,
  Maize: 2225,
  Mustard: 5950,
  Gram: 5650,
};

export const CENTRES: Centre[] = [
  {
    id: "c1",
    name: "Mandi Samiti – Karnal",
    district: "Karnal, Haryana",
    capacityPerSlot: 12,
    avgMinutesPerFarmer: 14,
  },
  {
    id: "c2",
    name: "Krishi Upaj Kendra – Bhopal",
    district: "Bhopal, Madhya Pradesh",
    capacityPerSlot: 10,
    avgMinutesPerFarmer: 18,
  },
  {
    id: "c3",
    name: "Procurement Centre – Guntur",
    district: "Guntur, Andhra Pradesh",
    capacityPerSlot: 8,
    avgMinutesPerFarmer: 20,
  },
];

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  const d = new Date(value + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const FARMERS: Farmer[] = [
  { id: "f1", name: "Ishan Singh", phone: "98110 44521", village: "Nilokheri", farmerId: "HR-KRL-10241", landAcres: 6.5 },
  { id: "f2", name: "Sunita Devi", phone: "94162 88310", village: "Gharaunda", farmerId: "HR-KRL-10388", landAcres: 3.2 },
  { id: "f3", name: "Ramesh Yadav", phone: "90031 77452", village: "Indri", farmerId: "HR-KRL-10455", landAcres: 8 },
  { id: "f4", name: "Kavita Patel", phone: "99260 55127", village: "Berasia", farmerId: "MP-BPL-20713", landAcres: 4.4 },
  { id: "f5", name: "Arun Kumar", phone: "97015 33290", village: "Assandh", farmerId: "HR-KRL-10502", landAcres: 2.8 },
  { id: "f6", name: "Lakshmi Reddy", phone: "89852 41190", village: "Tenali", farmerId: "AP-GNT-30188", landAcres: 5.1 },
];

function entry(status: TokenStatus, minutesAgo: number, note: string): TimelineEntry {
  return { status, at: new Date(Date.now() - minutesAgo * 60000).toISOString(), note };
}

function seedBookings(): Booking[] {
  const d = today();
  return [
    {
      id: "b1",
      token: "KRL-1042",
      farmerId: "f2",
      centreId: "c1",
      crop: "Wheat",
      quantityQuintal: 24,
      date: d,
      slot: SLOTS[0]!,
      status: "weighing",
      amount: null,
      timeline: [
        entry("booked", 1500, "Slot confirmed for 08:00 – 10:00"),
        entry("checked-in", 95, "Gate pass issued at Counter 2"),
        entry("weighing", 30, "Sample sent for moisture check"),
      ],
    },
    {
      id: "b2",
      token: "KRL-1043",
      farmerId: "f3",
      centreId: "c1",
      crop: "Wheat",
      quantityQuintal: 40,
      date: d,
      slot: SLOTS[0]!,
      status: "checked-in",
      amount: null,
      timeline: [
        entry("booked", 1400, "Slot confirmed for 08:00 – 10:00"),
        entry("checked-in", 60, "Waiting at weighbridge queue"),
      ],
    },
    {
      id: "b3",
      token: "KRL-1044",
      farmerId: "f1",
      centreId: "c1",
      crop: "Wheat",
      quantityQuintal: 18,
      date: d,
      slot: SLOTS[1]!,
      status: "booked",
      amount: null,
      timeline: [entry("booked", 900, "Slot confirmed for 10:00 – 12:00")],
    },
    {
      id: "b4",
      token: "KRL-1045",
      farmerId: "f5",
      centreId: "c1",
      crop: "Mustard",
      quantityQuintal: 12,
      date: d,
      slot: SLOTS[1]!,
      status: "booked",
      amount: null,
      timeline: [entry("booked", 700, "Slot confirmed for 10:00 – 12:00")],
    },
    {
      id: "b5",
      token: "KRL-1039",
      farmerId: "f1",
      centreId: "c1",
      crop: "Paddy",
      quantityQuintal: 30,
      date: d,
      slot: SLOTS[0]!,
      status: "paid",
      amount: 30 * MSP_PER_QUINTAL.Paddy,
      timeline: [
        entry("booked", 4000, "Slot confirmed"),
        entry("checked-in", 3000, "Gate pass issued"),
        entry("weighing", 2800, "Moisture 13.2% – within limit"),
        entry("procured", 2600, "30 quintal accepted at MSP"),
        entry("payment-initiated", 2400, "Payment advice sent to treasury"),
        entry("paid", 1200, "Credited to A/C ****4471"),
      ],
    },
    {
      id: "b6",
      token: "BPL-2210",
      farmerId: "f4",
      centreId: "c2",
      crop: "Gram",
      quantityQuintal: 15,
      date: d,
      slot: SLOTS[2]!,
      status: "procured",
      amount: 15 * MSP_PER_QUINTAL.Gram,
      timeline: [
        entry("booked", 2000, "Slot confirmed"),
        entry("checked-in", 400, "Gate pass issued"),
        entry("weighing", 300, "Quality check passed"),
        entry("procured", 200, "15 quintal accepted at MSP"),
      ],
    },
    {
      id: "b7",
      token: "GNT-3105",
      farmerId: "f6",
      centreId: "c3",
      crop: "Paddy",
      quantityQuintal: 22,
      date: d,
      slot: SLOTS[1]!,
      status: "payment-initiated",
      amount: 22 * MSP_PER_QUINTAL.Paddy,
      timeline: [
        entry("booked", 2600, "Slot confirmed"),
        entry("checked-in", 500, "Gate pass issued"),
        entry("weighing", 420, "Quality check passed"),
        entry("procured", 380, "22 quintal accepted at MSP"),
        entry("payment-initiated", 120, "Payment advice sent to treasury"),
      ],
    },
  ];
}

export type AppState = {
  farmers: Farmer[];
  bookings: Booking[];
  currentFarmerId: string;
};

export function seedState(): AppState {
  return { farmers: FARMERS, bookings: seedBookings(), currentFarmerId: "f1" };
}

const ACTIVE: TokenStatus[] = ["checked-in", "weighing"];

/** Position in the live queue at a centre (1-based), or null if not queued. */
export function queuePosition(bookings: Booking[], booking: Booking): number | null {
  if (booking.status !== "booked" && !ACTIVE.includes(booking.status)) return null;
  const queue = centreQueue(bookings, booking.centreId, booking.date);
  const idx = queue.findIndex((b) => b.id === booking.id);
  return idx === -1 ? null : idx + 1;
}

export function centreQueue(bookings: Booking[], centreId: string, date: string): Booking[] {
  const rank: Record<string, number> = { weighing: 0, "checked-in": 1, booked: 2 };
  return bookings
    .filter(
      (b) =>
        b.centreId === centreId &&
        b.date === date &&
        (b.status === "booked" || ACTIVE.includes(b.status)),
    )
    .sort((a, b) => {
      const r = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
      if (r !== 0) return r;
      const s = SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot);
      if (s !== 0) return s;
      return a.token.localeCompare(b.token);
    });
}

export function waitMinutes(centre: Centre, position: number): number {
  return Math.max(5, Math.round((position - 1) * centre.avgMinutesPerFarmer));
}

export function formatWait(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function slotLoad(bookings: Booking[], centreId: string, date: string, slot: string): number {
  return bookings.filter(
    (b) => b.centreId === centreId && b.date === date && b.slot === slot && b.status !== "cancelled",
  ).length;
}

export function nextToken(bookings: Booking[], centreId: string): string {
  const prefix = centreId === "c1" ? "KRL" : centreId === "c2" ? "BPL" : "GNT";
  const nums = bookings
    .filter((b) => b.token.startsWith(prefix))
    .map((b) => Number(b.token.split("-")[1] ?? 0));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `${prefix}-${max + 1}`;
}

export function centreById(id: string): Centre {
  return CENTRES.find((c) => c.id === id) ?? CENTRES[0]!;
}
