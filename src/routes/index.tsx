import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LanguageContext, languages, isLanguage, useLanguage, translate, type Language } from "@/lib/language";
import { initialTrips, drivers, days, mapsRouteUrl, mapsStopUrl, mapsBranchUrl, type Trip, type Stop, type Driver } from "@/lib/trips";

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
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("driver-language");
      if (isLanguage(saved)) setLanguage(saved);
    } catch { /* Storage can be unavailable in private browsing. */ }
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const changeLanguage = (value: string) => {
    if (!isLanguage(value)) return;
    setLanguage(value);
    try { localStorage.setItem("driver-language", value); } catch { /* Keep the in-session selection. */ }
  };
  const [view, setView] = useState<View>({ name: "login" });
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [returned, setReturned] = useState<Record<string, boolean>>({});
  const [dayId, setDayId] = useState("mon");

  const complete = (tripId: string, stopId: string) =>
    setTrips((ts) => ts.map((t) => (t.id !== tripId ? t : { ...t, stops: t.stops.map((s) => (s.id === stopId ? { ...s, completed: true } : s)) })));

  const reportStop = (tripId: string, stopId: string, remark: string) =>
    setTrips((ts) => ts.map((t) => (t.id !== tripId ? t : { ...t, stops: t.stops.map((s) => (s.id === stopId ? { ...s, remark } : s)) })));

  const clearStopRemark = (tripId: string, stopId: string) =>
    setTrips((ts) => ts.map((t) => (t.id !== tripId ? t : { ...t, stops: t.stops.map((s) => (s.id === stopId ? { ...s, remark: undefined } : s)) })));

  return (
    <LanguageContext.Provider value={language}>
    <div className="min-h-screen bg-muted flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-background flex flex-col">
        <div className="px-6 py-3 border-b border-border bg-card">
          <label className="flex items-center gap-3 text-sm font-semibold" htmlFor="app-language">
            <span aria-hidden="true">🌐</span>
            <span>{translate(language, "Language")}</span>
            <select id="app-language" value={language} onChange={(event) => changeLanguage(event.target.value)} className="ml-auto min-w-0 max-w-full h-11 rounded-lg border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring">
              {languages.map((item) => <option key={item.code} value={item.code} lang={item.code}>{item.label}</option>)}
            </select>
          </label>
        </div>
        {view.name === "login" && <Login onLogin={(d) => { setDriver(d); setView({ name: "trips" }); }} />}
        {view.name === "trips" && <TripList trips={trips.filter((t) => t.dayId === dayId)} allTrips={trips} dayId={dayId} onDay={setDayId} returned={returned} driver={driver} onOpen={(id) => setView({ name: "trip", tripId: id })} onLogout={() => { setDriver(null); setView({ name: "login" }); }} />}
        {view.name === "trip" && (() => {
          const trip = trips.find((t) => t.id === view.tripId);
          if (!trip) return null;
          return <TripDetail trip={trip} returned={!!returned[trip.id]} onBack={() => setView({ name: "trips" })} onStop={(sid) => setView({ name: "stop", tripId: trip.id, stopId: sid })} onReturn={() => setReturned((r) => ({ ...r, [trip.id]: true }))} />;
        })()}
        {view.name === "stop" && (() => {
          const trip = trips.find((t) => t.id === view.tripId);
          if (!trip) return null;
          const stop = trip.stops.find((s) => s.id === view.stopId);
          if (!stop) return null;
          return <StopDetail stop={stop} index={trip.stops.indexOf(stop) + 1} onBack={() => setView({ name: "trip", tripId: trip.id })} onComplete={() => { complete(trip.id, stop.id); setView({ name: "trip", tripId: trip.id }); }} onReport={(remark) => reportStop(trip.id, stop.id, remark)} onClearRemark={() => clearStopRemark(trip.id, stop.id)} />;
        })()}
      </div>
    </div>
    </LanguageContext.Provider>
  );
}

