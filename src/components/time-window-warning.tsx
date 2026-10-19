import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Clock, TriangleAlert } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { timeWindowWarning } from "@/lib/trip-guidance";
import type { Stop } from "@/lib/trips";

const ClockContext = createContext<Date | null>(null);

export function useDriverClock() {
  return useContext(ClockContext);
}

export function DriverClockProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 30000);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", tick); };
  }, []);
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}

export function TimeWindowWarning({ stop, dayId }: { stop: Stop; dayId: string }) {
  const now = useContext(ClockContext);
  const { t } = useLanguage();
  const warning = now ? timeWindowWarning(stop, dayId, now) : null;
  if (!warning) return null;
  const Icon = warning.kind === "late" ? TriangleAlert : Clock;
  return (
    <p role="status" className={`mt-2 flex items-start gap-2 rounded-md px-3 py-2 text-sm font-bold ${warning.kind === "late" ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{warning.kind === "late" ? t("Late — time window ended") : t("Window ends in {minutes} min", { minutes: warning.minutes })}</span>
    </p>
  );
}