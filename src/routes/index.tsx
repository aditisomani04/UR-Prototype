import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { initialTrips, type Trip, type Stop } from "@/lib/trips";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Driver Route — Delivery & Pickup" },
      { name: "description", content: "Driver app prototype for equipment delivery and pickup trips." },
      { property: "og:title", content: "Driver Route — Delivery & Pickup" },
      { property: "og:description", content: "Driver app prototype for equipment delivery and pickup trips." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type View = { name: "login" } | { name: "trips" } | { name: "trip"; tripId: string } | { name: "stop"; tripId: string; stopId: string };

function App() {
  const [view, setView] = useState<View>({ name: "login" });
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [returned, setReturned] = useState<Record<string, boolean>>({});

  const complete = (tripId: string, stopId: string) =>
    setTrips((ts) => ts.map((t) => (t.id !== tripId ? t : { ...t, stops: t.stops.map((s) => (s.id === stopId ? { ...s, completed: true } : s)) })));

  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-background flex flex-col">
        {view.name === "login" && <Login onLogin={() => setView({ name: "trips" })} />}
        {view.name === "trips" && <TripList trips={trips} returned={returned} onOpen={(id) => setView({ name: "trip", tripId: id })} onLogout={() => setView({ name: "login" })} />}
        {view.name === "trip" && (() => {
          const trip = trips.find((t) => t.id === view.tripId)!;
          return <TripDetail trip={trip} returned={!!returned[trip.id]} onBack={() => setView({ name: "trips" })} onStop={(sid) => setView({ name: "stop", tripId: trip.id, stopId: sid })} onReturn={() => setReturned((r) => ({ ...r, [trip.id]: true }))} />;
        })()}
        {view.name === "stop" && (() => {
          const trip = trips.find((t) => t.id === view.tripId)!;
          const stop = trip.stops.find((s) => s.id === view.stopId)!;
          return <StopDetail stop={stop} index={trip.stops.indexOf(stop) + 1} onBack={() => setView({ name: "trip", tripId: trip.id })} onComplete={() => { complete(trip.id, stop.id); setView({ name: "trip", tripId: trip.id }); }} />;
        })()}
      </div>
    </div>
  );
}

function Header({ title, sub, onBack, right }: { title: string; sub?: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <header className="bg-primary text-primary-foreground px-5 pt-6 pb-5">
      <div className="flex items-center justify-between">
        {onBack ? <button onClick={onBack} className="text-sm font-semibold opacity-90">← Back</button> : <span className="text-xs font-bold tracking-widest uppercase opacity-80">Driver</span>}
        {right}
      </div>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="text-sm opacity-80 mt-1">{sub}</p>}
    </header>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [id, setId] = useState("D-1042");
  const [pw, setPw] = useState("password");
  return (
    <div className="flex-1 flex flex-col justify-center px-6 gap-6">
      <div>
        <div className="h-14 w-14 rounded-xl bg-accent text-accent-foreground grid place-items-center text-2xl font-black">🚚</div>
        <h1 className="mt-5 text-3xl font-extrabold">Driver sign in</h1>
        <p className="text-muted-foreground mt-1">View today's deliveries and pickups.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
        <label className="text-sm font-semibold">Driver ID
          <input value={id} onChange={(e) => setId(e.target.value)} className="mt-1 w-full h-12 rounded-lg border border-input bg-card px-4 text-base" />
        </label>
        <label className="text-sm font-semibold">Password
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full h-12 rounded-lg border border-input bg-card px-4 text-base" />
        </label>
        <button className="h-14 rounded-lg bg-primary text-primary-foreground font-bold text-lg mt-2">Sign in</button>
      </form>
    </div>
  );
}

function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className="h-full bg-success transition-all" style={{ width: `${(done / total) * 100}%` }} />
    </div>
  );
}