function Header({ title, sub, onBack, right }: { title: string; sub?: string | undefined; onBack?: () => void; right?: React.ReactNode }) {
  const { t: tr, localize, date } = useLanguage();
  return (
    <header className="bg-primary text-primary-foreground px-5 pt-6 pb-5">
      <div className="flex items-center justify-between">
        {onBack ? <button onClick={onBack} className="text-sm font-semibold opacity-90">{tr('← Back')}</button> : <span className="text-xs font-bold tracking-widest uppercase opacity-80">{tr('Driver')}</span>}
        {right}
      </div>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="text-sm opacity-80 mt-1">{sub}</p>}
    </header>
  );
}

function Login({ onLogin }: { onLogin: (d: Driver) => void }) {
  const { t: tr, localize, date } = useLanguage();
  const [id, setId] = useState("D-1042");
  const [pw, setPw] = useState("password");
  const [error, setError] = useState("");
  const matched = drivers.find((d) => d.id.toLowerCase() === id.trim().toLowerCase());
  return (
    <div className="flex-1 flex flex-col justify-center px-6 gap-6 py-10">
      <div>
        <div className="h-14 w-14 rounded-xl bg-accent text-accent-foreground grid place-items-center text-2xl font-black">🚚</div>
        <h1 className="mt-5 text-3xl font-extrabold">{tr('Driver sign in')}</h1>
        <p className="text-muted-foreground mt-1">{tr("View today's deliveries and pickups.")}</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (matched) { setError(""); onLogin(matched); } else setError("Unknown driver ID — pick a sample driver below."); }}>
        <label className="text-sm font-semibold">{tr("Driver ID")}
          <input value={id} onChange={(e) => { setId(e.target.value); setError(""); }} className="mt-1 w-full h-12 rounded-lg border border-input bg-card px-4 text-base" />
        </label>
        <label className="text-sm font-semibold">{tr("Password")}
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full h-12 rounded-lg border border-input bg-card px-4 text-base" />
        </label>
        {error && <p role="alert" className="text-sm font-semibold text-destructive">{tr(error)}</p>}
        <button className="min-h-14 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-lg mt-2">{tr('Sign in')}</button>
      </form>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{tr('Sample drivers')}</p>
        <div className="flex flex-col gap-2">
          {drivers.map((d) => (
            <button key={d.id} onClick={() => { setId(d.id); setError(""); }} className={`text-left rounded-xl border p-3 flex items-center gap-3 transition ${matched?.id === d.id ? "border-primary border-2 bg-card shadow-sm" : "border-border bg-card"}`}>
              <span className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground grid place-items-center font-black text-sm">{d.name.split(" ").map((w) => w[0]).join("")}</span>
              <span className="flex-1">
                <span className="block font-bold">{d.name}</span>
                <span className="block text-xs text-muted-foreground">{d.id} · {localize(d.truck)}</span>
              </span>
              {matched?.id === d.id && <span className="text-primary font-bold">✓</span>}
            </button>
          ))}
        </div>
      </div>
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

