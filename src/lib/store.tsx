import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  seedState,
  STATUS_LABEL,
  type AppState,
  type Booking,
  type TokenStatus,
} from "./procurement";

const KEY = "agri-procure-state-v1";

export type Role = "farmer" | "staff";

type Ctx = {
  state: AppState;
  role: Role;
  setRole: (r: Role) => void;
  setCurrentFarmer: (id: string) => void;
  addBooking: (b: Booking) => void;
  updateStatus: (id: string, status: TokenStatus, note?: string) => void;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState());
  const [role, setRole] = useState<Role>("farmer");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as AppState);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state]);

  const addBooking = useCallback((b: Booking) => {
    setState((s) => ({ ...s, bookings: [b, ...s.bookings] }));
  }, []);

  const setCurrentFarmer = useCallback((id: string) => {
    setState((s) => ({ ...s, currentFarmerId: id }));
  }, []);

  const updateStatus = useCallback((id: string, status: TokenStatus, note?: string) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              status,
              timeline: [
                ...b.timeline,
                {
                  status,
                  at: new Date().toISOString(),
                  note: note ?? STATUS_LABEL[status],
                },
              ],
            }
          : b,
      ),
    }));
  }, []);

  const reset = useCallback(() => setState(seedState()), []);

  const value = useMemo(
    () => ({ state, role, setRole, setCurrentFarmer, addBooking, updateStatus, reset }),
    [state, role, setCurrentFarmer, addBooking, updateStatus, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
