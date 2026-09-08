import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/book", label: "Book slot" },
  { to: "/queue", label: "Live queue" },
  { to: "/admin", label: "Centre operations" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, state, setCurrentFarmer, reset } = useStore();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs">
          <span>Government of India · Ministry of Agriculture &amp; Farmers Welfare</span>
          <span className="opacity-80">Demo environment · sample data</span>
        </div>
      </div>

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
            >
              कृ
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">Krishi Setu</span>
              <span className="block text-xs text-muted-foreground">
                Smart Procurement Centre Management
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="order-3 w-full md:order-2 md:ml-6 md:w-auto">
            <ul className="flex flex-wrap gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{ className: "bg-primary/10 text-primary font-semibold" }}
                    className="inline-block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="order-2 ml-auto flex items-center gap-2">
            <div
              role="group"
              aria-label="Switch role"
              className="flex rounded-full border border-border bg-muted p-0.5"
            >
              {(["farmer", "staff"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    role === r
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r === "farmer" ? "Farmer" : "Centre staff"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {role === "farmer" && (
          <div className="border-t border-border bg-muted/50">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 text-sm">
              <label htmlFor="farmer-select" className="text-muted-foreground">
                Signed in as
              </label>
              <select
                id="farmer-select"
                value={state.currentFarmerId}
                onChange={(e) => setCurrentFarmer(e.target.value)}
                className="rounded-md border border-input bg-card px-2 py-1 text-sm"
              >
                {state.farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} · {f.farmerId}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
          <p>Krishi Setu · MSP procurement slot booking, queue and payment tracking.</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Reset demo data
          </button>
        </div>
      </footer>
    </div>
  );
}