function TripList({ trips, allTrips, dayId, onDay, returned, driver, onOpen, onLogout }: { trips: Trip[]; allTrips: Trip[]; dayId: string; onDay: (d: string) => void; returned: Record<string, boolean>; driver: Driver | null; onOpen: (id: string) => void; onLogout: () => void }) {
  const { t: tr, localize, date } = useLanguage();
  return (
    <>
      <Header title={tr("Weekly schedule")} sub={driver ? `${driver.name} · ${driver.id} · ${localize(driver.truck)}` : undefined} right={<button onClick={onLogout} className="text-sm opacity-90">{tr('Sign out')}</button>} />
      <nav className="grid grid-cols-5 gap-1 p-3 border-b border-border bg-card">
        {days.map((d) => {
          const dt = allTrips.filter((t) => t.dayId === d.id);
          const allDone = dt.every((t) => returned[t.id]);
          return (
            <button key={d.id} onClick={() => onDay(d.id)} className={`rounded-lg py-2 flex flex-col items-center ${d.id === dayId ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <span className="text-sm font-extrabold">{date(d.id, true)}</span>
              <span className="text-[11px] opacity-80">{date(d.id, false, true)}</span>
              <span className="text-[10px] font-bold mt-0.5">{allDone ? tr("✓ Done") : `${dt.length} ${tr("trips")}`}</span>
            </button>
          );
        })}
      </nav>
      <main className="p-4 flex flex-col gap-3">
        <p className="text-sm font-bold">{date(dayId)}</p>
        {trips.map((t) => {
          const done = t.stops.filter((s) => s.completed).length;
          const issues = t.stops.filter((s) => s.remark && !s.completed).length;
          const status = returned[t.id] ? "Complete" : done === t.stops.length ? "Return to branch" : done > 0 ? "In progress" : issues > 0 ? "Issues reported" : "Not started";
          return (
            <button key={t.id} onClick={() => onOpen(t.id)} className="text-left rounded-xl border border-border bg-card p-4 shadow-sm active:scale-[0.99] transition">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">{localize(t.name)}</h2>
                  <p className="text-sm text-muted-foreground">{localize(t.date)}</p>
                </div>
                <span className={`max-w-40 text-xs font-bold px-2 py-1 rounded-full ${returned[t.id] ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"}`}>{tr(status)}</span>
              </div>
              <p className="text-sm mt-3">{t.stops.length} {tr("stops")} · ~{t.miles} {tr("mi")} · {t.stops.filter((s) => s.type === "delivery").length} {tr("deliveries")} · {t.stops.filter((s) => s.type === "pickup").length} {tr("pickups")}</p>
              <div className="mt-3"><Progress done={done} total={t.stops.length} /></div>
              <p className="text-xs text-muted-foreground mt-1">{tr("{done} of {total} stops completed", { done, total: t.stops.length })}{issues > 0 ? ` · ⚠ ${tr("{count} reported", { count: issues })}` : ""}</p>
            </button>
          );
        })}
      </main>
    </>
  );
}

function TypeBadge({ type }: { type: Stop["type"] }) {
  const { t: tr, localize, date } = useLanguage();
  return <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${type === "delivery" ? "bg-delivery text-delivery-foreground" : "bg-pickup text-pickup-foreground"}`}>{type === "delivery" ? `↓ ${tr("Delivery")}` : `↑ ${tr("Pickup")}`}</span>;
}

function TripDetail({ trip, returned, onBack, onStop, onReturn }: { trip: Trip; returned: boolean; onBack: () => void; onStop: (id: string) => void; onReturn: () => void }) {
  const { t: tr, localize, date } = useLanguage();
  const pending = trip.stops.filter((s) => !s.completed);
  const completed = trip.stops.filter((s) => s.completed);
  const reported = pending.filter((s) => s.remark);
  const allDone = pending.every((s) => s.remark);
  const nextId = pending.find((s) => !s.remark)?.id;
  const routeStops = pending.filter((s) => !s.remark);
  return (
    <>
      <Header title={localize(trip.name)} sub={localize(trip.date)} onBack={onBack} />
      <main className="p-4 flex flex-col gap-5 pb-10">
        <div>
          <Progress done={completed.length} total={trip.stops.length} />
          <p className="text-sm mt-2 font-semibold">{tr("{done} of {total} stops completed", { done: completed.length, total: trip.stops.length })}{reported.length > 0 ? ` · ⚠ ${tr("{count} reported", { count: reported.length })}` : ""}</p>
        </div>
        {routeStops.length > 0 ? (
          <a href={mapsRouteUrl(trip.stops)} target="_blank" rel="noreferrer" className="min-h-12 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-bold grid place-items-center text-center">{tr('🗺 Open optimized route in Maps')}</a>
        ) : (
          <p className="text-sm text-muted-foreground">{tr(pending.length === 0 ? 'All stops completed.' : 'All remaining stops were reported — no stops left to route.')}</p>
        )}
        <Row icon="🏢" label={tr("Start")} title={tr("Depart branch")} sub={localize(trip.branch)} done />

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{tr("Pending")} ({pending.length})</h3>
          {pending.length === 0 && <p className="text-sm text-muted-foreground">{tr('All stops completed.')}</p>}
          <div className="flex flex-col gap-2">
            {pending.map((s) => <StopCard key={s.id} stop={s} n={trip.stops.indexOf(s) + 1} next={s.id === nextId} onClick={() => onStop(s.id)} />)}
          </div>
        </section>

        {completed.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{tr("Completed")} ({completed.length})</h3>
            <div className="flex flex-col gap-2">
              {completed.map((s) => <StopCard key={s.id} stop={s} n={trip.stops.indexOf(s) + 1} onClick={() => onStop(s.id)} />)}
            </div>
          </section>
        )}

        <section className={`rounded-xl border-2 p-4 ${allDone ? "border-primary bg-card" : "border-dashed border-border opacity-60"}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏁</span>
            <div>
              <p className="font-extrabold">{tr('Return to branch')}</p>
              <p className="text-sm text-muted-foreground">{localize(trip.branch)}</p>
            </div>
          </div>
          {returned ? (
            <p className="mt-3 font-bold text-success">{tr('✓ Arrived at branch — trip complete')}</p>
          ) : allDone ? (
            <>
              <a href={mapsBranchUrl()} target="_blank" rel="noreferrer" className="mt-3 w-full min-h-12 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-bold grid place-items-center text-center">{tr('🧭 Navigate to branch')}</a>
              <button onClick={onReturn} className="mt-3 w-full h-12 rounded-lg bg-primary text-primary-foreground font-bold">{tr('Confirm arrival at branch')}</button>
            </>
          ) : (
            <p className="mt-2 text-sm">{tr('Unlocks after every stop is completed or reported with remarks.')}</p>
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
  const { t: tr, localize, date } = useLanguage();
  return (
    <button onClick={onClick} className={`text-left rounded-xl border bg-card p-4 flex gap-3 ${next ? "border-primary border-2 shadow-md" : "border-border"} ${stop.completed ? "opacity-70" : ""}`}>
      <div className={`h-9 w-9 shrink-0 rounded-full grid place-items-center font-black ${stop.completed ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}>{stop.completed ? "✓" : n}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={stop.type} />
          {next && <span className="text-xs font-bold text-primary">{tr('NEXT STOP')}</span>}
          {stop.remark && <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent text-accent-foreground">{tr('⚠ Issue reported')}</span>}
        </div>
        <p className="font-bold mt-1">{stop.customer}</p>
        <p className="text-sm text-muted-foreground truncate">{stop.address}</p>
        <p className="text-sm mt-1">{localize(stop.equipment)}{stop.qty > 1 ? ` ×${stop.qty}` : ""}</p>
        <p className="text-xs text-muted-foreground mt-1">🕒 {localize(stop.window)}</p>
        {stop.remark && <p className="text-xs mt-1 italic text-muted-foreground line-clamp-2">“{tr(stop.remark)}”</p>}
      </div>
    </button>
  );
}

const QUICK_REASONS = ["Site closed — no access", "Customer not ready", "Equipment issue", "Traffic — ran out of time", "Contact unreachable"];

function StopDetail({ stop, index, onBack, onComplete, onReport, onClearRemark }: { stop: Stop; index: number; onBack: () => void; onComplete: () => void; onReport: (remark: string) => void; onClearRemark: () => void }) {
  const { t: tr, localize, date } = useLanguage();
  const [checked, setChecked] = useState(false);
  const [editingRemark, setEditingRemark] = useState(false);
  const [draft, setDraft] = useState("");
  const verb = stop.type === "delivery" ? "delivered" : "picked up";
  return (
    <>
      <Header title={`${tr("Stop")} ${index}`} sub={localize(stop.window)} onBack={onBack} />
      <main className="p-4 flex flex-col gap-4 flex-1">
        <TypeBadge type={stop.type} />
        <Field label={tr("Customer")} value={stop.customer} />
        <Field label={tr("Address")} value={stop.address} />
        <div className="grid grid-cols-2 gap-2">
          <a href={mapsStopUrl(stop)} target="_blank" rel="noreferrer" className="h-12 rounded-lg bg-secondary text-secondary-foreground font-bold grid place-items-center">{tr('🧭 Navigate')}</a>
          <a href={`tel:${stop.contactPhone.replace(/[^0-9+]/g, "")}`} className="h-12 rounded-lg bg-secondary text-secondary-foreground font-bold grid place-items-center">{tr("📞 Call {name}", { name: stop.contactName.split(" ")[0] ?? stop.contactName })}</a>
        </div>
        <div className="rounded-xl border-2 border-accent bg-accent/15 p-4">
          <p className="text-xs uppercase font-bold tracking-wide">{tr('⚠ Site instructions')}</p>
          <p className="mt-1 font-semibold">{tr(stop.notes)}</p>
          <p className="mt-2 text-sm">{tr("Site contact:")} <b>{stop.contactName}</b> · <a className="underline font-bold" href={`tel:${stop.contactPhone.replace(/[^0-9+]/g, "")}`}>{stop.contactPhone}</a></p>
        </div>
        <Field label={tr("Equipment")} value={`${localize(stop.equipment)}${stop.qty > 1 ? ` (${tr("qty")} ${stop.qty})` : ""}`} />
        <Field label={tr("Time window")} value={localize(stop.window)} />
        <div className="mt-auto pt-4 flex flex-col gap-3">
          {stop.completed ? (
            <div className="rounded-xl bg-success text-success-foreground p-4 font-bold text-center">{tr(`✓ Equipment ${verb}`)}</div>
          ) : editingRemark ? (
            <div className="rounded-xl border-2 border-accent bg-accent/15 p-4 flex flex-col gap-3">
              <p className="text-xs uppercase font-bold tracking-wide">{tr("⚠ Couldn't complete this stop?")}</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_REASONS.map((r) => (
                  <button key={r} onClick={() => setDraft(r)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-card border border-border">{tr(r)}</button>
                ))}
              </div>
              <textarea value={tr(draft)} onChange={(e) => setDraft(e.target.value)} rows={3} aria-label={tr("Driver remark")} placeholder={tr("Describe what happened…")} className="w-full rounded-lg border border-input bg-card p-3 text-sm" />
              <div className="flex flex-wrap gap-2">
                <button disabled={!draft.trim()} onClick={() => { onReport(draft.trim()); setEditingRemark(false); }} className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40">{tr('Save remark')}</button>
                <button onClick={() => setEditingRemark(false)} className="h-11 px-4 rounded-lg bg-card border border-border font-bold text-sm">{tr('Cancel')}</button>
              </div>
            </div>
          ) : stop.remark ? (
            <div className="rounded-xl border-2 border-accent bg-accent/15 p-4">
              <p className="text-xs uppercase font-bold tracking-wide">{tr('⚠ Issue reported — not completed')}</p>
              <p className="mt-1 font-semibold">{tr(stop.remark)}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => { setDraft(stop.remark ?? ""); setEditingRemark(true); }} className="flex-1 h-11 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm">{tr('Edit remark')}</button>
                <button onClick={onClearRemark} className="flex-1 h-11 rounded-lg bg-card border border-border font-bold text-sm">{tr('Clear & retry')}</button>
              </div>
            </div>
          ) : (
            <>
              <label className="flex items-center gap-3 rounded-xl border border-border p-4">
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="h-6 w-6 accent-primary" />
                <span className="text-sm font-semibold">{tr(`I confirm the equipment was ${verb} and inspected.`)}</span>
              </label>
              <button disabled={!checked} onClick={onComplete} className="min-h-14 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40">
                {tr(`Mark ${stop.type} complete`)}
              </button>
              <button onClick={() => { setDraft(""); setEditingRemark(true); }} className="min-h-12 px-3 py-2 rounded-lg border-2 border-accent text-accent-foreground font-bold text-sm bg-accent/10">
                {tr("⚠ Couldn't complete — leave a remark")}
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
