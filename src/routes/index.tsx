import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { cachedProgress, clearLocal, fetchProgress, flush, pendingCount, saveLocal } from "@/lib/offline-sync";
import { useContext, useEffect, useRef, useState } from "react";
import { equipmentInfo, assetTag } from "@/lib/equipment";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";
import { LanguageContext, languages, isLanguage, useLanguage, translate, type Language } from "@/lib/language";
import { days, drivers, mapsRouteUrl, mapsStopUrl, mapsBranchUrl, type Trip, type Stop, type Driver } from "@/lib/trips";
import { initialTrips } from "@/lib/schedule-data";
import { Celebration } from "@/components/celebration";
import { Onboarding, hasSeenOnboarding } from "@/components/onboarding";
import { Button } from "@/components/ui/button";
import { DriverClockProvider, TimeWindowWarning, useDriverClock } from "@/components/time-window-warning";
import { nextTripId, canEditDay, isDayComplete } from "@/lib/trip-guidance";
import { ArrowRight, SquareCheck, LockKeyhole } from "lucide-react";
import { celebrationSummary, type CelebrationSummary } from "@/lib/celebration-summary";
import { SignaturePad } from "@/components/signature-pad";

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
  component: DriverApp,
});

function DriverApp() {
  return <DriverClockProvider><App /></DriverClockProvider>;
}