function TripList({ trips, returned, onOpen, onLogout }: { trips: Trip[]; returned: Record<string, boolean>; onOpen: (id: string) => void; onLogout: () => void }) {
  return (
    <>
      <Header title="Today's trips" sub="Driver D-1042 · Truck 27" right={<button onClick={onLogout} className="text-sm opacity-90">Sign out</button>} />
      <main className="p-4 flex flex-col gap-3">
        {trips.map((t) => {
          const done = t.stops.filter((s) => s.completed).length;
          const status = returned[t.id] ? "Complete" : done === t.stops.length ? "Return to branch" : done > 0 ? "In progress" : "Not started";
          return (
            <button key={t.id} onClick={() => onOpen(t.id)} className="text-left rounded-xl border border-border bg-card p-4 shadow-sm active:scale-[0.99] transition">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-extrabold">{t.name}</h2>
                  <p className="text-sm text-muted-foreground">{t.date}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${returned[t.id] ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"}`}>{status}</span>
              </div>
              <p className="text-sm mt-3">{t.stops.length} stops · {t.stops.filter((s) => s.type === "delivery").length} deliveries · {t.stops.filter((s) => s.type === "pickup").length} pickups</p>
              <div className="mt-3"><Progress done={done} total={t.stops.length} /></div>
              <p className="text-xs text-muted-foreground mt-1">{done} of {t.stops.length} stops completed</p>
            </button>
          );
        })}
      </main>
    </>
  );
}

function TypeBadge({ type }: { type: Stop["type"] }) {
  return <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${type === "delivery" ? "bg-delivery text-delivery-foreground" : "bg-pickup text-pickup-foreground"}`}>{type === "delivery" ? "↓ Delivery" : "↑ Pickup"}</span>;
}

function TripDetail({ trip, returned, onBack, onStop, onReturn }: { trip: Trip; returned: boolean; onBack: () => void; onStop: (id: string) => void; onReturn: () => void }) {
  const pending = trip.stops.filter((s) => !s.completed);
  const completed = trip.stops.filter((s) => s.completed);
  const allDone = pending.length === 0;
  const nextId = pending[0]?.id;
  return (
    <>
      <Header title={trip.name} sub={trip.date} onBack={onBack} />
      <main className="p-4 flex flex-col gap-5 pb-10">
        <div>
          <Progress done={completed.length} total={trip.stops.length} />
          <p className="text-sm mt-2 font-semibold">{completed.length} of {trip.stops.length} stops completed</p>
        </div>
        <Row icon="🏢" label="Start" title="Depart branch" sub={trip.branch} done />

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Pending ({pending.length})</h3>
          {pending.length === 0 && <p className="text-sm text-muted-foreground">All stops completed.</p>}
          <div className="flex flex-col gap-2">
            {pending.map((s) => <StopCard key={s.id} stop={s} n={trip.stops.indexOf(s) + 1} next={s.id === nextId} onClick={() => onStop(s.id)} />)}
          </div>
        </section>

        {completed.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Completed ({completed.length})</h3>
            <div className="flex flex-col gap-2">
              {completed.map((s) => <StopCard key={s.id} stop={s} n={trip.stops.indexOf(s) + 1} onClick={() => onStop(s.id)} />)}
            </div>
          </section>
        )}

        <section className={`rounded-xl border-2 p-4 ${allDone ? "border-primary bg-card" : "border-dashed border-border opacity-60"}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏁</span>
            <div>
              <p className="font-extrabold">Return to branch</p>
              <p className="text-sm text-muted-foreground">{trip.branch}</p>
            </div>
          </div>
          {returned ? (
            <p className="mt-3 font-bold text-success">✓ Arrived at branch — trip complete</p>
          ) : allDone ? (
            <button onClick={onReturn} className="mt-3 w-full h-12 rounded-lg bg-primary text-primary-foreground font-bold">Confirm arrival at branch</button>
          ) : (
            <p className="mt-2 text-sm">Unlocks after all {trip.stops.length} stops are completed.</p>
          )}
        </section>
      </main>
    </>
  );
}

function Row({ icon, label, title, sub, done }: { icon: string; label: string; title: string; sub: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-xs uppercase font-bold text-muted-foreground">{label}</p>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
      {done && <span className="text-success font-bold">✓</span>}
    </div>
  );
}

function StopCard({ stop, n, next, onClick }: { stop: Stop; n: number; next?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`text-left rounded-xl border bg-card p-4 flex gap-3 ${next ? "border-primary border-2 shadow-md" : "border-border"} ${stop.completed ? "opacity-70" : ""}`}>
      <div className={`h-9 w-9 shrink-0 rounded-full grid place-items-center font-black ${stop.completed ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}>{stop.completed ? "✓" : n}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={stop.type} />
          {next && <span className="text-xs font-bold text-primary">NEXT STOP</span>}
        </div>
        <p className="font-bold mt-1">{stop.customer}</p>
        <p className="text-sm text-muted-foreground truncate">{stop.address}</p>
        <p className="text-sm mt-1">{stop.equipment}{stop.qty > 1 ? ` ×${stop.qty}` : ""}</p>
      </div>
    </button>
  );
}

function StopDetail({ stop, index, onBack, onComplete }: { stop: Stop; index: number; onBack: () => void; onComplete: () => void }) {
  const [checked, setChecked] = useState(false);
  const verb = stop.type === "delivery" ? "delivered" : "picked up";
  return (
    <>
      <Header title={`Stop ${index}`} sub={stop.window} onBack={onBack} />
      <main className="p-4 flex flex-col gap-4 flex-1">
        <TypeBadge type={stop.type} />
        <Field label="Customer" value={stop.customer} />
        <Field label="Address" value={stop.address} />
        <Field label="Equipment" value={`${stop.equipment}${stop.qty > 1 ? ` (qty ${stop.qty})` : ""}`} />
        <Field label="Time window" value={stop.window} />
        <div className="mt-auto pt-4 flex flex-col gap-3">
          {stop.completed ? (
            <div className="rounded-xl bg-success text-success-foreground p-4 font-bold text-center">✓ Equipment {verb}</div>
          ) : (
            <>
              <label className="flex items-center gap-3 rounded-xl border border-border p-4">
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="h-6 w-6 accent-primary" />
                <span className="text-sm font-semibold">I confirm the equipment was {verb} and inspected.</span>
              </label>
              <button disabled={!checked} onClick={onComplete} className="h-14 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40">
                Mark {stop.type} complete
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-3">
      <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