function DayAccessNotice({ dayId }: { dayId: string }) {
  const now = useDriverClock();
  const { t, date } = useLanguage();
  if (canEditDay(dayId, now)) return null;
  return <p role="status" className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm font-semibold text-muted-foreground"><LockKeyhole className="size-4 shrink-0 mt-0.5" aria-hidden="true" />{t("View only — updates unlock on {date} (branch time).", { date: date(dayId) })}</p>;
}

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
  const [base] = useState<Trip[]>(initialTrips);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [returned, setReturned] = useState<Record<string, boolean>>({});
  const [dayId, setDayId] = useState("mon");
  const [celebrate, setCelebrate] = useState<CelebrationSummary | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const finishOnboarding = () => {
    if (driver) { try { localStorage.setItem(`driver-onboarded-${driver.id}`, "1"); } catch { /* Storage can be unavailable. */ } }
    setShowOnboarding(false);
  };
  const baseRef = useRef(base);
  baseRef.current = base;
  const tripsRef = useRef(trips);
  tripsRef.current = trips;

  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  const applyProgress = (saved: Record<string, Partial<Stop> & { returned?: boolean }>) => {
    setTrips(baseRef.current.map((t) => ({ ...t, stops: t.stops.map((s) => ({ ...s, ...(saved[s.id] ?? {}) })) })));
    const r: Record<string, boolean> = {};
    for (const t of baseRef.current) if (saved[`return:${t.id}`]?.returned) r[t.id] = true;
    setReturned(r);
  };

  const sync = async (driverId: string) => { setPending(await flush(driverId)); };

  // Track connection; push queued changes as soon as we're back online.
  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => { setOnline(true); if (driver) void sync(driver.id); };
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    const timer = window.setInterval(() => { if (driver && navigator.onLine) void sync(driver.id); }, 30000);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); window.clearInterval(timer); };
  }, [driver]);

  // Restore this driver's progress: device copy first (works offline), then the database.
  useEffect(() => {
    if (!driver || !base.length) { setTrips(base); setReturned({}); return; }
    let cancelled = false;
    applyProgress(cachedProgress(driver.id) as never);
    setPending(pendingCount(driver.id));
    void (async () => {
      await sync(driver.id);
      const data = await fetchProgress(driver.id);
      if (!cancelled && data) applyProgress(data as never);
    })();
    return () => { cancelled = true; };
  }, [driver, base]);

  const save = (stopId: string, data: Record<string, unknown>) => {
    if (!driver) return;
    if (!saveLocal(driver.id, stopId, data)) window.alert(translate(language, "Phone storage is full — photos could not be saved, but stop progress was."));
    setPending(pendingCount(driver.id));
    void sync(driver.id);
  };

  const updateStop = (tripId: string, stopId: string, patch: Partial<Stop>) => {
    const trip = tripsRef.current.find((t) => t.id === tripId);
    if (!trip || !canEditDay(trip.dayId, new Date())) return;
    const current = tripsRef.current.find((t) => t.id === tripId)?.stops.find((s) => s.id === stopId);
    if (current) {
      const next = { ...current, ...patch };
      save(stopId, { completed: next.completed, remark: next.remark ?? null, scannedTag: next.scannedTag ?? null, photos: next.photos ?? [], condition: next.condition ?? null, conditionNote: next.conditionNote ?? null, fuelLevel: next.fuelLevel ?? null, hourMeter: next.hourMeter ?? null, signature: next.signature ?? null, signerName: next.signerName ?? null });
    }
    setTrips((ts) => ts.map((t) => (t.id !== tripId ? t : { ...t, stops: t.stops.map((s) => (s.id === stopId ? { ...s, ...patch } : s)) })));
  };
  const complete = (tripId: string, stopId: string) => updateStop(tripId, stopId, { completed: true });
  const uncomplete = (tripId: string, stopId: string) => updateStop(tripId, stopId, { completed: false });
  const reportStop = (tripId: string, stopId: string, remark: string) => updateStop(tripId, stopId, { remark });
  const clearStopRemark = (tripId: string, stopId: string) => updateStop(tripId, stopId, { remark: undefined });
  const markReturned = (tripId: string) => {
    const trip = tripsRef.current.find((t) => t.id === tripId);
    if (!trip || !canEditDay(trip.dayId, new Date()) || !trip.stops.every((s) => s.completed || s.remark)) return false;
    setReturned((r) => ({ ...r, [tripId]: true })); save(`return:${tripId}`, { returned: true });
    return true;
  };

  const resetProgress = async () => {
    if (!driver) return;
    if (!navigator.onLine) { window.alert(translate(language, "Reset needs a connection.")); return; }
    const { error } = await supabase.from("stop_progress").delete().eq("driver_id", driver.id);
    if (error) { console.error("Could not reset progress", error.message); return; }
    clearLocal(driver.id);
    setPending(0);
    setTrips(base);
    setReturned({});
    setView({ name: "trips" });
  };

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
        {driver && (!online || pending > 0) && (
          <div role="status" className={`px-6 py-2 text-sm font-semibold border-b border-border ${online ? "bg-secondary text-secondary-foreground" : "bg-destructive text-destructive-foreground"}`}>
            {!online
              ? translate(language, "Offline — changes are saved on this phone and will sync when you're back online.") + (pending ? ` (${translate(language, "{count} waiting", { count: pending })})` : "")
              : translate(language, "Syncing {count} change(s)…", { count: pending })}
          </div>
        )}
        {view.name === "login" && <Login onLogin={(d) => { setDriver(d); setShowOnboarding(!hasSeenOnboarding(d.id)); setView({ name: "trips" }); }} />}
        {driver && showOnboarding && <Onboarding driverName={driver.name} onDone={finishOnboarding} />}
        {driver && view.name !== "login" && !trips.length && <p className="p-6 text-muted-foreground">{translate(language, "Loading your schedule…")}</p>}
        {view.name === "trips" && <TripList trips={trips.filter((t) => t.dayId === dayId)} allTrips={trips} dayId={dayId} onDay={setDayId} returned={returned} driver={driver} onOpen={(id) => setView({ name: "trip", tripId: id })} onLogout={() => { setDriver(null); setView({ name: "login" }); }} onReset={resetProgress} onHelp={() => setShowOnboarding(true)} />}
        {view.name === "trip" && (() => {
          const trip = trips.find((t) => t.id === view.tripId);
          if (!trip) return null;
          return <TripDetail trip={trip} returned={!!returned[trip.id]} onBack={() => setView({ name: "trips" })} onStop={(sid) => setView({ name: "stop", tripId: trip.id, stopId: sid })} onReturn={() => { if (markReturned(trip.id)) setCelebrate(celebrationSummary(trips, trip.id, { ...returned, [trip.id]: true })); }} />;
        })()}
        {view.name === "stop" && (() => {
          const trip = trips.find((t) => t.id === view.tripId);
          if (!trip) return null;
          const stop = trip.stops.find((s) => s.id === view.stopId);
          if (!stop) return null;
          const nextStop = trip.stops.find((s) => s.id !== stop.id && !s.completed && !s.remark);
          return <StopDetail key={stop.id} stop={stop} dayId={trip.dayId} index={trip.stops.indexOf(stop) + 1} next={nextStop ? { index: trip.stops.indexOf(nextStop) + 1, name: nextStop.customer } : null} onNext={() => { setView(nextStop ? { name: "stop", tripId: trip.id, stopId: nextStop.id } : { name: "trip", tripId: trip.id }); window.scrollTo({ top: 0 }); }} onBack={() => setView({ name: "trip", tripId: trip.id })} onComplete={() => complete(trip.id, stop.id)} onReport={(remark) => reportStop(trip.id, stop.id, remark)} onClearRemark={() => clearStopRemark(trip.id, stop.id)} onUndo={() => uncomplete(trip.id, stop.id)} onUpdate={(patch) => updateStop(trip.id, stop.id, patch)} />;
        })()}
        {celebrate && <Celebration summary={celebrate} onDismiss={() => setCelebrate(null)} />}
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
  const { t: tr } = useLanguage();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("password");
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const d = drivers.find((x) => x.id.toLowerCase() === id.trim().toLowerCase());
    if (!d) { setError("Unknown driver ID — pick a sample driver below."); return; }
    if (d.password !== pw) { setError("Incorrect password."); return; }
    onLogin({ id: d.id, name: d.name, email: d.email, truck: d.truck });
  };
  const input = "mt-1 w-full h-12 rounded-lg border border-input bg-card px-4 text-base";
  return (
    <div className="flex-1 flex flex-col justify-center px-6 gap-6 py-10">
      <div>
        <div className="h-14 w-14 rounded-xl bg-accent text-accent-foreground grid place-items-center text-2xl font-black">🚚</div>
        <h1 className="mt-5 text-3xl font-extrabold">{tr("Driver sign in")}</h1>
        <p className="text-muted-foreground mt-1">{tr("View deliveries and pickups.")}</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <label className="text-sm font-semibold">{tr("Driver ID")}<input required value={id} onChange={(e) => setId(e.target.value)} className={input} placeholder="D-1042" autoComplete="username" /></label>
        <label className="text-sm font-semibold">{tr("Password")}<input required type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} autoComplete="current-password" /></label>
        {error && <p role="alert" className="text-sm font-semibold text-destructive">{tr(error)}</p>}
        <button className="min-h-14 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-lg mt-2">{tr("Sign in")}</button>
      </form>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{tr("Sample drivers")}</p>
        <div className="mt-2 flex flex-col gap-1">
          {drivers.map((d) => (
            <button key={d.id} type="button" onClick={() => { setId(d.id); setPw(d.password); setError(""); }} className="flex justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <span className="font-semibold">{d.name}</span><span className="font-mono text-muted-foreground">{d.id} · 🚛 {d.truck}</span>
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{tr('Password for all samples: "password"')}</p>
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

function TripList({ trips, allTrips, dayId, onDay, returned, driver, onOpen, onLogout, onReset, onHelp }: { trips: Trip[]; allTrips: Trip[]; dayId: string; onDay: (d: string) => void; returned: Record<string, boolean>; driver: Driver | null; onOpen: (id: string) => void; onLogout: () => void; onReset: () => void; onHelp: () => void }) {
  const { t: tr, localize, date } = useLanguage();
  const recommendedId = nextTripId(trips, returned);
  return (
    <>
      <Header title={tr("Weekly schedule")} sub={driver ? `${driver.name} · 🚛 ${driver.truck ?? driver.id}` : undefined} right={<div className="flex items-center gap-3"><button onClick={onHelp} className="text-sm opacity-90 underline">{tr("Help")}</button><button onClick={onReset} className="text-sm opacity-90 underline">{tr("Reset progress")}</button><button onClick={onLogout} className="text-sm opacity-90">{tr('Sign out')}</button></div>} />
      <nav className="grid grid-cols-5 gap-1 p-3 border-b border-border bg-card">
        {days.map((d) => {
          const dt = allTrips.filter((t) => t.dayId === d.id);
          const allDone = isDayComplete(dt, returned);
          return (
            <Button variant="ghost" aria-pressed={d.id === dayId} key={d.id} onClick={() => onDay(d.id)} className={`h-auto rounded-lg py-2 flex flex-col items-center gap-0 ${allDone ? "bg-success text-success-foreground hover:bg-success hover:text-success-foreground" : d.id === dayId ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "bg-muted"} ${d.id === dayId ? "ring-2 ring-ring ring-offset-2" : ""}`}>
              <span className="text-sm font-extrabold">{date(d.id, true)}</span>
              <span className="text-[11px] opacity-80">{date(d.id, false, true)}</span>
              <span className="text-[10px] font-bold mt-0.5 flex items-center gap-1">{allDone && <SquareCheck className="size-3" aria-hidden="true" />}{allDone ? tr("✓ Done") : `${dt.length} ${tr("trips")}`}</span>
            </Button>
          );
        })}
      </nav>
      <main className="p-4 flex flex-col gap-3">
        <p className="text-sm font-bold">{date(dayId)}</p>
        <DayAccessNotice dayId={dayId} />
        {trips.map((t) => {
          const done = t.stops.filter((s) => s.completed).length;
          const issues = t.stops.filter((s) => s.remark && !s.completed).length;
          const status = returned[t.id] ? "Complete" : done === t.stops.length ? "Return to branch" : done > 0 ? "In progress" : issues > 0 ? "Issues reported" : "Not started";
          return (
            <Button variant="outline" key={t.id} onClick={() => onOpen(t.id)} className={`block h-auto whitespace-normal text-left rounded-xl bg-card hover:bg-card hover:text-card-foreground p-4 shadow-sm active:scale-[0.99] transition ${t.id === recommendedId ? "border-2 border-primary" : "border border-border"}`}>
              {t.id === recommendedId && <span className="mb-3 flex w-fit items-center gap-2 rounded-md bg-primary px-3 py-1 text-sm font-bold text-primary-foreground"><ArrowRight className="size-4" aria-hidden="true" />{tr("Next up")}</span>}
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
            </Button>
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
  const editable = canEditDay(trip.dayId, useDriverClock());
  const pending = trip.stops.filter((s) => !s.completed);
  const completed = trip.stops.filter((s) => s.completed);
  const reported = pending.filter((s) => s.remark);
  const allDone = pending.every((s) => s.remark);
  const nextId = pending.find((s) => !s.remark)?.id;
  const routeStops = pending.filter((s) => !s.remark);
  useWebMCP({
    name: "list_trip_stops",
    description: "List the stops of the trip currently shown, with status (done, reported, pending).",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => runWebMCPTool("list_trip_stops", () =>
      trip.stops.map((s) => `${s.id}: [${s.type}] ${s.customer}, ${s.address} — ${s.completed ? "done" : s.remark ? `reported: ${s.remark}` : "pending"}`).join("\n")),
  });
  useWebMCP({
    name: "open_stop",
    description: "Open a stop's detail screen in the currently shown trip.",
    inputSchema: { type: "object", properties: { stopId: { type: "string", description: "Stop ID from list_trip_stops." } }, required: ["stopId"] },
    execute: ({ stopId }: { stopId: string }) => runWebMCPTool("open_stop", () => {
      const s = trip.stops.find((x) => x.id === stopId);
      if (!s) throw new Error("No such stop in this trip.");
      onStop(s.id);
      return `Opened ${s.customer}.`;
    }),
  });
  return (
    <>
      <Header title={localize(trip.name)} sub={localize(trip.date)} onBack={onBack} />
      <main className="p-4 flex flex-col gap-5 pb-10">
        <DayAccessNotice dayId={trip.dayId} />
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
            {pending.map((s) => <StopCard key={s.id} stop={s} dayId={trip.dayId} n={trip.stops.indexOf(s) + 1} next={s.id === nextId} onClick={() => onStop(s.id)} />)}
          </div>
        </section>

        {completed.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{tr("Completed")} ({completed.length})</h3>
            <div className="flex flex-col gap-2">
              {completed.map((s) => <StopCard key={s.id} stop={s} dayId={trip.dayId} n={trip.stops.indexOf(s) + 1} onClick={() => onStop(s.id)} />)}
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
              <Button disabled={!editable} onClick={onReturn} className="mt-3 w-full h-12 rounded-lg font-bold">{tr('Confirm arrival at branch')}</Button>
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

function StopCard({ stop, dayId, n, next, onClick }: { stop: Stop; dayId: string; n: number; next?: boolean; onClick: () => void }) {
  const { t: tr, localize, date } = useLanguage();
  return (
    <button onClick={onClick} className={`text-left rounded-xl border bg-card p-4 flex gap-3 ${next ? "border-primary border-2 shadow-md" : "border-border"} ${stop.completed ? "opacity-70" : ""}`}>
      <div className={`h-9 w-9 shrink-0 rounded-full grid place-items-center font-black ${stop.completed ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}>{stop.completed ? "✓" : n}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={stop.type} />
          {next && <span className="text-xs font-bold text-primary">{tr('NEXT STOP')}</span>}
          {stop.remark && <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent text-accent-foreground">{tr('⚠ Issue reported')}</span>}
          {stop.condition && stop.condition !== "Good" && <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent text-accent-foreground">{tr("⚠ {status}", { status: tr(stop.condition) })}</span>}
        </div>
        <p className="font-bold mt-1">{stop.customer}</p>
        <p className="text-sm text-muted-foreground truncate">{stop.address}</p>
        <p className="text-sm mt-1">{localize(stop.equipment)}{stop.qty > 1 ? ` ×${stop.qty}` : ""}</p>
        <p className="text-xs text-muted-foreground mt-1">🕒 {localize(stop.window)}</p>
        <TimeWindowWarning stop={stop} dayId={dayId} />
        {stop.remark && <p className="text-xs mt-1 italic text-muted-foreground line-clamp-2">“{tr(stop.remark)}”</p>}
      </div>
    </button>
  );
}

const QUICK_REASONS = ["Site closed — no access", "Customer not ready", "Equipment issue", "Traffic — ran out of time", "Contact unreachable"];
const CONDITIONS = ["Good", "Needs attention", "Damaged"];

const FUEL_LEVELS = ["Empty", "1/4", "1/2", "3/4", "Full"];

function EquipmentPanel({ stop, onUpdate }: { stop: Stop; onUpdate: (patch: Partial<Stop>) => void }) {
  const { t: tr } = useLanguage();
  const info = equipmentInfo(stop.equipment);
  const tag = assetTag(stop.equipment);
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [scanError, setScanError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const photos = stop.photos ?? [];

  const check = (raw: string) => {
    const code = raw.trim().toUpperCase().replace(/^#/, "");
    if (!code) return;
    if (code === tag) { onUpdate({ scannedTag: code }); setScanning(false); setScanError(""); setManual(""); }
    else setScanError(tr("Tag {code} doesn't match this stop's equipment.", { code }));
  };

  useEffect(() => {
    if (!scanning) return;
    let stream: MediaStream | undefined;
    let raf = 0;
    let stopped = false;
    const Detector = (window as unknown as { BarcodeDetector?: new () => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) { setScanError(tr("Camera scanning isn't supported on this device — type the tag number instead.")); return; }
    const detector = new Detector();
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then((s) => {
      stream = s;
      const v = videoRef.current;
      if (!v || stopped) return;
      v.srcObject = s;
      void v.play();
      const loop = async () => {
        if (stopped) return;
        try { const r = await detector.detect(v); if (r[0]) { check(r[0].rawValue); return; } } catch { /* frame not ready */ }
        raf = requestAnimationFrame(() => void loop());
      };
      void loop();
    }).catch(() => setScanError(tr("Camera access was blocked — type the tag number instead.")));
    return () => { stopped = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((tk) => tk.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    const existing = stop.photos ?? [];
    void Promise.all(list.map(shrinkPhoto)).then((shots) => {
      const added = shots.filter((s): s is string => !!s);
      if (added.length) onUpdate({ photos: [...existing, ...added] });
    });
  };

  return (
    <section className="rounded-xl border border-border overflow-hidden">
      <img src={info.photo} alt={tr(info.category)} loading="lazy" width={912} height={736} className="w-full h-44 object-contain bg-muted" />
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">{tr(info.category)}</p>
          <p className="text-sm">{tr("Asset tag")}: <b className="font-mono">{tag}</b></p>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          {info.specs.map((s) => (<div key={s.label}><dt className="text-xs text-muted-foreground">{tr(s.label)}</dt><dd className="font-semibold">{s.value}</dd></div>))}
        </dl>
        <div>
          <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">{tr(stop.type === "delivery" ? "Before drop-off" : "Before loading")}</p>
          <ul className="mt-1 text-sm list-disc pl-5">{info.checks.map((c) => <li key={c}>{tr(c)}</li>)}</ul>
        </div>
        <a href={info.catalogUrl} target="_blank" rel="noreferrer" className="h-11 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm grid place-items-center">{tr("📖 Specs & manuals on United Rentals")}</a>

        <div className="border-t border-border pt-3 flex flex-col gap-2">
          <p className="text-xs uppercase font-bold tracking-wide">{tr("Verify equipment (optional)")}</p>
          {stop.scannedTag ? (
            <div className="rounded-lg bg-success text-success-foreground p-3 font-bold text-sm flex items-center justify-between gap-2">
              <span>{tr("✓ Tag {code} verified", { code: stop.scannedTag })}</span>
              <button onClick={() => onUpdate({ scannedTag: undefined })} className="underline text-xs">{tr("Rescan")}</button>
            </div>
          ) : (
            <>
              {scanning ? (
                <div className="flex flex-col gap-2">
                  <video ref={videoRef} muted playsInline className="w-full h-48 rounded-lg bg-foreground object-cover" />
                  <button onClick={() => setScanning(false)} className="h-10 rounded-lg border border-border font-bold text-sm">{tr("Cancel")}</button>
                </div>
              ) : (
                <button onClick={() => { setScanError(""); setScanning(true); }} className="h-12 rounded-lg bg-primary text-primary-foreground font-bold">{tr("▦ Scan barcode")}</button>
              )}
              <form onSubmit={(e) => { e.preventDefault(); check(manual); }} className="flex gap-2">
                <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder={tag} aria-label={tr("Type tag number")} className="flex-1 h-11 rounded-lg border border-input bg-card px-3 font-mono uppercase" />
                <button disabled={!manual.trim()} className="h-11 px-4 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm disabled:opacity-40">{tr("Check")}</button>
              </form>
              {scanError && <p role="alert" className="text-sm font-semibold text-destructive">{scanError}</p>}
            </>
          )}
        </div>

        <div className="border-t border-border pt-3 flex flex-col gap-2">
          <p className="text-xs uppercase font-bold tracking-wide">{tr("Equipment photos ({count}) (optional)", { count: photos.length })}</p>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} alt={tr("Equipment photo {count}", { count: i + 1 })} className="w-full aspect-square object-cover rounded-lg" />
                  <button onClick={() => onUpdate({ photos: photos.filter((_, j) => j !== i) })} aria-label={tr("Remove photo")} className="absolute top-1 right-1 h-7 w-7 rounded-full bg-card text-foreground font-bold text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
          <label className="h-12 rounded-lg border-2 border-dashed border-border font-bold text-sm grid place-items-center cursor-pointer">
            {tr("📷 Add photo of condition")}
            <input type="file" accept="image/*" capture="environment" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
          </label>
        </div>

        {stop.type === "pickup" && (
          <div className="border-t border-border pt-3 flex flex-col gap-2">
            <p className="text-xs uppercase font-bold tracking-wide">{tr("Fuel & hour readings (optional)")}</p>
            <p className="text-sm font-semibold">{tr("Fuel level")}</p>
            <div className="flex flex-wrap gap-2">
              {FUEL_LEVELS.map((f) => (
                <button
                  key={f}
                  onClick={() => onUpdate({ fuelLevel: stop.fuelLevel === f ? undefined : f })}
                  aria-pressed={stop.fuelLevel === f}
                  className={`text-sm font-bold px-3 py-2 rounded-full border min-w-12 ${stop.fuelLevel === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}
                >
                  {tr(f)}
                </button>
              ))}
            </div>
            <label className="text-sm font-semibold flex flex-col gap-1">
              {tr("Hour meter")}
              <input
                type="text"
                inputMode="decimal"
                value={stop.hourMeter ?? ""}
                onChange={(e) => onUpdate({ hourMeter: e.target.value.replace(/[^0-9.]/g, "") || undefined })}
                placeholder={tr("e.g. 1234.5")}
                className="w-full rounded-lg border border-input bg-card p-3 text-base font-normal"
              />
            </label>
          </div>
        )}

        <div className="border-t border-border pt-3 flex flex-col gap-2">
          <p className="text-xs uppercase font-bold tracking-wide">{tr("Equipment condition (optional)")}</p>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                onClick={() => onUpdate(stop.condition === c ? { condition: undefined, conditionNote: undefined } : { condition: c })}
                aria-pressed={stop.condition === c}
                className={`text-sm font-bold px-3 py-2 rounded-full border ${stop.condition === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}
              >
                {tr(c)}
              </button>
            ))}
          </div>
          {stop.condition ? (
            <>
              <textarea
                value={stop.conditionNote ?? ""}
                onChange={(e) => onUpdate({ conditionNote: e.target.value || undefined })}
                rows={2}
                aria-label={tr("Condition notes")}
                placeholder={tr("Add a note (optional)…")}
                className="w-full rounded-lg border border-input bg-card p-3 text-sm"
              />
              <p className="text-xs text-muted-foreground">{tr("Saved: {status}", { status: tr(stop.condition) })}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">{tr("Optional — skip if there's nothing to report.")}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function StopDetail({ stop, dayId, index, next, onNext, onBack, onComplete, onReport, onClearRemark, onUndo, onUpdate }: { stop: Stop; dayId: string; index: number; next: { index: number; name: string } | null; onNext: () => void; onBack: () => void; onComplete: () => void; onReport: (remark: string) => void; onClearRemark: () => void; onUndo: () => void; onUpdate: (patch: Partial<Stop>) => void }) {
  const { t: tr, localize, date } = useLanguage();
  const editable = canEditDay(dayId, useDriverClock());
  const language = useContext(LanguageContext);
  const [checked, setChecked] = useState(false);
  const [editingRemark, setEditingRemark] = useState(false);
  const [draft, setDraft] = useState("");
  const verb = stop.type === "delivery" ? "delivered" : "picked up";
  return (
    <>
      <Header title={`${tr("Stop")} ${index}`} sub={localize(stop.window)} onBack={onBack} />
      <main className="p-4 flex flex-col gap-4 flex-1">
        <DayAccessNotice dayId={dayId} />
        <TypeBadge type={stop.type} />
        <TimeWindowWarning stop={stop} dayId={dayId} />
        <Field label={tr("Customer")} value={stop.customer} />
        <Field label={tr("Address")} value={stop.address} />
        <div className="grid grid-cols-2 gap-2">
          <a href={mapsStopUrl(stop)} target="_blank" rel="noreferrer" className="h-12 rounded-lg bg-secondary text-secondary-foreground font-bold grid place-items-center">{tr('🧭 Navigate')}</a>
          <a href={`tel:${stop.contactPhone.replace(/[^0-9+]/g, "")}`} className="h-12 rounded-lg bg-secondary text-secondary-foreground font-bold grid place-items-center">{tr("📞 Call {name}", { name: stop.contactName.split(" ")[0] ?? stop.contactName })}</a>
        </div>
        <div className="rounded-xl border-2 border-accent bg-accent/15 p-4">
          <p className="text-xs uppercase font-bold tracking-wide">{tr('⚠ Site instructions')}</p>
          <p className="mt-1 font-semibold">{(language === "en" || !stop.notesI18n) ? stop.notes : stop.notesI18n[language === "es" ? 0 : 1]}</p>
          <p className="mt-2 text-sm">{tr("Site contact:")} <b>{stop.contactName}</b> · <a className="underline font-bold" href={`tel:${stop.contactPhone.replace(/[^0-9+]/g, "")}`}>{stop.contactPhone}</a></p>
        </div>
        <Field label={tr("Equipment")} value={`${localize(stop.equipment)}${stop.qty > 1 ? ` (${tr("qty")} ${stop.qty})` : ""}`} />
        <fieldset disabled={!editable} className="min-w-0 disabled:opacity-70"><EquipmentPanel stop={stop} onUpdate={onUpdate} /></fieldset>
        <Field label={tr("Time window")} value={localize(stop.window)} />
        <fieldset disabled={!editable} className="min-w-0 mt-auto pt-4 flex flex-col gap-3 disabled:opacity-60">
          {stop.completed ? (
            <>
              <div className="rounded-xl bg-success text-success-foreground p-4 font-bold text-center">{tr(`✓ Equipment ${verb}`)}</div>
              {stop.signature && (
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs uppercase font-bold tracking-wide">{tr("✍ Customer signature")}{stop.signerName ? ` · ${stop.signerName}` : ""}</p>
                  <img src={stop.signature} alt={tr("Customer signature")} className="mt-2 w-full h-24 object-contain bg-card rounded" />
                </div>
              )}
              <button onClick={onNext} className="min-h-16 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-xl shadow-lg flex flex-col items-center">
                <span>{next ? tr("Next stop →") : tr("All stops handled — back to trip →")}</span>
                {next && <span className="text-sm font-semibold opacity-90">{tr("Up next: Stop {n} · {name}", { n: next.index, name: next.name })}</span>}
              </button>
              <button onClick={onUndo} className="min-h-12 px-3 py-2 rounded-lg border-2 border-border bg-card font-bold text-sm">{tr('↩ Undo completion')}</button>
            </>
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
            <>
              <div className="rounded-xl border-2 border-accent bg-accent/15 p-4">
                <p className="text-xs uppercase font-bold tracking-wide">{tr('⚠ Issue reported — not completed')}</p>
                <p className="mt-1 font-semibold">{tr(stop.remark)}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => { setDraft(stop.remark ?? ""); setEditingRemark(true); }} className="flex-1 h-11 rounded-lg bg-secondary text-secondary-foreground font-bold text-sm">{tr('Edit remark')}</button>
                  <button onClick={onClearRemark} className="flex-1 h-11 rounded-lg bg-card border border-border font-bold text-sm">{tr('Clear & retry')}</button>
                </div>
              </div>
              <button onClick={onNext} className="min-h-16 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-xl shadow-lg flex flex-col items-center">
                <span>{next ? tr("Next stop →") : tr("All stops handled — back to trip →")}</span>
                {next && <span className="text-sm font-semibold opacity-90">{tr("Up next: Stop {n} · {name}", { n: next.index, name: next.name })}</span>}
              </button>
            </>
          ) : (
            <>
              <SignaturePad signature={stop.signature} signerName={stop.signerName} onChange={onUpdate} />
              <label className="flex items-center gap-3 rounded-xl border border-border p-4">
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="h-6 w-6 accent-primary" />
                <span className="text-sm font-semibold">{tr(`I confirm the equipment was ${verb} and inspected.`)}</span>
              </label>
              {!stop.signature && <p className="text-xs font-semibold text-muted-foreground text-center">{tr("Customer signature needed to complete")}</p>}
              <button disabled={!checked || !stop.signature} onClick={onComplete} className="min-h-14 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40">
                {tr(`Mark ${stop.type} complete`)}
              </button>
              <button onClick={() => { setDraft(""); setEditingRemark(true); }} className="min-h-12 px-3 py-2 rounded-lg border-2 border-accent text-accent-foreground font-bold text-sm bg-accent/10">
                {tr("⚠ Couldn't complete — leave a remark")}
              </button>
            </>
          )}
        </fieldset>
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

/** Downscale a camera photo to a small JPEG so it fits in phone storage. */
function shrinkPhoto(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 800;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}
